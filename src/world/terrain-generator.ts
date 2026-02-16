import { CHUNK_SIZE as CS, WORLD_HEIGHT as WH, SEA_LEVEL as SEA, WORLD_SIZE as WS } from '../constants';
import { fbm, caveNoise } from '../core/noise';
import { ensureChunk, blockIndex, getBlock, setBlock } from './chunk-storage';
import type { BiomeType } from '../types/world';

const { floor: fl, abs: ab, random: rn } = Math;

export function getBiome(x: number, z: number): BiomeType {
  var t = fbm(x * .003 + 500, z * .003 + 500, 3),
    m = fbm(x * .005 + 1000, z * .005 + 1000, 2);
  if (t > .65) return 'snow';
  if (t < .3 && m < .4) return 'desert';
  return 'grass';
}

export function genChunkTerrain(cx: number, cz: number): void {
  var c = ensureChunk(cx, cz), ox = cx * CS, oz = cz * CS;
  for (var lx = 0; lx < CS; lx++) for (var lz = 0; lz < CS; lz++) {
    var wx = ox + lx, wz = oz + lz;
    var h = fbm(wx * .008, wz * .008, 5) * 35 + fbm(wx * .03, wz * .03, 3) * 8 + SEA;
    var biome = getBiome(wx, wz);
    if (biome === 'desert') h = fbm(wx * .006, wz * .006, 4) * 15 + SEA + 2;
    if (biome === 'snow') h = fbm(wx * .007, wz * .007, 5) * 40 + SEA + 5;
    h = fl(h); if (h >= WH) h = WH - 1;
    for (var y = 0; y <= h || y <= SEA; y++) {
      var idx = blockIndex(lx, y, lz);
      if (y === 0) { c[idx] = 12; continue; }
      if (y > h) { c[idx] = 120; continue; }
      // Cave
      if (y > 2 && y < h - 3 && y < 55) {
        var cv = caveNoise(wx, y, wz);
        if (cv > .55) { continue; }
      }
      if (y === h) {
        if (h <= SEA + 1 && biome !== 'snow') c[idx] = 9;
        else if (biome === 'desert') c[idx] = 9;
        else if (biome === 'snow') { c[idx] = 68; }
        else c[idx] = 1;
      } else if (y > h - 4) {
        if (biome === 'desert') c[idx] = 9;
        else if (biome === 'snow') c[idx] = 2;
        else c[idx] = 2;
      } else {
        c[idx] = 3;
        // Ores
        if (y < 12 && rn() < .004) c[idx] = 16;
        else if (y < 12 && rn() < .003) c[idx] = 17;
        else if (y < 12 && rn() < .002) c[idx] = 19;
        else if (y < 20 && rn() < .003) c[idx] = 18;
        else if (y < 30 && rn() < .006) c[idx] = 15;
        else if (y < 35 && rn() < .008) c[idx] = 14;
        else if (y < 40 && rn() < .008) c[idx] = 20;
        else if (y < 50 && rn() < .012) c[idx] = 13;
        else if (rn() < .03) { var sv = rn(); c[idx] = sv < .33 ? 21 : sv < .66 ? 22 : 23; }
      }
    }
  }
}

export function genTrees(cx: number, cz: number): void {
  var ox = cx * CS, oz = cz * CS;
  for (var lx = 2; lx < CS - 2; lx++) for (var lz = 2; lz < CS - 2; lz++) {
    if (rn() > .015) continue;
    var wx = ox + lx, wz = oz + lz, biome = getBiome(wx, wz);
    if (biome === 'desert') {
      // Cactus
      var ch = fl(fbm(wx * .008, wz * .008, 5) * 35 + fbm(wx * .03, wz * .03, 3) * 8 + SEA);
      if (ch > SEA && ch < WH - 5 && getBlock(wx, ch, wz) === 9) {
        var th = 2 + fl(rn() * 2);
        for (var ty = 1; ty <= th; ty++) setBlock(wx, ch + ty, wz, 44);
      }
      continue;
    }
    var gh = fl(fbm(wx * .008, wz * .008, 5) * 35 + fbm(wx * .03, wz * .03, 3) * 8 + SEA);
    if (biome === 'snow') gh = fl(fbm(wx * .007, wz * .007, 5) * 40 + SEA + 5);
    if (gh <= SEA || gh >= WH - 8) continue;
    var surf = getBlock(wx, gh, wz);
    if (surf !== 1 && surf !== 68 && surf !== 2) continue;
    var logT = biome === 'snow' ? 105 : 5;
    var leafT = biome === 'snow' ? 43 : 41;
    var th2 = 4 + fl(rn() * 3);
    for (var ty = 1; ty <= th2; ty++) setBlock(wx, gh + ty, wz, logT);
    for (var dx = -2; dx <= 2; dx++) for (var dz = -2; dz <= 2; dz++) for (var dy = -2; dy <= 1; dy++) {
      if (ab(dx) === 2 && ab(dz) === 2 && rn() > .3) continue;
      var lx2 = wx + dx, ly = gh + th2 + dy, lz2 = wz + dz;
      if (!getBlock(lx2, ly, lz2)) {
        var lt = leafT;
        if (leafT === 41 && rn() < .08) lt = 531;
        setBlock(lx2, ly, lz2, lt);
      }
    }
    // Flowers and grass near trees
    for (var fi = 0; fi < 3; fi++) {
      var fx = wx + fl(rn() * 6 - 3), fz = wz + fl(rn() * 6 - 3);
      var fh = fl(fbm(fx * .008, fz * .008, 5) * 35 + fbm(fx * .03, fz * .03, 3) * 8 + SEA);
      if (getBlock(fx, fh, fz) === 1 && !getBlock(fx, fh + 1, fz)) {
        var ft = rn() < .15 ? 124 : rn() < .3 ? 125 : 126;
        setBlock(fx, fh + 1, fz, ft);
      }
    }
  }
}
