import { LocalStorage } from 'quasar';
import isEmpty from 'lodash.isempty';

export function saveData(key, defaultData, componentRef) {
  function save() {
    const component = componentRef ? this.$refs[componentRef] : this;
    const currentData = Object.keys(defaultData)
      .filter(d => !isEmpty(component[d]))
      .reduce((obj, d) => {
        obj[d] = component[d];
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
        isDefaultData: !saved
      };
    },
    mounted() {
      // save data on page close
      this.save = save.bind(this);
      window.addEventListener('beforeunload', this.save);
    },
    // save data on route change
    beforeDestroy() {
      if (this.save) {
        this.save();
        window.removeEventListener('beforeunload', this.save);
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
