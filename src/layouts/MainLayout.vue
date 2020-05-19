<template>
  <q-layout view="hhh LpR fFf">
    <q-header class="bg-transparent" :class="$q.screen.gt.xs ? 'q-pa-lg' : 'q-pa-md'">
      <q-toolbar class="row justify-start">
        <router-link to="/" class="col-auto row items-center">
          <img v-if="$q.screen.gt.xs" src="~assets/KomuraLogo-Azul.svg" />
          <img v-else src="~assets/logo-icon.svg" width="36px" />
        </router-link>
        <div v-if="!isLoggedIn" class="col-auto q-ml-auto">
          <q-btn
            flat
            to="/login"
            class="q-pa-sm"
            color="primary"
            icon="o_account_circle"
            :label="$t('login')"
          />
        </div>
      </q-toolbar>
    </q-header>

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
      isLoggedIn: this.$auth.isLoggedIn(),
      unsubscribeonAuthStateChanged: undefined
    };
  },
  mounted() {
    this.unsubscribeonAuthStateChanged = this.$auth.firebaseAuth.onAuthStateChanged(
      firebaseUser => {
        this.isLoggedIn = !!firebaseUser;
      }
    );
  },
  beforeDestroy() {
    if (this.unsubscribeonAuthStateChanged) {
      this.unsubscribeonAuthStateChanged();
    }
  }
};
</script>
