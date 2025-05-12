import { get } from 'svelte/store';

import { threeConfigStore } from '$stores/common';

import { Mesh, MeshBasicMaterial, PerspectiveCamera, Scene, SphereGeometry, WebGLRenderer } from 'three';

export function setupRenderer(overlay: HTMLCanvasElement) {
  overlay.width = window.innerWidth;
  overlay.height = window.innerHeight;

  const scene = new Scene();
  const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

  const options = get(threeConfigStore);
  const renderer = new WebGLRenderer({ canvas: overlay, alpha: true });

  renderer.setSize(window.innerWidth, window.innerHeight);

  const sphereGeometry = new SphereGeometry(10, 32, 32);
  const sphereMaterial = new MeshBasicMaterial({
    color: 0xffffff,
    opacity: 0.05,
    wireframe: options.wireframe,
    transparent: true,
  });

  const sphere = new Mesh(sphereGeometry, sphereMaterial);
  scene.add(sphere);
  // Posisikan kamera di tengah sphere
  camera.position.set(0, 0, 0);

  return { camera, renderer, scene, sphere };
}
