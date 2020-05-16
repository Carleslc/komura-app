import { Quasar } from 'quasar';

import Vue from 'vue';
import VueI18n from 'vue-i18n';

import messages from 'src/i18n';

Vue.use(VueI18n);

const i18n = new VueI18n({
  locale: Quasar.lang.getLocale().split('-')[0],
  fallbackLocale: 'en',
  messages
});

Vue.prototype.$tg = function translateWithGender(key, gender) {
  let genderKey = 'neutral';
  if (gender === 'm') {
    genderKey = 'male';
  } else if (gender === 'f') {
    genderKey = 'female';
  }
  return i18n.t(`${key}.${genderKey}`);
};

export default ({ app }) => {
  app.i18n = i18n;
};

export { i18n };
