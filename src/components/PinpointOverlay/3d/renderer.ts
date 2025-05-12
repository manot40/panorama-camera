import { get } from 'svelte/store';

import { threeConfig } from '$stores/config';

import { Mesh, MeshBasicMaterial, PerspectiveCamera, Scene, SphereGeometry, WebGLRenderer } from 'three';

export function setupRenderer(overlay: HTMLCanvasElement) {
  const scene = new Scene();
  const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

  const options = get(threeConfig);
  const renderer = new WebGLRenderer({ canvas: overlay, alpha: true });

  adjustSize(true);
  const resizeAction = () => adjustSize();
  window.addEventListener('resize', resizeAction);

  const sphereGeometry = new SphereGeometry(10, 32, 32);
  const sphereMaterial = new MeshBasicMaterial({
    color: 0xffffff,
    opacity: 0.1,
    wireframe: options.wireframe,
    transparent: true,
  });

  const sphere = new Mesh(sphereGeometry, sphereMaterial);
  scene.add(sphere);
  // Posisikan kamera di tengah sphere
  camera.position.set(0, 0, 0);

  function adjustSize(first?: boolean) {
    if (!first) {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    }
    overlay.width = window.innerWidth;
    overlay.height = window.innerHeight;
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function cleanup() {
    window.removeEventListener('resize', resizeAction);
    renderer.setAnimationLoop(null);
    renderer.clear();
    renderer.dispose();
    scene.remove(sphere);
    sphere.geometry.dispose();
    sphere.material.dispose();
  }

  return { camera, renderer, scene, sphere, cleanup };
}
