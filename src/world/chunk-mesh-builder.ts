import * as THREE from 'three';
import { CHUNK_SIZE as CS, WORLD_HEIGHT as WH } from '../constants';
import { B } from '../data/blocks';
import { chunks, chunkMeshes, chunkKey, blockIndex, getBlock } from './chunk-storage';
import { getMaterial } from '../rendering/materials';
import { scene } from '../rendering/scene-setup';

const NB: [number, number, number, string][] = [
  [1, 0, 0, 'side'], [-1, 0, 0, 'side'], [0, 1, 0, 'top'], [0, -1, 0, 'bottom'], [0, 0, 1, 'side'], [0, 0, -1, 'side']
];

const LEAF_IDS: Record<number, number> = { 41: 1, 42: 1, 43: 1, 354: 1, 365: 1, 366: 1, 367: 1, 368: 1, 369: 1, 531: 1 };

export function buildChunk(cx: number, cz: number): void {
  var k = chunkKey(cx, cz);
  if (chunkMeshes[k]) { scene.remove(chunkMeshes[k]); chunkMeshes[k].traverse(function (c: any) { if (c.geometry) c.geometry.dispose(); }); delete chunkMeshes[k]; }
  var c = chunks[k]; if (!c) return;
  var grp = new THREE.Group(), ox = cx * CS, oz = cz * CS;
  var geo: Record<string, { v: number[]; n: number[]; u: number[]; f: number[] }> = {};

  // Find max Y with blocks to skip empty air above
  var maxY = 0;
  for (var sx = 0; sx < CS; sx++) for (var sz = 0; sz < CS; sz++) {
    for (var sy = WH - 1; sy > maxY; sy--) { if (c[blockIndex(sx, sy, sz)]) { maxY = sy; break; } }
  }
  maxY = maxY < WH - 1 ? maxY + 1 : WH - 1;

  for (var lx = 0; lx < CS; lx++) for (var y = 0; y <= maxY; y++) for (var lz = 0; lz < CS; lz++) {
    var id = c[blockIndex(lx, y, lz)]; if (!id) continue;
    var b = B[id]; if (!b) continue;
    var wx = ox + lx, wz = oz + lz;
    var px = wx + .5, py = y + .5, pz = wz + .5;

    // Flowers/grass/saplings: render as X-shaped cross (not leaves)
    if (b.f && !LEAF_IDS[id]) {
      var fk = id + '_side';
      if (!geo[fk]) geo[fk] = { v: [], n: [], u: [], f: [] };
      var g = geo[fk], vi = g.v.length / 3;
      var d = 0.45;
      // Quad 1
      g.v.push(px - d, py - .5, pz - d, px - d, py + .5, pz - d, px + d, py + .5, pz + d, px + d, py - .5, pz + d);
      for (var q = 0; q < 4; q++) g.n.push(.7, 0, .7);
      g.u.push(0, 0, 0, 1, 1, 1, 1, 0);
      g.f.push(vi, vi + 1, vi + 2, vi, vi + 2, vi + 3);
      // Quad 1 backface
      vi = g.v.length / 3;
      g.v.push(px + d, py - .5, pz + d, px + d, py + .5, pz + d, px - d, py + .5, pz - d, px - d, py - .5, pz - d);
      for (var q = 0; q < 4; q++) g.n.push(-.7, 0, -.7);
      g.u.push(0, 0, 0, 1, 1, 1, 1, 0);
      g.f.push(vi, vi + 1, vi + 2, vi, vi + 2, vi + 3);
      // Quad 2
      vi = g.v.length / 3;
      g.v.push(px + d, py - .5, pz - d, px + d, py + .5, pz - d, px - d, py + .5, pz + d, px - d, py - .5, pz + d);
      for (var q = 0; q < 4; q++) g.n.push(-.7, 0, .7);
      g.u.push(0, 0, 0, 1, 1, 1, 1, 0);
      g.f.push(vi, vi + 1, vi + 2, vi, vi + 2, vi + 3);
      // Quad 2 backface
      vi = g.v.length / 3;
      g.v.push(px - d, py - .5, pz + d, px - d, py + .5, pz + d, px + d, py + .5, pz - d, px + d, py - .5, pz - d);
      for (var q = 0; q < 4; q++) g.n.push(.7, 0, -.7);
      g.u.push(0, 0, 0, 1, 1, 1, 1, 0);
      g.f.push(vi, vi + 1, vi + 2, vi, vi + 2, vi + 3);
      continue;
    }

    for (var ni = 0; ni < 6; ni++) {
      var nb = NB[ni], nx = wx + nb[0], ny = y + nb[1], nz = wz + nb[2];
      var nid = getBlock(nx, ny, nz), nbl = nid ? B[nid] : null;
      if (nid && !nbl) continue;
      if (nid && nid === id && id === 120) continue;
      if (nid && !(nbl && nbl.t)) continue;
      var fk2 = id + '_' + nb[3];
      if (!geo[fk2]) geo[fk2] = { v: [], n: [], u: [], f: [] };
      var g2 = geo[fk2], vi2 = g2.v.length / 3;
      if (ni === 0) { g2.v.push(px + .5, py - .5, pz - .5, px + .5, py + .5, pz - .5, px + .5, py + .5, pz + .5, px + .5, py - .5, pz + .5); for (var q = 0; q < 4; q++) g2.n.push(1, 0, 0); }
      else if (ni === 1) { g2.v.push(px - .5, py - .5, pz + .5, px - .5, py + .5, pz + .5, px - .5, py + .5, pz - .5, px - .5, py - .5, pz - .5); for (var q = 0; q < 4; q++) g2.n.push(-1, 0, 0); }
      else if (ni === 2) { g2.v.push(px - .5, py + .5, pz - .5, px - .5, py + .5, pz + .5, px + .5, py + .5, pz + .5, px + .5, py + .5, pz - .5); for (var q = 0; q < 4; q++) g2.n.push(0, 1, 0); }
      else if (ni === 3) { g2.v.push(px - .5, py - .5, pz + .5, px - .5, py - .5, pz - .5, px + .5, py - .5, pz - .5, px + .5, py - .5, pz + .5); for (var q = 0; q < 4; q++) g2.n.push(0, -1, 0); }
      else if (ni === 4) { g2.v.push(px + .5, py - .5, pz + .5, px + .5, py + .5, pz + .5, px - .5, py + .5, pz + .5, px - .5, py - .5, pz + .5); for (var q = 0; q < 4; q++) g2.n.push(0, 0, 1); }
      else { g2.v.push(px - .5, py - .5, pz - .5, px - .5, py + .5, pz - .5, px + .5, py + .5, pz - .5, px + .5, py - .5, pz - .5); for (var q = 0; q < 4; q++) g2.n.push(0, 0, -1); }
      g2.u.push(0, 0, 0, 1, 1, 1, 1, 0);
      g2.f.push(vi2, vi2 + 1, vi2 + 2, vi2, vi2 + 2, vi2 + 3);
    }
  }

  for (var fk3 in geo) {
    var g3 = geo[fk3], pp = fk3.split('_'), bid = +pp[0], face = pp[1];
    var bg = new THREE.BufferGeometry();
    bg.setAttribute('position', new THREE.Float32BufferAttribute(g3.v, 3));
    bg.setAttribute('normal', new THREE.Float32BufferAttribute(g3.n, 3));
    bg.setAttribute('uv', new THREE.Float32BufferAttribute(g3.u, 2));
    bg.setIndex(g3.f);
    var mt = getMaterial(bid, face); if (!mt) continue;
    var ms = new THREE.Mesh(bg, mt); ms.receiveShadow = true; ms.castShadow = true;
    grp.add(ms);
  }
  scene.add(grp); chunkMeshes[k] = grp;
}
