<script lang="ts">
  import { cameraConfig } from '$stores/config';
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
        estimateFocalLength();
        video.srcObject = stream;
        video.dispatchEvent(new CustomEvent('ready', { detail: stream }));
      })
      .catch((e) => {
        // console.error('Error accessing camera:', e);
        // guideText.innerText = 'Error: Tidak dapat mengakses kamera';
      });

    // @todo  estimate focal length
    function estimateFocalLength() {
      // Perkirakan horizontal FOV (dari pengalaman, banyak kamera web sekitar 60-70 derajat)
      const estimatedHFOV = 65; // Dalam derajat
      // Hitung focal length (dalam pixel) menggunakan formula: f = (width/2) / tan(hfov/2)
      const widthInPixels = video.videoWidth;
      const focalLengthInPixels = widthInPixels / 2 / Math.tan((estimatedHFOV / 2) * (Math.PI / 180));
      // Konversi ke mm (asumsi sensor sekitar 6.3mm lebar untuk webcam typical)
      const sensorWidth = 6.3; // dalam mm
      const focalLengthInMM = (focalLengthInPixels / widthInPixels) * sensorWidth;

      cameraConfig.set({
        h: video.videoHeight,
        w: video.videoWidth,
        hfov: estimatedHFOV,
        cropFactor: 35 / sensorWidth,
        focalLength: focalLengthInMM,
      });
    }
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
