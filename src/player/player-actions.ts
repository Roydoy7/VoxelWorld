import { B } from '../data/blocks';
import { BLOCK_DROPS } from '../data/block-drops';
import { setBlock } from '../world/chunk-storage';
import { rebuildNear } from '../world/chunk-manager';
import { raycast, faceOffset } from '../input/raycasting';
import { mouseButton, setMouseButton } from '../input/input-manager';
import { P, swingT, swingDur, setSwingT } from './player-state';
import { addXP, eat } from './player-stats';
import { spawnDrop } from '../entities/drops';
import { spawnBreakParticles } from '../effects/particles';
import { hitMob } from '../entities/mob-ai';
import { mobs } from '../entities/mob-spawner';
import { crackBox, crackMats } from '../effects/crack-overlay';
import { hlBox } from '../ui/block-highlight';
import { updateHotbar } from '../ui/hotbar';

const { floor: fl, min: mn, abs: ab, sqrt: sq, sin, cos, PI } = Math;

function getBreakTime(bid: number, toolLv: number): number {
  if (bid === 12) return 999;
  var base: number;
  var bb = B[bid];
  if (bid === 1 || bid === 2 || bid === 72 || bid === 71 || bid === 9 || bid === 10 || bid === 11 || bid === 346) base = 1.5;
  else if (bb && (bb.f || bb.t && bid !== 3 && bid !== 4)) base = 0.4;
  else if (bb && bb.gl) base = 0.8;
  else if (bid === 3 || bid === 4 || bid === 21 || bid === 22 || bid === 23 || bid === 90 || bid === 91 || bid === 92 || bid === 94 || bid === 95 || bid === 118 || (bid >= 26 && bid <= 29) || bid === 61) base = 6.0;
  else if (bb && bb.o) base = 7.0;
  else base = 2.5;
  var isPick = toolLv >= 1 && toolLv <= 4;
  if (isPick) base /= [1, 3, 5, 8, 12][toolLv];
  return base;
}
var atkCD = 0;

export let invOpen = false;
export let craftOpen = false;
export function setInvOpen(v: boolean): void { invOpen = v; }
export function setCraftOpen(v: boolean): void { craftOpen = v; }

var onCraftTable: (() => void) | null = null;
export function setOnCraftTable(fn: () => void): void { onCraftTable = fn; }

export function updateActions(dt: number): void {
  if (P.dead || invOpen || craftOpen) return;
  if (atkCD > 0) atkCD -= dt;
  var eyeH = P.crouch ? 1.32 : 1.62;
  var adx = -sin(P.ry) * cos(P.rx), ady = sin(P.rx), adz = -cos(P.ry) * cos(P.rx);
  var hit = raycast(P.x, P.y + eyeH, P.z, adx, ady, adz, 6);

  if (hit) {
    hlBox.position.set(hit.x + .5, hit.y + .5, hit.z + .5); hlBox.visible = true;
    if (mouseButton === 1) {
      if (P.gm === 1) {
        setMouseButton(0); setSwingT(swingDur);
        spawnBreakParticles(hit.x, hit.y, hit.z, hit.id);
        setBlock(hit.x, hit.y, hit.z, 0); rebuildNear(hit.x, hit.z);
      } else {
        if (!P.mineB || P.mineB.x !== hit.x || P.mineB.y !== hit.y || P.mineB.z !== hit.z) { P.mineT = 0; P.mineB = { x: hit.x, y: hit.y, z: hit.z }; }
        if (swingT <= 0) setSwingT(swingDur);
        var tl = P.hb[P.sel] ? P.hb[P.sel]!.id : 0;
        var toolLv = B[tl] ? B[tl].tool : 0;
        var spd = getBreakTime(hit.id, toolLv);
        P.mineT += dt;
        var stage = mn(4, fl(P.mineT / spd * 5));
        crackBox.material = crackMats[stage];
        crackBox.position.set(hit.x + .5, hit.y + .5, hit.z + .5); crackBox.visible = true;
        if (P.mineT >= spd) {
          P.mineT = 0; crackBox.visible = false;
          spawnBreakParticles(hit.x, hit.y, hit.z, hit.id);
          var dropId = BLOCK_DROPS[hit.id] !== undefined ? BLOCK_DROPS[hit.id] : hit.id;
          if (dropId > 0) spawnDrop(hit.x + .5, hit.y + .5, hit.z + .5, dropId, 1);
          setBlock(hit.x, hit.y, hit.z, 0); rebuildNear(hit.x, hit.z); addXP(1);
        }
      }
    } else { crackBox.visible = false; }

    if (mouseButton === 2) {
      setMouseButton(0);
      if (hit.id === 49) { if (onCraftTable) onCraftTable(); return; }
      var fo = faceOffset(hit.face);
      var px2 = hit.x + fo[0], py2 = hit.y + fo[1], pz2 = hit.z + fo[2];
      var it = P.hb[P.sel];
      if (it && B[it.id] && !B[it.id].nb && !B[it.id].food) {
        if (!(fl(P.x) === px2 && (fl(P.y) === py2 || fl(P.y + 1) === py2) && fl(P.z) === pz2)) {
          setBlock(px2, py2, pz2, it.id); rebuildNear(px2, pz2);
          if (P.gm !== 1) { it.q--; if (it.q <= 0) P.hb[P.sel] = null; }
          updateHotbar();
        }
      }
      if (it && B[it.id] && B[it.id].food > 0 && P.hunger < 20) {
        eat(B[it.id].food);
        if (P.gm !== 1) { it.q--; if (it.q <= 0) P.hb[P.sel] = null; }
        updateHotbar();
      }
    }
  } else { hlBox.visible = false; crackBox.visible = false; P.mineT = 0; P.mineB = null; }

  // Melee attack
  if (mouseButton === 1 && atkCD <= 0) {
    var tl2 = P.hb[P.sel] ? B[P.hb[P.sel]!.id] : null;
    var hasTool = tl2 && tl2.tool >= 5;
    var aDmg = hasTool ? tl2!.tool - 4 : 0.5;
    for (var i = 0; i < mobs.length; i++) {
      var m = mobs[i]; if (m.dead) continue;
      var md = sq((m.x - P.x) * (m.x - P.x) + (m.y + .8 - P.y - 1.5) * (m.y + .8 - P.y - 1.5) + (m.z - P.z) * (m.z - P.z));
      if (md < 3) {
        var toM = Math.atan2(-(m.x - P.x), -(m.z - P.z));
        var ang = ab(((toM - P.ry) % (PI * 2) + PI * 3) % (PI * 2) - PI);
        if (ang < PI / 3) { hitMob(m, aDmg); atkCD = .4; setSwingT(swingDur); break; }
      }
    }
  }
}
