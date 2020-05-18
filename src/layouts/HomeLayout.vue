<template>
  <q-layout view="hhh LpR fFf">
    <q-header class="header">
      <q-toolbar class="row justify-start q-px-md">
        <q-btn flat :ripple="false" class="col-auto q-py-sm q-mr-auto" @click="toggleMenu">
          <div class="logo-menu">
            <img src="~assets/logo-icon.svg" style="width: 36px" />
          </div>
        </q-btn>
        <h4 class="col-auto ellipsis gt-xs">
          <div v-if="isHomePage && displayName">
            <span class="text-medium">{{ `${$tg('welcome', user.gender)}, ` }}</span>
            <span class="text-light">{{ displayName }}</span>
          </div>
          <div v-else-if="!isHomePage">
            <span class="text-medium">{{ $t($route.name) }}</span>
          </div>
        </h4>
        <div class="col-auto q-ml-auto"></div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="menu" side="left" :width="350" :breakpoint="breakpoint" show-if-above>
      <div class="column justify-between no-wrap full-height q-gutter-y-md">
        <div class="col-auto menu-section">
          <menu-btn
            dense
            icon="k:home"
            :selected="isHomePage"
            :to="{ name: 'home' }"
            class="first last"
          >
            <p>{{ $t('home') }}</p>
          </menu-btn>
        </div>
        <div class="col-auto menu-section">
          <menu-btn icon="img:statics/icons/exit.svg" @click="$auth.logout()">
            <p>{{ $t('logout') }}</p>
          </menu-btn>
        </div>
        <div class="col-auto column justify-between q-gutter-y-md full-width no-wrap">
          <div class="menu-section">
            <menu-btn big icon="o_group_add" :to="{ name: 'newGroup' }">
              <p>{{ $t('newGroup') }}</p>
            </menu-btn>
          </div>
          <div class="menu-section">
            <menu-btn>
              <q-avatar v-if="user.provider_picture" slot="icon">
                <img :src="user.provider_picture" />
              </q-avatar>
              <p class="text-break">{{ user.name }}</p>
              <p class="ellipsis text-light">@{{ user.username }}</p>
            </menu-btn>
          </div>
        </div>
      </div>
    </q-drawer>

    <q-page-container>
      <router-view class="content page-component" />
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
    this.breakpoint = 800;
    return {
      user: {},
      menu: this.$q.screen.width > this.breakpoint
    };
  },
  computed: {
    displayName() {
      return this.user.given_name || this.user.name;
    },
    isHomePage() {
      return this.$route.name === 'home';
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
