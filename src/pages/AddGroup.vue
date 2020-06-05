<template>
  <q-page>
    <q-form class="column" @submit="createGroup">
      <div class="row full-width">
        <div class="column q-mb-lg" :class="{ 'full-width': !split, 'split q-pr-md': split }">
          <k-input
            ref="name"
            v-model="name"
            label="name"
            input-class="text-medium-filled"
            class="q-mb-lg"
            required
            :placeholder="$t('namePlaceholder')"
            :lazy-rules="isDefaultData"
            :limit="50"
            :rules="[
              name => !!name || $t('required.groupName'),
              name => name.length >= 3 || $t('required.minLength', { n: 3 }),
              name => !alreadyExists || $t('groupAlreadyExists', { name }),
              name => !isRestricted || $t('groupRestrictedName', { name })
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
          <submit-btn
            v-if="split"
            label="createGroup"
            :disabled="uncompleted"
            class="q-mt-lg self-start"
          />
        </div>
        <topics-select
          v-model="selectedTopics"
          :search="name"
          class="column q-mb-lg"
          :class="{ 'full-width': !split, 'split q-pl-md': split }"
        />
      </div>
      <div v-if="!split" class="row full-width justify-center">
        <submit-btn label="createGroup" :disabled="uncompleted" />
      </div>
    </q-form>
  </q-page>
</template>

<script>
import { slugify, blacklist } from '@/utils/strings';
import { parseError, notifyError } from '@/utils/errors';
import { fitHeight } from '@/utils/screen';
import { currentUser } from '@/mixins/currentUser';
import { saveData } from '@/mixins/saveData';

export default {
  meta() {
    return {
      title: this.$t('newGroup')
    };
  },
  components: {
    'k-input': require('components/KInput.vue').default,
    'topics-select': require('components/TopicsSelect.vue').default,
    'submit-btn': require('components/SubmitButton.vue').default
  },
  mixins: [
    currentUser,
    saveData('add-group', {
      name: '',
      description: '',
      selectedTopics: []
    })
  ],
  props: {
    fit: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      alreadyExistsPath: null
    };
  },
  computed: {
    fitHeight,
    slug() {
      return slugify(this.name);
    },
    alreadyExists() {
      return this.alreadyExistsPath && this.slug === this.alreadyExistsPath;
    },
    isRestricted() {
      return blacklist.includes(this.slug);
    },
    uncompleted() {
      return (
        !this.name ||
        this.name.length < 3 ||
        this.alreadyExists ||
        this.isRestricted ||
        this.$apollo.loading
      );
    },
    split() {
      return this.fit ? this.$q.screen.gt.md : this.$q.screen.gt.sm;
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
            slug: this.slug,
            description: this.description || null,
            topics: this.selectedTopics.map(name => ({ name }))
          },
          update: (proxy, { data }) => {
            const group = data.insert_groups.returning[0];
            proxy.writeQuery({
              query: require('@/graphql/client/getGroup.gql'),
              variables: {
                path: group.path
              },
              data: {
                group
              }
            });
            this.reset();
            this.$router.push({
              name: 'group',
              params: { path: group.path }
            });
          }
        })
        .catch(
          parseError(
            (message, code) => {
              if (code === 'constraint-violation' && message.includes('groups_path_key')) {
                this.alreadyExistsPath = this.slug;
                this.validate();
                this.$info('Attempted to create an existing group', message);
              } else {
                notifyError();
              }
            },
            {
              name: this.name,
              path: this.slug,
              topics: this.selectedTopics
            }
          )
        );
    },
    validate() {
      this.$refs.name.validate();
    },
    reset() {
      this.resetData();
      this.$refs.name.resetValidation();
    }
  }
};
</script>

<style lang="scss">
.split {
  width: 50%;
}
</style>
