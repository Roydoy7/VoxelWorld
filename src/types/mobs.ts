import * as THREE from 'three';

export interface MobTypeDefinition {
  n: string;       // name
  hp: number;      // max health
  sp: number;      // speed
  ag: number;      // aggression range (0 = passive)
  rg: number;      // attack range
  dm: number;      // damage
  ra: number;      // ranged attack (1 = yes)
  ex: number;      // explosive (1 = creeper)
  col: number;     // primary color
  col2: number;    // secondary color
  drop: [number, number][];
  passive?: number;
}

export interface MobHealthBar {
  sp: THREE.Sprite;
  cv: HTMLCanvasElement;
  tex: THREE.CanvasTexture;
}

export interface MobInstance {
  type: string;
  mesh: THREE.Group;
  x: number; y: number; z: number;
  hp: number; mhp: number;
  wa: number;     // walk animation
  acd: number;    // attack cooldown
  scd: number;    // shoot cooldown
  fuse: number;   // creeper fuse timer
  fusing: number; // is fusing
  pt: number;     // patrol timer
  tx: number;     // target x
  tz: number;     // target z
  dead: number;   // is dead
  dt: number;     // death timer
  flee: number;   // flee timer
  sndT?: number;  // sound timer
  hpBar?: MobHealthBar;
}

export type MobTypes = Record<string, MobTypeDefinition>;
