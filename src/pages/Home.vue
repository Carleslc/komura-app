<template>
  <q-page class="column">
    <div class="col-auto row full-width gutter-y-lg gutter-y-max-sm">
      <div class="col-xs-12 col-md-6 col-lg-8 gutter-y-lg pr-lg pr-min-md">
        <h3 v-t="'myGroups'" />
        <div v-if="$apollo.loading" class="row q-col-gutter-x-lg">
          <div v-for="i in 2" :key="i" class="col-xs-12 col-lg-6">
            <item-skeleton avatar="rounded group-icon" label="text-h4" class="q-py-md" />
          </div>
        </div>
        <div v-else class="row q-col-gutter-x-lg">
          <div v-for="group in groups" :key="group.path" class="col-xs-12 col-lg-6">
            <group-item :group="group" class="q-py-md" />
            <q-separator v-if="groups.length > 2" />
          </div>
        </div>
      </div>
      <div class="column col-xs-12 col-md-6 col-lg-4 gutter-y-lg rounded bg-light hidden">
        <div class="content inner">
          <!-- NEWS / RECOMMENDATIONS -->
        </div>
      </div>
    </div>
    <fab
      icon="r_group_add"
      :to="{ name: 'newGroup' }"
      :class="{ 'on-mobile-drawer': $q.platform.is.desktop }"
    />
  </q-page>
</template>

<script>
import screen from '@/mixins/screen';
import currentUser from '@/mixins/currentUser';
import { identicon } from '@/services/gravatar';

export default {
  meta() {
    return {
      title: this.$t('home')
    };
  },
  components: {
    'item-skeleton': () => import('components/ItemSkeleton.vue'),
    'group-item': () => import('components/GroupItem.vue'),
    fab: () => import('components/Fab.vue')
  },
  mixins: [screen, currentUser],
  data() {
    return {
      groups: []
    };
  },
  apollo: {
    groups: {
      query: require('@/graphql/getUserGroups.gql'),
      variables() {
        return {
          id: this.currentUser.id
        };
      },
      update(data) {
        return data.users_by_pk.profiles.map(profile => ({
          admin: profile.role === 'admin',
          path: profile.group.path,
          name: profile.group.name,
          image: profile.group.image || profile.group.banner || identicon(profile.group.name)
        }));
      }
    }
  }
};
</script>
