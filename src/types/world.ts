import * as THREE from 'three';

export type ChunkKey = string;
export type ChunkData = Uint8Array;
export type ChunkMap = Record<string, ChunkData>;
export type ChunkMeshMap = Record<string, THREE.Group>;
export type BiomeType = 'grass' | 'desert' | 'snow';

export interface RaycastHit {
  x: number;
  y: number;
  z: number;
  id: number;
  face: number;
}
