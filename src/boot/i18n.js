import Vue from 'vue';
import VueI18n from 'vue-i18n';

import { messages, locale } from 'src/i18n';

Vue.use(VueI18n);

const i18n = new VueI18n({
  locale,
  fallbackLocale: 'en',
  messages
});

Vue.prototype.$tg = function translateWithGender(key, gender, ...values) {
  let genderKey = 'neutral';
  if (gender === 'm') {
    genderKey = 'male';
  } else if (gender === 'f') {
    genderKey = 'female';
  }
  const keyWithGender = `${key}.${genderKey}`;
  return i18n.t(i18n.te(keyWithGender) ? keyWithGender : key, values);
};

Vue.prototype.$tl = function translateLower(key, ...values) {
  return i18n.t(key, values).toLocaleLowerCase(i18n.locale);
};

export default ({ app }) => {
  app.i18n = i18n;
};

export { i18n };
