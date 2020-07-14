<template>
  <q-form class="column" @submit="submit">
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
          :lazy-rules="lazyRules"
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
          :rows="4"
          :limit="20000"
        />
        <submit-btn
          v-if="split"
          label="done"
          :disabled="uncompleted"
          :loading="$apollo.loading"
          class="q-mt-lg self-start"
        />
      </div>
      <div class="column q-mb-lg" :class="{ 'full-width': !split, 'split q-pl-md': split }">
        <topics-select
          ref="topicsSelect"
          v-model="selectedTopics"
          :search="name"
          :class="{
            'q-mb-lg': selectedTopics.length > 0,
            'q-mb-md': selectedTopics.length === 0
          }"
          @update="setDefaultBanner"
        />
        <k-field label="banner">
          <q-skeleton
            v-if="!banner"
            type="rect"
            animation="none"
            class="banner bg-light hoverable"
          />
          <banner v-else :src="banner" />
        </k-field>
      </div>
    </div>
    <div v-if="!split" class="row full-width justify-center">
      <submit-btn label="done" :disabled="uncompleted" :loading="$apollo.loading" />
    </div>
  </q-form>
</template>

<script>
import { override } from '@/utils/objects';
import { slugify, blacklistSlugs } from '@/utils/strings';
import { parseError, notifyError } from '@/utils/errors';
import { getRandomImageAsync } from '@/services/unsplash';
import { getClientGroup, toClientGroup } from '@/graphql/client/getGroup';
import currentUser from '@/mixins/currentUser';

export default {
  components: {
    'k-input': require('components/KInput.vue').default, // if async it would not be available in mounted
    'k-field': () => import('components/KField.vue'),
    'topics-select': () => import('components/TopicsSelect.vue'),
    'submit-btn': () => import('components/SubmitButton.vue'),
    banner: () => import('components/Banner.vue')
  },
  mixins: [currentUser],
  props: {
    fit: {
      type: Boolean,
      required: true
    },
    defaults: {
      type: Object,
      default: undefined
    },
    mutation: {
      type: Object,
      required: true
    },
    mutationKey: {
      type: String,
      required: true
    },
    lazyRules: {
      type: Boolean,
      default: true
    },
    overrideBanner: {
      type: Boolean,
      default: false
    },
    alreadyExistsInfo: {
      type: String,
      default: undefined
    }
  },
  data() {
    const data = override(
      {
        name: '',
        description: '',
        banner: null,
        selectedTopics: []
      },
      this.defaults
    );
    Object.assign(data, {
      alreadyExistsPath: null,
      fetchingBanner: false,
      waitingToSubmit: false
    });
    return data;
  },
  computed: {
    slug() {
      return slugify(this.name);
    },
    alreadyExists() {
      return this.alreadyExistsPath && this.slug === this.alreadyExistsPath;
    },
    isRestricted() {
      return blacklistSlugs.includes(this.slug);
    },
    uncompleted() {
      return (
        !this.name ||
        this.name.length < 3 ||
        this.alreadyExists ||
        this.isRestricted ||
        this.$apollo.loading ||
        this.waitingToSubmit
      );
    },
    canOverrideBanner() {
      return this.overrideBanner || this.banner === null;
    },
    split() {
      return this.fit ? this.$q.screen.gt.md : this.$q.screen.gt.sm;
    }
  },
  watch: {
    fetchingBanner() {
      if (this.waitingToSubmit) {
        this.submit();
      }
    }
  },
  mounted() {
    if (!this.lazyRules) {
      this.validate();
    }
  },
  methods: {
    submit() {
      this.waitingToSubmit = this.fetchingBanner;
      if (!this.waitingToSubmit) {
        this.$apollo
          .mutate({
            mutation: this.mutation,
            variables: {
              owner: this.currentUser.id,
              name: this.name,
              slug: this.slug,
              description: this.description || null,
              banner: this.banner,
              topics: this.selectedTopics.map(name => ({ name }))
            },
            update: (proxy, { data }) => {
              const dataByKey = data[this.mutationKey];
              const group = dataByKey.returning[0];
              proxy.writeQuery({
                query: getClientGroup,
                variables: {
                  path: group.path
                },
                data: {
                  group: toClientGroup(group)
                }
              });
              this.reset();
              this.$router.push({
                name: 'group',
                params: { path: group.path }
              });
            },
            refetchQueries: [
              {
                query: require('@/graphql/getUserGroups.gql'),
                variables: { id: this.currentUser.id }
              }
            ]
          })
          .catch(
            parseError(
              (message, code) => {
                if (code === 'constraint-violation' && message.includes('groups_path_key')) {
                  this.alreadyExistsPath = this.slug;
                  this.validate();
                  this.$info(this.alreadyExistsInfo, message);
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
      }
    },
    setDefaultBanner(selectedTopics) {
      if (this.canOverrideBanner && !this.fetchingBanner) {
        const topics = selectedTopics.filter(topic => !topic.isLocal).map(topic => topic.value);
        if (topics.length > 0) {
          if (!this.banner) {
            this.fetchingBanner = true;
            getRandomImageAsync(topics, '800x400')
              .then(url => {
                if (url) {
                  this.banner = url;
                }
              })
              .finally(() => {
                this.fetchingBanner = false;
              });
          }
        } else {
          this.banner = null;
        }
      }
    },
    validate() {
      this.$refs.name.validate();
    },
    reset() {
      this.$refs.name.resetValidation();
      this.$emit('reset');
    }
  }
};
</script>

<style lang="scss">
.split {
  width: 50%;
}
</style>
