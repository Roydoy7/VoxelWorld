import { P } from '../player/player-state';
import { $ } from './dom-helpers';
import { listWorlds, createWorld, deleteWorld } from '../world/world-save';
import type { WorldMeta } from '../world/world-save';

var onStart: ((worldId: string, isNew: boolean, mode?: number, seed?: number) => void) | null = null;

export function setupGameModeUI(startGame: (worldId: string, isNew: boolean, mode?: number, seed?: number) => void): void {
  onStart = startGame;
  refreshWorldList();
}

async function refreshWorldList(): Promise<void> {
  var modesel = $('modesel'); if (!modesel) return;
  var worlds = await listWorlds();

  modesel.innerHTML = '';

  // Title
  var h1 = document.createElement('h1');
  h1.textContent = '\u26CF \u65B9\u5757\u4E16\u754C';
  modesel.appendChild(h1);

  // World list container
  var listDiv = document.createElement('div');
  listDiv.id = 'wlist';

  if (worlds.length === 0) {
    var empty = document.createElement('div');
    empty.style.cssText = 'color:rgba(255,255,255,.5);font-size:13px;text-align:center;padding:16px';
    empty.textContent = '\u8FD8\u6CA1\u6709\u4E16\u754C\uFF0C\u521B\u5EFA\u4E00\u4E2A\u5427\uFF01';
    listDiv.appendChild(empty);
  } else {
    for (var i = 0; i < worlds.length; i++) {
      listDiv.appendChild(makeWorldItem(worlds[i]));
    }
  }
  modesel.appendChild(listDiv);

  // Create new world button
  var createBtn = document.createElement('div');
  createBtn.className = 'mbtn';
  createBtn.id = 'btn_new';
  createBtn.textContent = '+ \u521B\u5EFA\u65B0\u4E16\u754C';
  createBtn.addEventListener('click', function () { showCreatePanel(); });
  modesel.appendChild(createBtn);

  // Create panel (hidden)
  var panel = document.createElement('div');
  panel.id = 'wcreate';
  panel.style.display = 'none';

  var nameLabel = document.createElement('div');
  nameLabel.style.cssText = 'color:#fff;font-size:13px;margin-bottom:4px';
  nameLabel.textContent = '\u4E16\u754C\u540D\u79F0';
  panel.appendChild(nameLabel);

  var nameInput = document.createElement('input');
  nameInput.id = 'wname';
  nameInput.type = 'text';
  nameInput.placeholder = '\u6211\u7684\u4E16\u754C';
  nameInput.maxLength = 20;
  panel.appendChild(nameInput);

  var seedLabel = document.createElement('div');
  seedLabel.style.cssText = 'color:#fff;font-size:13px;margin-top:8px;margin-bottom:4px';
  seedLabel.textContent = '\u79CD\u5B50 (\u53EF\u9009)';
  panel.appendChild(seedLabel);

  var seedInput = document.createElement('input');
  seedInput.id = 'wseed';
  seedInput.type = 'text';
  seedInput.placeholder = '\u7559\u7A7A\u968F\u673A\u751F\u6210';
  panel.appendChild(seedInput);

  var modeLabel = document.createElement('div');
  modeLabel.style.cssText = 'color:#fff;font-size:13px;margin-top:8px;margin-bottom:6px';
  modeLabel.textContent = '\u6E38\u620F\u6A21\u5F0F';
  panel.appendChild(modeLabel);

  var modeRow = document.createElement('div');
  modeRow.style.cssText = 'display:flex;gap:8px';

  var survBtn = document.createElement('div');
  survBtn.className = 'mbtn wmode';
  survBtn.innerHTML = '\u2694 \u751F\u5B58\u6A21\u5F0F';
  survBtn.addEventListener('click', function () { doCreate(0); });
  modeRow.appendChild(survBtn);

  var creaBtn = document.createElement('div');
  creaBtn.className = 'mbtn wmode btn_crea';
  creaBtn.innerHTML = '\u2728 \u521B\u9020\u6A21\u5F0F';
  creaBtn.addEventListener('click', function () { doCreate(1); });
  modeRow.appendChild(creaBtn);

  panel.appendChild(modeRow);

  var backBtn = document.createElement('div');
  backBtn.style.cssText = 'color:rgba(255,255,255,.5);font-size:12px;margin-top:8px;cursor:pointer;text-align:center';
  backBtn.textContent = '\u2190 \u8FD4\u56DE';
  backBtn.addEventListener('click', function () { hideCreatePanel(); });
  panel.appendChild(backBtn);

  modesel.appendChild(panel);
}

function makeWorldItem(w: WorldMeta): HTMLElement {
  var item = document.createElement('div');
  item.className = 'witem';

  var info = document.createElement('div');
  info.className = 'winfo';
  info.style.cssText = 'flex:1;cursor:pointer';

  var name = document.createElement('div');
  name.className = 'wname';
  name.textContent = w.name;
  info.appendChild(name);

  var detail = document.createElement('div');
  detail.className = 'wdetail';
  var modeText = w.mode === 0 ? '\u751F\u5B58\u6A21\u5F0F' : '\u521B\u9020\u6A21\u5F0F';
  var date = new Date(w.lastPlayed);
  var dateStr = date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate() + ' ' + date.getHours() + ':' + ('0' + date.getMinutes()).slice(-2);
  detail.textContent = modeText + ' | ' + dateStr;
  info.appendChild(detail);

  info.addEventListener('click', function () {
    if (onStart) onStart(w.id, false);
  });
  item.appendChild(info);

  var delBtn = document.createElement('div');
  delBtn.className = 'wdel';
  delBtn.textContent = '\u{1F5D1}';
  delBtn.title = '\u5220\u9664\u4E16\u754C';
  delBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    if (confirm('\u786E\u5B9A\u5220\u9664\u4E16\u754C "' + w.name + '"?\u6B64\u64CD\u4F5C\u4E0D\u53EF\u6062\u590D\uFF01')) {
      deleteWorld(w.id).then(function () { refreshWorldList(); });
    }
  });
  item.appendChild(delBtn);

  return item;
}

function showCreatePanel(): void {
  var list = $('wlist'); if (list) list.style.display = 'none';
  var btn = $('btn_new'); if (btn) btn.style.display = 'none';
  var panel = $('wcreate'); if (panel) panel.style.display = 'flex';
  var nameEl = $('wname') as HTMLInputElement; if (nameEl) { nameEl.value = ''; nameEl.focus(); }
  var seedEl = $('wseed') as HTMLInputElement; if (seedEl) seedEl.value = '';
}

function hideCreatePanel(): void {
  var list = $('wlist'); if (list) list.style.display = '';
  var btn = $('btn_new'); if (btn) btn.style.display = '';
  var panel = $('wcreate'); if (panel) panel.style.display = 'none';
}

async function doCreate(mode: number): Promise<void> {
  var nameEl = $('wname') as HTMLInputElement;
  var seedEl = $('wseed') as HTMLInputElement;
  var name = (nameEl && nameEl.value.trim()) || '\u6211\u7684\u4E16\u754C';
  var seedStr = seedEl ? seedEl.value.trim() : '';
  var seed: number;
  if (seedStr) {
    seed = parseInt(seedStr, 10);
    if (isNaN(seed)) {
      // Hash string to number
      seed = 0;
      for (var i = 0; i < seedStr.length; i++) seed = ((seed << 5) - seed + seedStr.charCodeAt(i)) | 0;
    }
  } else {
    seed = Math.floor(Math.random() * 2147483647);
  }
  var worldId = await createWorld(name, seed, mode as 0 | 1);
  if (onStart) onStart(worldId, true, mode, seed);
}

export function applyGameMode(mode: number): void {
  P.gm = mode as 0 | 1;
  var modesel = $('modesel'); if (modesel) modesel.style.display = 'none';
  var load = $('load'); if (load) load.style.display = 'flex';
  if (mode === 1) {
    P.fly = true;
    var hp = $('hp'); if (hp) hp.style.display = 'none';
    var hunger = $('hunger'); if (hunger) hunger.style.display = 'none';
    var xpbar = $('xpbar'); if (xpbar) xpbar.style.display = 'none';
    var xplvl = $('xplvl'); if (xplvl) xplvl.style.display = 'none';
    var help = $('help'); if (help) help.innerHTML = 'WASD\u79FB\u52A8 \u7A7A\u683C\u4E0A\u5347 Shift\u4E0B\u964D<br>\u5DE6\u952E\u7834\u574F \u53F3\u952E\u653E\u7F6E \u6EDA\u8F6E/1-9\u9009<br>E\u80CC\u5305(\u6240\u6709\u65B9\u5757) F4\u89C6\u89D2<br>Q\u4E22\u5F03 \u65E0\u654C \u65E0\u9650\u65B9\u5757 \u81EA\u7531\u98DE\u884C';
  } else {
    var hp2 = $('hp'); if (hp2) hp2.style.display = '';
    var hunger2 = $('hunger'); if (hunger2) hunger2.style.display = '';
    var xpbar2 = $('xpbar'); if (xpbar2) xpbar2.style.display = '';
    var xplvl2 = $('xplvl'); if (xplvl2) xplvl2.style.display = '';
    var help = $('help'); if (help) help.innerHTML = 'WASD\u79FB\u52A8 \u7A7A\u683C\u8DF3 Ctrl\u51B2\u523A Shift\u8E72<br>\u5DE6\u952E\u6316/\u653B \u53F3\u952E\u653E/\u5403 \u6EDA\u8F6E/1-9\u9009<br>E\u80CC\u5305(2x2\u5408\u6210) \u53F3\u952E\u5DE5\u4F5C\u53F0(3x3)<br>F4\u89C6\u89D2 Q\u4E22\u5F03 \u9700\u6316\u6398\u6536\u96C6\u65B9\u5757';
  }
}

export function showMainMenu(): void {
  var modesel = $('modesel'); if (modesel) modesel.style.display = 'flex';
  refreshWorldList();
}
