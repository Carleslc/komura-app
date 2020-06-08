<template>
  <q-page class="row justify-center">
    <not-found />
  </q-page>
</template>

<script>
export default {
  components: {
    'not-found': require('components/NotFound.vue').default
  }
};
</script>
