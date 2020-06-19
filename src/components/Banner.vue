<template>
  <q-img
    v-if="src"
    :src="src"
    no-default-spinner
    native-context-menu
    class="banner"
    img-class="non-draggable"
    :class="{ loading: loading }"
    @load="load"
    @error="$emit('error')"
  />
</template>

<script>
export default {
  props: {
    src: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      loading: true
    };
  },
  methods: {
    load() {
      this.loading = false;
      this.$emit('load');
    }
  }
};
</script>
