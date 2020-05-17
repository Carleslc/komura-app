<template>
  <q-btn flat align="left" color="primary" class="menu-button q-pa-lg q-pr-sm" :to="to" @click="$emit('click')">
    <div class="row items-center no-wrap full-width" :class="{ 'justify-center': center }">
      <div :class="{ 'q-mr-md': fit, 'q-mr-lg': !fit }">
        <q-icon v-if="icon" :name="icon" />
        <slot v-else name="icon" />
      </div>
      <div class="overflow-hidden text-left">
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
    fit: {
      type: Boolean,
      default: false
    },
    center: {
      type: Boolean,
      default: false
    }
  }
};
</script>
