import { writable } from 'svelte/store';

export const aligned = writable(false);

export type ConfigData = {
  start: boolean;
  crosshair: boolean;
};
export const config = writable<ConfigData>({
  start: false,
  crosshair: true,
});

export type ThreeConfig = {
  wireframe: boolean;
};
export const threeConfig = writable<ThreeConfig>({
  wireframe: true,
});

export type CameraConfig = {
  w: number;
  h: number;
  hfov: number;
  cropFactor: number;
  focalLength: number;
};
export const cameraConfig = writable<CameraConfig>();
