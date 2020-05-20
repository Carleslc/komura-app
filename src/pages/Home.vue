<template>
  <q-page class="row justify-center items-center">
    <p class="col-auto text text-xl">{{ $t('home') }}</p>

    <q-page-sticky position="bottom-right" :offset="[24, 24]" class="on-hidden-drawer">
      <q-btn fab icon="r_group_add" color="primary" :to="{ name: 'newGroup' }" />
    </q-page-sticky>
  </q-page>
</template>

<script>
export default {
  meta() {
    return {
      title: this.$t('home')
    };
  }
};
</script>
