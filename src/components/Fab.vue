<template>
  <q-page-sticky :position="position" :offset="[24, 24]">
    <q-btn
      v-if="to"
      fab
      :icon="icon"
      :color="color"
      :label="$t(label)"
      :to="to"
      @click="$emit('click')"
    />
    <q-fab
      v-else
      :icon="icon"
      :active-icon="icon"
      :color="color"
      :label="$t(label)"
      @click="$emit('click')"
    />
  </q-page-sticky>
</template>

<script>
export default {
  props: {
    position: {
      type: String,
      default: 'bottom-right'
    },
    icon: {
      type: String,
      required: true
    },
    color: {
      type: String,
      default: 'primary'
    },
    label: {
      type: String,
      default: undefined
    },
    to: {
      type: Object,
      default: undefined
    }
  }
};
</script>
