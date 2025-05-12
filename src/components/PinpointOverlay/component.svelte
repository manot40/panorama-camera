<script lang="ts">
  import type * as THREE from 'three';
  import type { Action } from 'svelte/action';
  import type { WebGPURenderer } from 'three/webgpu';

  import { setupRenderer } from './3d/renderer';
  import { generateTargetPoints } from './3d/target';
  import { setupOrientationSensor } from './3d/orientation';

  import { threeConfigStore as threeConfig } from '$stores/common';

  type Props = {};
  const {}: Props = $props();

  let scene = $state<THREE.Scene>();
  let camera = $state<THREE.PerspectiveCamera>();
  let sphere = $state<THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>>();
  let renderer = $state<WebGPURenderer | THREE.WebGLRenderer>();

  export const overlay: Action<HTMLCanvasElement> = (overlay) => {
    let cleanupFn: (() => void) | undefined = undefined;

    (async () => {
      const threeInstance = await setupRenderer(overlay);

      scene = threeInstance.scene;
      camera = threeInstance.camera;
      sphere = threeInstance.sphere;
      renderer = threeInstance.renderer;

      const points = generateTargetPoints();

      await setupOrientationSensor(camera);
      for (const target of points) scene.add(target.mesh);

      cleanupFn = threeConfig.subscribe((val) => {
        sphere?.material.setValues({ wireframe: val.wireframe });
      });

      animate();
      function animate() {
        requestAnimationFrame(animate);
        if (!renderer || !scene || !camera) return;
        'renderAsync' in renderer ? renderer.renderAsync(scene, camera) : renderer.render(scene, camera);
      }
    })();

    return { destroy: cleanupFn };
  };
</script>

<canvas use:overlay></canvas>

<style>
  canvas {
    width: 100%;
    height: 100%;
    position: absolute;
    pointer-events: none;
  }
</style>
