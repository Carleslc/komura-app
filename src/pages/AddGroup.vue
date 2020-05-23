<template>
  <q-page>
    <q-form class="column" @submit="createGroup">
      <div class="row full-width">
        <div class="column split q-mb-lg">
          <k-input
            ref="name"
            v-model="name"
            label="name"
            input-class="text-medium-filled"
            class="q-mb-lg"
            required
            :placeholder="$t('namePlaceholder')"
            :lazy-rules="isNew"
            :limit="60"
            :rules="[
              name => !!name || $t('required.groupName'),
              name => name.length >= 3 || $t('required.minLength', { n: 3 })
            ]"
          />
          <k-input
            v-model="description"
            label="description"
            type="textarea"
            :placeholder="$t('descriptionPlaceholder')"
            :rows="fitHeight ? 2 : 4"
            :limit="20000"
          />
        </div>
      </div>
      <div class="row">
        <q-btn
          outline
          type="submit"
          :label="$t('createGroup')"
          :disabled="!name || name.length < 3"
          class="primary q-px-lg"
        />
      </div>
    </q-form>
  </q-page>
</template>

<script>
import { slugify } from '@/utils/strings';
import { fitHeight } from '@/utils/responsive';
import { currentUser } from '@/mixins/currentUser';
import { saveDataMixin } from '@/mixins/saveDataMixin';

const saveData = saveDataMixin('add-group', 'name', 'description');

export default {
  meta() {
    return {
      title: this.$t('newGroup')
    };
  },
  components: {
    'k-input': require('components/KInput.vue').default
  },
  mixins: [currentUser, saveData.mixin],
  data() {
    return {
      name: '',
      description: '',
      ...saveData.load(),
      isNew: saveData.isNew()
    };
  },
  computed: {
    fitHeight: fitHeight.bind(this)
  },
  mounted() {
    if (!this.isNew) {
      this.validate();
    }
  },
  methods: {
    createGroup() {
      this.$apollo
        .mutate({
          mutation: require('@/graphql/createRootGroup.gql'),
          variables: {
            owner: this.currentUser.id,
            name: this.name,
            slug: slugify(this.name),
            description: this.description || null
          }
        })
        .then(({ data }) => {
          // console.log(data.insert_groups.returning[0]);
        })
        .catch(console.error);
    },
    validate() {
      this.$refs.name.validate();
    }
  }
};
</script>

<style lang="scss">
.split {
  width: 100%;

  @media (min-width: $breakpoint-md-min) {
    width: 50%;
  }
}
.drawer-hidden .split {
  @media (min-width: $breakpoint-sm-min) {
    width: 50%;
  }
}
</style>
