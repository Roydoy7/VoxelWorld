import * as THREE from 'three';
import { scene } from './scene-setup';

export const sunVis = new THREE.Mesh(
  new THREE.SphereGeometry(6, 16, 16),
  new THREE.MeshBasicMaterial({ color: 0xffee44, fog: false })
); scene.add(sunVis);

export const sunGlow = new THREE.Mesh(
  new THREE.SphereGeometry(10, 16, 16),
  new THREE.MeshBasicMaterial({ color: 0xffee44, transparent: true, opacity: 0.15, fog: false })
); scene.add(sunGlow);

export const moonVis = new THREE.Mesh(
  new THREE.SphereGeometry(4, 16, 16),
  new THREE.MeshBasicMaterial({ color: 0xddddff, fog: false })
); scene.add(moonVis);

export const moonGlow = new THREE.Mesh(
  new THREE.SphereGeometry(7, 16, 16),
  new THREE.MeshBasicMaterial({ color: 0x8888cc, transparent: true, opacity: 0.12, fog: false })
); scene.add(moonGlow);
