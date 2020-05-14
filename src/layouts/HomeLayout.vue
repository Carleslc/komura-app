<template>
  <q-layout view="hhh LpR fFf">
    <q-header>
      <q-toolbar class="row justify-start">
        <q-btn flat class="col-auto q-py-sm q-mr-auto" @click="toggleMenu">
          <img id="toolbar-logo" src="~assets/logo-icon.svg" style="width: 36px" />
        </q-btn>
        <h3 v-if="user.name" class="col-auto ellipsis gt-xs">
          <span class="text-medium">{{ `${$t('welcome')}, ` }}</span>
          <span class="text-light">{{ user.name }}</span>
        </h3>
        <div class="col-auto q-ml-auto">
          <q-btn
            v-if="!isLoggedIn"
            flat
            to="/login"
            class="q-pa-sm"
            color="primary"
            icon="o_account_circle"
            label="Iniciar sesión"
          />
          <q-btn
            v-else
            flat
            class="q-pa-sm"
            color="primary"
            icon="img:statics/icons/exit.svg"
            label="Salir"
            @click="$auth.logout()"
          />
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="menu" show-if-above side="left" class="bg-grey">
      Hello
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
export default {
  meta: {
    titleTemplate: title => `${title} | Komura`
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
      this.menu = !this.menu;
    }
  }
};
</script>
