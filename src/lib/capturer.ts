import { get } from 'svelte/store';

import { targets } from '$stores/target-points';
import { orientationStore } from '$stores/camera-orientation';
import { captured as store, type CapturedImage } from '$stores/captured-images';

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

  // Simpan gambar dengan informasi orientasi
  captured.push({
    imageData: canvas.toDataURL('image/png'),
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

  // Buat juga file metadata JSON untuk membantu penyusunan
  const metadata = captured.map((image, index) => ({
    filename: `spherical_image_${index}.jpg`,
    orientation: image.orientation,
    targetPosition: { x: image.targetPosition.x, y: image.targetPosition.y, z: image.targetPosition.z },
  }));

  const pretty = JSON.stringify(metadata, null, 2);
  zip.file('metadata.json', new Blob([pretty], { type: 'application/json' }));

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  downloadFile('spherical_images.zip', url);
}

async function zipImages(captured: CapturedImage[]) {
  const { default: JSZip } = await import('jszip');
  const zip = new JSZip();
  captured.forEach((image, index) => {
    zip.file(`spherical_image_${index}.jpg`, image.imageData.split(',')[1], { base64: true });
  });

  return zip;
}

function downloadFile(name: string, url: string) {
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}
