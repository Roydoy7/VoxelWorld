import * as THREE from 'three';
import { B } from '../data/blocks';
import { generateTexture } from './textures';

const matCache: Record<string, THREE.MeshLambertMaterial> = {};

export function getMaterial(id: number, face: string): THREE.MeshLambertMaterial | null {
  var k = id + '_' + face; if (matCache[k]) return matCache[k];
  var b = B[id]; if (!b) return null;
  var cv = generateTexture(id, face); if (!cv) return null;
  var tex = new THREE.CanvasTexture(cv); tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.NearestFilter;
  var opt: any = { map: tex, side: THREE.FrontSide };
  if (b.t && !b.gl) opt.alphaTest = 0.5;
  if (b.gl) { opt.transparent = true; opt.opacity = 0.4; opt.side = THREE.DoubleSide; }
  if (b.e) { opt.emissive = new THREE.Color(b.c.t); opt.emissiveIntensity = 0.3; }
  var m = new THREE.MeshLambertMaterial(opt);
  matCache[k] = m; return m;
}
