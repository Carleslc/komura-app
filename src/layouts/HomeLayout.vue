<template>
  <q-layout view="hhh LpR fFf">
    <q-header class="header">
      <q-toolbar class="row justify-start q-px-md">
        <q-btn flat class="col-auto q-py-sm q-mr-auto" @click="toggleMenu">
          <img src="~assets/logo-icon.svg" style="width: 36px" />
        </q-btn>
        <h4 v-if="displayName" class="col-auto ellipsis gt-xs">
          <span class="text-medium">{{ `${$t('welcome')}, ` }}</span>
          <span class="text-light">{{ displayName }}</span>
        </h4>
        <div class="col-auto q-ml-auto"></div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="menu" persistent :breakpoint="800" show-if-above side="left">
      <div class="column justify-between full-height">
        <div class="col-4 menu-section">
          Menu
        </div>
        <div class="col-auto menu-section">
          <menu-btn icon="img:statics/icons/exit.svg" @click="$auth.logout()">
            <p>Salir</p>
            <p class="text-light">de la plataforma</p>
          </menu-btn>
        </div>
        <div class="col-auto column justify-between q-gutter-y-lg">
          <div class="menu-section">
            <menu-btn icon="o_group_add" :to="{ name: 'new-group' }">
              <p>Crear grupo</p>
            </menu-btn>
          </div>
          <div class="menu-section">
            <menu-btn>
              <q-avatar v-if="user.provider_picture" slot="icon">
                <img :src="user.provider_picture" />
              </q-avatar>
              <p>{{ user.name }}</p>
              <p class="text-light">@{{ user.username }}</p>
            </menu-btn>
          </div>
        </div>
      </div>
    </q-drawer>

    <q-page-container>
      <router-view class="content" />
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
