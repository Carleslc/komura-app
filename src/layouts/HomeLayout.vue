<template>
  <q-layout view="hhh LpR lFf" class="home-layout" :class="{ 'drawer-hidden': fit }">
    <q-header>
      <q-toolbar class="row justify-start q-px-md">
        <q-btn
          v-if="!fit"
          flat
          :ripple="false"
          class="col-auto q-py-sm q-mr-auto"
          @click="toggleMenu"
        >
          <div class="logo-menu">
            <img src="~assets/logo-icon.svg" style="width: 36px" />
          </div>
        </q-btn>
        <h4 class="col-auto ellipsis gt-xxxs">
          <div v-if="greetings && displayName">
            <span class="text-medium">{{ `${$tg('welcome', currentUser.gender)}, ` }}</span>
            <span class="text-light">{{ displayName }}</span>
          </div>
          <div v-else-if="!greetings">
            <span class="text-medium">{{ $t($route.name) }}</span>
          </div>
        </h4>
        <div class="col-auto q-ml-auto">
          <user-profile-btn v-if="fit" avatar :user="currentUser" />
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-if="!fit" v-model="menu" :width="320" :breakpoint="breakpoint" show-if-above>
      <div class="column justify-between no-wrap full-height q-gutter-y-md">
        <div class="col-auto menu-section">
          <menu-btn
            :icon="tabs.home.icon"
            :selected="isTab(tabs.home)"
            :to="{ name: tabs.home.key }"
            :label="tabs.home.key"
            class="nav first last"
          />
        </div>
        <div class="col-auto menu-section">
          <menu-btn icon="img:statics/icons/exit.svg" label="logout" @click="$auth.logout()" />
        </div>
        <div class="col-auto column justify-between q-gutter-y-md full-width no-wrap">
          <div class="menu-section">
            <menu-btn big icon="o_group_add" label="newGroup" :to="{ name: 'newGroup' }" />
          </div>
          <div class="menu-section">
            <user-profile-btn :user="currentUser" />
          </div>
        </div>
      </div>
    </q-drawer>

    <q-page-container>
      <router-view class="content page-component" />
    </q-page-container>

    <q-footer v-if="fit">
      <div class="row shadow-up">
        <div v-for="tab of tabs" :key="tab.key" class="col-12 row justify-center">
          <menu-btn
            :icon="tab.icon"
            :to="{ name: tab.key }"
            :label="tab.key"
            :selected="isTab(tab)"
            padding="12px lg"
            class="nav nav-bottom"
          />
        </div>
      </div>
    </q-footer>
  </q-layout>
</template>

<script>
import { CurrentUser } from '@/mixins/CurrentUser';

export default {
  meta: {
    titleTemplate: title => `${title} | Komura`
  },
  components: {
    'menu-btn': require('components/MenuButton.vue').default,
    'user-profile-btn': require('components/UserProfileButton.vue').default
  },
  mixins: [CurrentUser],
  data() {
    this.breakpoint = 800;
    return {
      menu: this.$q.screen.width > this.breakpoint,
      tabs: {
        home: {
          key: 'home',
          icon: 'k:home'
        }
      }
    };
  },
  computed: {
    displayName() {
      return this.currentUser.given_name || this.currentUser.name;
    },
    isHomePage() {
      return this.isTab(this.tabs.home);
    },
    fit() {
      return this.$q.screen.width <= this.breakpoint;
    },
    greetings() {
      return [this.tabs.home.key, 'userProfile'].includes(this.$route.name);
    }
  },
  methods: {
    toggleMenu() {
      this.menu = !this.menu;
    },
    isTab(tab) {
      return this.$route.name === tab.key;
    }
  }
};
</script>

<style lang="scss">
.home-layout {
  .q-header {
    background-color: transparent;
    padding: 6vh 3.33vw 0 3.33vw;
  }

  .q-page-container {
    padding-top: calc(56px + 6vh) !important; // header height + header padding
    min-height: calc(100vh - (56px + 6vh)) !important;

    .content {
      padding: 6vh 3.33vw 2vh 3.33vw;
    }
  }

  &.drawer-hidden .q-page-container {
    padding-bottom: calc(48px + 5vh) !important; // footer height + footer padding
    min-height: calc(100vh - (56px + 6vh) - (48px + 5vh)) !important;
  }

  .q-drawer {
    &.q-drawer--standard {
      padding: 6vh 0 4vh 2vw;
      top: calc(56px + 6vh) !important; // header height + header padding
    }
    &.q-drawer--mobile {
      padding: 2.5vw;
    }
    .q-drawer__content {
      max-width: 100%;
    }
  }

  .q-footer {
    background-color: transparent;
    padding-top: 12px; // shadow
    overflow: hidden;

    > div {
      padding: 2.5vh 16px;
    }
  }
}
</style>
