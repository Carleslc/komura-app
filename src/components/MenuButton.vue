<template>
  <q-btn
    flat
    align="left"
    :padding="padding"
    :ripple="false"
    class="menu-button"
    :class="{ nav: nav, selected: selected }"
    :to="to"
    @click="$emit('click')"
  >
    <div class="row items-center no-wrap full-width" :class="{ 'justify-center': center }">
      <div :class="fit ? 'q-mr-md' : 'q-mr-lg'">
        <q-icon v-if="icon" :name="icon" :size="big ? '28px' : '24px'" />
        <slot v-else name="icon" />
      </div>
      <div class="overflow-hidden text-left">
        <p v-if="label" class="menu-label">{{ $t(label) }}</p>
        <slot v-else />
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
    label: {
      type: String,
      default: undefined
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
    nav: {
      type: Boolean,
      default: false
    },
    fit: {
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
      if (this.$q.screen.height <= 512) {
        return this.big ? 'md lg' : 'sm lg';
      }
      return this.big ? '42px lg' : 'lg';
    }
  }
};
</script>
