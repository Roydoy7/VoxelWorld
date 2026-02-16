import * as THREE from 'three';
import { scene } from '../rendering/scene-setup';

function makeCrackTexture(stage: number): THREE.MeshBasicMaterial {
  var cv = document.createElement('canvas'); cv.width = cv.height = 16; var ctx = cv.getContext('2d')!;
  ctx.strokeStyle = 'rgba(0,0,0,' + (0.15 + stage * 0.2) + ')'; ctx.lineWidth = 1;
  var segs = [[4, 2, 8, 6], [10, 1, 6, 8], [2, 10, 12, 5], [8, 8, 14, 14], [1, 6, 5, 12], [10, 10, 7, 15], [3, 1, 9, 10], [12, 3, 5, 14], [7, 5, 13, 2]];
  for (var i = 0; i <= stage * 2 + 1 && i < segs.length; i++) {
    var s = segs[i]; ctx.beginPath(); ctx.moveTo(s[0], s[1]); ctx.lineTo(s[2], s[3]); ctx.stroke();
  }
  var tex = new THREE.CanvasTexture(cv); tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.NearestFilter;
  return new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1 });
}

export const crackMats: THREE.MeshBasicMaterial[] = [];
for (var ci = 0; ci < 5; ci++) crackMats.push(makeCrackTexture(ci));

export const crackBox = new THREE.Mesh(new THREE.BoxGeometry(1.002, 1.002, 1.002), crackMats[0]);
crackBox.visible = false; scene.add(crackBox);
