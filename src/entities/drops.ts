import * as THREE from 'three';
import { generateTexture } from '../rendering/textures';
import { P } from '../player/player-state';
import { B } from '../data/blocks';
import { scene } from '../rendering/scene-setup';
import { showAlert } from '../ui/dom-helpers';
import { updateHotbar } from '../ui/hotbar';
import { getBlock } from '../world/chunk-storage';
import type { ItemDrop } from '../types/effects';

const { floor: fl, sqrt: sq, sin, random: rn } = Math;

function groundBelow(x: number, y: number, z: number): number {
  for (var yy = fl(y); yy >= 0; yy--) { var bb = getBlock(fl(x), yy, fl(z)); if (bb && bb !== 120) return yy + 1; }
  return 0;
}

export const drops: ItemDrop[] = [];
const dropGroup = new THREE.Group(); scene.add(dropGroup);

export function resetDrops(): void {
  for (var i = drops.length - 1; i >= 0; i--) {
    dropGroup.remove(drops[i].m);
    drops[i].m.geometry.dispose();
  }
  drops.length = 0;
}

function makeDropMat(id: number, face: string): THREE.MeshLambertMaterial {
  var cv = generateTexture(id, face); if (!cv) cv = generateTexture(id, 'top') || generateTexture(id, 'side');
  if (!cv) return new THREE.MeshLambertMaterial({ color: 0xffffff });
  var tex = new THREE.CanvasTexture(cv); tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.NearestFilter;
  return new THREE.MeshLambertMaterial({ map: tex });
}

export function spawnDrop(x: number, y: number, z: number, id: number, qty: number): void {
  var mats = [makeDropMat(id, 'side'), makeDropMat(id, 'side'), makeDropMat(id, 'top'), makeDropMat(id, 'bottom'), makeDropMat(id, 'side'), makeDropMat(id, 'side')];
  var m = new THREE.Mesh(new THREE.BoxGeometry(.25, .25, .25), mats);
  m.position.set(x, y, z); m.castShadow = true; dropGroup.add(m);
  drops.push({ m: m, x: x + (rn() - .5) * .3, y: y, z: z + (rn() - .5) * .3, vy: 4, id: id, qty: qty, age: 0 });
}

export function pickUp(id: number, qty: number): boolean {
  for (var i = 0; i < 9; i++) { if (P.hb[i] && P.hb[i]!.id === id) { P.hb[i]!.q += qty; updateHotbar(); return true; } }
  for (var i = 0; i < 9; i++) { if (!P.hb[i]) { P.hb[i] = { id: id, q: qty }; updateHotbar(); return true; } }
  return false;
}

export function updateDrops(dt: number): void {
  for (var i = drops.length - 1; i >= 0; i--) {
    var d = drops[i]; d.age += dt; d.vy -= 12 * dt; d.y += d.vy * dt;
    if (d.vy > 0 && getBlock(fl(d.x), fl(d.y + .3), fl(d.z))) { d.vy = 0; }
    var gy = groundBelow(d.x, d.y, d.z); if (d.y < gy) { d.y = gy; d.vy = 0; }
    d.m.position.set(d.x, d.y + .15 + sin(d.age * 3) * .08, d.z);
    d.m.rotation.y += dt * 2;
    if (d.age > 0.5 && sq((d.x - P.x) * (d.x - P.x) + (d.y - P.y + .5) * (d.y - P.y + .5) + (d.z - P.z) * (d.z - P.z)) < 1.5) {
      if (pickUp(d.id, d.qty)) { dropGroup.remove(d.m); d.m.geometry.dispose(); drops.splice(i, 1); continue; }
    }
    if (d.age > 120) { dropGroup.remove(d.m); d.m.geometry.dispose(); drops.splice(i, 1); }
  }
}
