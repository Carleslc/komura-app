import { LocalStorage } from 'quasar';
import { isEmpty } from 'lodash';

export function saveDataMixin(key, ...data) {
  function save() {
    const currentData = Object.keys(this.$data)
      .filter(d => data.includes(d) && !isEmpty(this.$data[d]))
      .reduce((obj, d) => {
        obj[d] = this.$data[d];
        return obj;
      }, {});
    if (!isEmpty(currentData)) {
      LocalStorage.set(key, currentData);
    } else {
      LocalStorage.remove(key);
    }
  }

  return {
    // mixin is called before component, so loading data must be in component's data method
    load() {
      return LocalStorage.getItem(key);
    },
    isNew() {
      return !LocalStorage.has(key);
    },
    mixin: {
      // save data on page close
      created() {
        this.save = save.bind(this);
        window.addEventListener('beforeunload', this.save);
      },
      // save data on route change
      beforeDestroy() {
        this.save();
        window.removeEventListener('beforeunload', this.save);
      }
    }
  };
}
