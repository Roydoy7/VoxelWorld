import { P } from '../player/player-state';
import { B } from '../data/blocks';
import { RECIPES } from '../data/recipes';
import { render3DItem, cloneCV } from '../rendering/item-renderer';
import { renderer } from '../rendering/scene-setup';
import { $, showAlert } from './dom-helpers';
import { updateHotbar } from './hotbar';
import { pickUp } from '../entities/drops';
import { setCraftOpen } from '../player/player-actions';
import type { CraftingResult } from '../types/inventory';

export let craftOpen = false;
var craftGrid = new Array(9).fill(0);
var heldId = 0, heldQty = 0;

function getCursor(): HTMLElement {
  var el = document.getElementById('held-cursor');
  if (el) return el;
  var c = document.createElement('div');
  c.id = 'held-cursor';
  c.style.cssText = 'position:fixed;pointer-events:none;z-index:999;display:none';
  document.body.appendChild(c);
  document.addEventListener('mousemove', function (e) {
    var cc = document.getElementById('held-cursor');
    if (cc) { cc.style.left = (e.clientX + 10) + 'px'; cc.style.top = (e.clientY + 10) + 'px'; }
  });
  return c;
}

function showHeld(): void {
  var el = getCursor(); el.innerHTML = '';
  if (heldId) {
    var cv = render3DItem(heldId);
    if (cv) { var c = cloneCV(cv); c.style.cssText = 'width:32px;height:32px;image-rendering:pixelated'; el.appendChild(c); }
    if (heldQty > 1) { var q = document.createElement('span'); q.textContent = '' + heldQty; q.style.cssText = 'position:absolute;bottom:0;right:0;color:#fff;font-size:10px;font-weight:bold;text-shadow:0 1px 2px #000'; el.appendChild(q); }
    el.style.display = 'block';
  } else { el.style.display = 'none'; }
}

function slotIcon(el: HTMLElement, id: number, qty: number): void {
  el.innerHTML = '';
  if (!id) return;
  var cv = render3DItem(id);
  if (cv) { var c = cloneCV(cv); c.style.imageRendering = 'pixelated'; el.appendChild(c); }
  if (qty > 1) { var q = document.createElement('span'); q.className = 'sq'; q.textContent = '' + qty; el.appendChild(q); }
}

function matchRecipe(): CraftingResult | null {
  for (var r = 0; r < RECIPES.length; r++) {
    var pat = RECIPES[r][0] as number[], match = true;
    for (var j = 0; j < 9; j++) { if (pat[j] !== craftGrid[j]) { match = false; break; } }
    if (match) return { id: RECIPES[r][1] as number, q: RECIPES[r][2] as number };
    var pn = pat.filter(function (v: number) { return v > 0; });
    if (pn.length === 1) {
      var gn = craftGrid.filter(function (v: number) { return v > 0; });
      if (gn.length === 1 && gn[0] === pn[0]) return { id: RECIPES[r][1] as number, q: RECIPES[r][2] as number };
    }
  }
  return null;
}

export function toggleCrafting(): void {
  craftOpen = !craftOpen;
  var el = $('craft'); if (el) el.style.display = craftOpen ? 'flex' : 'none';
  setCraftOpen(craftOpen);
  if (craftOpen) {
    heldId = 0; heldQty = 0; showHeld();
    craftGrid.fill(0); rebuildAll();
    document.exitPointerLock();
  } else {
    if (heldId) { pickUp(heldId, heldQty); heldId = 0; heldQty = 0; showHeld(); }
    for (var i = 0; i < 9; i++) { if (craftGrid[i]) { pickUp(craftGrid[i], 1); craftGrid[i] = 0; } }
    updateHotbar(); renderer.domElement.requestPointerLock();
  }
}

function rebuildAll(): void {
  // Craft grid cells
  var cells = document.querySelectorAll('#cgrid .cs');
  for (var i = 0; i < 9; i++) {
    var c = cells[i] as HTMLElement; if (!c) continue;
    slotIcon(c, craftGrid[i], 1);
  }
  // Output
  var res = matchRecipe(), out = $('cout');
  if (out) slotIcon(out, res ? res.id : 0, res ? res.q : 0);
  // Hotbar
  var hcells = document.querySelectorAll('#cbar .ic');
  for (var i = 0; i < 9; i++) {
    var hc = hcells[i] as HTMLElement; if (!hc) continue;
    var s = P.hb[i];
    slotIcon(hc, s ? s.id : 0, s ? s.q : 0);
  }
}

export function initCrafting(): void {
  var panel = $('cpanel'); if (!panel) return;
  panel.innerHTML = '';
  panel.style.cssText = 'background:rgba(80,80,80,.85);padding:20px;border-radius:8px;display:flex;flex-direction:column;gap:12px';

  // Top row: craft grid + arrow + output
  var topRow = document.createElement('div');
  topRow.style.cssText = 'display:flex;gap:16px;align-items:center';

  // Craft grid
  var leftDiv = document.createElement('div');
  var label = document.createElement('div');
  label.style.cssText = 'color:#fff;font-size:13px;margin-bottom:6px'; label.textContent = '⚒ 合成';
  leftDiv.appendChild(label);
  var g = document.createElement('div'); g.id = 'cgrid';
  g.style.cssText = 'display:grid;grid-template-columns:repeat(3,46px);gap:3px';
  for (var i = 0; i < 9; i++) {
    var d = document.createElement('div'); d.className = 'cs'; d.dataset.i = '' + i;
    d.addEventListener('click', function (this: HTMLElement) {
      var idx = +(this.dataset.i || '0');
      if (heldId) {
        if (!craftGrid[idx]) { craftGrid[idx] = heldId; heldQty--; if (heldQty <= 0) { heldId = 0; heldQty = 0; } }
        else if (craftGrid[idx] !== heldId) { var old = craftGrid[idx]; craftGrid[idx] = heldId; heldQty--; if (heldQty <= 0) { heldId = old; heldQty = 1; } else { pickUp(old, 1); } }
      } else if (craftGrid[idx]) { heldId = craftGrid[idx]; heldQty = 1; craftGrid[idx] = 0; }
      updateHotbar(); rebuildAll(); showHeld();
    });
    g.appendChild(d);
  }
  leftDiv.appendChild(g);
  topRow.appendChild(leftDiv);

  // Arrow
  var arrow = document.createElement('div');
  arrow.style.cssText = 'color:#fff;font-size:24px'; arrow.textContent = '→';
  topRow.appendChild(arrow);

  // Output
  var outEl = document.createElement('div'); outEl.id = 'cout';
  outEl.style.cssText = 'width:50px;height:50px;background:rgba(40,40,40,.9);border:2px solid #6a6;display:flex;align-items:center;justify-content:center;cursor:pointer;border-radius:4px;position:relative';
  outEl.addEventListener('click', function () {
    var res = matchRecipe(); if (!res) return;
    if (heldId && heldId !== res.id) return;
    if (heldId === res.id) heldQty += res.q; else { heldId = res.id; heldQty = res.q; }
    craftGrid.fill(0);
    updateHotbar(); rebuildAll(); showHeld();
    showAlert('合成 ' + B[res.id].n + (res.q > 1 ? ' x' + res.q : ''));
  });
  topRow.appendChild(outEl);
  panel.appendChild(topRow);

  // Separator
  var sep = document.createElement('div');
  sep.style.cssText = 'height:1px;background:rgba(255,255,255,.15);margin:4px 0';
  panel.appendChild(sep);

  // Hotbar label
  var hLabel = document.createElement('div');
  hLabel.style.cssText = 'color:#fff;font-size:12px'; hLabel.textContent = '🎒 背包';
  panel.appendChild(hLabel);

  // Hotbar slots
  var hbar = document.createElement('div'); hbar.id = 'cbar';
  hbar.style.cssText = 'display:grid;grid-template-columns:repeat(9,42px);gap:3px';
  for (var i = 0; i < 9; i++) {
    var hd = document.createElement('div'); hd.className = 'ic'; hd.dataset.hi = '' + i;
    hd.addEventListener('click', function (this: HTMLElement) {
      var hi = +(this.dataset.hi || '0');
      var s = P.hb[hi];
      if (heldId) {
        if (!s) { P.hb[hi] = { id: heldId, q: heldQty }; heldId = 0; heldQty = 0; }
        else if (s.id === heldId) { s.q += heldQty; heldId = 0; heldQty = 0; }
        else { var tId = heldId, tQ = heldQty; heldId = s.id; heldQty = s.q; P.hb[hi] = { id: tId, q: tQ }; }
      } else if (s) { heldId = s.id; heldQty = s.q; P.hb[hi] = null; }
      updateHotbar(); rebuildAll(); showHeld();
    });
    hbar.appendChild(hd);
  }
  panel.appendChild(hbar);
}
