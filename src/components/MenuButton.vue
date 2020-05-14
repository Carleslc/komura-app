<template>
  <q-btn flat color="primary" class="menu-button q-pa-lg" @click="$emit('click')">
    <div class="row items-center no-wrap">
      <q-icon v-if="icon" :name="icon" class="q-mr-lg" />
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
    }
  }
};
</script>
