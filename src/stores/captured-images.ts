import type { Vector3 } from 'three';
import type { CurrentOrientation } from './camera-orientation';

import { writable } from 'svelte/store';

export type HuginData = { yaw: number; pitch: number; roll: number };

export type CapturedImage = {
  imageData: string;
  huginData: HuginData;
  orientation: CurrentOrientation;
  targetPosition: Vector3;
};

export const captured = writable<CapturedImage[]>([]);
