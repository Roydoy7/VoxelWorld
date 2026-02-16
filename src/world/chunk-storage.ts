import { CHUNK_SIZE as CS, WORLD_HEIGHT as WH, WORLD_SIZE as WS } from '../constants';
import { scene } from '../rendering/scene-setup';
import type { ChunkMap, ChunkMeshMap, ChunkKey, ChunkData } from '../types/world';

const { floor: fl } = Math;

export const chunks: ChunkMap = {};
export const chunkMeshes: ChunkMeshMap = {};

export function resetChunks(): void {
  for (var k in chunkMeshes) {
    if (chunkMeshes[k]) {
      scene.remove(chunkMeshes[k]);
      chunkMeshes[k].traverse(function (c: any) { if (c.geometry) c.geometry.dispose(); });
      delete chunkMeshes[k];
    }
  }
  for (var k2 in chunks) delete chunks[k2];
}

export function chunkKey(cx: number, cz: number): ChunkKey {
  return cx + ',' + cz;
}

export function ensureChunk(cx: number, cz: number): ChunkData {
  var k = chunkKey(cx, cz);
  if (!chunks[k]) chunks[k] = new Uint8Array(CS * WH * CS);
  return chunks[k];
}

export function blockIndex(lx: number, y: number, lz: number): number {
  return (lx * WH + y) * CS + lz;
}

export function getBlock(x: number, y: number, z: number): number {
  if (y < 0 || y >= WH || x < 0 || x >= WS || z < 0 || z >= WS) return 0;
  var cx = fl(x / CS), cz = fl(z / CS), c = chunks[chunkKey(cx, cz)];
  return c ? c[blockIndex(x - cx * CS, y, z - cz * CS)] : 0;
}

export function setBlock(x: number, y: number, z: number, v: number): void {
  if (y < 0 || y >= WH || x < 0 || x >= WS || z < 0 || z >= WS) return;
  var cx = fl(x / CS), cz = fl(z / CS), c = ensureChunk(cx, cz);
  c[blockIndex(x - cx * CS, y, z - cz * CS)] = v;
}
