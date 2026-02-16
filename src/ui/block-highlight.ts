import * as THREE from 'three';
import { scene } from '../rendering/scene-setup';

export const hlBox = new THREE.LineSegments(
  new THREE.EdgesGeometry(new THREE.BoxGeometry(1.005, 1.005, 1.005)),
  new THREE.LineBasicMaterial({ color: 0x111111, linewidth: 2, transparent: true, opacity: .6 })
); scene.add(hlBox); hlBox.visible = false;
