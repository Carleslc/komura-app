<template>
  <q-page class="flex flex-center">
    <h1>Kindly Network</h1>
  </q-page>
</template>

<script>
export default {
  meta: {
    title: 'Komura',
    titleTemplate: ''
  },
  props: {
    redirectOnLoggedIn: {
      type: Boolean,
      default: true
    }
  },
  mounted() {
    if (this.redirectOnLoggedIn) {
      this.$auth.redirectOnLoggedIn = { name: 'home' };
    }
  }
};
</script>
