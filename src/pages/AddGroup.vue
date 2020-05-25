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
            :lazy-rules="isDefaultData"
            :limit="60"
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
        </div>
      </div>
      <div class="row">
        <q-btn
          outline
          type="submit"
          :label="$t('createGroup')"
          :disabled="!name || name.length < 3 || alreadyExists || isRestricted || $apollo.loading"
          class="primary q-px-lg"
        />
      </div>
    </q-form>
  </q-page>
</template>

<script>
import { slugify, blacklist } from '@/utils/strings';
import { fitHeight } from '@/utils/responsive';
import { parseError } from '@/utils/errors';
import { currentUser } from '@/mixins/currentUser';
import { saveData } from '@/mixins/saveData';

export default {
  meta() {
    return {
      title: this.$t('newGroup')
    };
  },
  components: {
    'k-input': require('components/KInput.vue').default
  },
  mixins: [
    currentUser,
    saveData('add-group', {
      name: '',
      description: ''
    })
  ],
  data() {
    return {
      alreadyExistsPath: null
    };
  },
  computed: {
    fitHeight: fitHeight.bind(this),
    slug() {
      return slugify(this.name);
    },
    alreadyExists() {
      return this.alreadyExistsPath && this.slug === this.alreadyExistsPath;
    },
    isRestricted() {
      return blacklist.includes(this.slug);
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
            description: this.description || null
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
              if (code === 'constraint-violation') {
                this.alreadyExistsPath = this.slug;
                this.validate();
                this.$info('Attempted to create an existing group', message);
              } else {
                this.$q.notify({
                  type: 'negative',
                  message
                });
              }
            },
            {
              name: this.name,
              path: this.slug
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
