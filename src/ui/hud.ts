import { CHUNK_SIZE as CS } from '../constants';
import { P } from '../player/player-state';
import { mobs } from '../entities/mob-spawner';
import { TOD } from '../rendering/day-night';
import { weather } from '../rendering/weather';
import { getBiome } from '../world/terrain-generator';
import { $ } from './dom-helpers';

const { floor: fl } = Math;

export function updateDebug(): void {
  var el = $('ui'); if (!el) return;
  el.innerHTML = 'XYZ: ' + P.x.toFixed(1) + ' ' + P.y.toFixed(1) + ' ' + P.z.toFixed(1) +
    '<br>Chunk: ' + fl(P.x / CS) + ',' + fl(P.z / CS) +
    '<br>FPS: ' + fps + ' | Mobs: ' + mobs.length +
    '<br>Biome: ' + getBiome(fl(P.x), fl(P.z)) +
    '<br>Time: ' + fl(TOD * 24000) + ' | ' + (weather.rain ? '雨' : '晴') +
    '<br>Fly: ' + (P.fly ? 'ON' : 'OFF') + ' | Lv: ' + P.level;
}

export let fps = 0;
export function setFps(v: number): void { fps = v; }
