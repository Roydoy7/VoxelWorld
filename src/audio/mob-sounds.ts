import { P } from '../player/player-state';

const BASE = 'sounds/';
var ctx: AudioContext | null = null;
var gainNode: GainNode | null = null;
var buffers: Record<string, AudioBuffer> = {};

function getCtx(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext();
    gainNode = ctx.createGain();
    gainNode.gain.value = 0.5;
    gainNode.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

async function loadBuffer(file: string): Promise<AudioBuffer | null> {
  if (buffers[file]) return buffers[file];
  try {
    var resp = await fetch(BASE + file);
    var arr = await resp.arrayBuffer();
    var buf = await getCtx().decodeAudioData(arr);
    buffers[file] = buf;
    return buf;
  } catch { return null; }
}

function play3D(buf: AudioBuffer, mx: number, my: number, mz: number, vol: number, rate?: number): void {
  var c = getCtx();
  var dx = mx - P.x, dy = my - P.y, dz = mz - P.z;
  var dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
  if (dist > 32) return; // too far
  var falloff = Math.max(0, 1 - dist / 32);
  var finalVol = vol * falloff * falloff;
  if (finalVol < 0.01) return;

  var src = c.createBufferSource();
  src.buffer = buf;
  if (rate) src.playbackRate.value = rate;
  // Stereo panning based on direction
  var panner = c.createStereoPanner();
  var ang = Math.atan2(dx, dz);
  var relAng = ang - P.ry;
  panner.pan.value = Math.max(-1, Math.min(1, Math.sin(relAng)));

  var g = c.createGain();
  g.gain.value = finalVol;
  src.connect(g);
  g.connect(panner);
  panner.connect(gainNode!);
  src.start();
}

function pickFile(prefix: string, count: number): string {
  var i = ((Math.random() * count) | 0) + 1;
  return prefix + (i < 10 ? '0' + i : '' + i) + '.ogg';
}

// Sound definitions per mob type: [prefix, count, volume, minRate, rateRange]
type SoundDef = [string, number, number, number, number];

const MOB_IDLE: Record<string, SoundDef> = {
  pig:      ['cute_',    5, 0.4, 0.9, 0.3],
  cow:      ['grunt_',   3, 0.5, 0.6, 0.2],
  sheep:    ['cute_',    5, 0.35, 1.1, 0.3],
  chicken:  ['cute_',    5, 0.3, 1.5, 0.4],
  zombie:   ['monster_', 4, 0.5, 0.7, 0.2],
  skeleton: ['monster_', 4, 0.4, 1.2, 0.3],
  spider:   ['bug_',     3, 0.4, 0.9, 0.3],
  creeper:  ['bug_',     3, 0.3, 0.6, 0.2],
  slime:    ['burble_',  2, 0.4, 0.8, 0.4],
};

const MOB_HURT: Record<string, SoundDef> = {
  pig:      ['hurt_',    3, 0.5, 1.2, 0.3],
  cow:      ['hurt_',    3, 0.5, 0.7, 0.2],
  sheep:    ['hurt_',    3, 0.5, 1.3, 0.2],
  chicken:  ['hurt_',    3, 0.4, 1.6, 0.3],
  zombie:   ['hurt_',    3, 0.6, 0.7, 0.2],
  skeleton: ['hurt_',    3, 0.5, 1.3, 0.3],
  spider:   ['hurt_',    3, 0.5, 1.0, 0.3],
  creeper:  ['hurt_',    3, 0.5, 0.9, 0.2],
  slime:    ['spit_',    2, 0.5, 1.0, 0.3],
};

const MOB_DEATH: Record<string, SoundDef> = {
  pig:      ['scream_',  1, 0.5, 1.3, 0.0],
  cow:      ['roar_',    2, 0.5, 0.6, 0.1],
  sheep:    ['scream_',  1, 0.4, 1.5, 0.0],
  chicken:  ['scream_',  1, 0.4, 1.8, 0.0],
  zombie:   ['roar_',    2, 0.6, 0.7, 0.2],
  skeleton: ['roar_',    2, 0.5, 1.3, 0.2],
  spider:   ['roar_',    2, 0.5, 1.1, 0.2],
  creeper:  ['scream_',  1, 0.6, 0.8, 0.0],
  slime:    ['spit_',    2, 0.5, 0.6, 0.3],
};

function playSoundDef(def: SoundDef, x: number, y: number, z: number): void {
  var [prefix, count, vol, minRate, rateRange] = def;
  var file = pickFile(prefix, count);
  var rate = minRate + Math.random() * rateRange;
  var buf = buffers[file];
  if (buf) play3D(buf, x, y, z, vol, rate);
  else loadBuffer(file).then(b => { if (b) play3D(b, x, y, z, vol, rate); });
}

export function playMobIdle(type: string, x: number, y: number, z: number): void {
  var def = MOB_IDLE[type];
  if (def) playSoundDef(def, x, y, z);
}

export function playMobHurt(type: string, x: number, y: number, z: number): void {
  var def = MOB_HURT[type];
  if (def) playSoundDef(def, x, y, z);
}

export function playMobDeath(type: string, x: number, y: number, z: number): void {
  var def = MOB_DEATH[type];
  if (def) playSoundDef(def, x, y, z);
}

// Preload all mob sounds
export function preloadMobSounds(): void {
  getCtx();
  var files = [
    'cute_01.ogg','cute_02.ogg','cute_03.ogg','cute_04.ogg','cute_05.ogg',
    'grunt_01.ogg','grunt_02.ogg','grunt_03.ogg',
    'monster_01.ogg','monster_02.ogg','monster_03.ogg','monster_04.ogg',
    'bug_01.ogg','bug_02.ogg','bug_03.ogg',
    'hurt_01.ogg','hurt_02.ogg','hurt_03.ogg',
    'roar_01.ogg','roar_02.ogg',
    'burble_01.ogg','burble_02.ogg',
    'scream_01.ogg',
    'spit_01.ogg','spit_02.ogg',
    'howl.ogg',
  ];
  for (var f of files) loadBuffer(f);
}
