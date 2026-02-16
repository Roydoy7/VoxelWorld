import { B } from '../data/blocks';

const { floor: fl, min: mn, max: mx, abs: ab, sin, cos, sqrt: sq, PI } = Math;

export const textureCache: Record<string, HTMLCanvasElement> = {};

export function generateTexture(id: number, face: string): HTMLCanvasElement | null {
  var k = id + '_' + face; if (textureCache[k]) return textureCache[k];
  var b = B[id]; if (!b) return null;
  var cv = document.createElement('canvas'); cv.width = cv.height = 16;
  var X = cv.getContext('2d')!;
  var col = b.c[face === 'top' ? 't' : face === 'bottom' ? 'b' : 's'] || b.c.t;
  var R0 = (col >> 16) & 0xff, G0 = (col >> 8) & 0xff, B0 = col & 0xff;
  function H(a: number, b: number) { var n = sin(a * 127.1 + b * 311.7) * 43758.5; return n - fl(n); }
  function SN(x: number, y: number) { var ix = fl(x), iy = fl(y), fx = x - ix, fy = y - iy; fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy); return H(ix, iy) * (1 - fx) * (1 - fy) + H(ix + 1, iy) * fx * (1 - fy) + H(ix, iy + 1) * (1 - fx) * fy + H(ix + 1, iy + 1) * fx * fy; }
  function FB(x: number, y: number, o: number) { var v = 0, a = .5, f = 1; for (var i = 0; i < o; i++) { v += a * SN(x * f + id * 7.3, y * f + id * 13.7); a *= .5; f *= 2; } return v; }
  function PH(x: number, y: number) { return H(x + id * 17.3, y + id * 31.7); }
  function fp(px: number, py: number, r: number, g: number, b2: number, a?: number) {
    r = mx(0, mn(255, r | 0)); g = mx(0, mn(255, g | 0)); b2 = mx(0, mn(255, b2 | 0));
    X.fillStyle = a != null ? 'rgba(' + r + ',' + g + ',' + b2 + ',' + a + ')' : 'rgb(' + r + ',' + g + ',' + b2 + ')';
    X.fillRect(px, py, 1, 1);
  }
  var isLog = (id === 5 || id === 7 || id === 105 || id === 106 || id === 107 || id === 108 || id === 350 || id === 352);
  var isPlank = (id === 6 || id === 8 || id === 101 || id === 102 || id === 103 || id === 104 || id === 351 || id === 353 || id === 355 || id === 356 || id === 357);
  var isLeaf = b.f && (id === 41 || id === 42 || id === 43 || id === 354 || id === 365 || id === 366 || id === 367 || id === 368 || id === 369 || id === 531);
  var isBrick = (id === 89 || id === 113 || id === 26 || id === 27 || id === 28 || id === 29 || id === 114 || id === 347);
  var isMetal = (id >= 53 && id <= 60);
  var isWool = (id >= 31 && id <= 40);
  var isSand = (id === 9 || id === 10 || id === 11);
  for (var py = 0; py < 16; py++) for (var px = 0; px < 16; px++) {
    var n1 = FB(px * .25, py * .25, 3) - .25;
    var n2 = FB(px * .6, py * .6, 2) - .25;
    var n3 = FB(px * 1.2, py * 1.2, 2) - .25;
    var ph = PH(px, py);
    var rr = R0, gg = G0, bb = B0;
    if (id === 1) {
      if (face === 'top') {
        var gn = FB(px * .2, py * .2, 5); var gn5 = FB(px * .5, py * .5, 3);
        rr = 48 + gn * 50 + gn5 * 12; gg = 115 + gn * 55 + gn5 * 15; bb = 20 + gn * 25 + gn5 * 8;
        if (ph > .8) { gg += 15; rr -= 5; } if (ph < .1) { rr += 6; gg -= 10; bb -= 4; }
        if (ph > .93) { rr = 60 + gn * 30; gg = 130 + gn * 30; bb = 25 + gn * 15; }
        if (ph > .96) { rr = 120 + n2 * 40; gg = 70 + n2 * 30; bb = 30 + n2 * 20; }
      } else if (face === 'bottom') {
        rr = 107 + n1 * 30 + n3 * 8; gg = 82 + n1 * 22 + n3 * 6; bb = 48 + n1 * 16 + n3 * 4;
        if (ph > .85) { rr -= 14; gg -= 11; bb -= 9; }
        if (ph < .06) { rr += 12; gg += 10; bb += 7; }
      } else {
        var grassLine = py < 2 || (py === 2 && ph > .35) || (py === 3 && ph > .75);
        if (grassLine) {
          var gn2 = FB(px * .25, py * .3, 4); rr = 50 + gn2 * 55; gg = 118 + gn2 * 52; bb = 22 + gn2 * 28;
          if (py === 0) { rr -= 5; gg += 8; }
          if (py >= 2 && ph > .5) { rr += (1 - ph) * 40; gg -= (1 - ph) * 20; bb += (1 - ph) * 15; }
        } else {
          rr = 107 + n1 * 30 + n2 * 10; gg = 82 + n1 * 22 + n2 * 8; bb = 48 + n1 * 16 + n2 * 5;
          if (ph > .88) { rr -= 16; gg -= 13; bb -= 11; }
          if (ph < .05 && py > 5) { rr += 8; gg += 6; bb += 4; }
        }
      }
      fp(px, py, rr, gg, bb); continue;
    }
    if (id === 2 || id === 72) {
      rr = R0 + n1 * 32 + n2 * 14 + n3 * 6; gg = G0 + n1 * 24 + n2 * 10 + n3 * 4; bb = B0 + n1 * 18 + n2 * 7 + n3 * 3;
      if (ph > .86) { rr -= 16; gg -= 13; bb -= 11; }
      if (ph < .06) { rr += 12; gg += 10; bb += 6; }
      if (ph > .92 && ph < .95) { rr += 15; gg += 13; bb += 10; }
      fp(px, py, rr, gg, bb); continue;
    }
    if (id === 3 || id === 4 || id === 90 || id === 91 || id === 92 || id === 94 || id === 95 || id === 118 || (id >= 21 && id <= 23) || (id >= 98 && id <= 100)) {
      if (id === 3) {
        // Stone: Minecraft-style blocky discrete grey patches
        var sh1 = H(fl(px / 4), fl(py / 2));
        var sh2 = H(fl((px + 2) / 3) + 7, fl((py + 1) / 2) + 11);
        var sh3 = H(fl(px / 2) + 13, fl(py) + 5);
        var sv = sh1 * .38 + sh2 * .34 + sh3 * .28;
        var si = mn(4, fl(sv * 5));
        var stBase = [88, 110, 126, 140, 155][si];
        stBase += (ph - .5) * 6;
        rr = stBase; gg = stBase; bb = stBase;
      } else if (id === 4 || id === 95) {
        // Cobblestone: irregular round stones packed together
        var md1 = 99, md2 = 99, sth = 0;
        for (var ci2 = 0; ci2 < 10; ci2++) {
          var scx = H(ci2 + .3, .7) * 14 + 1, scy = H(.7, ci2 + .3) * 14 + 1;
          var sdx = px - scx, sdy = py - scy;
          if (sdx > 8) sdx -= 16; if (sdx < -8) sdx += 16;
          if (sdy > 8) sdy -= 16; if (sdy < -8) sdy += 16;
          var sd = sq(sdx * sdx * 1.1 + sdy * sdy);
          if (sd < md1) { md2 = md1; sth = H(ci2 + 3, ci2 * 2 + 7); md1 = sd; }
          else if (sd < md2) { md2 = sd; }
        }
        var edge = md2 - md1;
        var sg = id === 95 ? 95 + sth * 40 : 100 + sth * 55;
        if (edge < 1.2) sg -= (1.2 - edge) * 30;
        sg += (ph - .5) * 8;
        rr = sg; gg = sg; bb = sg;
        if (id === 95) { rr -= 5; gg += 5; bb -= 3; }
      } else if (id === 21) {
        // Granite: rough pinkish stone with speckles
        var gh1 = H(fl(px / 3), fl(py / 2));
        var gh2 = H(fl((px + 1) / 2) + 5, fl((py + 1) / 2) + 3);
        var gh3 = H(px + 9, py + 13);
        var gv = gh1 * .4 + gh2 * .35 + gh3 * .25;
        var gi = mn(4, fl(gv * 5));
        var gr = [155, 170, 185, 195, 175][gi];
        var gg2 = [115, 128, 138, 145, 130][gi];
        var gb = [115, 125, 135, 140, 128][gi];
        gr += (ph - .5) * 12; gg2 += (ph - .5) * 8; gb += (ph - .5) * 8;
        if (ph > .85) { gr += 8; gg2 -= 3; gb -= 5; }
        if (ph < .1) { gr -= 10; gg2 -= 6; gb -= 4; }
        var gcr = ab(SN(px * .4 + 21, py * .5 + 7) - .5);
        if (gcr < .04) { gr -= 20; gg2 -= 15; gb -= 12; }
        rr = gr; gg = gg2; bb = gb;
      } else {
        rr = R0 + n1 * 32 + n2 * 14 + n3 * 5; gg = G0 + n1 * 32 + n2 * 14 + n3 * 5; bb = B0 + n1 * 32 + n2 * 14 + n3 * 5;
        if (ph > .91) { rr += 16; gg += 16; bb += 16; }
        if (ph < .04) { rr -= 10; gg -= 10; bb -= 10; }
        var crk = 0.05;
        var crv = ab(SN(px * .5 + id * .3, py * .5 + id * .7) - .5);
        if (crv < crk) { var cci = 1 - crv / crk; rr -= 25 * cci; gg -= 25 * cci; bb -= 25 * cci; }
      }
      fp(px, py, rr, gg, bb); continue;
    }
    if (b.o) {
      rr = R0 + n1 * 25; gg = G0 + n1 * 25; bb = B0 + n1 * 25;
      if (ab(SN(px * .5, py * .5) - .5) < .04) { rr -= 20; gg -= 20; bb -= 20; }
      var ox = (px * 3 + py * 7 + id * 5) % 11, oy = (py * 3 + px * 5 + id * 3) % 11;
      if (ox < 3 && oy < 3 && PH(px * 2 + 1, py * 3 + 2) > .35) {
        var oc = id === 13 ? 0x333333 : id === 14 ? 0xd4a060 : id === 15 ? 0xf8d840 : id === 16 ? 0x5aeaea : id === 17 ? 0xdd3030 : id === 18 ? 0x3060d8 : id === 19 ? 0x40d870 : id === 20 ? 0xd08050 : id === 130 ? 0x333333 : col;
        rr = ((oc >> 16) & 0xff) + n2 * 15; gg = ((oc >> 8) & 0xff) + n2 * 15; bb = (oc & 0xff) + n2 * 15;
      }
      fp(px, py, rr, gg, bb); continue;
    }
    if (isLog) {
      if (face === 'top' || face === 'bottom') {
        var dx = px - 7.5, dy2 = py - 7.5, dist = sq(dx * dx + dy2 * dy2);
        var ringRaw = sin(dist * 1.6 + .3) * .5 + .5;
        var ringQ = fl(ringRaw * 5) / 5;
        rr = R0 + ringQ * 30 - 12 + (ph - .5) * 8; gg = G0 + ringQ * 24 - 10 + (ph - .5) * 6; bb = B0 + ringQ * 16 - 8 + (ph - .5) * 4;
        if (dist < 1.8) { rr -= 18; gg -= 12; bb -= 8; }
        if (dist > 6) { var sc = b.c.s; rr = ((sc >> 16) & 0xff) + n1 * 12; gg = ((sc >> 8) & 0xff) + n1 * 10; bb = (sc & 0xff) + n1 * 6; }
      } else {
        // Bark: sharp-edged vertical strips with grooves
        var sv1 = H(fl(px / 3) + id * 5, .3);
        var sv2 = H(fl((px + 1) / 4) + id * 3, .7);
        var sv3 = H(fl(px / 2) + id * 9, fl(py / 4) + id * 2);
        var bv = sv1 * .4 + sv2 * .3 + sv3 * .3;
        var bi = mn(4, fl(bv * 5));
        var bkR = R0 + [-16, -6, 4, 14, 8][bi];
        var bkG = G0 + [-12, -4, 3, 10, 6][bi];
        var bkB = B0 + [-8, -3, 2, 7, 4][bi];
        // Vertical grooves between strips
        var xMod3 = px % 3;
        if (xMod3 === 0 && H(px + id * 2, fl(py / 2)) > .3) { bkR -= 22; bkG -= 18; bkB -= 12; }
        // Secondary thin groove
        if (px % 5 === 2 && H(px + id, fl(py / 3) + id) > .55) { bkR -= 14; bkG -= 11; bkB -= 8; }
        // Horizontal bark cracks
        var hCrack = H(.5, py + id * 7);
        if (hCrack > .82 && H(px, py + id * 11) > .4) { bkR -= 16; bkG -= 13; bkB -= 9; }
        // Knot detail
        if (ph > .92 && H(fl(px / 4), fl(py / 4) + id) > .7) { bkR -= 20; bkG -= 15; bkB -= 10; }
        // Per-pixel grain
        bkR += (ph - .5) * 10; bkG += (ph - .5) * 7; bkB += (ph - .5) * 5;
        rr = bkR; gg = bkG; bb = bkB;
        // Birch: white bark with black horizontal marks
        if (id === 7) {
          var bch = H(fl(px / 2) + 3, fl(py / 3) + 5);
          rr = 200 + bch * 25 - 12 + (ph - .5) * 10;
          gg = 192 + bch * 20 - 10 + (ph - .5) * 8;
          bb = 176 + bch * 16 - 8 + (ph - .5) * 6;
          // Black horizontal marks
          var bMark = H(.3, fl(py / 2) + id);
          if (bMark > .6 && px > fl(bMark * 6) && px < fl(bMark * 6) + 6 + fl(H(py, id) * 5)) {
            rr -= 80 + (ph - .5) * 20; gg -= 75 + (ph - .5) * 18; bb -= 70 + (ph - .5) * 15;
          }
        }
      }
      fp(px, py, rr, gg, bb); continue;
    }
    if (isPlank) {
      var grain2 = SN(px * .1 + id * 3, py * .8 + id) * .5 + .5;
      rr = R0 + grain2 * 22 - 11 + n1 * 12; gg = G0 + grain2 * 18 - 9 + n1 * 10; bb = B0 + grain2 * 14 - 7 + n1 * 7;
      if (py === 0 || py === 8) { rr -= 22; gg -= 20; bb -= 18; }
      if ((px === 3 && py === 3) || (px === 11 && py === 11)) { rr -= 30; gg -= 25; bb -= 20; }
      var bX = py < 8 ? px % 8 : ((px + 4) % 8); if (bX === 0) { rr -= 10; gg -= 8; bb -= 6; }
      fp(px, py, rr, gg, bb); continue;
    }
    if (isLeaf) {
      var ln = FB(px * .35, py * .35, 4); var ln2 = FB(px * .6, py * .6, 2);
      rr = R0 + (ln < .2 ? -38 : ln * 48 - 22) + n2 * 10 + ln2 * 6;
      gg = G0 + (ln < .2 ? -32 : ln * 44 - 20) + n2 * 8 + ln2 * 8;
      bb = B0 + (ln < .2 ? -16 : ln * 26 - 12) + n2 * 5 + ln2 * 3;
      var hole = PH(px * 2.3, py * 3.1) < .1;
      if (ab(px - 8) < 1 && py % 4 === 0) { rr += 14; gg += 18; bb += 10; }
      if (ln > .55 && ln2 > .3) { gg += 8; rr -= 3; }
      // Apple on apple leaves
      if (id === 531) {
        var adx2 = px - 10, ady2 = py - 10;
        if (adx2 * adx2 + ady2 * ady2 < 7) { rr = 200 + n2 * 30; gg = 25 + n2 * 15; bb = 20 + n2 * 10; hole = false; }
        if (px >= 9 && px <= 10 && py === 7) { rr = 60; gg = 100; bb = 30; hole = false; }
      }
      fp(px, py, rr, gg, bb, hole ? .25 : .82); continue;
    }
    if (b.f) {
      if ((px === 7 || px === 8) && py >= 10 && py <= 15) { fp(px, py, 50, 110 + n1 * 20, 35); continue; }
      var fdx = ab(px - 7.5), fdy = ab(py - 6);
      var pd = sq(fdx * fdx + fdy * fdy);
      if (pd < 4 && py < 12 && fdx + fdy < 4.5) {
        rr = R0 + n1 * 30; gg = G0 + n1 * 30; bb = B0 + n1 * 30;
        if (pd < 1.5) { rr = mn(255, rr + 40); gg = mn(255, gg + 40); bb = mn(255, bb + 20); }
        fp(px, py, rr, gg, bb, .9); continue;
      }
      if (py >= 12 && py <= 14 && (px === 5 || px === 6 || px === 9 || px === 10) && ph > .5) { fp(px, py, 40, 100 + n1 * 20, 30, .7); continue; }
      continue;
    }
    if (b.gl) {
      if (px === 0 || px === 15 || py === 0 || py === 15) { fp(px, py, mn(255, R0 * .6 + 100), mn(255, G0 * .6 + 100), mn(255, B0 * .6 + 100), .65); }
      else if (px === 1 || px === 14 || py === 1 || py === 14) { fp(px, py, R0, G0, B0, .3); }
      else { var sh = (px + py === 8) ? .15 : 0; fp(px, py, mn(255, R0 + 20), mn(255, G0 + 20), mn(255, B0 + 20), .12 + sh); }
      continue;
    }
    if (isBrick) {
      var bRow = fl(py / 4), off = bRow % 2 ? 4 : 0, bx = (px + off) % 8, by = py % 4;
      if (bx === 0 || by === 0) { rr = 180 + n2 * 15; gg = 175 + n2 * 12; bb = 165 + n2 * 10; }
      else { rr = R0 + n1 * 22 + n2 * 8; gg = G0 + n1 * 16 + n2 * 6; bb = B0 + n1 * 12 + n2 * 4; if (ph > .88) { rr += 10; gg += 8; bb += 5; } }
      if (id === 27) { if (ph > .6 && py % 4 > 0 && (px + off) % 8 > 0) { rr -= 10; gg += 15; bb -= 5; } }
      if (id === 28) { if (ab(SN(px * .3, py * .2) - .5) < .06) { rr -= 20; gg -= 20; bb -= 20; } }
      fp(px, py, rr, gg, bb); continue;
    }
    if (isSand) {
      rr = R0 + n1 * 20 + n2 * 8 + n3 * 10; gg = G0 + n1 * 16 + n2 * 6 + n3 * 8; bb = B0 + n1 * 12 + n2 * 4 + n3 * 6;
      if (ph > .8) { rr += 12; gg += 10; bb += 5; }
      if (ph < .1) { rr -= 12; gg -= 10; bb -= 6; }
      if (ph > .9 && ph < .94) { rr += 8; gg += 6; bb += 3; }
      if (id === 10) { if (ph > .7) { rr += 16; gg += 16; bb += 16; } if (ph < .3) { rr -= 16; gg -= 16; bb -= 16; } }
      fp(px, py, rr, gg, bb); continue;
    }
    if (id === 24 || id === 25 || id === 119) {
      rr = R0 + n1 * 20; gg = G0 + n1 * 16; bb = B0 + n1 * 12;
      if (face !== 'top' && face !== 'bottom') { var bd = sin(py * .6 + n2 * 2) * .5 + .5; rr += bd * 15 - 8; gg += bd * 12 - 6; bb += bd * 8 - 4; }
      fp(px, py, rr, gg, bb); continue;
    }
    if (isWool) { rr = R0 + n1 * 20 + n2 * 10; gg = G0 + n1 * 20 + n2 * 10; bb = B0 + n1 * 20 + n2 * 10; if ((px + py) % 2 === 0) { rr += 4; gg += 4; bb += 4; } fp(px, py, rr, gg, bb); continue; }
    if (isMetal) {
      rr = R0 + n1 * 15; gg = G0 + n1 * 15; bb = B0 + n1 * 15;
      var sh2 = sin((px + py) * .4) * .5 + .5; rr += sh2 * 20; gg += sh2 * 18; bb += sh2 * 15;
      if (px === 0 || px === 15 || py === 0 || py === 15) { rr -= 20; gg -= 18; bb -= 15; }
      if (px === 1 || px === 14 || py === 1 || py === 14) { rr += 10; gg += 10; bb += 10; }
      fp(px, py, rr, gg, bb); continue;
    }
    if (id === 120) {
      var wave = sin(px * .5 + py * .3 + SN(px * .2, py * .2) * 3) * .5 + .5;
      var wave2 = sin(px * .3 - py * .4 + SN(px * .15, py * .25) * 2) * .5 + .5;
      rr = R0 + wave * 25 - 12 + wave2 * 10 - 5 + n1 * 12;
      gg = G0 + wave * 20 - 10 + wave2 * 8 - 4 + n1 * 10;
      bb = B0 + wave * 18 - 9 + wave2 * 12 - 6 + n1 * 10;
      if (ph > .88) { rr += 18; gg += 22; bb += 28; }
      if (ph > .95) { rr += 15; gg += 15; bb += 20; }
      var caust = sin(px * .8 + py * .6) * sin(px * .6 - py * .8);
      if (caust > .3) { rr += 8; gg += 10; bb += 14; }
      fp(px, py, rr, gg, bb, .65); continue;
    }
    if (id === 121) { var flow = FB(px * .2, py * .15, 3); rr = 200 + flow * 55; gg = 80 + flow * 80; bb = 10 + flow * 30; if (ph > .85) { rr = 255; gg = mn(255, gg + 40); bb = mn(255, bb + 20); } fp(px, py, rr, gg, bb, .85); continue; }
    if (id === 68 || id === 69 || id === 70 || id === 363 || id === 364) {
      rr = R0 + n1 * 12 + n2 * 6; gg = G0 + n1 * 10 + n2 * 5; bb = B0 + n1 * 8 + n2 * 4;
      if (ph > .9) { rr = mn(255, rr + 15); gg = mn(255, gg + 15); bb = mn(255, bb + 15); }
      if (id !== 68) { if (ab(SN(px * .4 + id, py * .3) - .5) < .03) { rr = mn(255, rr + 30); gg = mn(255, gg + 30); bb = mn(255, bb + 30); } fp(px, py, rr, gg, bb, .75); continue; }
      fp(px, py, rr, gg, bb); continue;
    }
    if (id === 88) {
      if (face === 'top' || face === 'bottom') { rr = R0 + n1 * 15; gg = G0 + n1 * 12; bb = B0 + n1 * 8; }
      else {
        var shelf = py < 2 || py > 13 || (py > 6 && py < 9);
        if (shelf) { rr = 188 + n1 * 15; gg = 140 + n1 * 12; bb = 76 + n1 * 8; }
        else { var bI = fl(px / 2) + (py < 7 ? 0 : 8), bC = H(bI, id * 3);
          if (bC < .2) { rr = 140; gg = 30; bb = 30; } else if (bC < .4) { rr = 30; gg = 100; bb = 30; } else if (bC < .6) { rr = 30; gg = 30; bb = 140; } else if (bC < .8) { rr = 140; gg = 100; bb = 30; } else { rr = 80; gg = 60; bb = 40; }
          rr += n2 * 15; gg += n2 * 12; bb += n2 * 10; if (px % 2 === 0) { rr -= 8; gg -= 8; bb -= 8; }
        }
      }
      fp(px, py, rr, gg, bb); continue;
    }
    if (id === 52) {
      if (face === 'top' || face === 'bottom') { var d2 = sq((px - 7.5) * (px - 7.5) + (py - 7.5) * (py - 7.5)); if (d2 < 3) { rr = 60; gg = 60; bb = 60; } else { rr = R0 + n1 * 20; gg = G0 + n1 * 15; bb = B0 + n1 * 10; } }
      else { if (py > 5 && py < 10) { rr = 240 + n2 * 15; gg = 240 + n2 * 12; bb = 240 + n2 * 10; } else { rr = R0 + n1 * 20; gg = G0 + n1 * 10; bb = B0 + n1 * 8; } }
      fp(px, py, rr, gg, bb); continue;
    }
    if (id === 46 || id === 47 || id === 48) {
      if (face === 'top' || face === 'bottom') { rr = R0 + n1 * 15; gg = G0 + n1 * 12; bb = B0 + n1 * 8; }
      else { var st = sin(px * 1.2) * .5 + .5; rr = R0 + st * 25 - 12 + n1 * 12; gg = G0 + st * 20 - 10 + n1 * 10; bb = B0 + st * 15 - 8 + n1 * 6;
        if (id === 47 && py > 4 && py < 12 && px > 3 && px < 13) { var isF = (py < 8 && (px === 5 || px === 6 || px === 9 || px === 10)) || (py >= 8 && py < 12 && (py === 9 || py === 11 || px === 5 || px === 10)); if (isF) { rr = 255; gg = 200; bb = 50; } }
      }
      fp(px, py, rr, gg, bb); continue;
    }
    if (id === 49) {
      if (face === 'top') { if (px % 5 === 0 || py % 5 === 0) { rr = 100; gg = 70; bb = 40; } else { rr = R0 + n1 * 15; gg = G0 + n1 * 12; bb = B0 + n1 * 8; } }
      else { rr = R0 + n1 * 18; gg = G0 + n1 * 14; bb = B0 + n1 * 10; if ((px === 4 || px === 11) && py > 2 && py < 14) { rr = 80; gg = 60; bb = 40; } }
      fp(px, py, rr, gg, bb); continue;
    }
    if (id === 71) {
      if (face === 'top') { var gn3 = FB(px * .25, py * .25, 3); rr = 100 + gn3 * 40; gg = 85 + gn3 * 30; bb = 115 + gn3 * 40; }
      else if (face === 'bottom') { rr = 107 + n1 * 28; gg = 82 + n1 * 20; bb = 48 + n1 * 14; }
      else { var mL = py < 2 || (py === 2 && ph > .4); if (mL) { var gn4 = FB(px * .25, py * .3, 3); rr = 100 + gn4 * 40; gg = 85 + gn4 * 30; bb = 115 + gn4 * 40; } else { rr = 107 + n1 * 28; gg = 82 + n1 * 20; bb = 48 + n1 * 14; } }
      fp(px, py, rr, gg, bb); continue;
    }
    if (b.e && !b.o) {
      var glow = 1 - (sq((px - 7.5) * (px - 7.5) + (py - 7.5) * (py - 7.5)) / 12) * .15;
      rr = (R0 + n1 * 25) * glow; gg = (G0 + n1 * 20) * glow; bb = (B0 + n1 * 15) * glow;
      if (ph > .85) { rr = mn(255, rr + 30); gg = mn(255, gg + 25); bb = mn(255, bb + 20); }
      fp(px, py, rr, gg, bb); continue;
    }
    if ((id >= 73 && id <= 78) || (id >= 313 && id <= 328)) { rr = R0 + n1 * 10 + n2 * 5; gg = G0 + n1 * 10 + n2 * 5; bb = B0 + n1 * 10 + n2 * 5; fp(px, py, rr, gg, bb); continue; }
    if ((id >= 79 && id <= 84) || (id >= 297 && id <= 312)) {
      rr = R0 + n1 * 18 + n2 * 8; gg = G0 + n1 * 15 + n2 * 6; bb = B0 + n1 * 12 + n2 * 5;
      if (id >= 297) { var sw = sin(px * .5 + py * .3 + SN(px * .2, py * .2) * 6) * .5 + .5; rr += sw * 25 - 12; gg += sw * 20 - 10; bb += sw * 18 - 9; }
      fp(px, py, rr, gg, bb); continue;
    }
    if (id === 87) {
      if (face === 'top' || face === 'bottom') { var d3 = mx(ab(px - 7.5), ab(py - 7.5)); if (d3 < 3) { rr = R0 - 20; gg = G0 - 15; bb = B0 - 10; } else { rr = R0 + n1 * 20; gg = G0 + n1 * 16; bb = B0 + n1 * 12; } }
      else { var stw = SN(px * .9 + id, py * .15) * .5 + .5; rr = R0 + stw * 25 - 12 + n2 * 8; gg = G0 + stw * 20 - 10 + n2 * 6; bb = B0 + stw * 15 - 8 + n2 * 4; if (py % 5 === 0) { rr -= 20; gg -= 15; bb += 5; } }
      fp(px, py, rr, gg, bb); continue;
    }
    if (id === 61) {
      rr = R0 + n1 * 15 + n2 * 8; gg = G0 + n1 * 12 + n2 * 6; bb = B0 + n1 * 20 + n2 * 10;
      var sh3 = sin((px + py) * .3) * .5 + .5; bb += sh3 * 15; rr += sh3 * 8;
      if (ph > .95) { rr += 20; gg += 15; bb += 25; }
      fp(px, py, rr, gg, bb); continue;
    }
    if (id === 64 || id === 65) {
      rr = R0 + n1 * 25 + n2 * 10; gg = G0 + n1 * 18 + n2 * 8; bb = B0 + n1 * 12 + n2 * 5;
      if (ab(SN(px * .4 + id, py * .5) - .5) < .05) { rr -= 20; gg -= 15; bb -= 10; }
      if (id === 65 && ph > .88) { rr += 8; gg += 8; bb += 10; }
      fp(px, py, rr, gg, bb); continue;
    }
    if (id >= 182 && id <= 195) {
      var org = sin(px * .8 + sin(py * .6) * 2) * .5 + .5;
      rr = R0 + n1 * 25 + org * 20 - 10; gg = G0 + n1 * 25 + org * 15 - 8; bb = B0 + n1 * 25 + org * 15 - 8;
      if (b.f) { if (sq((px - 7.5) * (px - 7.5) + (py - 7.5) * (py - 7.5)) > 6) continue; fp(px, py, rr, gg, bb, .8); continue; }
      fp(px, py, rr, gg, bb); continue;
    }
    if (id === 96) { rr = R0 + n1 * 20; gg = G0 + n1 * 18; bb = B0 + n1 * 10; if (ph > .75 && ((px + py) % 3 === 0)) { rr -= 25; gg -= 20; bb -= 10; } fp(px, py, rr, gg, bb); continue; }
    if (id === 109 || id === 110) {
      rr = R0 + n1 * 8 + n2 * 4; gg = G0 + n1 * 7 + n2 * 3; bb = B0 + n1 * 6 + n2 * 3;
      if (ab(SN(px * .3 + id, py * .6) - .5) < .03) { rr -= 12; gg -= 10; bb -= 8; }
      if (id === 110 && face !== 'top' && face !== 'bottom' && (px === 0 || px === 5 || px === 10 || px === 15)) { rr -= 10; gg -= 8; bb -= 6; }
      fp(px, py, rr, gg, bb); continue;
    }
    if (id === 111 || id === 112) {
      rr = R0 + n1 * 20; gg = G0 + n1 * 15; bb = B0 + n1 * 12;
      if (ph > .8) { rr = mn(255, rr + 20); gg = mn(255, gg + 15); bb = mn(255, bb + 10); }
      if (face !== 'bottom') { var sp = PH(px * 2.7, py * 3.3); if (sp > .85) { rr = mn(255, rr + 30); gg = mn(255, gg + 25); bb = mn(255, bb + 20); } }
      fp(px, py, rr, gg, bb); continue;
    }
    if (id === 50 || id === 51) {
      if (face === 'top' || face === 'bottom') { rr = R0 + n1 * 15; gg = G0 + n1 * 12; bb = B0 + n1 * 8; }
      else { rr = R0 + n1 * 18; gg = G0 + n1 * 14; bb = B0 + n1 * 10;
        if (px === 0 || px === 15 || py === 0 || py === 15) { rr -= 15; gg -= 12; bb -= 10; }
        if (id === 50 && py > 5 && py < 10 && px > 5 && px < 10) { rr = 40; gg = 40; bb = 40; if (py > 6 && py < 9 && px > 6 && px < 9) { rr = 220; gg = 120; bb = 30; } }
        if (id === 51 && py > 4 && py < 11 && px > 6 && px < 10) { rr -= 15; gg -= 10; bb -= 8; if (py === 7 && px === 8) { rr = 180; gg = 160; bb = 50; } }
      }
      fp(px, py, rr, gg, bb); continue;
    }
    rr = R0 + n1 * 22 + n2 * 10; gg = G0 + n1 * 22 + n2 * 10; bb = B0 + n1 * 22 + n2 * 10;
    if (ph > .9) { rr += 12; gg += 12; bb += 12; }
    if (ph < .06) { rr -= 12; gg -= 12; bb -= 12; }
    fp(px, py, rr, gg, bb);
  }
  textureCache[k] = cv; return cv;
}
