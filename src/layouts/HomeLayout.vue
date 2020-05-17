<template>
  <q-layout view="hhh LpR fFf">
    <q-header class="header">
      <q-toolbar class="row justify-start q-px-md">
        <q-btn flat class="col-auto q-py-sm q-mr-auto" @click="toggleMenu">
          <div class="logo-menu">
            <img src="~assets/logo-icon.svg" style="width: 36px" />
          </div>
        </q-btn>
        <h4 class="col-auto ellipsis gt-xs">
          <div v-if="displayName && $route.name === 'home'">
            <span class="text-medium">{{ `${$tg('welcome', user.gender)}, ` }}</span>
            <span class="text-light">{{ displayName }}</span>
          </div>
          <div v-else-if="$route.name !== 'home'">
            <span class="text-medium">{{ $t($route.name) }}</span>
          </div>
        </h4>
        <div class="col-auto q-ml-auto"></div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="menu" side="left" :width="350" :breakpoint="815" show-if-above>
      <div class="column justify-between no-wrap full-height">
        <div class="col-4 menu-section">
          <div class="menu-section">
            <menu-btn icon="o_home" :to="{ name: 'home' }">
              <p :class="{ 'text-primary': $route.name === 'home' }">{{ $t('home') }}</p>
            </menu-btn>
          </div>
        </div>
        <div class="col-auto menu-section">
          <menu-btn icon="img:statics/icons/exit.svg" @click="$auth.logout()">
            <p>{{ $t('logout') }}</p>
          </menu-btn>
        </div>
        <div class="col-auto column justify-between q-gutter-y-lg full-width">
          <div class="menu-section">
            <menu-btn icon="o_group_add" :to="{ name: 'newGroup' }" class="q-py-xl">
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
      <router-view ref="child" class="content" />
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
    return {
      user: {},
      menu: true
    };
  },
  computed: {
    displayName() {
      return this.user.given_name || this.user.name;
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
