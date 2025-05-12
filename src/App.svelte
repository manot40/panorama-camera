<script lang="ts">
  import clsx from 'clsx';

  import CameraStream from '$components/CameraStream.svelte';
  import ActionOverlay from '$components/ActionOverlay';
  import PinpointOverlay from '$components/PinpointOverlay';

  import { commonStore as common } from '$stores/common';

  let videoElement = $state<HTMLVideoElement>();
</script>

<div class="relative w-dvw h-dvh overflow-hidden">
  <CameraStream onReady={(_, node) => (videoElement = node)}></CameraStream>
  {#if videoElement}
    <PinpointOverlay />
    <ActionOverlay {videoElement} />
  {/if}

  {#if $common.crosshair}
    <div
      class={clsx(
        $common.aligned ? 'bg-green-800' : 'bg-white',
        'absolute top-0 w-px h-full left-1/2 -translate-x-1/2 shadow-sm'
      )}>
    </div>
    <div
      class={clsx(
        $common.aligned ? 'bg-green-800' : 'bg-white',
        'absolute left-0 w-full h-px top-1/2 -translate-y-1/2 shadow-sm'
      )}>
    </div>
  {/if}
</div>
