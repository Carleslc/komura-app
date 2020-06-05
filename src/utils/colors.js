import ColorThief from 'colorthief';
import { colors } from 'quasar';

const colorTags = ['primary', 'accent', 'secondary', 'positive', 'info', 'warning', 'negative'];

export function getRandomColor() {
  return colorTags[Math.floor(Math.random() * colorTags.length)];
}

export function getPaletteColor(tag) {
  return colors.getPaletteColor(tag);
}

function arrayToRgb(color) {
  return `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
}

export function getMainColorAsync(img, defaultColor = 'rgb(0,0,0)') {
  return new Promise(resolve => {
    function getColor() {
      resolve(arrayToRgb(new ColorThief().getColor(img)));
    }

    if (img) {
      img.crossOrigin = 'anonymous';
      if (img.complete) {
        getColor();
      } else {
        img.addEventListener('load', getColor);
      }
    } else {
      resolve(defaultColor);
    }
  });
}
