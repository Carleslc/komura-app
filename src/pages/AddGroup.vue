<template>
  <q-page>
    <q-form class="row" @submit="createGroup">
      <q-input v-model="name" filled class="col-xs-12 col-md-6" :class="{ filled: !!name }" />
    </q-form>
  </q-page>
</template>

<script>
export default {
  meta() {
    return {
      title: this.$t('newGroup')
    };
  },
  data() {
    return {
      name: ''
    };
  },
  methods: {
    createGroup() {
      console.log(this.name);
    }
  }
};
</script>

<style>
.q-field .q-field__control {
  max-width: 400px;
}
</style>
