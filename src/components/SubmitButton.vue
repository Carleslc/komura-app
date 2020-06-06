<template>
  <q-btn
    v-bind="$attrs"
    outline
    type="submit"
    :label="$t(label)"
    :loading="loading"
    class="primary"
    :class="{ 'q-px-lg': !xxs }"
    @click="$emit('click')"
  />
</template>

<script>
import screen from '@/mixins/screen';

export default {
  mixins: [screen],
  props: {
    label: {
      type: String,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    }
  }
};
</script>
