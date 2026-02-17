import { WORLD_SIZE as WS, CHUNK_SIZE as CS, RENDER_DISTANCE as RD } from './constants';
import { scene, camera, renderer } from './rendering/scene-setup';
import { ensureTerrain, ensureTrees, buildInitialChunks, updateChunks, resetChunkManager, restoreTerrainDone, restoreTreesDone } from './world/chunk-manager';
import { initInput } from './input/input-manager';
import { P, resetPlayer } from './player/player-state';
import { updatePhysics } from './player/player-physics';
import { updateActions, setOnCraftTable } from './player/player-actions';
import { updateHP, updateHungerUI, updateXP, updateHungerSystem, respawn } from './player/player-stats';
import { mobs, spawnInitialMobs, updateMobRespawn, findGround, resetMobs } from './entities/mob-spawner';
import { updateMobs } from './entities/mob-ai';
import { updateArrows } from './entities/arrows';
import { updateDrops, resetDrops } from './entities/drops';
import { updateParticles } from './effects/particles';
import { updateExplosions } from './effects/explosions';
import { updateDayNight, setTOD } from './rendering/day-night';
import { updateWeather, setWeather } from './rendering/weather';
import { buildHotbar, updateHotbar } from './ui/hotbar';
import { updateDebug, setFps } from './ui/hud';
import { toggleInventory } from './ui/inventory-ui';
import { toggleCrafting, initCrafting, craftOpen } from './ui/crafting-ui';
import { invOpen } from './ui/inventory-ui';
import { setupGameModeUI, applyGameMode } from './ui/game-mode-ui';
import { $, showAlert } from './ui/dom-helpers';
import { spawnDrop } from './entities/drops';
import { resetChunks } from './world/chunk-storage';
import { setSeed } from './core/noise';
import { saveWorld, loadWorld, openDB } from './world/world-save';
import { preloadSounds } from './audio/audio-manager';
import { preloadMobSounds } from './audio/mob-sounds';

const { floor: fl, min: mn } = Math;

// Wire up crafting table interaction
setOnCraftTable(toggleCrafting);

// Yield that guarantees browser repaint
function frameYield(): Promise<void> {
  return new Promise(function (r) { requestAnimationFrame(function () { r(); }); });
}

// FPS tracking
var prevT = 0, fpsCount = 0, fpsTime = 0;
var currentWorldId: string | null = null;
var saveTimer = 0;
var gameRunning = false;

function gameLoop(t: number): void {
  requestAnimationFrame(gameLoop);
  var dt = mn(.05, (t - prevT) / 1000); prevT = t;
  fpsCount++; fpsTime += dt;
  if (fpsTime >= 1) { setFps(fpsCount); fpsCount = 0; fpsTime = 0; }

  if (P.dead) { renderer.render(scene, camera); return; }

  updatePhysics(dt);
  updateActions(dt);
  updateMobs(dt);
  updateArrows(dt);
  updateExplosions(dt);
  updateDrops(dt);
  updateParticles(dt);
  updateDayNight(dt, P.x, P.y, P.z);
  updateWeather(dt);
  updateHungerSystem(dt);
  updateMobRespawn(dt);

  // HP bar billboarding
  for (var mi = 0; mi < mobs.length; mi++) {
    if (mobs[mi].hpBar && mobs[mi].hpBar!.sp.visible) mobs[mi].hpBar!.sp.lookAt(camera.position);
  }

  if (fpsCount % 20 === 0) updateChunks(P.x, P.z);
  var ui = $('ui');
  if (ui && ui.style.display !== 'none' && fpsCount % 15 === 0) updateDebug();

  // Auto-save every 60 seconds
  if (currentWorldId) {
    saveTimer += dt;
    if (saveTimer >= 60) {
      saveTimer = 0;
      saveWorld(currentWorldId).then(function () { showAlert('\u5DF2\u4FDD\u5B58'); });
    }
  }

  renderer.render(scene, camera);
}

async function initNewWorld(seed: number): Promise<void> {
  var ltxt = $('ltxt'), lfill = $('lfill');
  if (ltxt) ltxt.textContent = '\u751F\u6210\u5730\u5F62...';
  if (lfill) lfill.style.width = '5%';
  await frameYield();
  await frameYield();

  setSeed(seed);

  var spCx = fl(WS / 2 / CS), spCz = fl(WS / 2 / CS);
  var genR = RD + 1;
  var done = 0;

  // Generate terrain in radius around spawn
  for (var dx = -genR; dx <= genR; dx++) for (var dz = -genR; dz <= genR; dz++) {
    if (dx * dx + dz * dz > genR * genR) continue;
    ensureTerrain(spCx + dx, spCz + dz);
    done++;
    if (lfill) lfill.style.width = (5 + done * .3) + '%';
    await frameYield();
  }

  // Generate trees
  if (ltxt) ltxt.textContent = '\u751F\u6210\u6811\u6728...';
  var treeR = RD;
  done = 0;
  for (var dx2 = -treeR; dx2 <= treeR; dx2++) for (var dz2 = -treeR; dz2 <= treeR; dz2++) {
    if (dx2 * dx2 + dz2 * dz2 > treeR * treeR) continue;
    ensureTrees(spCx + dx2, spCz + dz2);
    done++;
    if (done % 2 === 0) {
      if (lfill) lfill.style.width = (35 + done * .3) + '%';
      await frameYield();
    }
  }

  if (ltxt) ltxt.textContent = '\u6784\u5EFA\u533A\u5757...';
  if (lfill) lfill.style.width = '50%';
  await frameYield();
  await buildInitialChunks(function (pct) { if (lfill) lfill.style.width = pct + '%'; });

  if (ltxt) ltxt.textContent = '\u751F\u6210\u751F\u7269...';
  if (lfill) lfill.style.width = '92%';
  await frameYield();
  spawnInitialMobs();

  P.y = findGround(fl(P.x), fl(P.z)) + 2; P.fallY = P.y;
}

async function finishInit(): Promise<void> {
  var ltxt = $('ltxt'), lfill = $('lfill');
  buildHotbar(); updateHP(); updateHungerUI(); updateXP(); initCrafting();

  if (ltxt) ltxt.textContent = '\u5B8C\u6210\uFF01';
  if (lfill) lfill.style.width = '100%';
  await frameYield();

  var load = $('load'); if (load) load.style.display = 'none';
  renderer.domElement.requestPointerLock();
  gameRunning = true;
  if (!prevT) requestAnimationFrame(gameLoop);
}

function resetWorld(): void {
  resetChunks();
  resetChunkManager();
  resetMobs();
  resetDrops();
  resetPlayer();
  setTOD(0.35);
  setWeather(false, 120);
  saveTimer = 0;
}

async function startGame(worldId: string, isNew: boolean, mode?: number, seed?: number): Promise<void> {
  // Reset everything if this is not the first game
  if (gameRunning) {
    resetWorld();
    gameRunning = false;
  }

  currentWorldId = worldId;
  preloadSounds();
  preloadMobSounds();

  if (isNew) {
    applyGameMode(mode || 0);
    setSeed(seed || 0);
    await initNewWorld(seed || 0);
  } else {
    var meta = await loadWorld(worldId);
    if (!meta) return;
    applyGameMode(meta.mode);
    setSeed(meta.seed);
    // Reset and restore
    resetChunkManager();
    restoreTerrainDone(meta.terrainDone);
    restoreTreesDone(meta.treesDone);
    resetPlayer(meta.player);
    setTOD(meta.tod);
    setWeather(meta.weather.rain, meta.weather.timer);

    var ltxt = $('ltxt'), lfill = $('lfill');

    // Generate terrain around player for any chunks not in save
    if (ltxt) ltxt.textContent = '\u751F\u6210\u5730\u5F62...';
    if (lfill) lfill.style.width = '30%';
    await frameYield();
    var pCx = fl(P.x / CS), pCz = fl(P.z / CS), genR2 = RD + 1;
    for (var dx3 = -genR2; dx3 <= genR2; dx3++) for (var dz3 = -genR2; dz3 <= genR2; dz3++) {
      if (dx3 * dx3 + dz3 * dz3 > genR2 * genR2) continue;
      ensureTerrain(pCx + dx3, pCz + dz3);
    }
    var treeR2 = RD;
    for (var dx4 = -treeR2; dx4 <= treeR2; dx4++) for (var dz4 = -treeR2; dz4 <= treeR2; dz4++) {
      if (dx4 * dx4 + dz4 * dz4 > treeR2 * treeR2) continue;
      ensureTrees(pCx + dx4, pCz + dz4);
    }

    if (ltxt) ltxt.textContent = '\u6784\u5EFA\u533A\u5757...';
    if (lfill) lfill.style.width = '50%';
    await frameYield();
    await buildInitialChunks(function (pct) { if (lfill) lfill.style.width = pct + '%'; }, P.x, P.z);

    if (ltxt) ltxt.textContent = '\u751F\u6210\u751F\u7269...';
    if (lfill) lfill.style.width = '92%';
    await frameYield();
    spawnInitialMobs();
  }

  await finishInit();

  // Initial save for new worlds
  if (isNew && currentWorldId) {
    saveWorld(currentWorldId);
  }
}

// Initialize DB then setup UI
openDB().then(function () {
  setupGameModeUI(startGame);
});

// Respawn button
var respawnBtn = $('respawn-btn');
if (respawnBtn) respawnBtn.addEventListener('click', respawn);

// Input
initInput({
  onDigitKey: function (sel) {
    P.sel = sel; updateHotbar();
  },
  onScroll: function (dir) {
    P.sel = (P.sel + dir + 9) % 9; updateHotbar();
  },
  onToggleInventory: function () { if (craftOpen) toggleCrafting(); else toggleInventory(); },
  onCloseUI: function () { if (craftOpen) toggleCrafting(); else if (invOpen) toggleInventory(); },
  onToggleFly: function () { P.fly = !P.fly; },
  onToggleDebug: function () {
    var el = $('ui'); if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
  },
  onToggleView: function () { P.viewMode = ((P.viewMode + 1) % 3) as 0 | 1 | 2; },
  onDropItem: function () {
    var it = P.hb[P.sel]; if (it && it.q > 0) {
      spawnDrop(P.x, P.y + 1, P.z, it.id, 1);
      it.q--; if (it.q <= 0) P.hb[P.sel] = null; updateHotbar();
    }
  },
  getPlayerState: function () { return { ry: P.ry, rx: P.rx, dead: P.dead }; },
  setPlayerLook: function (ry, rx) { P.ry = ry; P.rx = rx; },
  isInvOrCraftOpen: function () { return invOpen || craftOpen; }
});

// Window resize
window.addEventListener('resize', function () {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

// Save on page close
window.addEventListener('beforeunload', function () {
  if (currentWorldId && gameRunning) {
    saveWorld(currentWorldId);
  }
});
