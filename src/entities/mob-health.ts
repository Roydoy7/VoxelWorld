import * as THREE from 'three';
import { MOB_TYPES } from '../data/mob-types';
import type { MobInstance, MobHealthBar } from '../types/mobs';

const { min: mn, ceil } = Math;

export function makeHPBar(maxHP: number): MobHealthBar {
  var cv = document.createElement('canvas'); cv.width = mn(maxHP * 8, 128); cv.height = 10;
  var tex = new THREE.CanvasTexture(cv); tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.NearestFilter;
  var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
  sp.scale.set(mn(maxHP * .12, 2), .15, 1); sp.visible = false;
  return { sp: sp, cv: cv, tex: tex };
}

export function updateMobHPBar(m: MobInstance): void {
  if (!m.hpBar) { var hb = makeHPBar(m.mhp); m.hpBar = hb; m.mesh.add(hb.sp); }
  var b = m.hpBar, cv = b.cv, ctx = cv.getContext('2d')!;
  ctx.clearRect(0, 0, cv.width, cv.height);
  var hearts = ceil(m.mhp / 2);
  for (var i = 0; i < hearts; i++) {
    var v = m.hp - i * 2, x = i * 8 + 1, y = 1;
    if (v <= 0) ctx.fillStyle = '#333';
    else if (v === 1) ctx.fillStyle = '#a00';
    else ctx.fillStyle = '#e22';
    ctx.fillRect(x + 1, y, 2, 1); ctx.fillRect(x + 4, y, 2, 1);
    ctx.fillRect(x, y + 1, 7, 1); ctx.fillRect(x, y + 2, 7, 1);
    ctx.fillRect(x + 1, y + 3, 5, 1); ctx.fillRect(x + 2, y + 4, 3, 1); ctx.fillRect(x + 3, y + 5, 1, 1);
    if (v === 1) { ctx.fillStyle = '#333'; ctx.fillRect(x + 4, y, 2, 1); ctx.fillRect(x + 4, y + 1, 3, 1); ctx.fillRect(x + 4, y + 2, 3, 1); ctx.fillRect(x + 4, y + 3, 2, 1); ctx.fillRect(x + 4, y + 4, 1, 1); }
  }
  b.tex.needsUpdate = true;
  var mt = MOB_TYPES[m.type]; var yOff = mt.n === '蜘蛛' ? .6 : mt.n === '鸡' ? 1 : mt.n === '史莱姆' ? .8 : mt.passive ? 1.3 : 2;
  b.sp.position.set(0, yOff, 0); b.sp.visible = m.hp < m.mhp;
}
