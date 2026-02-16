import { P } from '../player/player-state';
import { B } from '../data/blocks';
import { RECIPES } from '../data/recipes';
import { render3DItem, cloneCV } from '../rendering/item-renderer';
import { renderer } from '../rendering/scene-setup';
import { $, showAlert } from './dom-helpers';
import { updateHotbar } from './hotbar';
import { pickUp } from '../entities/drops';
import { setInvOpen } from '../player/player-actions';
import type { CraftingResult } from '../types/inventory';

export let invOpen = false;
var invCraft = new Array(4).fill(0);
var heldId = 0, heldQty = 0;
var cursorEl: HTMLElement | null = null;

function getCursor(): HTMLElement {
  var el = document.getElementById('held-cursor');
  if (el) { cursorEl = el; return el; }
  cursorEl = document.createElement('div');
  cursorEl.id = 'held-cursor';
  cursorEl.style.cssText = 'position:fixed;pointer-events:none;z-index:999;display:none';
  document.body.appendChild(cursorEl);
  document.addEventListener('mousemove', function (e) {
    var c = document.getElementById('held-cursor');
    if (c) { c.style.left = (e.clientX + 10) + 'px'; c.style.top = (e.clientY + 10) + 'px'; }
  });
  return cursorEl;
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

export function toggleInventory(): void {
  invOpen = !invOpen;
  var el = $('inv'); if (el) el.style.display = invOpen ? 'flex' : 'none';
  setInvOpen(invOpen);
  if (invOpen) {
    heldId = 0; heldQty = 0; showHeld();
    buildInvGrid(); invCraft.fill(0); buildInvCraft();
    document.exitPointerLock();
  } else {
    if (heldId) { pickUp(heldId, heldQty); heldId = 0; heldQty = 0; showHeld(); }
    for (var i = 0; i < 4; i++) { if (invCraft[i]) { pickUp(invCraft[i], 1); invCraft[i] = 0; } }
    updateHotbar(); renderer.domElement.requestPointerLock();
  }
}

function buildInvGrid(): void {
  var g = $('igrid'); if (!g) return; g.innerHTML = '';
  if (P.gm === 1) {
    var ids = Object.keys(B);
    for (var i = 0; i < ids.length; i++) {
      var id = +ids[i];
      var d = document.createElement('div'); d.className = 'ic';
      var cv3 = render3DItem(id);
      if (cv3) { var ic = cloneCV(cv3); ic.style.imageRendering = 'pixelated'; d.appendChild(ic); }
      var nm = document.createElement('span'); nm.className = 'nm'; nm.textContent = B[id].n; d.appendChild(nm);
      d.dataset.id = '' + id;
      d.addEventListener('click', function (this: HTMLElement) { var bid = +(this.dataset.id || '0'); P.hb[P.sel] = { id: bid, q: 64 }; updateHotbar(); showAlert(B[bid].n); });
      g.appendChild(d);
    }
  } else {
    for (var i = 0; i < 9; i++) {
      var d = document.createElement('div'); d.className = 'ic'; d.dataset.si = '' + i;
      var slot = P.hb[i];
      if (slot) {
        slotIcon(d, slot.id, slot.q);
        var nm = document.createElement('span'); nm.className = 'nm'; nm.textContent = B[slot.id].n; d.appendChild(nm);
      }
      d.addEventListener('click', function (this: HTMLElement) {
        var si = +(this.dataset.si || '0');
        var s = P.hb[si];
        if (heldId) {
          if (!s) { P.hb[si] = { id: heldId, q: heldQty }; heldId = 0; heldQty = 0; }
          else if (s.id === heldId) { s.q += heldQty; heldId = 0; heldQty = 0; }
          else { var tId = heldId, tQ = heldQty; heldId = s.id; heldQty = s.q; P.hb[si] = { id: tId, q: tQ }; }
        } else if (s) { heldId = s.id; heldQty = s.q; P.hb[si] = null; }
        updateHotbar(); buildInvGrid(); buildInvCraft(); showHeld();
      });
      g.appendChild(d);
    }
  }
}

function match2x2(): CraftingResult | null {
  var g3 = [invCraft[0], invCraft[1], 0, invCraft[2], invCraft[3], 0, 0, 0, 0];
  for (var r = 0; r < RECIPES.length; r++) {
    var pat = RECIPES[r][0] as number[], match = true;
    for (var j = 0; j < 9; j++) { if (pat[j] !== g3[j]) { match = false; break; } }
    if (match) return { id: RECIPES[r][1] as number, q: RECIPES[r][2] as number };
  }
  var gn = invCraft.filter(function (v: number) { return v > 0; });
  if (gn.length === 1) {
    for (var r = 0; r < RECIPES.length; r++) {
      var pn = (RECIPES[r][0] as number[]).filter(function (v: number) { return v > 0; });
      if (pn.length === 1 && pn[0] === gn[0]) return { id: RECIPES[r][1] as number, q: RECIPES[r][2] as number };
    }
  }
  return null;
}

function buildInvCraft(): void {
  var g = $('icraft'); if (!g) return; g.innerHTML = '';
  for (var i = 0; i < 4; i++) {
    var d = document.createElement('div'); d.className = 'cs'; d.dataset.i = '' + i;
    if (invCraft[i]) slotIcon(d, invCraft[i], 1);
    d.addEventListener('click', function (this: HTMLElement) {
      var idx = +(this.dataset.i || '0');
      if (heldId) {
        if (!invCraft[idx]) { invCraft[idx] = heldId; heldQty--; if (heldQty <= 0) { heldId = 0; heldQty = 0; } }
        else if (invCraft[idx] !== heldId) { var old = invCraft[idx]; invCraft[idx] = heldId; heldQty--; if (heldQty <= 0) { heldId = old; heldQty = 1; } else { pickUp(old, 1); } }
      } else if (invCraft[idx]) { heldId = invCraft[idx]; heldQty = 1; invCraft[idx] = 0; }
      updateHotbar(); buildInvGrid(); buildInvCraft(); showHeld();
    });
    g.appendChild(d);
  }
  var res = match2x2(), out = $('icout'); if (!out) return;
  slotIcon(out, res ? res.id : 0, res ? res.q : 0);
  out.onclick = function () {
    var res2 = match2x2(); if (!res2) return;
    if (heldId && heldId !== res2.id) return;
    if (heldId === res2.id) heldQty += res2.q; else { heldId = res2.id; heldQty = res2.q; }
    invCraft.fill(0);
    updateHotbar(); buildInvGrid(); buildInvCraft(); showHeld();
    showAlert('合成 ' + B[res2.id].n + (res2.q > 1 ? ' x' + res2.q : ''));
  };
}
