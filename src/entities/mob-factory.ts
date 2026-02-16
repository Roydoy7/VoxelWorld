import * as THREE from 'three';
import { MOB_TYPES } from '../data/mob-types';

const { PI } = Math;

function mp(geo: THREE.BoxGeometry, mat: THREE.Material, x: number, y: number, z: number): THREE.Mesh {
  var m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); return m;
}

export function makeMobMesh(type: string): THREE.Group {
  var t = MOB_TYPES[type], g = new THREE.Group();
  var bm = new THREE.MeshLambertMaterial({ color: t.col });
  var dm2 = new THREE.MeshLambertMaterial({ color: t.col2 });
  var em = new THREE.MeshBasicMaterial({ color: 0x111111 });

  if (type === 'zombie') {
    var body = new THREE.Mesh(new THREE.BoxGeometry(.5, 0.75, .3), new THREE.MeshLambertMaterial({ color: 0x2040a0 })); body.position.set(0, .87, 0); body.name = 'body'; g.add(body);
    var head = new THREE.Mesh(new THREE.BoxGeometry(.5, .5, .5), bm); head.position.set(0, 1.5, 0); head.name = 'head'; g.add(head);
    g.add(mp(new THREE.BoxGeometry(.12, .06, .02), em, -.12, 1.55, .26));
    g.add(mp(new THREE.BoxGeometry(.12, .06, .02), em, .12, 1.55, .26));
    var ll = new THREE.Mesh(new THREE.BoxGeometry(.25, .75, .25), new THREE.MeshLambertMaterial({ color: 0x1a3a80 })); ll.position.set(-.13, .37, 0); ll.name = 'legL'; g.add(ll);
    var lr = new THREE.Mesh(new THREE.BoxGeometry(.25, .75, .25), new THREE.MeshLambertMaterial({ color: 0x1a3a80 })); lr.position.set(.13, .37, 0); lr.name = 'legR'; g.add(lr);
    var al = new THREE.Mesh(new THREE.BoxGeometry(.25, .7, .25), bm.clone()); al.position.set(-.38, .85, .3); al.name = 'armL'; al.rotation.x = -PI / 3; g.add(al);
    var ar = new THREE.Mesh(new THREE.BoxGeometry(.25, .7, .25), bm.clone()); ar.position.set(.38, .85, .3); ar.name = 'armR'; ar.rotation.x = -PI / 3; g.add(ar);
  } else if (type === 'skeleton') {
    var body = new THREE.Mesh(new THREE.BoxGeometry(.35, 0.7, .2), dm2); body.position.set(0, .85, 0); body.name = 'body'; g.add(body);
    var head = new THREE.Mesh(new THREE.BoxGeometry(.45, .45, .45), bm); head.position.set(0, 1.45, 0); head.name = 'head'; g.add(head);
    g.add(mp(new THREE.BoxGeometry(.1, .05, .02), em, -.1, 1.5, .23));
    g.add(mp(new THREE.BoxGeometry(.1, .05, .02), em, .1, 1.5, .23));
    var ll = new THREE.Mesh(new THREE.BoxGeometry(.12, .75, .12), dm2); ll.position.set(-.1, .37, 0); ll.name = 'legL'; g.add(ll);
    var lr = new THREE.Mesh(new THREE.BoxGeometry(.12, .75, .12), dm2); lr.position.set(.1, .37, 0); lr.name = 'legR'; g.add(lr);
    var al = new THREE.Mesh(new THREE.BoxGeometry(.12, .65, .12), bm.clone()); al.position.set(-.3, .85, 0); al.name = 'armL'; g.add(al);
    var ar = new THREE.Mesh(new THREE.BoxGeometry(.12, .65, .12), bm.clone()); ar.position.set(.3, .85, 0); ar.name = 'armR'; g.add(ar);
    g.add(mp(new THREE.BoxGeometry(.04, .5, .04), new THREE.MeshLambertMaterial({ color: 0x6B3A1A }), -.35, .95, .15));
  } else if (type === 'creeper') {
    var body = new THREE.Mesh(new THREE.BoxGeometry(.45, .85, .3), bm); body.position.set(0, .92, 0); body.name = 'body'; g.add(body);
    var head = new THREE.Mesh(new THREE.BoxGeometry(.5, .5, .5), bm.clone()); head.position.set(0, 1.6, 0); head.name = 'head'; g.add(head);
    g.add(mp(new THREE.BoxGeometry(.1, .08, .02), em, -.1, 1.65, .26));
    g.add(mp(new THREE.BoxGeometry(.1, .08, .02), em, .1, 1.65, .26));
    g.add(mp(new THREE.BoxGeometry(.15, .2, .02), em, 0, 1.48, .26));
    var lp: [number, number, number][] = [[-.13, .2, .08], [.13, .2, .08], [-.13, .2, -.08], [.13, .2, -.08]];
    for (var li = 0; li < 4; li++) { var lg = new THREE.Mesh(new THREE.BoxGeometry(.18, .4, .18), dm2); lg.position.set(lp[li][0], lp[li][1], lp[li][2]); lg.name = 'leg' + li; g.add(lg); }
  } else if (type === 'spider') {
    var body = new THREE.Mesh(new THREE.BoxGeometry(.7, .35, .5), bm); body.position.set(0, .35, 0); body.name = 'body'; g.add(body);
    var head = new THREE.Mesh(new THREE.BoxGeometry(.4, .35, .4), bm.clone()); head.position.set(0, .4, .45); head.name = 'head'; g.add(head);
    g.add(mp(new THREE.BoxGeometry(.1, .1, .02), new THREE.MeshBasicMaterial({ color: 0xff0000 }), -.1, .45, .66));
    g.add(mp(new THREE.BoxGeometry(.1, .1, .02), new THREE.MeshBasicMaterial({ color: 0xff0000 }), .1, .45, .66));
    for (var si = 0; si < 8; si++) {
      var sl = new THREE.Mesh(new THREE.BoxGeometry(.08, .4, .08), bm.clone());
      var sx2 = (si % 2 === 0 ? -.4 : .4), sz2 = (si < 2 ? -.2 : si < 4 ? -.05 : si < 6 ? .1 : .25);
      sl.position.set(sx2, .2, sz2); sl.rotation.z = (si % 2 === 0 ? 1 : -1) * .5; sl.name = 'leg' + si; g.add(sl);
    }
  } else if (type === 'slime') {
    var body = new THREE.Mesh(new THREE.BoxGeometry(.7, .7, .7), new THREE.MeshLambertMaterial({ color: t.col, transparent: true, opacity: 0.7 })); body.position.set(0, .35, 0); body.name = 'body'; g.add(body);
    g.add(mp(new THREE.BoxGeometry(.12, .08, .02), em, -.1, .4, .36));
    g.add(mp(new THREE.BoxGeometry(.12, .08, .02), em, .1, .4, .36));
    g.add(mp(new THREE.BoxGeometry(.2, .04, .02), em, 0, .28, .36));
  } else if (type === 'pig') {
    var body = new THREE.Mesh(new THREE.BoxGeometry(.6, .5, .85), bm); body.position.set(0, .55, 0); body.name = 'body'; g.add(body);
    var head = new THREE.Mesh(new THREE.BoxGeometry(.5, .5, .5), bm.clone()); head.position.set(0, .68, .58); head.name = 'head'; g.add(head);
    g.add(mp(new THREE.BoxGeometry(.25, .18, .08), dm2, 0, .58, .87));
    g.add(mp(new THREE.BoxGeometry(.06, .05, .02), em, -.05, .58, .92));
    g.add(mp(new THREE.BoxGeometry(.06, .05, .02), em, .05, .58, .92));
    g.add(mp(new THREE.BoxGeometry(.08, .06, .02), em, -.1, .73, .84));
    g.add(mp(new THREE.BoxGeometry(.08, .06, .02), em, .1, .73, .84));
    var earL = new THREE.Mesh(new THREE.BoxGeometry(.12, .1, .04), bm.clone()); earL.position.set(-.2, .97, .58); earL.rotation.z = .35; g.add(earL);
    var earR = new THREE.Mesh(new THREE.BoxGeometry(.12, .1, .04), bm.clone()); earR.position.set(.2, .97, .58); earR.rotation.z = -.35; g.add(earR);
    var lps: [number, number, number][] = [[-.17, .15, .25], [.17, .15, .25], [-.17, .15, -.25], [.17, .15, -.25]];
    for (var li = 0; li < 4; li++) { var lg = new THREE.Mesh(new THREE.BoxGeometry(.17, .3, .17), dm2); lg.position.set(lps[li][0], lps[li][1], lps[li][2]); lg.name = 'leg' + li; g.add(lg); }
  } else if (type === 'cow') {
    var body = new THREE.Mesh(new THREE.BoxGeometry(.55, .5, .8), bm); body.position.set(0, .55, 0); body.name = 'body'; g.add(body);
    var head = new THREE.Mesh(new THREE.BoxGeometry(.4, .35, .3), bm.clone()); head.position.set(0, .7, .5); head.name = 'head'; g.add(head);
    g.add(mp(new THREE.BoxGeometry(.25, .12, .08), new THREE.MeshLambertMaterial({ color: 0xb0a090 }), 0, .62, .66));
    g.add(mp(new THREE.BoxGeometry(.06, .04, .02), em, -.12, .76, .65));
    g.add(mp(new THREE.BoxGeometry(.06, .04, .02), em, .12, .76, .65));
    for (var li = 0; li < 4; li++) { var lg = new THREE.Mesh(new THREE.BoxGeometry(.15, .3, .15), bm.clone()); lg.position.set(li % 2 === 0 ? -.17 : .17, .15, li < 2 ? .25 : -.25); lg.name = 'leg' + li; g.add(lg); }
  } else if (type === 'sheep') {
    var wool = new THREE.Mesh(new THREE.BoxGeometry(.6, .55, .8), bm); wool.position.set(0, .6, 0); wool.name = 'body'; g.add(wool);
    var head = new THREE.Mesh(new THREE.BoxGeometry(.3, .3, .3), new THREE.MeshLambertMaterial({ color: 0xc0b0a0 })); head.position.set(0, .7, .45); head.name = 'head'; g.add(head);
    g.add(mp(new THREE.BoxGeometry(.06, .04, .02), em, -.08, .76, .6));
    g.add(mp(new THREE.BoxGeometry(.06, .04, .02), em, .08, .76, .6));
    for (var li = 0; li < 4; li++) { var lg = new THREE.Mesh(new THREE.BoxGeometry(.12, .3, .12), new THREE.MeshLambertMaterial({ color: 0xc0b0a0 })); lg.position.set(li % 2 === 0 ? -.17 : .17, .15, li < 2 ? .25 : -.25); lg.name = 'leg' + li; g.add(lg); }
  } else if (type === 'chicken') {
    var body = new THREE.Mesh(new THREE.BoxGeometry(.3, .3, .4), bm); body.position.set(0, .35, 0); body.name = 'body'; g.add(body);
    var head = new THREE.Mesh(new THREE.BoxGeometry(.2, .2, .2), bm.clone()); head.position.set(0, .55, .2); head.name = 'head'; g.add(head);
    g.add(mp(new THREE.BoxGeometry(.1, .05, .08), new THREE.MeshLambertMaterial({ color: 0xf0c020 }), 0, .52, .34));
    g.add(mp(new THREE.BoxGeometry(.06, .08, .02), new THREE.MeshLambertMaterial({ color: 0xc02020 }), 0, .46, .3));
    g.add(mp(new THREE.BoxGeometry(.04, .03, .02), em, -.06, .57, .3));
    g.add(mp(new THREE.BoxGeometry(.04, .03, .02), em, .06, .57, .3));
    var ll = new THREE.Mesh(new THREE.BoxGeometry(.05, .2, .05), new THREE.MeshLambertMaterial({ color: 0xf0c020 })); ll.position.set(-.08, .1, 0); ll.name = 'legL'; g.add(ll);
    var lr = new THREE.Mesh(new THREE.BoxGeometry(.05, .2, .05), new THREE.MeshLambertMaterial({ color: 0xf0c020 })); lr.position.set(.08, .1, 0); lr.name = 'legR'; g.add(lr);
  }

  g.traverse(function (c: any) { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } });
  return g;
}
