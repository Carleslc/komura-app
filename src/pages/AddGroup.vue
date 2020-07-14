<template>
  <q-page>
    <group-form
      ref="form"
      already-exists-info="Attempted to create an existing group"
      mutation-key="insert_groups"
      :mutation="createRootGroup"
      :defaults="$data"
      :lazy-rules="isDefaultData"
      :fit="fit"
      override-banner
      @reset="resetData"
    />
  </q-page>
</template>

<script>
import { createRootGroup } from '@/graphql/createRootGroup';
import { saveData } from '@/mixins/saveData';

export default {
  meta() {
    return {
      title: this.$t('newGroup')
    };
  },
  components: {
    'group-form': () => import('components/GroupForm.vue')
  },
  mixins: [
    saveData(
      'add-group',
      {
        name: '',
        description: '',
        banner: null,
        selectedTopics: []
      },
      'form'
    )
  ],
  props: {
    fit: {
      type: Boolean,
      required: true
    }
  },
  created() {
    this.createRootGroup = createRootGroup;
  }
};
</script>
