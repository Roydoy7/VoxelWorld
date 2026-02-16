import { getBlock } from '../world/chunk-storage';
import { B } from '../data/blocks';
import type { RaycastHit } from '../types/world';

const { floor: fl, abs: ab } = Math;

export function raycast(ox: number, oy: number, oz: number, dx: number, dy: number, dz: number, maxD: number): RaycastHit | null {
  var x = fl(ox), y = fl(oy), z = fl(oz);
  var sx = dx > 0 ? 1 : -1, sy = dy > 0 ? 1 : -1, sz = dz > 0 ? 1 : -1;
  var dtx = ab(1 / dx), dty = ab(1 / dy), dtz = ab(1 / dz);
  var tmx = (dx > 0 ? (x + 1 - ox) : (ox - x)) * dtx;
  var tmy = (dy > 0 ? (y + 1 - oy) : (oy - y)) * dty;
  var tmz = (dz > 0 ? (z + 1 - oz) : (oz - z)) * dtz;
  var face = 0;
  for (var i = 0; i < maxD * 3; i++) {
    var bid = getBlock(x, y, z);
    if (bid > 0 && !B[bid].nb && !B[bid].t) { return { x: x, y: y, z: z, id: bid, face: face }; }
    if (bid > 0 && !B[bid].nb && B[bid].t && bid !== 120 && bid !== 121) { return { x: x, y: y, z: z, id: bid, face: face }; }
    if (tmx < tmy && tmx < tmz) { tmx += dtx; x += sx; face = sx > 0 ? 4 : 5; }
    else if (tmy < tmz) { tmy += dty; y += sy; face = sy > 0 ? 2 : 3; }
    else { tmz += dtz; z += sz; face = sz > 0 ? 0 : 1; }
  }
  return null;
}

export function faceOffset(f: number): [number, number, number] {
  return f === 0 ? [0, 0, -1] : f === 1 ? [0, 0, 1] : f === 2 ? [0, -1, 0] : f === 3 ? [0, 1, 0] : f === 4 ? [-1, 0, 0] : [1, 0, 0];
}
