<script lang="ts">
  import type * as THREE from 'three';
  import type { Action } from 'svelte/action';
  import type { Unsubscriber } from 'svelte/store';
  import type { WebGPURenderer } from 'three/webgpu';

  import { setupRenderer } from './3d/renderer';
  import { generateTargetPoints } from './3d/target';
  import { setupOrientationSensor } from './3d/orientation';

  import { config, threeConfig } from '$stores/config';

  type Props = {};
  const {}: Props = $props();

  export const overlay: Action<HTMLCanvasElement> = (overlay) => {
    $effect(() => {
      if (!$config.start) {
        return;
      }

      let unsubThreeConfig: Unsubscriber | undefined = undefined;
      const instance = setupRenderer(overlay);

      const scene = instance.scene;
      const camera = instance.camera;
      const sphere = instance.sphere;
      const renderer = instance.renderer;

      const points = generateTargetPoints();

      setupOrientationSensor(camera).then(() => {
        for (const target of points) scene!.add(target.mesh);

        unsubThreeConfig = threeConfig.subscribe((val) => {
          sphere?.material.setValues({ wireframe: val.wireframe });
        });

        renderer.setAnimationLoop(animate);
        function animate() {
          if ($config.start) renderer.render(scene, camera);
        }
      });

      return () => {
        instance.cleanup();
        unsubThreeConfig?.();
      };
    });
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
