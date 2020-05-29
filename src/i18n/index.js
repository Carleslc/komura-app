import { Quasar } from 'quasar';

import en from './en';
import es from './es';

export const messages = {
  en,
  es,
};

export const locale = Quasar.lang.getLocale().split('-')[0];
