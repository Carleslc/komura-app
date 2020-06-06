<template>
  <q-btn
    v-bind="$attrs"
    outline
    type="submit"
    :label="$t(label)"
    :loading="loading"
    class="primary"
    :class="{ 'q-px-lg': xxs }"
    @click="$emit('click')"
  />
</template>

<script>
import { xxs } from '@/utils/screen';

export default {
  props: {
    label: {
      type: String,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    xxs
  }
};
</script>
