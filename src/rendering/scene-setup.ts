import * as THREE from 'three';
import { RENDER_DISTANCE as RD, CHUNK_SIZE as CS } from '../constants';

const { min: mn } = Math;

export const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);
scene.fog = new THREE.Fog(0x87CEEB, RD * CS * 0.5, RD * CS);

export const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, RD * CS * 1.5);

export const renderer = new THREE.WebGLRenderer({ antialias: false });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(mn(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.prepend(renderer.domElement);
renderer.domElement.id = 'c';

export const ambientLight = new THREE.AmbientLight(0x606080, 0.5);
scene.add(ambientLight);

export const hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x556633, 0.4);
scene.add(hemisphereLight);

export const sunLight = new THREE.DirectionalLight(0xfff0e0, 1.0);
sunLight.castShadow = true;
sunLight.shadow.mapSize.set(2048, 2048);
sunLight.shadow.camera.left = -64;
sunLight.shadow.camera.right = 64;
sunLight.shadow.camera.top = 64;
sunLight.shadow.camera.bottom = -64;
sunLight.shadow.camera.near = 0.5;
sunLight.shadow.camera.far = 300;
sunLight.shadow.bias = -0.001;
sunLight.position.set(80, 120, 60);
scene.add(sunLight);
scene.add(sunLight.target);
