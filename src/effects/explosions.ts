import * as THREE from 'three';
import { WORLD_SIZE as WS, CHUNK_SIZE as CS } from '../constants';
import { B } from '../data/blocks';
import { getBlock, setBlock } from '../world/chunk-storage';
import { buildChunk } from '../world/chunk-mesh-builder';
import { P } from '../player/player-state';
import { hurtPlayer } from '../player/player-stats';
import { mobs, mobGroup } from '../entities/mob-spawner';
import { scene } from '../rendering/scene-setup';
import type { ExplosionParticle } from '../types/effects';
import type { MobInstance } from '../types/mobs';

const { floor: fl, max: mx, sqrt: sq, random: rn } = Math;

const explosionParticles: ExplosionParticle[] = [];

function boom(ex: number, ey: number, ez: number): void {
  for (var i = 0; i < 15; i++) {
    var m = new THREE.Mesh(new THREE.BoxGeometry(.2, .2, .2), new THREE.MeshBasicMaterial({ color: rn() > .4 ? 0xff6600 : 0xffcc00 }));
    m.position.set(ex, ey, ez); scene.add(m);
    explosionParticles.push({ m: m, vx: (rn() - .5) * 8, vy: rn() * 10, vz: (rn() - .5) * 8, l: .6 + rn() * .4 });
  }
}

export function updateExplosions(dt: number): void {
  for (var i = explosionParticles.length - 1; i >= 0; i--) {
    var e = explosionParticles[i]; e.l -= dt; e.vy -= 14 * dt;
    e.m.position.x += e.vx * dt; e.m.position.y += e.vy * dt; e.m.position.z += e.vz * dt;
    e.m.scale.setScalar(mx(.01, e.l * 2));
    if (e.l <= 0) { scene.remove(e.m); e.m.geometry.dispose(); explosionParticles.splice(i, 1); }
  }
}

export function creeperBoom(m: MobInstance): void {
  var cx2 = fl(m.x), cy2 = fl(m.y), cz2 = fl(m.z), r = 3;
  for (var dx = -r; dx <= r; dx++) for (var dy = -r; dy <= r; dy++) for (var dz = -r; dz <= r; dz++) {
    if (dx * dx + dy * dy + dz * dz <= r * r) {
      var id = getBlock(cx2 + dx, cy2 + dy, cz2 + dz);
      if (id && !(B[id] && B[id].nb)) setBlock(cx2 + dx, cy2 + dy, cz2 + dz, 0);
    }
  }
  for (var dx2 = -2; dx2 <= 2; dx2++) for (var dz2 = -2; dz2 <= 2; dz2++) {
    var ncx = mx(0, fl((cx2 + dx2 * CS) / CS)), ncz = mx(0, fl((cz2 + dz2 * CS) / CS));
    if (ncx < WS / CS && ncz < WS / CS) buildChunk(ncx, ncz);
  }
  var d = sq((P.x - m.x) * (P.x - m.x) + (P.y - m.y) * (P.y - m.y) + (P.z - m.z) * (P.z - m.z));
  if (d < 6) hurtPlayer(fl(10 * (1 - d / 6) + 1), '苦力怕');
  boom(m.x, m.y + .5, m.z); mobGroup.remove(m.mesh); mobs.splice(mobs.indexOf(m), 1);
}
