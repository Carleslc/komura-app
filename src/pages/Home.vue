<template>
  <div class="container fixed-center text-center">
    <p v-if="user.name" class="text text-xl">{{ `${$t('welcome')}, ${user.name}` }}</p>
  </div>
</template>

<script>
export default {
  meta() {
    return {
      title: this.$t('home')
    };
  },
  data() {
    return {
      user: {}
    };
  },
  apollo: {
    user: {
      query: require('@/graphql/client/getCurrentUser.gql')
    }
  }
};
</script>
