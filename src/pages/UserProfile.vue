<template>
  <q-page class="row justify-center items-center">
    <p class="col-auto text text-xl">{{ currentUser.name }}</p>
  </q-page>
</template>

<script>
import { currentUser } from '@/mixins/currentUser';

export default {
  mixins: [currentUser],
  meta() {
    return {
      title: this.currentUser.name
    };
  },
  props: {
    username: {
      type: String,
      default: undefined
    }
  },
  created() {
    if (!this.username) {
      this.$router.replace({
        params: { username: this.currentUser.username }
      });
    }
  }
};
</script>
