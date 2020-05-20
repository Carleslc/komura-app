<template>
  <q-btn v-if="avatar" round :to="userProfile">
    <q-avatar v-if="picture" size="48px" class="shadow">
      <img :src="picture" />
      <q-tooltip :delay="300">
        <about :name="user.name" :username="user.username" class="justify-center" />
      </q-tooltip>
    </q-avatar>
  </q-btn>
  <menu-btn v-else :to="userProfile">
    <q-avatar v-if="picture" slot="icon" class="q-mr-md">
      <img :src="picture" />
    </q-avatar>
    <about :name="user.name" :username="user.username" />
  </menu-btn>
</template>

<script>
export default {
  components: {
    'menu-btn': require('components/MenuButton.vue').default,
    about: require('components/UserProfileAbout.vue').default
  },
  props: {
    user: {
      type: Object,
      required: true
    },
    avatar: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    picture() {
      return this.user.provider_picture;
    },
    userProfile() {
      return { name: 'userProfile', params: { username: this.user.username } };
    }
  }
};
</script>
