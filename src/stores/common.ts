import { writable } from 'svelte/store';

export type CommonData = {
  aligned: boolean;
  crosshair: boolean;
};

export type ThreeConfig = {
  wireframe: boolean;
};

export const commonStore = writable<CommonData>({
  aligned: false,
  crosshair: true,
});

export const threeConfigStore = writable<ThreeConfig>({
  wireframe: true,
});
