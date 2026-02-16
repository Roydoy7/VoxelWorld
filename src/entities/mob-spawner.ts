import * as THREE from 'three';
import { WORLD_SIZE as WS, WORLD_HEIGHT as WH, SEA_LEVEL as SEA } from '../constants';
import { getBlock } from '../world/chunk-storage';
import { MOB_TYPES } from '../data/mob-types';
import { makeMobMesh } from './mob-factory';
import { scene } from '../rendering/scene-setup';
import { isNight } from '../rendering/day-night';
import { P } from '../player/player-state';
import type { MobInstance } from '../types/mobs';

const { floor: fl, max: mx, min: mn, sqrt: sq, random: rn, sin, cos, PI } = Math;

export const mobs: MobInstance[] = [];
export const mobGroup = new THREE.Group(); scene.add(mobGroup);

export function resetMobs(): void {
  for (var i = mobs.length - 1; i >= 0; i--) {
    var m = mobs[i];
    mobGroup.remove(m.mesh);
    if (m.hpBar) mobGroup.remove(m.hpBar.sp);
  }
  mobs.length = 0;
}

export function findGround(x: number, z: number): number {
  for (var y = WH - 1; y > 0; y--) { var bb = getBlock(fl(x), y, fl(z)); if (bb && bb !== 120) return y + 1; }
  return -1;
}

export function spawnMob(type: string, x: number, y: number, z: number): void {
  var t = MOB_TYPES[type], mesh = makeMobMesh(type); mesh.position.set(x, y, z); mobGroup.add(mesh);
  mobs.push({ type: type, mesh: mesh, x: x, y: y, z: z, hp: t.hp, mhp: t.hp, wa: 0, acd: 0, scd: rn() * 2, fuse: 0, fusing: 0, pt: 0, tx: x, tz: z, dead: 0, dt: 0, flee: 0 });
}

export function spawnInitialMobs(): void {
  var passive = ['pig', 'cow', 'sheep', 'chicken'];
  for (var i = 0; i < 12; i++) {
    var type = passive[fl(rn() * passive.length)];
    var mx2 = fl(WS / 2 - 40 + rn() * 80), mz = fl(WS / 2 - 40 + rn() * 80);
    var my = findGround(mx2, mz); if (my > SEA && my < WH - 5) spawnMob(type, mx2 + .5, my, mz + .5);
  }
}

var mobSpawnTimer = 0;
export function updateMobRespawn(dt: number): void {
  mobSpawnTimer += dt; if (mobSpawnTimer < 8 || mobs.length >= 50) return; mobSpawnTimer = 0;
  var hostile = ['zombie', 'skeleton', 'creeper', 'spider', 'slime'];
  var passive = ['pig', 'cow', 'sheep', 'chicken'];
  var night = isNight();
  var type: string;
  if (night && rn() < .7) {
    type = hostile[fl(rn() * hostile.length)];
    var ang2 = rn() * PI * 2, dist2 = 10 + rn() * 20;
    var mx2 = P.x + sin(ang2) * dist2, mz = P.z + cos(ang2) * dist2;
    mx2 = mx(3, mn(WS - 3, fl(mx2))); mz = mx(3, mn(WS - 3, fl(mz)));
    var my = findGround(mx2, mz); if (my > SEA && my < WH - 5) spawnMob(type, mx2, my, mz);
  } else {
    type = passive[fl(rn() * passive.length)];
    var ang2 = rn() * PI * 2, dist2 = 8 + rn() * 7;
    var mx2 = P.x + sin(ang2) * dist2, mz = P.z + cos(ang2) * dist2;
    mx2 = mx(3, mn(WS - 3, fl(mx2))); mz = mx(3, mn(WS - 3, fl(mz)));
    var my = findGround(mx2, mz); if (my > SEA && my < WH - 5) spawnMob(type, mx2, my, mz);
  }
  // Despawn hostile mobs during day if far
  if (!night) {
    for (var i = mobs.length - 1; i >= 0; i--) {
      var m = mobs[i]; if (m.dead) continue;
      var t = MOB_TYPES[m.type]; if (!t.passive) {
        var dd = sq((m.x - P.x) * (m.x - P.x) + (m.z - P.z) * (m.z - P.z));
        if (dd > 40) { mobGroup.remove(m.mesh); if (m.hpBar) mobGroup.remove(m.hpBar.sp); mobs.splice(i, 1); }
      }
    }
  }
}
