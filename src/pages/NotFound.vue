<template>
  <q-page class="row justify-center">
    <not-found :message="message" :emoji="emoji" />
  </q-page>
</template>

<script>
export default {
  components: {
    'not-found': () => import('components/NotFound.vue')
  },
  props: {
    message: {
      type: String,
      default: '404'
    },
    emoji: {
      type: String,
      default: 'sweat'
    }
  }
};
</script>
