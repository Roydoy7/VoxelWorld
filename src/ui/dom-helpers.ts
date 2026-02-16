export function $(id: string): HTMLElement | null { return document.getElementById(id); }

var aTimer: number = 0;
export function showAlert(msg: string): void {
  var el = $('alert2'); if (!el) return;
  el.textContent = msg; el.style.opacity = '1';
  clearTimeout(aTimer); aTimer = window.setTimeout(function () { el!.style.opacity = '0'; }, 2000);
}
