<template>
  <q-page>
    <q-form class="column" @submit="createGroup">
      <div class="row full-width">
        <div class="column split q-mb-lg">
          <k-input v-model="name" label="name" class="q-mb-lg" />
          <k-input
            v-model="description"
            label="description"
            type="textarea"
            :rows="fitHeight ? 2 : 4"
          />
        </div>
      </div>
      <div class="row">
        <q-btn outline type="submit" :label="$t('createGroup')" class="primary q-px-lg" />
      </div>
    </q-form>
  </q-page>
</template>

<script>
import { fitHeight } from '@/utils/responsive.js';

export default {
  meta() {
    return {
      title: this.$t('newGroup')
    };
  },
  components: {
    'k-input': require('components/KInput.vue').default
  },
  data() {
    return {
      name: '',
      description: ''
    };
  },
  computed: {
    fitHeight: fitHeight.bind(this)
  },
  methods: {
    createGroup() {
      console.log(this.name);
    }
  }
};
</script>

<style lang="scss">
.split {
  width: 100%;

  @media (min-width: $breakpoint-md-min) {
    width: 50%;
  }
}
.drawer-hidden .split {
  @media (min-width: $breakpoint-sm-min) {
    width: 50%;
  }
}
</style>
