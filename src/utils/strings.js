import { Quasar } from 'quasar';

const NON_LATIN_OR_SPACE = /[^a-zA-Z \u00c0-\u00d6\u00d8-\u00f6\u00f8-\u02af\u1d00-\u1d25\u1d62-\u1d65\u1d6b-\u1d77\u1d79-\u1d9a\u1e00-\u1eff\u2090-\u2094\u2184-\u2184\u2488-\u2490\u271d-\u271d\u2c60-\u2c7c\u2c7e-\u2c7f\ua722-\ua76f\ua771-\ua787\ua78b-\ua78c\ua7fb-\ua7ff\ufb00-\ufb06]/g;
const NON_ALPHANUMERIC_OR_SPACE = /[^a-zA-Z0-9 ]/g;
const NON_ALPHA_OR_SPACE = /[^a-zA-Z ]/g;
const ACCENTS = /[\u0300-\u036f]/g;
const SPACES = /\s+/g;

export function trimSpaces(s, separator = ' ') {
  return s.replace(SPACES, separator).trim();
}

export function removeSpecial(s) {
  return trimSpaces(s.replace(NON_LATIN_OR_SPACE, ''));
}

export function normalize(s, separator = ' ') {
  return trimSpaces(s, separator)
    .normalize('NFD')
    .replace(ACCENTS, '');
}

export function alpha(s, numeric = false) {
  return normalize(s)
    .replace(numeric ? NON_ALPHANUMERIC_OR_SPACE : NON_ALPHA_OR_SPACE, '')
    .trim();
}

export function lowerCase(s) {
  return s ? s.toLowerCase(Quasar.lang.getLocale()) : s;
}

export function alphaLower(s, numeric = false) {
  return lowerCase(alpha(s, numeric));
}

export function slugify(s, separator = '-') {
  return trimSpaces(alphaLower(s, true), separator);
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

export function params(objectParams) {
  return Object.keys(objectParams)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(objectParams[key])}`)
    .join('&');
}

export const blacklistSlugs = ['new', 'edit'];

export function equalsIgnoreCase(a, b) {
  return lowerCase(a) === lowerCase(b);
}
