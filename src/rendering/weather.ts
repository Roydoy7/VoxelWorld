import { sunLight, ambientLight } from './scene-setup';
import { $, showAlert } from '../ui/dom-helpers';

const { random: rn } = Math;

export const weather = { rain: false, timer: 120 + rn() * 300 };

export function setWeather(rain: boolean, timer: number): void {
  weather.rain = rain;
  weather.timer = timer;
  var el = $('weather');
  if (el) {
    el.style.opacity = rain ? '.2' : '0';
    if (rain) el.style.background = 'repeating-linear-gradient(transparent,transparent 4px,rgba(150,180,255,.07) 4px,rgba(150,180,255,.07) 8px)';
  }
}

export function updateWeather(dt: number): void {
  weather.timer -= dt;
  if (weather.timer <= 0) {
    weather.rain = !weather.rain; weather.timer = weather.rain ? 60 + rn() * 120 : 120 + rn() * 300;
    $('weather')!.style.opacity = weather.rain ? '.2' : '0';
    if (weather.rain) { $('weather')!.style.background = 'repeating-linear-gradient(transparent,transparent 4px,rgba(150,180,255,.07) 4px,rgba(150,180,255,.07) 8px)'; showAlert('开始下雨了'); }
    else showAlert('雨停了');
  }
  if (weather.rain) { sunLight.intensity *= .5; ambientLight.intensity *= .8; }
}
