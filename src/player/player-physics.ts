import * as THREE from 'three';
import { WORLD_SIZE as WS, WORLD_HEIGHT as WH } from '../constants';
import { B } from '../data/blocks';
import { getBlock } from '../world/chunk-storage';
import { keys } from '../input/input-manager';
import { camera } from '../rendering/scene-setup';
import { P, swingT, swingDur, setSwingT } from './player-state';
import {
  pModel, pHead, pHair, pBody, pArmL, pArmR, pHandL, pHandR, pLegL, pLegR, pEyeL, pEyeR,
  fpHand, fpSwingAng, setFpSwingAng
} from './player-model';
import { hurtPlayer } from './player-stats';
import { showAlert } from '../ui/dom-helpers';
import { findGround } from '../entities/mob-spawner';

const { floor: fl, max: mx, min: mn, abs: ab, sqrt: sq, sin, cos, PI } = Math;
var fpTimer = 0;

function AABB(ax: number, ay: number, az: number, hw: number, hh: number): boolean {
  for (var bx = fl(ax - hw); bx <= fl(ax + hw); bx++)
    for (var by = fl(ay); by <= fl(ay + hh); by++)
      for (var bz = fl(az - hw); bz <= fl(az + hw); bz++) {
        var b = getBlock(bx, by, bz); if (b > 0 && !B[b].t && !B[b].nb) return true;
      }
  return false;
}

export function updatePhysics(dt: number): void {
  if (P.dead) return;
  P.crouch = !P.fly && (keys['ShiftLeft'] || keys['ShiftRight']);
  var eyeH = P.crouch ? 1.32 : 1.62;
  var pHeight = P.crouch ? 1.4 : 1.7;
  var sp = P.crouch ? 2.2 : P.sprint ? 6.2 : 4.3; if (P.fly) sp = 12;
  var mv = dt * sp, sx2 = sin(P.ry), cx2 = cos(P.ry), dx = 0, dz = 0;
  if (keys['KeyW']) { dx -= sx2; dz -= cx2; }
  if (keys['KeyS']) { dx += sx2; dz += cx2; }
  if (keys['KeyA']) { dx -= cx2; dz += sx2; }
  if (keys['KeyD']) { dx += cx2; dz -= sx2; }
  P.sprint = !P.crouch && (keys['ControlLeft'] || keys['ControlRight']);
  var len = sq(dx * dx + dz * dz); if (len > .01) { dx /= len; dz /= len; }

  if (P.fly) { P.x += dx * mv; P.z += dz * mv; }
  else {
    var nx = P.x + dx * mv; if (!AABB(nx, P.y, P.z, .28, pHeight)) P.x = nx;
    var nz = P.z + dz * mv; if (!AABB(P.x, P.y, nz, .28, pHeight)) P.z = nz;
  }

  // Knockback velocity
  if (P.vx || P.vz) {
    var kx = P.vx * dt, kz = P.vz * dt;
    if (!P.fly) {
      var knx = P.x + kx; if (!AABB(knx, P.y, P.z, .28, pHeight)) P.x = knx; else P.vx = 0;
      var knz = P.z + kz; if (!AABB(P.x, P.y, knz, .28, pHeight)) P.z = knz; else P.vz = 0;
    } else { P.x += kx; P.z += kz; }
    P.vx *= .88; P.vz *= .88;
    if (ab(P.vx) < .05) P.vx = 0; if (ab(P.vz) < .05) P.vz = 0;
  }

  if (P.fly) {
    P.vy = 0;
    if (keys['Space']) P.y += dt * 8;
    if (keys['ShiftLeft'] || keys['ShiftRight']) P.y -= dt * 8;
    P.gnd = false; P.fallY = P.y;
  } else {
    P.vy -= 28 * dt;
    if (keys['Space'] && P.gnd) { P.vy = 8.5; P.gnd = false; }
    var inW = getBlock(fl(P.x), fl(P.y + .8), fl(P.z)) === 120;
    if (inW) { P.vy = mx(P.vy, -2); if (keys['Space']) P.vy = 4; P.fallY = P.y; }
    var ny = P.y + P.vy * dt;
    if (P.vy < 0 && AABB(P.x, ny, P.z, .28, .01)) {
      if (!P.gnd) { var fd = P.fallY - P.y; if (fd > 3.5 && !inW) { var dmg = fl(fd - 3); hurtPlayer(dmg); showAlert('摔落伤害 -' + dmg); } }
      P.vy = 0; P.gnd = true; P.fallY = P.y;
    } else if (P.vy > 0 && AABB(P.x, ny + pHeight, P.z, .28, .01)) { P.vy = 0; P.y = ny; }
    else { P.y = ny; P.gnd = false; }
  }

  P.x = mx(.5, mn(WS - .5, P.x)); P.z = mx(.5, mn(WS - .5, P.z));
  if (P.y < -5) { if (P.gm === 1) { P.y = findGround(fl(P.x), fl(P.z)) + 2; P.vy = 0; } else hurtPlayer(100); }

  // Walk animation
  var moving = len > .01 && P.gnd;
  if (moving) P.wa += dt * (P.sprint ? 8 : 5); else P.wa *= .85;

  // Camera
  if (P.viewMode === 0) {
    camera.position.set(P.x, P.y + eyeH, P.z);
    camera.rotation.order = 'YXZ'; camera.rotation.y = P.ry; camera.rotation.x = P.rx;
  } else {
    var camDist = 4;
    var cDir = P.viewMode === 1 ? 1 : -1;
    var camX = P.x + sin(P.ry) * camDist * cDir * cos(P.rx);
    var camY = P.y + eyeH - sin(P.rx) * camDist * cDir;
    var camZ = P.z + cos(P.ry) * camDist * cDir * cos(P.rx);
    for (var ci = 0; ci < 10; ci++) {
      var t = ci / 10;
      var tx = P.x + sin(P.ry) * camDist * t * cDir * cos(P.rx);
      var ty = P.y + eyeH - sin(P.rx) * camDist * t * cDir;
      var tz = P.z + cos(P.ry) * camDist * t * cDir * cos(P.rx);
      if (getBlock(fl(tx), fl(ty), fl(tz)) > 0) {
        camDist = camDist * mx(.5, t - .1);
        camX = P.x + sin(P.ry) * camDist * cDir * cos(P.rx);
        camY = P.y + eyeH - sin(P.rx) * camDist * cDir;
        camZ = P.z + cos(P.ry) * camDist * cDir * cos(P.rx); break;
      }
    }
    camera.position.set(camX, camY, camZ);
    camera.lookAt(P.x, P.y + eyeH - .3, P.z);
  }

  // Player model
  pModel.position.set(P.x, P.y, P.z); pModel.rotation.y = P.ry + PI;
  var crouchOff = P.crouch ? -.3 : 0;
  pHead.position.y = 1.5 + crouchOff; pBody.position.y = .87 + crouchOff;
  pArmL.position.y = .87 + crouchOff; pArmR.position.y = .87 + crouchOff;
  pHandL.position.y = .54 + crouchOff; pHandR.position.y = .54 + crouchOff;
  pHair.position.y = 1.62 + crouchOff;
  pEyeL.position.y = 1.5 + crouchOff; pEyeR.position.y = 1.5 + crouchOff;
  if (P.crouch) { pBody.rotation.x = .3; pHead.rotation.x = -.3; }
  else { pBody.rotation.x = 0; pHead.rotation.x = P.rx * .3; }
  var la = sin(P.wa) * .6;
  pLegL.rotation.x = la; pLegR.rotation.x = -la;
  pArmL.rotation.x = -la * .5;

  // Arm swing
  if (swingT > 0) {
    setSwingT(swingT - dt); var sp2 = 1 - swingT / swingDur;
    pArmR.rotation.x = -2.0 * sin(sp2 * PI); pArmR.rotation.z = -.3 * sin(sp2 * PI);
    setFpSwingAng(sin(sp2 * PI) * 1.2);
  } else { pArmR.rotation.x = la * .5; pArmR.rotation.z = 0; setFpSwingAng(fpSwingAng * .8); if (ab(fpSwingAng) < .01) setFpSwingAng(0); }
  pModel.visible = P.viewMode !== 0;

  // First-person hand
  if (P.viewMode === 0) {
    fpHand.visible = true;
    var fsx = sin(P.ry), fcx = cos(P.ry);
    var eyeH2 = P.crouch ? 1.32 : 1.62;
    var hDist = 0.5, hRight = 0.45, hDown = 0.45;
    // Walk bob
    var wBob = sin(P.wa) * .025;
    var wSway = cos(P.wa * .5) * .015;
    // Idle breathing
    fpTimer += dt;
    var idleY = sin(fpTimer * 1.5) * .008;
    var idleR = sin(fpTimer * 1.2) * .015;
    // Swing offset (pull arm forward and across during swing)
    var swFwd = fpSwingAng * .12;
    var swSide = -fpSwingAng * .06;
    fpHand.position.set(
      P.x + fcx * (hRight + wSway + swSide) + (-fsx) * (hDist + swFwd),
      P.y + eyeH2 - hDown + wBob + idleY + sin(P.rx) * (-.25),
      P.z + (-fsx) * (hRight + wSway + swSide) + (-fcx) * (hDist + swFwd)
    );
    fpHand.rotation.set(-P.rx - 0.4 - fpSwingAng + idleR, P.ry + PI, idleR * .5, 'YXZ');
  } else { fpHand.visible = false; }
}
