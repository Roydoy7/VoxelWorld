import { WORLD_SIZE as WS } from '../constants';
import { P } from './player-state';
import { $, showAlert } from '../ui/dom-helpers';
import { renderer } from '../rendering/scene-setup';
import { findGround } from '../entities/mob-spawner';

const { floor: fl, max: mx, min: mn, sqrt: sq } = Math;

// HP display
export function updateHP(): void {
  var h = ''; for (var i = 0; i < 10; i++) { var v = P.hp - i * 2; h += '<div class="ht' + (v <= 0 ? ' x' : v === 1 ? ' half' : '') + '"></div>'; }
  var el = $('hp'); if (el) el.innerHTML = h;
}

export function updateHungerUI(): void {
  var h = ''; for (var i = 0; i < 10; i++) { var v = P.hunger - i * 2; h += '<div class="hg' + (v <= 0 ? ' x' : v === 1 ? ' half' : '') + '"></div>'; }
  var el = $('hunger'); if (el) el.innerHTML = h;
}

export function updateXP(): void {
  var el = $('xpfill'); if (el) el.style.width = (P.xp / P.xpNext * 100) + '%';
  var lv = $('xplvl'); if (lv) lv.textContent = P.level > 0 ? '' + P.level : '';
}

export function addXP(n: number): void {
  P.xp += n;
  while (P.xp >= P.xpNext) { P.xp -= P.xpNext; P.level++; P.xpNext = fl(7 + P.level * 2.5); showAlert('升级！等级 ' + P.level); }
  updateXP();
}

// Damage
function dmgFlash(): void {
  var el = $('dmg'); if (el) { el.style.borderColor = 'rgba(200,0,0,.4)'; setTimeout(function () { el!.style.borderColor = 'transparent'; }, 200); }
}

export function hurtPlayer(n: number, src?: string, kbx?: number, kbz?: number): void {
  if (P.dead || P.gm === 1) return;
  P.hp = mx(0, P.hp - n); updateHP(); dmgFlash();
  if (src) showAlert(src + ' -' + n);
  if (kbx !== undefined && kbz !== undefined) {
    var kbl = sq(kbx * kbx + kbz * kbz);
    if (kbl > .01) { P.vx = kbx / kbl * 12; P.vz = kbz / kbl * 12; P.vy = 5; }
  }
  if (P.hp <= 0) die();
}

function die(): void {
  if (P.gm === 1) return;
  P.dead = true; var el = $('die'); if (el) el.style.display = 'flex'; document.exitPointerLock();
}

export function respawn(): void {
  P.hp = 20; P.hunger = 20; P.xp = 0; P.level = 0; P.xpNext = 7; P.dead = false;
  P.x = WS / 2 + .5; P.z = WS / 2 + .5; P.y = findGround(fl(P.x), fl(P.z)) + 2;
  P.vx = P.vy = P.vz = 0; P.fly = false;
  updateHP(); updateHungerUI(); updateXP();
  var el = $('die'); if (el) el.style.display = 'none'; renderer.domElement.requestPointerLock();
}

// Hunger system
var hungerT = 0, regenT = 0, starveT = 0, healOT = 0, healOV = 0;
export function updateHungerSystem(dt: number): void {
  if (P.gm === 1) return;
  hungerT += dt; if (P.sprint && P.gnd) hungerT += dt * 1.5;
  if (hungerT >= 30) { hungerT = 0; if (P.hunger > 0) { P.hunger = mx(0, P.hunger - 1); updateHungerUI(); } }
  if (P.hunger <= 0) { starveT += dt; if (starveT >= 4) { starveT = 0; P.hp = mx(0, P.hp - 1); updateHP(); dmgFlash(); if (P.hp <= 0) die(); } }
  else starveT = 0;
  if (P.hunger >= 18 && P.hp < P.maxHp) { regenT += dt; if (regenT >= 3) { regenT = 0; P.hp = mn(P.maxHp, P.hp + 1); updateHP(); } }
  else regenT = 0;
  if (healOV > 0) { healOT += dt; if (healOT >= 1.5) { healOT = 0; healOV--; P.hp = mn(P.maxHp, P.hp + 1); updateHP(); } }
}

export function eat(fv: number): void {
  P.hunger = mn(20, P.hunger + fv); updateHungerUI();
  healOV += fl(fv / 2); if (healOV > 10) healOV = 10; healOT = 0;
  showAlert('+' + fv + ' 饥饿值');
}
