<template>
  <q-page class="row justify-center">
    <not-found />
  </q-page>
</template>

<script>
export default {
  components: {
    'not-found': () => import('components/NotFound.vue')
  }
};
</script>
