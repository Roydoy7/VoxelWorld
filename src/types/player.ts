export type GameMode = 0 | 1; // 0 = survival, 1 = creative
export type ViewMode = 0 | 1 | 2;

export interface ItemStack {
  id: number;
  q: number;
}

export interface MiningTarget {
  x: number;
  y: number;
  z: number;
}

export interface PlayerState {
  x: number; y: number; z: number;
  vx: number; vy: number; vz: number;
  rx: number; ry: number;
  hp: number; maxHp: number;
  hunger: number; saturation: number;
  xp: number; level: number; xpNext: number;
  hb: (ItemStack | null)[];
  sel: number;
  fly: boolean; sprint: boolean;
  gnd: boolean; fallY: number;
  dead: boolean;
  mineT: number; mineB: MiningTarget | null;
  crouch: boolean;
  viewMode: ViewMode;
  wa: number;
  gm: GameMode;
}
