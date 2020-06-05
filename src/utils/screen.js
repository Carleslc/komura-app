import { Screen } from 'quasar';

export function fitHeight() {
  return Screen.height <= 512;
}

export function xxs() {
  return Screen.width >= 350;
}
