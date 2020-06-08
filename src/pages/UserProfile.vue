<template>
  <q-page v-if="found" class="row justify-center items-center">
    <p class="col-auto text text-xl">{{ user.name }}</p>
  </q-page>
  <not-found v-else />
</template>

<script>
import currentUser from '@/mixins/currentUser';
import { equalsIgnoreCase } from '@/utils/strings';

export default {
  meta() {
    return {
      title: this.user.name
    };
  },
  components: {
    'not-found': () => import('pages/NotFound.vue')
  },
  mixins: [currentUser],
  props: {
    username: {
      type: String,
      default: undefined
    }
  },
  data() {
    return {
      found: true,
      user: {
        username: this.username
      }
    };
  },
  computed: {
    hasUsername() {
      return this.user.username !== undefined;
    },
    isCurrentUser() {
      return equalsIgnoreCase(this.user.username, this.currentUser.username);
    }
  },
  created() {
    if (!this.hasUsername) {
      this.setUsername(this.currentUser.username);
    }
    if (this.isCurrentUser) {
      this.user = this.currentUser;
    }
  },
  apollo: {
    user: {
      query: require('@/graphql/getUser.gql'),
      skip() {
        return !this.hasUsername || this.isCurrentUser;
      },
      variables() {
        return {
          username: this.username
        };
      },
      context() {
        return this.$auth.publicRole;
      },
      update(data) {
        this.found = data.groups && data.groups.length > 0;
        if (this.found) {
          const personalSpace = data.groups[0];
          return {
            username: personalSpace.path,
            is_public: personalSpace.is_public,
            provider_picture: personalSpace.owner.provider_picture,
            created_at: personalSpace.owner.created_at,
            ...personalSpace.owner.main_profile
          };
        }
        return {};
      },
      result() {
        this.setUsername(this.user.username);
      }
    }
  },
  methods: {
    setUsername(username) {
      if (username && username !== this.username) {
        this.user.username = username;
        this.$router.replace({
          params: { username }
        });
      }
    }
  }
};
</script>
