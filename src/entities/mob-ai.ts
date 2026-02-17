import * as THREE from 'three';
import { WORLD_SIZE as WS } from '../constants';
import { MOB_TYPES } from '../data/mob-types';
import { P } from '../player/player-state';
import { hurtPlayer, addXP } from '../player/player-stats';
import { shoot } from './arrows';
import { creeperBoom } from '../effects/explosions';
import { spawnDrop } from './drops';
import { updateMobHPBar } from './mob-health';
import { mobs, mobGroup, findGround } from './mob-spawner';
import { showAlert } from '../ui/dom-helpers';
import { playMobIdle, playMobHurt, playMobDeath } from '../audio/mob-sounds';
import type { MobInstance } from '../types/mobs';

const { max: mx, min: mn, abs: ab, sqrt: sq, sin, cos, random: rn, PI, atan2 } = Math;

export function updateMobs(dt: number): void {
  for (var i = mobs.length - 1; i >= 0; i--) {
    var m = mobs[i];
    if (m.dead) { m.dt -= dt; m.mesh.rotation.z += dt * 4; m.mesh.position.y -= dt * 2.5; if (m.dt <= 0) { mobGroup.remove(m.mesh); mobs.splice(i, 1); } continue; }
    var t = MOB_TYPES[m.type], ddx = P.x - m.x, ddz = P.z - m.z, dist = sq(ddx * ddx + ddz * ddz);
    var agg = dist < t.ag && !P.dead && !t.passive;

    // Ambient idle sounds
    if (!m.sndT) m.sndT = 3 + rn() * 5;
    m.sndT -= dt;
    if (m.sndT <= 0) {
      m.sndT = 4 + rn() * 8;
      playMobIdle(m.type, m.x, m.y, m.z);
    }

    // Passive flee
    if (t.passive && m.flee > 0) {
      m.flee -= dt; agg = false;
      var fang = atan2(-ddx, -ddz); m.mesh.rotation.y = fang;
      var nx2 = m.x + sin(fang) * t.sp * 2 * dt, nz2 = m.z + cos(fang) * t.sp * 2 * dt;
      var gy = findGround(nx2, nz2); if (gy > 0 && ab(gy - m.y) < 2) { m.x = nx2; m.z = nz2; m.y = gy; }
    }
    m.wa += dt * 5;

    if (agg) {
      var ang = atan2(ddx, ddz); m.mesh.rotation.y = ang;
      if ((!t.ra && dist > 1.5) || (t.ra && dist < 4)) {
        var sp = t.ra && dist < 4 ? -t.sp : t.sp;
        var nx2 = m.x + sin(ang) * sp * dt, nz2 = m.z + cos(ang) * sp * dt;
        var gy = findGround(nx2, nz2); if (gy > 0 && ab(gy - m.y) < 2.5) { m.x = nx2; m.z = nz2; m.y = gy; }
      }
      if (!t.ra && !t.ex && dist < t.rg) { m.acd -= dt; if (m.acd <= 0) { hurtPlayer(t.dm, t.n, P.x - m.x, P.z - m.z); m.acd = 1; } }
      if (t.ra && dist > 4 && dist < t.rg) { m.scd -= dt; if (m.scd <= 0) { shoot(m.x, m.y + 1.3, m.z, P.x, P.y - .2, P.z, t.dm); m.scd = 2 + rn(); } }
      if (t.ex && dist < t.rg) {
        if (!m.fusing) { m.fusing = 1; m.fuse = 2; }
        m.fuse -= dt;
        var flash = sin(m.fuse * 12) > 0;
        m.mesh.traverse(function (c: any) { if (c.material && c.material.emissive) c.material.emissive.setHex(flash ? 0xffffff : 0); });
        if (m.fuse <= 0) { creeperBoom(m); continue; }
      } else if (t.ex && m.fusing) {
        m.fusing = 0; m.fuse = 0;
        m.mesh.traverse(function (c: any) { if (c.material && c.material.emissive) c.material.emissive.setHex(0); });
      }
    } else if (!t.passive || m.flee <= 0) {
      m.pt -= dt;
      if (m.pt <= 0) { m.tx = mx(3, mn(WS - 3, m.x + (rn() - .5) * 8)); m.tz = mx(3, mn(WS - 3, m.z + (rn() - .5) * 8)); m.pt = 3 + rn() * 4; }
      var wdx = m.tx - m.x, wdz = m.tz - m.z, wd = sq(wdx * wdx + wdz * wdz);
      if (wd > .5) {
        var ang2 = atan2(wdx, wdz); m.mesh.rotation.y = ang2;
        var nx3 = m.x + sin(ang2) * t.sp * .25 * dt, nz3 = m.z + cos(ang2) * t.sp * .25 * dt;
        var gy2 = findGround(nx3, nz3); if (gy2 > 0 && ab(gy2 - m.y) < 2) { m.x = nx3; m.z = nz3; m.y = gy2; }
      }
    }

    var la = sin(m.wa) * .6;
    m.mesh.traverse(function (c: any) {
      if (c.name === 'legL' || c.name === 'leg0' || c.name === 'leg2') c.rotation.x = la;
      if (c.name === 'legR' || c.name === 'leg1' || c.name === 'leg3') c.rotation.x = -la;
      if (c.name === 'armL') c.rotation.x = -la * .5 - PI / 3;
      if (c.name === 'armR') c.rotation.x = la * .5 - PI / 3;
    });
    m.mesh.position.set(m.x, m.y, m.z);
  }
}

export function hitMob(mob: MobInstance, dm: number): void {
  mob.hp -= dm; if (mob.hp < 0) mob.hp = 0;
  updateMobHPBar(mob);
  mob.mesh.traverse(function (c: any) { if (c.material && c.material.emissive) c.material.emissive = new THREE.Color(0xff0000); });
  setTimeout(function () { mob.mesh.traverse(function (c: any) { if (c.material && c.material.emissive) c.material.emissive = new THREE.Color(0); }); }, 150);
  var t = MOB_TYPES[mob.type];
  if (t.passive) mob.flee = 3;
  var kbx = mob.x - P.x, kbz = mob.z - P.z, kbl = sq(kbx * kbx + kbz * kbz);
  if (kbl > .1) { mob.x += kbx / kbl * .5; mob.z += kbz / kbl * .5; }
  if (mob.hp <= 0) {
    mob.dead = 1; mob.dt = .6; showAlert(t.n + ' 被击杀！');
    playMobDeath(mob.type, mob.x, mob.y, mob.z);
    addXP(t.passive ? 1 : 5);
    if (t.drop) { for (var di = 0; di < t.drop.length; di++) { var dr = t.drop[di]; if (dr[0]) spawnDrop(mob.x, mob.y + .5, mob.z, dr[0], dr[1]); } }
  } else {
    playMobHurt(mob.type, mob.x, mob.y, mob.z);
  }
}
