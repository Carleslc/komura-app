import { LocalStorage } from 'quasar';
import isEmpty from 'lodash.isempty';

export function saveData(key, defaultData) {
  function save() {
    const currentData = Object.keys(defaultData)
      .filter(d => !isEmpty(this[d]))
      .reduce((obj, d) => {
        obj[d] = this[d];
        return obj;
      }, {});

    if (!isEmpty(currentData)) {
      LocalStorage.set(key, currentData);
    } else {
      LocalStorage.remove(key);
    }
  }

  return {
    // mixin is called before component, so component data will overwrite mixin's data
    data() {
      const saved = LocalStorage.getItem(key);
      return {
        ...defaultData,
        ...saved,
        isDefaultData: !LocalStorage.has(key)
      };
    },
    // save data on page close
    created() {
      this.save = save.bind(this);
      window.addEventListener('beforeunload', this.save);
    },
    // save data on route change
    beforeDestroy() {
      this.save();
      window.removeEventListener('beforeunload', this.save);
    },
    // enforce data validation if data is not default
    mounted() {
      if (!this.isDefaultData && this.validate) {
        this.validate(); // Overwrite in component if needed
      }
    },
    methods: {
      resetData() {
        Object.keys(defaultData).forEach(d => {
          this[d] = defaultData[d];
        });
        this.isDefaultData = true;
      }
    }
  };
}
