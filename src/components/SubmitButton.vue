<template>
  <q-btn
    v-bind="$attrs"
    outline
    type="submit"
    :label="$t(label)"
    class="primary"
    :class="{ 'q-px-lg': padding }"
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
    }
  },
  computed: {
    padding() {
      return xxs(this.$q.screen);
    }
  }
};
</script>
