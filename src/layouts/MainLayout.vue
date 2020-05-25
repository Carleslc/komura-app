<template>
  <q-layout view="hhh LpR fFf">
    <q-header class="bg-transparent" :class="$q.screen.gt.xs ? 'q-pa-lg' : 'q-pa-md'">
      <q-toolbar class="row justify-start">
        <router-link to="/" class="col-auto row items-center">
          <img v-if="$q.screen.gt.xs" src="~assets/KomuraLogo-Azul.svg" />
          <img v-else src="~assets/logo-icon.svg" width="36px" />
        </router-link>
        <div class="col-auto q-ml-auto">
          <q-btn
            flat
            padding="md lg"
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
import { isLoggedIn } from '@/mixins/isLoggedIn';

export default {
  meta: {
    titleTemplate: title => `${title} | Komura`
  },
  mixins: [isLoggedIn],
  computed: {
    loginKey() {
      return this.isLoggedIn ? 'home' : 'login';
    }
  }
};
</script>
