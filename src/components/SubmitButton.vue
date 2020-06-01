<template>
  <q-btn
    v-bind="$attrs"
    outline
    type="submit"
    :label="$t(label)"
    class="primary"
    :class="{ 'q-px-lg': $q.screen.width >= 350 }"
    @click="$emit('click')"
  />
</template>

<script>
export default {
  props: {
    label: {
      type: String,
      required: true
    }
  }
};
</script>
