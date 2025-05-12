import type { Mesh, MeshBasicMaterial, SphereGeometry, Vector3 } from 'three';

import { writable } from 'svelte/store';

export type TargetPoint = {
  mesh: Mesh<SphereGeometry, MeshBasicMaterial>;
  position: Vector3;
  captured: boolean;
};

export const activeIndex = writable(0);

export const targets = writable<TargetPoint[]>([]);
