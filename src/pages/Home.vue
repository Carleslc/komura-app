<template>
  <q-page class="row justify-center items-center">
    <p v-t="'home'" class="col-auto text text-xl" />

    <q-page-sticky
      position="bottom-right"
      :offset="[24, 24]"
      :class="{ 'on-mobile-drawer': $q.platform.is.desktop }"
    >
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
