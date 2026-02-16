import { CHUNK_SIZE as CS, RENDER_DISTANCE as RD, WORLD_SIZE as WS } from '../constants';
import { chunkMeshes, chunkKey } from './chunk-storage';
import { buildChunk } from './chunk-mesh-builder';
import { genChunkTerrain, genTrees } from './terrain-generator';

const { floor: fl } = Math;
var maxCx = fl(WS / CS);

// Track which chunks have terrain/trees generated
var terrainDone: Record<string, 1> = {};
var treesDone: Record<string, 1> = {};

export function getTerrainDone(): Record<string, 1> { return terrainDone; }
export function getTreesDone(): Record<string, 1> { return treesDone; }

export function resetChunkManager(): void {
  for (var k in terrainDone) delete terrainDone[k];
  for (var k2 in treesDone) delete treesDone[k2];
}

export function restoreTerrainDone(keys: string[]): void {
  for (var i = 0; i < keys.length; i++) terrainDone[keys[i]] = 1;
}
export function restoreTreesDone(keys: string[]): void {
  for (var i = 0; i < keys.length; i++) treesDone[keys[i]] = 1;
}

export function ensureTerrain(cx: number, cz: number): void {
  if (cx < 0 || cz < 0 || cx >= maxCx || cz >= maxCx) return;
  var k = chunkKey(cx, cz);
  if (terrainDone[k]) return;
  genChunkTerrain(cx, cz);
  terrainDone[k] = 1;
}

export function ensureTrees(cx: number, cz: number): void {
  if (cx < 0 || cz < 0 || cx >= maxCx || cz >= maxCx) return;
  var k = chunkKey(cx, cz);
  if (treesDone[k]) return;
  genTrees(cx, cz);
  treesDone[k] = 1;
}

function prepareChunk(cx: number, cz: number): void {
  // Ensure terrain for this chunk and all neighbors
  for (var dx = -1; dx <= 1; dx++) for (var dz = -1; dz <= 1; dz++) {
    ensureTerrain(cx + dx, cz + dz);
  }
  // Ensure trees for this chunk and all neighbors (leaves extend across boundaries)
  for (var dx = -1; dx <= 1; dx++) for (var dz = -1; dz <= 1; dz++) {
    ensureTrees(cx + dx, cz + dz);
  }
}

export function rebuildNear(x: number, z: number): void {
  var cx = fl(x / CS), cz = fl(z / CS); buildChunk(cx, cz);
  if (x % CS === 0 && cx > 0) buildChunk(cx - 1, cz);
  if (x % CS === CS - 1) buildChunk(cx + 1, cz);
  if (z % CS === 0 && cz > 0) buildChunk(cx, cz - 1);
  if (z % CS === CS - 1) buildChunk(cx, cz + 1);
}

export async function buildInitialChunks(updateProgress: (pct: number) => void, px?: number, pz?: number): Promise<void> {
  var spCx = fl((px !== undefined ? px : WS / 2) / CS), spCz = fl((pz !== undefined ? pz : WS / 2) / CS), built = 0;
  var initR = RD - 1; // smaller initial build, rest via lazy loading
  for (var dx = -initR; dx <= initR; dx++) for (var dz = -initR; dz <= initR; dz++) {
    if (dx * dx + dz * dz > initR * initR + 2) continue;
    var nx = spCx + dx, nz = spCz + dz;
    if (nx >= 0 && nz >= 0 && nx < maxCx && nz < maxCx) {
      buildChunk(nx, nz); built++;
      updateProgress(50 + built * 1.5);
      await new Promise<void>(function (r) { requestAnimationFrame(function () { r(); }); });
    }
  }
}

export function updateChunks(px: number, pz: number): void {
  var cx = fl(px / CS), cz = fl(pz / CS);
  var built = 0;
  for (var dx = -RD; dx <= RD; dx++) for (var dz = -RD; dz <= RD; dz++) {
    if (dx * dx + dz * dz > RD * RD + 2) continue;
    var nx = cx + dx, nz = cz + dz, key = chunkKey(nx, nz);
    if (nx >= 0 && nz >= 0 && nx < maxCx && nz < maxCx && !chunkMeshes[key]) {
      prepareChunk(nx, nz);
      buildChunk(nx, nz);
      built++;
      if (built >= 4) return; // limit per frame to avoid stuttering
    }
  }
}
