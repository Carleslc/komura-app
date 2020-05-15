<template>
  <q-btn flat align="left" color="primary" class="menu-button q-pa-lg" :to="to" @click="$emit('click')">
    <div class="row items-center no-wrap">
      <div class="q-mr-lg">
        <q-icon v-if="icon" :name="icon" />
        <slot v-else name="icon" />
      </div>
      <div style="text-align: start">
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
    }
  }
};
</script>
