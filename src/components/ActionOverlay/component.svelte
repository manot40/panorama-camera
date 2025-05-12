<script lang="ts">
  import { CameraIcon, ImagesIcon, RefreshCwIcon, PlayIcon } from '@lucide/svelte';

  import { captureImage } from '$lib/capturer';

  import { config } from '$stores/config';
  import { captured } from '$stores/captured-images';
  import { activeIndex } from '$stores/target-points';

  import Button from '$ui/button/button.svelte';

  type Props = { videoElement: HTMLVideoElement };
  const { videoElement }: Props = $props();

  let animate = $state(false);

  function startPulse() {
    animate = true;
    setTimeout(() => (animate = false), 1000);
  }

  function toggleCapture() {
    if (!$config.start) return ($config.start = true);
    const result = captureImage($activeIndex, videoElement);
    if (!result) return;

    $captured = result;
    startPulse();
  }

  function handleReset() {
    $captured = [];
    $config.start = false;
  }
</script>

<div class="fixed top-0 left-0 flex flex-col size-full">
  <div></div>
  <div class="flex-1 h-full"></div>
  <div class="flex justify-center px-4 py-6">
    <div class="flex justify-between items-center w-full max-w-lg">
      <div class="relative grid place-content-center size-20">
        {#if $config.start}
          {#if animate}
            <div
              class="absolute size-12 left-1/2 top-1/2 -translate-1/2 ring-2 ring-neutral-200 rounded-lg animate-ping repeat-1">
            </div>
          {/if}
          <div class="relative z-0 size-14 rounded-lg ring-2 ring-neutral-200 overflow-hidden">
            {#if $captured.length > 0}
              {#if $captured.length > 1}
                <div class="absolute grid place-content-center top-0 left-0 size-full bg-black/35 z-10">
                  <span class="text-white">+{$captured.length - 1}</span>
                </div>
              {/if}
              <img src={$captured.at(-1)!.imageData} alt="" class="size-full object-cover" />
            {:else}
              <div class="size-full grid place-content-center bg-black/35">
                <ImagesIcon class="!size-6 text-white" />
              </div>
            {/if}
          </div>
        {/if}
      </div>

      <Button size="icon" class="rounded-full size-20" onclick={toggleCapture}>
        {#if $config.start}
          <CameraIcon class="!size-6" />
        {:else}
          <PlayIcon class="!size-6" />
        {/if}
      </Button>

      <div class="grid place-content-center size-20">
        {#if $config.start}
          <Button size="icon" variant="secondary" class="rounded-full size-14" onclick={handleReset}>
            <RefreshCwIcon class="!size-4" />
          </Button>
        {/if}
      </div>
    </div>
  </div>
</div>
