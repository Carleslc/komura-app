<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

<script>
import { icons } from 'src/assets/icons.js';

export default {
  created() {
    this.loadIcons();
  },
  methods: {
    loadIcons() {
      // eslint-disable-next-line consistent-return
      this.$q.iconMapFn = iconName => {
        if (iconName.startsWith('k:') === true) {
          const name = iconName.substring(2);
          return { icon: icons[name] };
        }
        // when we don't return anything from our iconMapFn,
        // the default Quasar icon mapping takes over
      };
    },
  },
};
</script>
