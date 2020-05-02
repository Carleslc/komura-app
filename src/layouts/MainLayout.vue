<template>
  <q-layout view="lHh lpR lFf">
    <q-header>
      <q-toolbar>
        <router-link to="/" class="q-py-md">
          <img id="toolbar-logo" src="~assets/KomuraLogo-Blanco.svg" style="width: 150px" />
        </router-link>
        <q-btn
          v-if="!isLoggedIn"
          to="/login"
          class="absolute-right q-pr-sm text-md"
          flat
          icon="o_account_circle"
          label="Iniciar sesión"
        />
        <q-btn
          v-else
          class="absolute-right q-pr-sm text-md"
          flat
          icon="o_account_circle"
          label="Logout"
          @click="$auth.logout()"
        />
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
