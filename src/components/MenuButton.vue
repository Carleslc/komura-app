<template>
  <q-btn
    flat
    align="left"
    :padding="padding || defaultPadding"
    :ripple="false"
    class="menu-button"
    :class="{ selected: selected }"
    :to="to"
    @click="$emit('click')"
  >
    <div class="row items-center no-wrap full-width">
      <q-icon v-if="icon" :name="icon" class="menu-icon" />
      <slot v-else name="icon" />
      <div class="overflow-hidden text-left">
        <p v-if="label" v-t="label" class="menu-label" />
        <slot v-else />
      </div>
    </div>
  </q-btn>
</template>

<script>
import screen from '@/mixins/screen';

export default {
  mixins: [screen],
  props: {
    icon: {
      type: String,
      default: undefined
    },
    label: {
      type: String,
      default: undefined
    },
    to: {
      type: Object,
      default: undefined
    },
    big: {
      type: Boolean,
      default: false
    },
    selected: {
      type: Boolean,
      default: false
    },
    padding: {
      type: String,
      default: undefined
    }
  },
  computed: {
    defaultPadding() {
      if (this.fitHeight) {
        return this.big ? 'md lg' : 'sm lg';
      }
      return this.big ? '42px lg' : 'lg';
    }
  }
};
</script>
