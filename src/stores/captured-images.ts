import type { Vector3 } from 'three';
import type { CurrentOrientation } from './camera-orientation';

import { writable } from 'svelte/store';

export type CapturedImage = {
  imageData: string;
  orientation: CurrentOrientation;
  targetPosition: Vector3;
};

export const capturedStore = writable<CapturedImage[]>([]);
