<template>
  <div class="container fixed-center text-center">
    <p class="text text-xl">{{ `${$t('welcome')}, ${displayName}` }}</p>
  </div>
</template>

<script>
export default {
  computed: {
    displayName() {
      return this.$auth.firebaseUser.displayName;
    }
  },
  meta() {
    return {
      title: this.$t('home')
    };
  }
};
</script>
