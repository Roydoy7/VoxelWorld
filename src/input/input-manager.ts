import { renderer } from '../rendering/scene-setup';

const { PI } = Math;

export const keys: Record<string, boolean> = {};
export let mouseButton = 0;
export let locked = false;

export function setMouseButton(v: number): void { mouseButton = v; }

export type InputCallbacks = {
  onDigitKey: (sel: number) => void;
  onScroll: (dir: number) => void;
  onToggleInventory: () => void;
  onCloseUI: () => void;
  onToggleFly: () => void;
  onToggleDebug: () => void;
  onToggleView: () => void;
  onDropItem: () => void;
  getPlayerState: () => { ry: number; rx: number; dead: boolean };
  setPlayerLook: (ry: number, rx: number) => void;
  isInvOrCraftOpen: () => boolean;
};

let cb: InputCallbacks | null = null;

export function initInput(callbacks: InputCallbacks): void {
  cb = callbacks;

  document.addEventListener('keydown', function (e) {
    keys[e.code] = true;
    if (e.code.startsWith('Digit') && e.code !== 'Digit0') { cb!.onDigitKey(+e.code[5] - 1); }
    if (e.code === 'KeyE' && (locked || cb!.isInvOrCraftOpen())) { e.preventDefault(); cb!.onToggleInventory(); }
    if (e.code === 'Escape' && cb!.isInvOrCraftOpen()) { e.preventDefault(); cb!.onCloseUI(); }
    if (e.code === 'KeyF' && locked) { cb!.onToggleFly(); }
    if (e.code === 'F3') { e.preventDefault(); cb!.onToggleDebug(); }
    if (e.code === 'F4') { e.preventDefault(); cb!.onToggleView(); }
    if (e.code === 'KeyQ' && locked) { cb!.onDropItem(); }
  });

  document.addEventListener('keyup', function (e) { keys[e.code] = false; });

  document.addEventListener('mousemove', function (e) {
    if (!locked) return;
    var ps = cb!.getPlayerState();
    if (ps.dead) return;
    var ry = ps.ry - e.movementX * .002;
    var rx = ps.rx - e.movementY * .002;
    rx = Math.max(-PI / 2 + .01, Math.min(PI / 2 - .01, rx));
    cb!.setPlayerLook(ry, rx);
  });

  document.addEventListener('mousedown', function (e) { if (locked) mouseButton = e.button === 0 ? 1 : e.button === 2 ? 2 : 0; });
  document.addEventListener('mouseup', function (e) { if ((e.button === 0 && mouseButton === 1) || (e.button === 2 && mouseButton === 2)) mouseButton = 0; });
  document.addEventListener('wheel', function (e) { cb!.onScroll(e.deltaY > 0 ? 1 : -1); });

  renderer.domElement.addEventListener('click', function () {
    if (!locked && !cb!.isInvOrCraftOpen() && !cb!.getPlayerState().dead) renderer.domElement.requestPointerLock();
  });

  document.addEventListener('pointerlockchange', function () { locked = !!document.pointerLockElement; });
  renderer.domElement.addEventListener('contextmenu', function (e) { e.preventDefault(); });
}
