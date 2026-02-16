import { DAY_LENGTH as DAY_LEN } from '../constants';
import { scene, sunLight, ambientLight, hemisphereLight } from './scene-setup';
import { sunVis, sunGlow, moonVis, moonGlow } from './sky';

const { sin, cos, abs: ab, max: mx, min: mn, PI } = Math;

export let TOD = 0.35;

export function setTOD(v: number): void { TOD = v; }

export function isNight(): boolean { return TOD < 0.2 || TOD > 0.8; }

export function updateDayNight(dt: number, px: number, py: number, pz: number): void {
  TOD = (TOD + dt / DAY_LEN) % 1;
  var angle = (TOD - .25) * PI * 2;
  var sunY = sin(angle) * 120, sunX = cos(angle) * 80;
  sunLight.position.set(px + sunX, ab(sunY) + 10, pz + 60);
  sunLight.target.position.set(px, py, pz);
  var dayF = mx(0, mn(1, (sin(angle) + .2) * 1.2));
  sunLight.intensity = dayF * 1.2;
  ambientLight.intensity = .25 + dayF * .35;
  hemisphereLight.intensity = .15 + dayF * .25;
  var skyR = .04 + dayF * .49, skyG = .04 + dayF * .73, skyB = .12 + dayF * .8;
  var nightB = 1 - dayF;
  skyR += nightB * .02; skyG += nightB * .02; skyB += nightB * .08;
  (scene.background as THREE.Color).setRGB(skyR, skyG, skyB); scene.fog!.color.setRGB(skyR, skyG, skyB);
  if (ab(TOD - .25) < .06 || ab(TOD - .75) < .06) sunLight.color.setHex(0xff8844);
  else sunLight.color.setHex(0xfff0e0);
  // Sun visual
  var svx = px + cos(angle) * 160, svy = sin(angle) * 160, svz = pz + 60;
  sunVis.position.set(svx, svy, svz); sunGlow.position.set(svx, svy, svz);
  sunVis.visible = svy > -10; sunGlow.visible = svy > -10;
  // Moon
  var mvx = px - cos(angle) * 160, mvy = -sin(angle) * 160, mvz = pz + 60;
  moonVis.position.set(mvx, mvy, mvz); moonGlow.position.set(mvx, mvy, mvz);
  moonVis.visible = mvy > -10; moonGlow.visible = mvy > -10;
}
