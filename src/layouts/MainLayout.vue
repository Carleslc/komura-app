<template>
  <q-layout view="hhh LpR fFf">
    <q-header class="bg-transparent" :class="xs ? 'q-pa-md' : 'q-pa-lg'">
      <q-toolbar class="row justify-start q-pr-none">
        <router-link to="/" class="col-auto row items-center">
          <img v-if="xs" src="~assets/logo-icon.svg" width="36px" />
          <img v-else src="~assets/KomuraLogo-Azul.svg" />
        </router-link>
        <div class="col-auto q-ml-auto">
          <q-btn
            flat
            :padding="xs ? 'md' : 'md lg'"
            color="primary"
            :icon="isLoggedIn ? 'k:home' : 'o_account_circle'"
            :label="$t(loginKey)"
            :to="{ name: loginKey }"
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
import isLoggedIn from '@/mixins/isLoggedIn';
import screen from '@/mixins/screen';

export default {
  meta: {
    titleTemplate: title => `${title} | Komura`
  },
  mixins: [isLoggedIn, screen],
  computed: {
    loginKey() {
      return this.isLoggedIn ? 'home' : 'login';
    }
  }
};
</script>
