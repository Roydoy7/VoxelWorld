import * as THREE from 'three';

export interface ArrowProjectile {
  m: THREE.Mesh;
  x: number; y: number; z: number;
  vx: number; vy: number; vz: number;
  dm: number;
  l: number; // lifetime
}

export interface ExplosionParticle {
  m: THREE.Mesh;
  vx: number; vy: number; vz: number;
  l: number; // lifetime
}

export interface BreakParticle {
  m: THREE.Mesh;
  x: number; y: number; z: number;
  vx: number; vy: number; vz: number;
  life: number;
  ml: number; // max lifetime
}

export interface ItemDrop {
  m: THREE.Mesh;
  x: number; y: number; z: number;
  vy: number;
  id: number;
  qty: number;
  age: number;
}
