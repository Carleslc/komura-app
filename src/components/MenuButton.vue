<template>
  <q-btn flat align="left" :padding="padding" color="primary" class="menu-button" :to="to" @click="$emit('click')">
    <div class="row items-center no-wrap full-width" :class="{ 'justify-center': center }">
      <div class="q-mr-lg">
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
    center: {
      type: Boolean,
      default: false
    },
    dense: {
      type: Boolean,
      default: false
    },
    padding: {
      type: String,
      default: 'lg'
    }
  }
};
</script>
