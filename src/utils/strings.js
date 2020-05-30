export function slugify(s, separator = '-') {
  return s
    .replace(/\s+/g, separator)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export function asUsername(s) {
  return slugify(s, '.');
}

export function kebabCase(s) {
  return s
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/\s+/g, '-')
    .toLowerCase();
}

export function words(s) {
  return s.split(/\s+/);
}

export function similar(aWords, bWords) {
  return aWords.some(aWord => bWords.includes(aWord));
}

export const blacklist = ['new'];

const colors = ['primary', 'accent', 'positive', 'info', 'warning', 'negative'];

export function getRandomColor() {
  return colors[Math.floor(Math.random() * colors.length)];
}
