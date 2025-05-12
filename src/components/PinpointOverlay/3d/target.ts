import { get } from 'svelte/store';

import { SphereGeometry, MeshBasicMaterial, Mesh, Vector3 } from 'three';

import { indexStore, targetStore, type TargetPoint } from '$stores/target-points';

export function generateTargetPoints() {
  const points = <TargetPoint[]>[];

  const numPointsHorizontal = 8; // 8 titik horizontal (45 derajat interval)
  const numPointsVertical = 4; // 4 titik vertical (45 derajat interval)

  for (let h = 0; h < numPointsHorizontal; h++) {
    const horizontalAngle = (h / numPointsHorizontal) * Math.PI * 2;

    for (let v = 1; v < numPointsVertical; v++) {
      const verticalAngle = (v / numPointsVertical) * Math.PI - Math.PI / 2;

      const x = 10 * Math.cos(horizontalAngle) * Math.cos(verticalAngle);
      const y = 10 * Math.sin(verticalAngle);
      const z = 10 * Math.sin(horizontalAngle) * Math.cos(verticalAngle);

      const point = createPointMaterial(x, y, z);
      points.push({ mesh: point, position: new Vector3(x, y, z), captured: false });
    }
  }

  const topXYZ = [0, 10, 0] as const;
  const topPoint = createPointMaterial(...topXYZ);
  points.push({ mesh: topPoint, position: new Vector3(...topXYZ), captured: false });

  const botXYZ = [0, -10, 0] as const;
  const bottomPoint = createPointMaterial(...botXYZ);
  points.push({ mesh: bottomPoint, position: new Vector3(...botXYZ), captured: false });

  targetStore.set(points);
  highlightCurrentTarget();
  return points;
}

export function createPointMaterial(x: number, y: number, z: number) {
  const geometry = new SphereGeometry(0.2, 16, 16);
  const material = new MeshBasicMaterial({ color: 0xff0000 });
  const point = new Mesh(geometry, material);
  point.position.set(x, y, z);
  return point;
}

export function highlightCurrentTarget() {
  const index = get(indexStore);
  const targetPoints = get(targetStore);
  // Reset semua warna
  targetPoints.forEach((point) => {
    if (!point.captured) {
      point.mesh.material.color.set(0xff0000); // Merah untuk yang belum diambil
    } else {
      point.mesh.material.color.set(0x00ff00); // Hijau untuk yang sudah diambil
    }
  });

  // Highlight target saat ini
  if (index < targetPoints.length && !targetPoints[index].captured) {
    targetPoints[index].mesh.material.color.set(0xffff00); // Kuning untuk target aktif
  }
}

// Temukan target berikutnya yang belum diambil
export function findNextUncapturedTarget() {
  const targetPoints = get(targetStore);
  for (let i = 0; i < targetPoints.length; i++) {
    if (!targetPoints[i].captured) {
      indexStore.set(i);
      highlightCurrentTarget();
      return;
    }
  }

  // Semua target sudah diambil
  // guideText.innerText = 'Semua foto telah diambil! Anda bisa mengunduh hasilnya.';
  // captureBtn.innerText = 'Unduh Semua';
  // captureBtn.onclick = downloadAllImages;
}
