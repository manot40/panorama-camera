import { get } from 'svelte/store';

import { Euler, Quaternion } from 'three';

import { targets } from '$stores/target-points';
import { orientationStore } from '$stores/camera-orientation';
import { captured as store, type CapturedImage } from '$stores/captured-images';
import { cameraConfig } from '$stores/config';

export function captureImage(index: number, cameraView: HTMLVideoElement) {
  const captured = get(store);
  const targetPoints = get(targets);
  const currentOrientation = get(orientationStore);

  if (index >= targetPoints.length) return;

  const target = targetPoints[index];

  // Buat canvas untuk capture
  const canvas = document.createElement('canvas');
  canvas.width = cameraView.videoWidth;
  canvas.height = cameraView.videoHeight;
  const ctx = canvas.getContext('2d');

  // Gambar frame video ke canvas
  ctx!.drawImage(cameraView, 0, 0, canvas.width, canvas.height);

  const quaternion = new Quaternion().setFromEuler(
    new Euler(
      (currentOrientation.beta * Math.PI) / 180,
      (currentOrientation.alpha * Math.PI) / 180,
      (-currentOrientation.gamma * Math.PI) / 180,
      'YXZ'
    )
  );

  const euler = new Euler().setFromQuaternion(quaternion);
  const yaw = (euler.y * 180) / Math.PI; // Rotasi horizontal
  const pitch = (euler.x * 180) / Math.PI; // Rotasi vertikal
  const roll = (euler.z * 180) / Math.PI; // Rotasi "roll"
  const huginData = { yaw, pitch, roll };

  // Simpan gambar dengan informasi orientasi
  captured.push({
    huginData,
    imageData: canvas.toDataURL('image/jpeg'),
    orientation: currentOrientation,
    targetPosition: target.position.clone(),
  });

  target.captured = true;
  target.mesh.material.color.set(0x00ff00);
  return captured;
}

// Download semua gambar yang diambil
export async function downloadAllImages() {
  const captured = get(store);
  const zip = await zipImages(captured);
  const metadata = captured.map((image, index) => ({
    filename: generateFileName(image, index),
    orientation: image.orientation,
    targetPosition: { x: image.targetPosition.x, y: image.targetPosition.y, z: image.targetPosition.z },
  }));

  // Common Metadata
  const pretty = JSON.stringify(metadata, null, 2);
  zip.file('metadata.json', new Blob([pretty], { type: 'application/json' }));
  // Hugin .pto
  const hugin = generateHuginProject(captured);
  zip.file('project.pto', hugin);

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(zipBlob);
  downloadFile('spherical_images.zip', url);
}

async function zipImages(captured: CapturedImage[]) {
  const { default: JSZip } = await import('jszip');
  const zip = new JSZip();
  captured.forEach((image, index) => {
    zip.file(generateFileName(image, index), image.imageData.split(',')[1], { base64: true });
  });

  return zip;
}

const generateFileName = (image: CapturedImage, index: number) => {
  const alpha = image.orientation.alpha.toFixed(2);
  const beta = image.orientation.beta.toFixed(2);
  const gamma = image.orientation.gamma.toFixed(2);
  return `photo_${index}_${alpha}_${beta}_${gamma}.jpg`;
};

function downloadFile(name: string, url: string) {
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

function generateHuginProject(images: CapturedImage[]) {
  const { w, h, hfov } = get(cameraConfig);
  // Header file PTO
  let ptoContent = '# hugin project file\n';
  ptoContent += 'p f0 w8000 h4000 v360 k0 E0 R0 S\n'; // Format Equirectangular 8000x4000
  ptoContent += 'm g1 i0 f0\n';

  // Output format
  ptoContent += '# output format\n';
  ptoContent += 'm g1 i0 f0 m2\n';

  // Image parameters
  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const imgWidth = w;
    const imgHeight = h;

    // Format:
    // i - image line
    // w,h - width,height
    // f - projection (0 = rectilinear)
    // v - field of view
    // y,p,r - yaw, pitch, roll values
    ptoContent += `# image ${i}\n`;
    ptoContent += `i w${imgWidth} h${imgHeight} f0 v${hfov} `;
    ptoContent += `Eev0 Er1 Eb1 r0 p0 y0 TrX0 TrY0 TrZ0 `;
    ptoContent += `j0 a0 b0 c0 d0 e0 `;
    ptoContent += `g0 t0 Va1 Vb0 Vc0 Vd0 Vx0 Vy0 `;
    ptoContent += `Vm5 n"${generateFileName(img, i)}"\n`;

    // Control point line (o)
    ptoContent += `o f0 y${img.huginData.yaw} r${img.huginData.roll} p${img.huginData.pitch} `;
    ptoContent += `v${hfov} `;
    ptoContent += `a0 b0 c0 d0 e0 `;
    ptoContent += `w${imgWidth} h${imgHeight} `;
    ptoContent += `n"${generateFileName(img, i)}"\n`;
  }

  return new Blob([ptoContent], { type: 'text/plain' });
}
