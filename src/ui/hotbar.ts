import { P } from '../player/player-state';
import { render3DItem, cloneCV } from '../rendering/item-renderer';
import { $ } from './dom-helpers';

export function updateHotbar(): void {
  var slots = document.querySelectorAll('#bar .sl');
  for (var i = 0; i < 9; i++) {
    var s = slots[i] as HTMLElement; if (!s) continue;
    s.innerHTML = '<span class="sn">' + (i + 1) + '</span>';
    if (P.hb[i]) {
      var cv3 = render3DItem(P.hb[i]!.id);
      if (cv3) { var c2 = cloneCV(cv3); c2.style.imageRendering = 'pixelated'; s.appendChild(c2); }
      if (P.hb[i]!.q > 1) { var sq2 = document.createElement('span'); sq2.className = 'sq'; sq2.textContent = '' + P.hb[i]!.q; s.appendChild(sq2); }
    }
    s.className = 'sl' + (i === P.sel ? ' on' : '');
  }
}

export function buildHotbar(): void {
  var bar = $('bar'); if (!bar) return; bar.innerHTML = '';
  for (var i = 0; i < 9; i++) {
    var d = document.createElement('div'); d.className = 'sl' + (i === P.sel ? ' on' : '');
    d.innerHTML = '<span class="sn">' + (i + 1) + '</span>'; d.dataset.i = '' + i;
    d.addEventListener('click', function (this: HTMLElement) { P.sel = +(this.dataset.i || '0'); updateHotbar(); });
    bar.appendChild(d);
  }
  updateHotbar();
}
