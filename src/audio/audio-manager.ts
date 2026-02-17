import { B } from '../data/blocks';

// Sound categories
type SoundCat = 'grass' | 'stone' | 'wood' | 'sand' | 'glass' | 'metal' | 'soft';
type SoundEvent = 'step' | 'dig' | 'breakBlock' | 'place' | 'hit' | 'hurt' | 'fall' | 'eat' | 'levelup';

const BASE = 'sounds/';

// Sound file definitions: [path, count] — files are named path_000.ogg .. path_{count-1}.ogg
const STEP_FILES: Record<SoundCat, [string, number]> = {
  grass: ['footstep_grass_', 3],
  stone: ['footstep_concrete_', 3],
  wood:  ['footstep_wood_', 3],
  sand:  ['footstep_snow_', 3],
  glass: ['footstep_concrete_', 3],
  metal: ['footstep_concrete_', 3],
  soft:  ['footstep_carpet_', 0], // not copied, fallback to grass
};

const BREAK_FILES: Record<SoundCat, [string, number]> = {
  grass: ['impactSoft_medium_', 2],
  stone: ['impactGeneric_light_', 2],
  wood:  ['impactPlank_medium_', 2],
  sand:  ['impactSoft_medium_', 2],
  glass: ['impactGlass_medium_', 1],
  metal: ['impactMetal_light_', 2],
  soft:  ['impactSoft_medium_', 2],
};

// Audio context & buffer cache
var ctx: AudioContext | null = null;
var buffers: Record<string, AudioBuffer> = {};
var masterVol = 0.5;
var gainNode: GainNode | null = null;

function getCtx(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext();
    gainNode = ctx.createGain();
    gainNode.gain.value = masterVol;
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

function playBuffer(buf: AudioBuffer, vol: number, rate?: number): void {
  var c = getCtx();
  var src = c.createBufferSource();
  src.buffer = buf;
  if (rate) src.playbackRate.value = rate;
  var g = c.createGain();
  g.gain.value = vol;
  src.connect(g);
  g.connect(gainNode!);
  src.start();
}

function pickFile(prefix: string, count: number): string {
  var i = (Math.random() * count) | 0;
  return prefix + String(i).padStart(3, '0') + '.ogg';
}

// Determine block material category
function getBlockMat(bid: number): SoundCat {
  if (!bid || !B[bid]) return 'stone';
  var bb = B[bid];
  if (bb.gl) return 'glass';
  if (bb.f) return 'grass';
  if (bb.o) return 'stone';
  var n = bb.n;
  if (n.includes('木') || n.includes('板') || n.includes('箱') || n.includes('书架') || n.includes('工作台') || n.includes('竹')) return 'wood';
  if (n.includes('沙') || n.includes('砾') || n.includes('雪')) return 'sand';
  if (n.includes('铁块') || n.includes('金块') || n.includes('钻石块') || n.includes('铜块') || n.includes('合金块') || n.includes('铁栏')) return 'metal';
  if (n.includes('羊毛') || n.includes('粘液') || n.includes('蜂蜜') || n.includes('海绵') || n.includes('地毯')) return 'soft';
  if (n.includes('草') || n.includes('土') || n.includes('泥') || n.includes('菌丝') || n.includes('苔')) return 'grass';
  return 'stone';
}

// Preload common sounds
var preloaded = false;
export function preloadSounds(): void {
  if (preloaded) return;
  preloaded = true;
  getCtx();
  // Preload footstep and common sounds
  var files = [
    'footstep_grass_000.ogg', 'footstep_grass_001.ogg', 'footstep_grass_002.ogg',
    'footstep_concrete_000.ogg', 'footstep_concrete_001.ogg', 'footstep_concrete_002.ogg',
    'footstep_wood_000.ogg', 'footstep_wood_001.ogg', 'footstep_wood_002.ogg',
    'footstep_snow_000.ogg', 'footstep_snow_001.ogg', 'footstep_snow_002.ogg',
    'impactMining_000.ogg', 'impactMining_001.ogg', 'impactMining_002.ogg',
    'impactSoft_medium_000.ogg', 'impactSoft_medium_001.ogg',
    'impactPlank_medium_000.ogg', 'impactPlank_medium_001.ogg',
    'impactGlass_medium_000.ogg', 'impactGlass_heavy_000.ogg',
    'impactGeneric_light_000.ogg', 'impactGeneric_light_001.ogg',
    'impactWood_light_000.ogg', 'impactWood_light_001.ogg',
    'impactPunch_heavy_000.ogg', 'impactPunch_heavy_001.ogg', 'impactPunch_heavy_002.ogg',
    'impactSoft_heavy_000.ogg', 'impactSoft_heavy_001.ogg',
    'impactMetal_light_000.ogg', 'impactMetal_light_001.ogg',
    'impactBell_heavy_000.ogg',
  ];
  for (var f of files) loadBuffer(f);
}

// --- Public API ---

// Footstep sound (call from walk animation)
var lastStepT = 0;
export function playStep(blockBelow: number): void {
  var now = performance.now();
  if (now - lastStepT < 150) return; // throttle
  lastStepT = now;
  var mat = getBlockMat(blockBelow);
  var [prefix, count] = STEP_FILES[mat];
  if (count <= 0) { prefix = STEP_FILES.grass[0]; count = STEP_FILES.grass[1]; }
  var file = pickFile(prefix, count);
  var buf = buffers[file];
  if (buf) playBuffer(buf, 0.3, 0.85 + Math.random() * 0.3);
  else loadBuffer(file).then(b => { if (b) playBuffer(b, 0.3, 0.85 + Math.random() * 0.3); });
}

// Mining tick sound
var lastDigT = 0;
export function playDig(): void {
  var now = performance.now();
  if (now - lastDigT < 250) return;
  lastDigT = now;
  var file = pickFile('impactMining_', 3);
  var buf = buffers[file];
  if (buf) playBuffer(buf, 0.35, 0.9 + Math.random() * 0.2);
  else loadBuffer(file).then(b => { if (b) playBuffer(b, 0.35, 0.9 + Math.random() * 0.2); });
}

// Block break sound
export function playBreak(bid: number): void {
  var mat = getBlockMat(bid);
  if (mat === 'glass') {
    // Glass breaking - use heavy glass impact
    var file = 'impactGlass_heavy_000.ogg';
    var buf = buffers[file];
    if (buf) playBuffer(buf, 0.5);
    else loadBuffer(file).then(b => { if (b) playBuffer(b, 0.5); });
    return;
  }
  var [prefix, count] = BREAK_FILES[mat];
  if (count <= 0) return;
  var file2 = pickFile(prefix, count);
  var buf2 = buffers[file2];
  if (buf2) playBuffer(buf2, 0.5, 0.8 + Math.random() * 0.4);
  else loadBuffer(file2).then(b => { if (b) playBuffer(b, 0.5, 0.8 + Math.random() * 0.4); });
}

// Block place sound
export function playPlace(bid: number): void {
  var mat = getBlockMat(bid);
  var prefix: string; var count: number;
  if (mat === 'wood') { prefix = 'impactWood_light_'; count = 2; }
  else if (mat === 'glass') { prefix = 'impactGlass_medium_'; count = 1; }
  else if (mat === 'metal') { prefix = 'impactMetal_light_'; count = 2; }
  else { prefix = 'impactGeneric_light_'; count = 2; }
  var file = pickFile(prefix, count);
  var buf = buffers[file];
  if (buf) playBuffer(buf, 0.4, 0.8 + Math.random() * 0.3);
  else loadBuffer(file).then(b => { if (b) playBuffer(b, 0.4, 0.8 + Math.random() * 0.3); });
}

// Attack hit sound
export function playHit(): void {
  var file = pickFile('impactPunch_heavy_', 3);
  var buf = buffers[file];
  if (buf) playBuffer(buf, 0.5, 0.9 + Math.random() * 0.2);
  else loadBuffer(file).then(b => { if (b) playBuffer(b, 0.5, 0.9 + Math.random() * 0.2); });
}

// Player hurt sound
export function playHurt(): void {
  var file = pickFile('impactSoft_heavy_', 2);
  var buf = buffers[file];
  if (buf) playBuffer(buf, 0.6, 1.0 + Math.random() * 0.3);
  else loadBuffer(file).then(b => { if (b) playBuffer(b, 0.6, 1.0 + Math.random() * 0.3); });
}

// Eat sound
export function playEat(): void {
  var file = pickFile('impactSoft_medium_', 2);
  var buf = buffers[file];
  if (buf) playBuffer(buf, 0.35, 1.2 + Math.random() * 0.3);
  else loadBuffer(file).then(b => { if (b) playBuffer(b, 0.35, 1.2 + Math.random() * 0.3); });
}

// Level up sound
export function playLevelUp(): void {
  var file = 'impactBell_heavy_000.ogg';
  var buf = buffers[file];
  if (buf) playBuffer(buf, 0.5, 1.5);
  else loadBuffer(file).then(b => { if (b) playBuffer(b, 0.5, 1.5); });
}

// Fall damage sound
export function playFall(): void {
  var file = pickFile('impactSoft_heavy_', 2);
  var buf = buffers[file];
  if (buf) playBuffer(buf, 0.7, 0.6);
  else loadBuffer(file).then(b => { if (b) playBuffer(b, 0.7, 0.6); });
}

export function setVolume(v: number): void {
  masterVol = v;
  if (gainNode) gainNode.gain.value = v;
}
