<template>
  <q-layout view="lHh lpR lFf">
    <q-header>
      <q-toolbar>
        <a href="/" class="q-py-md">
          <img id="toolbar-logo" src="~assets/KomuraLogo-Blanco.svg" style="width: 150px" />
        </a>
        <q-btn
          v-if="!isLoggedIn"
          to="/login"
          class="absolute-right q-pr-sm"
          flat
          icon="o_account_circle"
          label="Iniciar sesión"
        />
        <q-btn v-else class="absolute-right q-pr-sm" flat icon="o_account_circle" @click="logoutUser">
          Logout<br />
          {{ displayName }}
        </q-btn>
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
  computed: {
    isLoggedIn() {
      return this.$auth.isLoggedIn();
    },
    displayName() {
      return this.$auth.getFirebaseUser().displayName;
    }
  },
  methods: {
    logoutUser() {
      this.$auth.logout();
    }
  }
};
</script>
