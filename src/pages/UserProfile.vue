<template>
  <q-page class="row justify-center items-center">
    <p class="col-auto text text-xl">{{ currentUser.name }}</p>
  </q-page>
</template>

<script>
import { CurrentUser } from '@/mixins/CurrentUser';

export default {
  mixins: [CurrentUser],
  meta() {
    return {
      title: this.currentUser.name
    };
  }
};
</script>
