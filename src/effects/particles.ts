import * as THREE from 'three';
import { B } from '../data/blocks';
import { scene } from '../rendering/scene-setup';
import type { BreakParticle } from '../types/effects';

const { max: mx, random: rn } = Math;

export const particles: BreakParticle[] = [];
const partGroup = new THREE.Group(); scene.add(partGroup);
const partGeo = new THREE.BoxGeometry(.1, .1, .1);
const partMatCache: Record<number, THREE.MeshLambertMaterial> = {};

function getPartMat(col: number): THREE.MeshLambertMaterial {
  if (partMatCache[col]) return partMatCache[col].clone();
  var m = new THREE.MeshLambertMaterial({ color: col, transparent: true });
  partMatCache[col] = m; return m.clone();
}

export function spawnBreakParticles(x: number, y: number, z: number, blockId: number): void {
  var b = B[blockId]; if (!b) return;
  var col = b.c.t || b.c.s;
  for (var i = 0; i < 6; i++) {
    var c2 = col + ((i * 37 + 13) & 0x0f0f0f) - (0x080808);
    var m = new THREE.Mesh(partGeo, getPartMat(mx(0, c2)));
    var px2 = x + .15 + rn() * .7, py2 = y + .15 + rn() * .7, pz2 = z + .15 + rn() * .7;
    m.position.set(px2, py2, pz2);
    var sc = .6 + rn() * .8; m.scale.set(sc, sc, sc);
    partGroup.add(m);
    particles.push({ m: m, x: px2, y: py2, z: pz2, vx: (rn() - .5) * 2.5, vy: 1.5 + rn() * 3, vz: (rn() - .5) * 2.5, life: 0.5 + rn() * .3, ml: 0.5 + rn() * .3 });
  }
}

export function updateParticles(dt: number): void {
  for (var i = particles.length - 1; i >= 0; i--) {
    var p = particles[i]; p.life -= dt;
    if (p.life <= 0) { partGroup.remove(p.m); (p.m.material as THREE.MeshLambertMaterial).dispose(); particles.splice(i, 1); continue; }
    p.vy -= 16 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
    p.m.position.set(p.x, p.y, p.z); p.m.rotation.x += dt * 6; p.m.rotation.z += dt * 4;
    (p.m.material as THREE.MeshLambertMaterial).opacity = p.life / p.ml;
  }
}
