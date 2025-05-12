import { writable } from 'svelte/store';

export type CurrentOrientation = { alpha: number; beta: number; gamma: number };

export const orientationStore = writable<CurrentOrientation>({ alpha: 0, beta: 0, gamma: 0 });
