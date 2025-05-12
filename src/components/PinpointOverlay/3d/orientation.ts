import { get } from 'svelte/store';

import { findNextUncapturedTarget } from './target';

import { commonStore } from '$stores/common';
import { orientationStore } from '$stores/camera-orientation';
import { indexStore, targetStore } from '$stores/target-points';

import { Euler, PerspectiveCamera, Quaternion, Vector3 } from 'three';

export async function setupOrientationSensor(camera: PerspectiveCamera) {
  const isAbsoluteSupported =
    'AbsoluteOrientationSensor' in window &&
    (await Promise.all([
      navigator.permissions.query({ name: <any>'accelerometer' }),
      navigator.permissions.query({ name: <any>'magnetometer' }),
      navigator.permissions.query({ name: <any>'gyroscope' }),
    ]).then((results) => results.every((r) => r.state === 'granted')));

  if (isAbsoluteSupported) {
    absoluteOrientationSensor(camera);
  } else {
    setupDeviceOrientation(camera);
  }
}

function absoluteOrientationSensor(camera: PerspectiveCamera) {
  try {
    const sensor = new window.AbsoluteOrientationSensor({ frequency: 60 });
    sensor.addEventListener('reading', () => {
      // Convert quaternion ke euler angles
      const quaternion = new Quaternion(
        sensor.quaternion[0],
        sensor.quaternion[1],
        sensor.quaternion[2],
        sensor.quaternion[3]
      );
      const euler = new Euler().setFromQuaternion(quaternion.invert());

      // Update kamera
      updateCameraOrientation(camera, [euler.x, euler.y, euler.z]);
    });
    sensor.start();
  } catch (e) {
    console.error('Failed to initialize Sensor. Trying basic orientation sensor.');
    setupDeviceOrientation(camera);
  }
}

function setupDeviceOrientation(camera: PerspectiveCamera) {
  window.addEventListener('deviceorientation', (event) => {
    // Convert device orientation ke radians
    const alpha = event.alpha ? (event.alpha * Math.PI) / 180 : 0; // Z-axis
    const beta = event.beta ? (event.beta * Math.PI) / 180 : 0; // X-axis
    const gamma = event.gamma ? (event.gamma * Math.PI) / 180 : 0; // Y-axis

    updateCameraOrientation(camera, [beta, gamma, alpha]);
  });
}

function updateCameraOrientation(camera: PerspectiveCamera, [beta, gamma, alpha]: [number, number, number]) {
  orientationStore.set({ alpha, beta, gamma });
  // Membuat quaternion dari euler angles
  const quaternion = new Quaternion();
  const euler = new Euler(-beta, alpha, -gamma, 'YXZ');
  quaternion.setFromEuler(euler);

  // Terapkan rotasi ke kamera
  camera.quaternion.setFromEuler(euler);
  const adjustment = new Quaternion().setFromEuler(new Euler(Math.PI / 2, 0, 0));
  camera.quaternion.multiply(adjustment);

  // Periksa apakah kamera mengarah ke target saat ini
  checkTargetAlignment(camera);
}

// Periksa apakah kamera mengarah ke target saat ini
function checkTargetAlignment(camera: PerspectiveCamera) {
  const index = get(indexStore);
  const targetPoints = get(targetStore);

  if (index >= targetPoints.length) return;

  const target = targetPoints[index];
  if (target.captured) {
    // Jika target saat ini sudah diambil, cari target berikutnya yang belum
    findNextUncapturedTarget();
    return;
  }

  // Buat vector untuk arah kamera (0, 0, -1) yang sudah dirotasi oleh quaternion kamera
  const cameraDirection = new Vector3(0, 0, -1);
  cameraDirection.applyQuaternion(camera.quaternion);

  // Hitung arah ke target (normalized)
  const targetDirection = target.position.clone().normalize();

  // Hitung dot product untuk mengukur seberapa "sejajar" kedua vector (1 = sejajar sempurna)
  const alignment = cameraDirection.dot(targetDirection);

  // Jika alignment di atas threshold, aktifkan tombol capture
  const THRESHOLD = 0.95; // cos(18 derajat) ≈ 0.95 -> target berada dalam ~18 derajat dari pusat

  commonStore.set({ ...get(commonStore), aligned: alignment > THRESHOLD });
}

declare global {
  interface Window {
    AbsoluteOrientationSensor: any;
  }
}
