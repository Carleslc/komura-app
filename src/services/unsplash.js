import axios from 'axios';
import { report } from '@/boot/sentry';
import { lowerCase } from '@/utils/strings';

const SOURCE_URL = 'https://source.unsplash.com';
const IMAGES_URL = 'https://images.unsplash.com';

export function getRandomImageUrl(keywords, size, featured = true) {
  const type = featured ? 'featured' : 'random';
  const tags = keywords ? keywords.map(k => encodeURIComponent(lowerCase(k))).join(',') : '';
  return `${SOURCE_URL}/${type}/${size || ''}?${tags}`;
}

export function getRandomImageAsync(keywords, size) {
  return new Promise(resolve => {
    axios
      .get(getRandomImageUrl(keywords, size))
      .then(({ request: { responseURL } }) => resolve(responseURL))
      .catch(e => {
        report(e);
        resolve();
      });
  });
}

export function isUnsplash(url) {
  return url && url.startsWith(IMAGES_URL);
}
