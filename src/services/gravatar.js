import { lowerCase, params } from '@/utils/strings';
import md5 from 'md5';

const GRAVATAR_URL = 'https://www.gravatar.com/avatar/';
const DEFAULT = 'wavatar';

function hash(s) {
  return s ? md5(lowerCase(s)) : '';
}

export function gravatar(s, d = DEFAULT, options) {
  return `${GRAVATAR_URL}${hash(s)}?${params({ ...options, d })}`;
}

export function defaultAvatar(s, d, options) {
  return gravatar(s, d, { ...options, f: 'y' });
}
