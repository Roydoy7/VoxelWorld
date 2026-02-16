import * as THREE from 'three';
import { getBlock } from '../world/chunk-storage';
import { P } from '../player/player-state';
import { hurtPlayer } from '../player/player-stats';
import { scene } from '../rendering/scene-setup';
import type { ArrowProjectile } from '../types/effects';

const { floor: fl, sqrt: sq } = Math;

export const arrows: ArrowProjectile[] = [];
const arrowGroup = new THREE.Group(); scene.add(arrowGroup);

export function shoot(fx: number, fy: number, fz: number, tx: number, ty: number, tz: number, dm: number): void {
  var ddx = tx - fx, ddy = ty - fy, ddz = tz - fz, l = sq(ddx * ddx + ddy * ddy + ddz * ddz);
  if (l < .1) return; var s = 16;
  var m = new THREE.Mesh(new THREE.BoxGeometry(.05, .05, .45), new THREE.MeshLambertMaterial({ color: 0x6B3A1A }));
  m.position.set(fx, fy, fz); m.lookAt(tx, ty, tz); m.castShadow = true; arrowGroup.add(m);
  arrows.push({ m: m, x: fx, y: fy, z: fz, vx: ddx / l * s, vy: ddy / l * s + 2, vz: ddz / l * s, dm: dm, l: 4 });
}

export function updateArrows(dt: number): void {
  for (var i = arrows.length - 1; i >= 0; i--) {
    var a = arrows[i]; a.l -= dt; a.vy -= 14 * dt;
    a.x += a.vx * dt; a.y += a.vy * dt; a.z += a.vz * dt;
    a.m.position.set(a.x, a.y, a.z); a.m.lookAt(a.x + a.vx, a.y + a.vy, a.z + a.vz);
    if (sq((a.x - P.x) * (a.x - P.x) + (a.y - P.y) * (a.y - P.y) + (a.z - P.z) * (a.z - P.z)) < .9) { hurtPlayer(a.dm, '骷髅', a.vx, a.vz); a.l = -1; }
    if (getBlock(fl(a.x), fl(a.y), fl(a.z)) && getBlock(fl(a.x), fl(a.y), fl(a.z)) !== 120) a.l = -1;
    if (a.l <= 0 || a.y < -5) { arrowGroup.remove(a.m); a.m.geometry.dispose(); arrows.splice(i, 1); }
  }
}
