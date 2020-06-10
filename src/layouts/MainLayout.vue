<template>
  <q-layout view="hHh LpR fFf" :class="{ 'no-header': !header }">
    <q-header v-if="header" class="bg-transparent" :class="xs ? 'q-pa-md' : 'q-pa-lg'">
      <q-toolbar class="row justify-start q-pr-none">
        <router-link to="/" class="col-auto row items-center">
          <img v-if="xs" src="~assets/logo-icon.svg" width="36px" @mousedown.prevent />
          <img v-else src="~assets/KomuraLogo-Azul.svg" @mousedown.prevent />
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
      <router-view class="content" @not-found="header = true" />
    </q-page-container>
  </q-layout>
</template>

<script>
import isLoggedIn from '@/mixins/isLoggedIn';
import screen from '@/mixins/screen';
import meta from '@/utils/meta';

export default {
  meta() {
    return {
      title: this.branded ? meta.title : '',
      titleTemplate: title => (this.branded ? meta.titleTemplate(title) : title),
      meta: meta.meta
    };
  },
  mixins: [isLoggedIn, screen],
  props: {
    branded: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      header: this.branded
    };
  },
  computed: {
    loginKey() {
      return this.isLoggedIn ? 'home' : 'login';
    }
  }
};
</script>
