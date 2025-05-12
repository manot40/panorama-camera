import { get } from 'svelte/store';

import { targetStore } from '$stores/target-points';
import { capturedStore } from '$stores/captured-images';
import { orientationStore } from '$stores/camera-orientation';

export function captureImage(index: number, cameraView: HTMLVideoElement) {
  const captured = get(capturedStore);
  const targetPoints = get(targetStore);
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
export function downloadAllImages() {
  const captured = get(capturedStore);

  captured.forEach((image, index) => {
    const link = document.createElement('a');
    link.href = image.imageData;
    link.download = `spherical_image_${index}.jpg`;
    link.click();
  });

  // Buat juga file metadata JSON untuk membantu penyusunan
  const metadata = captured.map((image, index) => {
    return {
      filename: `spherical_image_${index}.jpg`,
      orientation: image.orientation,
      targetPosition: {
        x: image.targetPosition.x,
        y: image.targetPosition.y,
        z: image.targetPosition.z,
      },
    };
  });

  const metadataBlob = new Blob([JSON.stringify(metadata, null, 2)], { type: 'application/json' });
  const metadataUrl = URL.createObjectURL(metadataBlob);
  const link = document.createElement('a');
  link.href = metadataUrl;
  link.download = 'spherical_metadata.json';
  link.click();
}
