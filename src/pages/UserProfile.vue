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
  }
};
</script>
