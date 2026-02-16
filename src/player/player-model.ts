import * as THREE from 'three';
import { scene } from '../rendering/scene-setup';

const { PI } = Math;

var skinC = 0xe0b090, shirtC = 0x40a0d0, pantsC = 0x2a2a6a, shoeC = 0x444444, hairC = 0x3a2010;
var skinM = new THREE.MeshLambertMaterial({ color: skinC });
var shirtM = new THREE.MeshLambertMaterial({ color: shirtC });
var pantsM = new THREE.MeshLambertMaterial({ color: pantsC });
var shoeM = new THREE.MeshLambertMaterial({ color: shoeC });
var hairM = new THREE.MeshLambertMaterial({ color: hairC });
var eyeM = new THREE.MeshBasicMaterial({ color: 0x222244 });
var whiteM = new THREE.MeshBasicMaterial({ color: 0xffffff });

export const pModel = new THREE.Group();

// Head
export const pHead = new THREE.Mesh(new THREE.BoxGeometry(.5, .5, .5), skinM); pHead.position.y = 1.5; pHead.name = 'head'; pModel.add(pHead);
export const pHair = new THREE.Mesh(new THREE.BoxGeometry(.52, .26, .52), hairM); pHair.position.set(0, 1.62, 0); pModel.add(pHair);
export const pEyeL = new THREE.Mesh(new THREE.BoxGeometry(.08, .06, .02), whiteM); pEyeL.position.set(-.1, 1.5, .26); pModel.add(pEyeL);
export const pEyeR = new THREE.Mesh(new THREE.BoxGeometry(.08, .06, .02), whiteM); pEyeR.position.set(.1, 1.5, .26); pModel.add(pEyeR);
var pPupL = new THREE.Mesh(new THREE.BoxGeometry(.04, .04, .02), eyeM); pPupL.position.set(-.1, 1.5, .27); pModel.add(pPupL);
var pPupR = new THREE.Mesh(new THREE.BoxGeometry(.04, .04, .02), eyeM); pPupR.position.set(.1, 1.5, .27); pModel.add(pPupR);
// Body
export const pBody = new THREE.Mesh(new THREE.BoxGeometry(.5, .75, .3), shirtM); pBody.position.y = .87; pBody.name = 'body'; pModel.add(pBody);
// Arms
export const pArmL = new THREE.Mesh(new THREE.BoxGeometry(.25, .7, .25), shirtM.clone()); pArmL.position.set(-.375, .87, 0); pArmL.name = 'armL'; pModel.add(pArmL);
export const pArmR = new THREE.Mesh(new THREE.BoxGeometry(.25, .7, .25), shirtM.clone()); pArmR.position.set(.375, .87, 0); pArmR.name = 'armR'; pModel.add(pArmR);
// Hands
export const pHandL = new THREE.Mesh(new THREE.BoxGeometry(.24, .2, .24), skinM.clone()); pHandL.position.set(-.375, .54, 0); pModel.add(pHandL);
export const pHandR = new THREE.Mesh(new THREE.BoxGeometry(.24, .2, .24), skinM.clone()); pHandR.position.set(.375, .54, 0); pModel.add(pHandR);
// Legs
export const pLegL = new THREE.Mesh(new THREE.BoxGeometry(.25, .75, .25), pantsM); pLegL.position.set(-.13, .375, 0); pLegL.name = 'legL'; pModel.add(pLegL);
export const pLegR = new THREE.Mesh(new THREE.BoxGeometry(.25, .75, .25), pantsM.clone()); pLegR.position.set(.13, .375, 0); pLegR.name = 'legR'; pModel.add(pLegR);
// Shoes
var pShoeL = new THREE.Mesh(new THREE.BoxGeometry(.26, .12, .3), shoeM); pShoeL.position.set(-.13, .06, .02); pModel.add(pShoeL);
var pShoeR = new THREE.Mesh(new THREE.BoxGeometry(.26, .12, .3), shoeM.clone()); pShoeR.position.set(.13, .06, .02); pModel.add(pShoeR);
pModel.traverse(function (c: any) { if (c.isMesh) c.castShadow = true; });
pModel.visible = false; scene.add(pModel);

// First-person hand (Minecraft-style: blocky arm with sleeve, forearm, hand)
export const fpHand = new THREE.Group();
var fpSleeve2 = new THREE.Mesh(new THREE.BoxGeometry(.28, .28, .28), new THREE.MeshLambertMaterial({ color: shirtC }));
fpSleeve2.position.set(0, .18, 0); fpHand.add(fpSleeve2);
var fpArm2 = new THREE.Mesh(new THREE.BoxGeometry(.25, .4, .25), new THREE.MeshLambertMaterial({ color: skinC }));
fpArm2.position.set(0, -.12, 0); fpHand.add(fpArm2);
var fpFist = new THREE.Mesh(new THREE.BoxGeometry(.22, .16, .28), new THREE.MeshLambertMaterial({ color: skinC }));
fpFist.position.set(0, -.38, .04); fpHand.add(fpFist);
fpHand.visible = true; scene.add(fpHand);

export let fpSwingAng = 0;
export function setFpSwingAng(v: number): void { fpSwingAng = v; }
