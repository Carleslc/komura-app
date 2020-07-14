<template>
  <q-page>
    {{ path }}
  </q-page>
</template>

<!-- TODO: <group-form :mutation="updateGroup" mutation-key="update_groups" :lazy-rules="false" :fit="fit" /> -->

<script>
export default {
  meta() {
    return {
      title: this.$t('editGroup')
    };
  },
  /* components: {
    'group-form': () => import('components/GroupForm.vue')
  }, */
  props: {
    fit: {
      type: Boolean,
      required: true
    },
    path: {
      type: String,
      required: true
    }
  }
  // TODO
};
</script>
