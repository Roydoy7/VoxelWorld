import { WORLD_SIZE as WS } from '../constants';
import type { PlayerState } from '../types/player';

export const P: PlayerState = {
  x: WS / 2 + .5, y: 60, z: WS / 2 + .5,
  vx: 0, vy: 0, vz: 0,
  rx: 0, ry: 0,
  hp: 20, maxHp: 20,
  hunger: 20, saturation: 5,
  xp: 0, level: 0, xpNext: 7,
  hb: new Array(9).fill(null),
  sel: 0,
  fly: false, sprint: false,
  gnd: false, fallY: 0,
  dead: false,
  mineT: 0, mineB: null,
  crouch: false,
  viewMode: 0 as 0,
  wa: 0,
  gm: 0 as 0
};

export let swingT = 0;
export const swingDur = 0.25;
export function setSwingT(v: number): void { swingT = v; }

export function resetPlayer(data?: {
  x: number; y: number; z: number;
  rx: number; ry: number;
  hp: number; maxHp: number;
  hunger: number; saturation: number;
  xp: number; level: number; xpNext: number;
  hb: any[];
  sel: number;
  fly: boolean;
}): void {
  if (data) {
    P.x = data.x; P.y = data.y; P.z = data.z;
    P.rx = data.rx; P.ry = data.ry;
    P.hp = data.hp; P.maxHp = data.maxHp;
    P.hunger = data.hunger; P.saturation = data.saturation;
    P.xp = data.xp; P.level = data.level; P.xpNext = data.xpNext;
    P.hb = data.hb.map(function (s: any) { return s ? { id: s.id, q: s.q } : null; });
    P.sel = data.sel;
    P.fly = data.fly;
  } else {
    P.x = WS / 2 + .5; P.y = 60; P.z = WS / 2 + .5;
    P.rx = 0; P.ry = 0;
    P.hp = 20; P.maxHp = 20;
    P.hunger = 20; P.saturation = 5;
    P.xp = 0; P.level = 0; P.xpNext = 7;
    P.hb = new Array(9).fill(null);
    P.sel = 0;
    P.fly = false;
  }
  P.vx = 0; P.vy = 0; P.vz = 0;
  P.sprint = false; P.gnd = false; P.fallY = P.y;
  P.dead = false; P.mineT = 0; P.mineB = null;
  P.crouch = false; P.viewMode = 0 as 0; P.wa = 0;
}
