<script lang="ts">
  import type { Action } from 'svelte/action';

  type Args = { onready: (e: CustomEvent<MediaStream>) => void };

  type Props = {
    children?: (stream?: MediaStream) => any;
    onReady?: (e: MediaStream, node: HTMLVideoElement) => void;
  };

  const { children, onReady }: Props = $props();

  let stream = $state<MediaStream>();

  const cameraStream: Action<HTMLVideoElement, undefined, Args> = (video) => {
    navigator.mediaDevices
      .getUserMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          facingMode: 'environment',
        },
      })
      .then((s) => {
        stream = s;
        onReady?.(s, video);
        video.srcObject = stream;
        video.dispatchEvent(new CustomEvent('ready', { detail: stream }));
      })
      .catch((e) => {
        // console.error('Error accessing camera:', e);
        // guideText.innerText = 'Error: Tidak dapat mengakses kamera';
      });

    return {};
  };
</script>

<!-- svelte-ignore a11y_media_has_caption -->
<video use:cameraStream autoplay playsinline></video>

{@render children?.(stream)}

<style>
  video {
    position: absolute;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
</style>
