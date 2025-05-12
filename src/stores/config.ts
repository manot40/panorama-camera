import { writable } from 'svelte/store';

export type ConfigData = {
  start: boolean;
  crosshair: boolean;
};

export type ThreeConfig = {
  wireframe: boolean;
};

export const aligned = writable(false);

export const config = writable<ConfigData>({
  start: false,
  crosshair: true,
});

export const threeConfig = writable<ThreeConfig>({
  wireframe: true,
});
