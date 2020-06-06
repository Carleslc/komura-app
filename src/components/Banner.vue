<template>
  <q-img
    v-if="src"
    :src="src"
    native-context-menu
    class="banner"
    img-class="non-draggable"
    @load="$emit('load')"
    @error="$emit('error')"
  />
</template>

<script>
export default {
  props: {
    src: {
      type: String,
      required: true
    }
  }
};
</script>
