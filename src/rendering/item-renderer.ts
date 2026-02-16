import { B } from '../data/blocks';
import { generateTexture } from './textures';

const { floor: fl, min: mn, sqrt: sq, PI } = Math;

export function cloneCV(src: HTMLCanvasElement): HTMLCanvasElement {
  var c = document.createElement('canvas'); c.width = src.width; c.height = src.height;
  c.getContext('2d')!.drawImage(src, 0, 0); return c;
}

const itemCache: Record<number, HTMLCanvasElement> = {};

export function render3DItem(id: number): HTMLCanvasElement | null {
  if (itemCache[id]) return itemCache[id];
  var b = B[id]; if (!b) return null;
  var cv = document.createElement('canvas'); cv.width = cv.height = 40;
  var ctx = cv.getContext('2d')!; ctx.imageSmoothingEnabled = false;
  var topT = generateTexture(id, 'top'), sideT = generateTexture(id, 'side');
  if (!topT && !sideT) { itemCache[id] = cv; return cv; }

  // Tools
  if (b.tool > 0) {
    var col = b.c.t, hr = (col >> 16) & 255, hg = (col >> 8) & 255, hb = col & 255;
    var mc = 'rgb(' + hr + ',' + hg + ',' + hb + ')';
    var ml = 'rgb(' + mn(255, hr + 40) + ',' + mn(255, hg + 40) + ',' + mn(255, hb + 40) + ')';
    var md = 'rgb(' + fl(hr * .7) + ',' + fl(hg * .7) + ',' + fl(hb * .7) + ')';
    var me = 'rgb(' + fl(hr * .5) + ',' + fl(hg * .5) + ',' + fl(hb * .5) + ')';
    var nm = b.n || '';
    var p = function (x: number, y: number, c2: string) { ctx.fillStyle = c2; ctx.fillRect(x * 2.4 + 1, y * 2.4 + 1, 3, 3); };
    var hc = '#8B6914', hl = '#A88020', hd = '#6B4910';
    if (nm.indexOf('剑') >= 0) {
      // Blade
      p(13, 1, ml); p(12, 2, mc); p(13, 2, ml);
      p(11, 3, mc); p(12, 3, ml); p(10, 4, mc); p(11, 4, mc);
      p(9, 5, mc); p(10, 5, md); p(8, 6, mc); p(9, 6, mc);
      p(7, 7, mc); p(8, 7, md);
      // Guard
      p(5, 8, hd); p(6, 8, hl); p(7, 8, hl); p(8, 8, hd);
      // Handle
      p(5, 9, hc); p(4, 10, hl); p(3, 11, hc); p(2, 12, hd);
    } else if (nm.indexOf('镐') >= 0) {
      // Head — wide diagonal bar
      p(2, 1, md); p(3, 1, mc); p(4, 1, ml);
      p(4, 2, md); p(5, 2, mc); p(6, 2, ml);
      p(6, 3, md); p(7, 3, mc); p(8, 3, ml);
      p(8, 4, me); p(9, 4, mc); p(10, 4, ml);
      p(10, 5, md); p(11, 5, mc); p(12, 5, ml);
      // Head bottom edge
      p(3, 2, me); p(12, 6, me);
      // Handle
      p(9, 6, hc); p(8, 7, hl); p(7, 8, hc); p(6, 9, hl);
      p(5, 10, hc); p(4, 11, hd); p(3, 12, hc); p(2, 13, hl);
    } else if (nm.indexOf('斧') >= 0) {
      // Axe head
      p(9, 1, mc); p(10, 1, ml); p(11, 1, mc);
      p(8, 2, md); p(9, 2, mc); p(10, 2, ml); p(11, 2, mc);
      p(8, 3, me); p(9, 3, mc); p(10, 3, ml);
      p(9, 4, md); p(10, 4, mc);
      p(10, 5, md);
      // Handle
      p(9, 5, hc); p(8, 6, hl); p(7, 7, hc); p(6, 8, hl);
      p(5, 9, hc); p(4, 10, hd); p(3, 11, hc); p(2, 12, hl);
    } else if (nm.indexOf('锹') >= 0) {
      // Shovel head
      p(11, 1, md); p(12, 1, mc);
      p(10, 2, md); p(11, 2, mc); p(12, 2, ml); p(13, 2, mc);
      p(10, 3, me); p(11, 3, mc); p(12, 3, ml); p(13, 3, md);
      p(11, 4, md); p(12, 4, mc);
      // Handle
      p(10, 5, hc); p(9, 6, hl); p(8, 7, hc); p(7, 8, hl);
      p(6, 9, hc); p(5, 10, hd); p(4, 11, hc); p(3, 12, hl); p(2, 13, hc);
    } else if (nm.indexOf('锄') >= 0) {
      // Hoe head
      p(10, 2, mc); p(11, 2, ml); p(12, 2, mc);
      p(11, 3, md); p(12, 3, mc);
      p(11, 4, me);
      // Handle
      p(10, 5, hc); p(9, 6, hl); p(8, 7, hc); p(7, 8, hl);
      p(5, 10, hc); p(6, 9, hd); p(4, 11, hc); p(3, 12, hl);
    } else {
      p(10, 3, mc); p(11, 3, ml); p(11, 4, mc); p(12, 4, ml);
      p(10, 5, hc); p(9, 6, hl); p(8, 7, hc); p(7, 8, hc); p(6, 9, hd); p(5, 10, hc); p(4, 11, hl); p(3, 12, hc);
    }
    itemCache[id] = cv; return cv;
  }

  // Food
  if (b.food > 0) {
    var col2 = b.c.t, fr = (col2 >> 16) & 255, fg = (col2 >> 8) & 255, fb = col2 & 255;
    ctx.fillStyle = 'rgb(' + fr + ',' + fg + ',' + fb + ')';
    ctx.beginPath(); ctx.ellipse(20, 20, 12, 10, 0, 0, PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.beginPath(); ctx.ellipse(16, 16, 5, 4, -.3, 0, PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.beginPath(); ctx.ellipse(24, 24, 6, 4, .3, 0, PI * 2); ctx.fill();
    itemCache[id] = cv; return cv;
  }

  // Armor
  if (b.n && (b.n.indexOf('头盔') >= 0 || b.n.indexOf('胸甲') >= 0 || b.n.indexOf('护腿') >= 0 || b.n.indexOf('靴子') >= 0)) {
    var col3 = b.c.t, ar = (col3 >> 16) & 255, ag2 = (col3 >> 8) & 255, ab2 = col3 & 255;
    ctx.fillStyle = 'rgb(' + ar + ',' + ag2 + ',' + ab2 + ')';
    if (b.n.indexOf('头盔') >= 0) { ctx.fillRect(8, 8, 24, 6); ctx.fillRect(6, 14, 28, 12); ctx.fillRect(10, 14, 6, 4); ctx.fillRect(24, 14, 6, 4); ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.fillRect(12, 18, 6, 6); ctx.fillRect(22, 18, 6, 6); }
    else if (b.n.indexOf('胸甲') >= 0) { ctx.fillRect(6, 4, 28, 6); ctx.fillRect(6, 10, 8, 24); ctx.fillRect(26, 10, 8, 24); ctx.fillRect(14, 10, 12, 20); ctx.fillStyle = 'rgba(0,0,0,.15)'; ctx.fillRect(16, 14, 8, 12); }
    else if (b.n.indexOf('护腿') >= 0) { ctx.fillRect(8, 4, 24, 8); ctx.fillRect(8, 12, 10, 22); ctx.fillRect(22, 12, 10, 22); ctx.fillStyle = 'rgba(0,0,0,.15)'; ctx.fillRect(18, 4, 4, 30); }
    else { ctx.fillRect(6, 12, 12, 18); ctx.fillRect(22, 12, 12, 18); ctx.fillStyle = 'rgba(0,0,0,.15)'; ctx.fillRect(8, 16, 8, 4); ctx.fillRect(24, 16, 8, 4); }
    ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fillRect(10, 6, 6, 4);
    itemCache[id] = cv; return cv;
  }

  // Non-breakable items
  if (b.nb) {
    var col4 = b.c.t, mr = (col4 >> 16) & 255, mg = (col4 >> 8) & 255, mb = col4 & 255;
    ctx.fillStyle = 'rgb(' + fl(mr * .8) + ',' + fl(mg * .8) + ',' + fl(mb * .8) + ')'; ctx.fillRect(8, 8, 24, 24);
    ctx.fillStyle = 'rgb(' + mr + ',' + mg + ',' + mb + ')'; ctx.fillRect(10, 10, 20, 20);
    ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.fillRect(10, 10, 20, 3); ctx.fillRect(10, 10, 3, 20);
    itemCache[id] = cv; return cv;
  }

  // Flowers/foliage
  if (b.f) {
    var col5 = b.c.t, pr = (col5 >> 16) & 255, pg = (col5 >> 8) & 255, pb = col5 & 255;
    ctx.fillStyle = '#3a8a2a'; ctx.fillRect(18, 20, 4, 16);
    ctx.fillStyle = 'rgb(' + pr + ',' + pg + ',' + pb + ')';
    ctx.beginPath(); ctx.ellipse(20, 14, 8, 8, 0, 0, PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.beginPath(); ctx.ellipse(18, 12, 3, 3, 0, 0, PI * 2); ctx.fill();
    itemCache[id] = cv; return cv;
  }

  // Block: isometric 3D cube
  var u = 13, cx2 = 20, cy2 = 19;
  ctx.save(); ctx.setTransform(u / 16, u / 32, -u / 16, u / 32, cx2, cy2 - u);
  ctx.drawImage(topT || sideT!, 0, 0); ctx.restore();
  ctx.save(); ctx.setTransform(u / 16, -u / 32, 0, u / 16, cx2, cy2);
  ctx.drawImage(sideT || topT!, 0, 0); ctx.restore();
  ctx.save(); ctx.setTransform(u / 16, u / 32, 0, u / 16, cx2 - u, cy2 - u / 2);
  ctx.drawImage(sideT || topT!, 0, 0); ctx.restore();
  ctx.beginPath(); ctx.moveTo(cx2 - u, cy2 - u / 2); ctx.lineTo(cx2, cy2); ctx.lineTo(cx2, cy2 + u); ctx.lineTo(cx2 - u, cy2 + u / 2);
  ctx.closePath(); ctx.fillStyle = 'rgba(0,0,0,0.22)'; ctx.fill();
  ctx.beginPath(); ctx.moveTo(cx2, cy2); ctx.lineTo(cx2 + u, cy2 - u / 2); ctx.lineTo(cx2 + u, cy2 + u / 2); ctx.lineTo(cx2, cy2 + u);
  ctx.closePath(); ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.15)'; ctx.lineWidth = 0.5;
  ctx.beginPath(); ctx.moveTo(cx2, cy2 - u); ctx.lineTo(cx2 + u, cy2 - u / 2); ctx.lineTo(cx2 + u, cy2 + u / 2); ctx.lineTo(cx2, cy2 + u); ctx.lineTo(cx2 - u, cy2 + u / 2); ctx.lineTo(cx2 - u, cy2 - u / 2); ctx.closePath(); ctx.stroke();
  itemCache[id] = cv; return cv;
}
