<script lang="ts">
  import { targetStore } from '$stores/target-points';
  import { capturedStore } from '$stores/captured-images';

  type Props = { videoElement: HTMLVideoElement };
  const { videoElement }: Props = $props();
</script>

<div></div>
