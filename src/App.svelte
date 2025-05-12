<script lang="ts">
  import clsx from 'clsx';

  import CameraStream from '$components/CameraStream.svelte';
  import ActionOverlay from '$components/ActionOverlay';
  import PinpointOverlay from '$components/PinpointOverlay';

  import { config, aligned } from '$stores/config';

  let videoElement = $state<HTMLVideoElement>();
</script>

<div class="relative w-dvw h-dvh overflow-hidden">
  <CameraStream onReady={(_, node) => (videoElement = node)}></CameraStream>
  {#if videoElement}
    <PinpointOverlay />
    <ActionOverlay {videoElement} />
  {/if}

  {#if $config.crosshair}
    <div
      class={clsx(
        $aligned ? 'ring-green-800' : 'ring-white',
        'absolute size-6 top-1/2 left-1/2 -translate-1/2 ring-4 rounded-full'
      )}>
    </div>
  {/if}
</div>
