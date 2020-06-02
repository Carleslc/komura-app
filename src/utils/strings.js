const NON_LATIN_OR_SPACE = /[^a-zA-Z \u00c0-\u00d6\u00d8-\u00f6\u00f8-\u02af\u1d00-\u1d25\u1d62-\u1d65\u1d6b-\u1d77\u1d79-\u1d9a\u1e00-\u1eff\u2090-\u2094\u2184-\u2184\u2488-\u2490\u271d-\u271d\u2c60-\u2c7c\u2c7e-\u2c7f\ua722-\ua76f\ua771-\ua787\ua78b-\ua78c\ua7fb-\ua7ff\ufb00-\ufb06]/gi;

import { Quasar } from 'quasar';

export function trimSpaces(s, separator = ' ') {
  return s.replace(/\s+/g, separator).trim();
}

export function removeSpecial(s) {
  return trimSpaces(s.replace(NON_LATIN_OR_SPACE, ''));
}

export function normalize(s, separator = ' ') {
  return trimSpaces(s, separator)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function alpha(s) {
  return normalize(s)
    .replace(/[^a-zA-Z ]/g, '')
    .trim();
}

export function lowerCase(s) {
  return s.toLowerCase(Quasar.lang.getLocale());
}

export function alphaLower(s) {
  return lowerCase(alpha(s));
}

export function slugify(s, separator = '-') {
  return normalize(s, separator).toLowerCase();
}

export function asUsername(s) {
  return slugify(s, '.');
}

export function kebabCase(s) {
  return trimSpaces(s)
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase();
}

export function words(s) {
  return s.split(/\s+/);
}

export function similar(a, b) {
  return b.indexOf(a) > -1;
}

export function similarWords(aWords, bWords) {
  return aWords.some(aWord => bWords.some(bWord => bWord.indexOf(aWord) > -1));
}

export const blacklist = ['new'];

const colors = ['primary', 'accent', 'secondary', 'positive', 'info', 'warning', 'negative'];

export function getRandomColor() {
  return colors[Math.floor(Math.random() * colors.length)];
}
