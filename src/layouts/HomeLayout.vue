<template>
  <q-layout view="hhh LpR fFf">
    <q-header class="header">
      <q-toolbar class="row justify-start q-px-md">
        <q-btn flat class="col-auto q-py-sm q-mr-auto" @click="toggleMenu">
          <img src="~assets/logo-icon.svg" style="width: 36px" />
        </q-btn>
        <h4 v-if="user.name" class="col-auto ellipsis gt-xs">
          <span class="text-medium">{{ `${$t('welcome')}, ` }}</span>
          <span class="text-light">{{ user.name }}</span>
        </h4>
        <div class="col-auto q-ml-auto"></div>
      </q-toolbar>
    </q-header>

    <q-drawer v-if="isLoggedIn" v-model="menu" :breakpoint="800" show-if-above side="left">
      <div class="menu-section">
        <menu-btn icon="img:statics/icons/exit.svg" @click="$auth.logout()">
          <p>Salir</p>
          <p class="text-light">de la plataforma</p>
        </menu-btn>
      </div>
    </q-drawer>

    <q-page-container>
      <router-view class="content" />
    </q-page-container>
  </q-layout>
</template>

<script>
export default {
  meta: {
    titleTemplate: title => `${title} | Komura`
  },
  components: {
    'menu-btn': require('components/MenuButton.vue').default
  },
  data() {
    return {
      user: {},
      menu: true,
      isLoggedIn: this.$auth.isLoggedIn(),
      unsubscribeonAuthStateChanged: undefined
    };
  },
  mounted() {
    this.unsubscribeonAuthStateChanged = this.$auth.firebaseAuth.onAuthStateChanged(firebaseUser => {
      this.isLoggedIn = !!firebaseUser;
    });
  },
  beforeDestroy() {
    if (this.unsubscribeonAuthStateChanged) {
      this.unsubscribeonAuthStateChanged();
    }
  },
  apollo: {
    user: {
      query: require('@/graphql/client/getCurrentUser.gql')
    }
  },
  methods: {
    toggleMenu() {
      if (this.isLoggedIn) {
        this.menu = !this.menu;
      }
    }
  }
};
</script>
