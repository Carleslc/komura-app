<template>
  <q-btn
    flat
    align="left"
    :padding="padding"
    :ripple="false"
    class="menu-button"
    :class="{ dense: dense, selected: selected }"
    :to="to"
    @click="$emit('click')"
  >
    <div class="row items-center no-wrap full-width" :class="{ 'justify-center': center }">
      <div class="q-mr-lg">
        <q-icon v-if="icon" :name="icon" :size="big ? '28px' : '24px'" />
        <slot v-else name="icon" />
      </div>
      <div class="menu-label overflow-hidden text-left">
        <slot />
      </div>
    </div>
  </q-btn>
</template>

<script>
export default {
  props: {
    icon: {
      type: String,
      default: ''
    },
    to: {
      type: Object,
      default: undefined
    },
    center: {
      type: Boolean,
      default: false
    },
    big: {
      type: Boolean,
      default: false
    },
    dense: {
      type: Boolean,
      default: false
    },
    selected: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    padding() {
      if (this.$q.screen.height <= 420) {
        return this.big ? 'md lg' : 'sm lg';
      }
      return this.big ? '42px lg' : 'lg';
    }
  }
};
</script>
