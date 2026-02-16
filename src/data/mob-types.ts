import type { MobTypes } from '../types/mobs';

export const MOB_TYPES: MobTypes = {
  zombie: { n: '僵尸', hp: 20, sp: 2.5, ag: 16, rg: 2, dm: 3, ra: 0, ex: 0, col: 0x2a6a2a, col2: 0x1a4a1a, drop: [[0, 0]] },
  skeleton: { n: '骷髅', hp: 20, sp: 2.2, ag: 16, rg: 15, dm: 3, ra: 1, ex: 0, col: 0xd0d0c0, col2: 0xb0b0a0, drop: [[224, 1], [227, 1]] },
  creeper: { n: '苦力怕', hp: 20, sp: 2.8, ag: 12, rg: 3, dm: 0, ra: 0, ex: 1, col: 0x30a030, col2: 0x209020, drop: [[226, 1]] },
  spider: { n: '蜘蛛', hp: 16, sp: 3.2, ag: 12, rg: 2, dm: 2, ra: 0, ex: 0, col: 0x3a2a1a, col2: 0x880000, drop: [[225, 1]] },
  slime: { n: '史莱姆', hp: 12, sp: 1.5, ag: 10, rg: 2, dm: 2, ra: 0, ex: 0, col: 0x60c060, col2: 0x40a040, drop: [[86, 1]] },
  pig: { n: '猪', hp: 10, sp: 1.5, ag: 0, rg: 0, dm: 0, ra: 0, ex: 0, col: 0xf0a0a0, col2: 0xe09090, drop: [[210, 1]], passive: 1 },
  cow: { n: '牛', hp: 10, sp: 1.5, ag: 0, rg: 0, dm: 0, ra: 0, ex: 0, col: 0x6a3a1a, col2: 0xf0f0f0, drop: [[212, 1], [223, 1]], passive: 1 },
  sheep: { n: '羊', hp: 8, sp: 1.5, ag: 0, rg: 0, dm: 0, ra: 0, ex: 0, col: 0xe8e8e8, col2: 0xd0d0d0, drop: [[31, 1], [216, 1]], passive: 1 },
  chicken: { n: '鸡', hp: 4, sp: 1.8, ag: 0, rg: 0, dm: 0, ra: 0, ex: 0, col: 0xf0f0f0, col2: 0xc02020, drop: [[214, 1], [227, 1]], passive: 1 },
};
