<template>
  <q-layout
    view="hhh LpR lFf"
    class="home-layout"
    :class="{ 'drawer-mobile': fit, 'drawer-hidden': !menu }"
  >
    <q-header>
      <q-toolbar class="row justify-start" :class="fit ? 'q-px-none' : 'q-px-md'">
        <q-btn v-if="!fit" flat :ripple="false" class="logo-menu q-py-sm" @click="toggleMenu">
          <div>
            <img src="~assets/logo-icon.svg" style="width: 36px" />
          </div>
        </q-btn>
        <h4 class="col-auto ellipsis gt-xxxs" :class="{ 'q-ml-auto': !fit }">
          <div v-if="greetings && displayName">
            <span class="text-medium">{{ `${$tg('welcome', currentUser.gender)}, ` }}</span>
            <span class="text-light">{{ displayName }}</span>
          </div>
          <div v-else-if="withHeader">
            <span v-t="$route.name" class="text-medium" />
          </div>
        </h4>
        <div class="col-auto q-ml-auto">
          <user-profile-btn v-if="fit" avatar :user="currentUser" />
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-if="!fit"
      v-model="menu"
      behavior="desktop"
      :width="320"
      :breakpoint="breakpoint"
      show-if-above
    >
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
import { currentUser } from '@/mixins/currentUser';

export default {
  meta: {
    titleTemplate: title => `${title} | Komura`
  },
  components: {
    'menu-btn': require('components/MenuButton.vue').default,
    'user-profile-btn': require('components/UserProfileButton.vue').default
  },
  mixins: [currentUser],
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
    withHeader() {
      return !['userProfile', 'group'].includes(this.$route.name);
    },
    greetings() {
      return this.$route.name === this.tabs.home.key;
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
.desktop .home-layout {
  .logo-menu img {
    transition: transform 0.3s ease-in-out;
    -webkit-transition: transform 0.3s ease-in-out;
  }
  .q-btn:hover,
  .q-btn:focus {
    &.logo-menu {
      img {
        -webkit-transform: rotate(-45deg);
        transform: rotate(-45deg);
      }
    }
  }
}

.home-layout {
  .logo-menu {
    position: fixed;
    top: 6vh;
  }

  .q-header {
    padding: 6vh 3.33vw 0 3.33vw;
  }

  .q-page-container {
    padding-top: calc(56px + 6vh) !important; // header height + header padding
    min-height: calc(100vh - (56px + 6vh)) !important;

    .content {
      padding: 6vh 3.33vw 2vh 3.33vw;
    }
  }

  &.drawer-mobile .q-page-container {
    padding-bottom: calc(48px + 5vh + 8px) !important; // footer height + footer padding
    min-height: calc(100vh - (56px + 6vh) - (48px + 5vh + 8px)) !important;
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
    padding-top: 8px;
    overflow-x: hidden;

    > div {
      padding: 2.5vh 16px;
    }
  }
}
</style>
