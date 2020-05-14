<template>
  <q-layout view="hhh LpR fFf">
    <q-header class="bg-transparent q-pa-lg">
      <q-toolbar class="row justify-start">
        <router-link to="/" class="col-auto">
          <img src="~assets/KomuraLogo-Azul.svg" />
        </router-link>
        <div v-if="!isLoggedIn" class="col-auto q-ml-auto">
          <q-btn flat to="/login" class="q-pa-sm" color="primary" icon="o_account_circle" :label="$t('login')" />
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
    this.unsubscribeonAuthStateChanged = this.$auth.firebaseAuth.onAuthStateChanged(firebaseUser => {
      this.isLoggedIn = !!firebaseUser;
    });
  },
  beforeDestroy() {
    if (this.unsubscribeonAuthStateChanged) {
      this.unsubscribeonAuthStateChanged();
    }
  }
};
</script>
