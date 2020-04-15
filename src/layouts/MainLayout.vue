<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <a href="/" class="q-py-md">
          <img id="toolbar-logo" src="~assets/KomuraLogo-Blanco.svg" style="width: 150px" />
        </a>
        <q-btn
          v-if="!userDetails.userId"
          to="/login"
          class="absolute-right q-pr-sm"
          flat
          icon="o_account_circle"
          label="Iniciar sesión"
        />
        <q-btn v-else class="absolute-right q-pr-sm" flat icon="o_account_circle" @click="logoutUser">
          Logout<br />
          {{ userDetails.name }}
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
  data() {
    return {
      userDetails: {}
    };
  },
  computed: {
    title() {
      const currentPath = this.$route.fullPath;
      if (currentPath === '/login') {
        return 'Iniciar sesión';
      }
      return 'Komura';
    }
  },
  methods: {
    logoutUser() {
      this.$q.notify({
        color: 'info',
        message: 'Has cerrado la sesión'
      });
    }
  }
};
</script>
