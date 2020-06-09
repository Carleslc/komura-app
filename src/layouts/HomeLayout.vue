<template>
  <q-layout
    view="hhh LpR lFf"
    class="home-layout"
    :class="{
      'drawer-mobile': fitWidth || fitHeight,
      'drawer-hidden': drawerHidden,
      'fit-height': fitHeight
    }"
  >
    <q-header>
      <q-toolbar class="row justify-start" :class="fitWidth ? 'q-px-none' : 'q-px-md'">
        <q-btn v-if="!fitWidth" flat :ripple="false" class="logo-menu q-py-sm" @click="toggleMenu">
          <div>
            <img src="~assets/logo-icon.svg" style="width: 36px" />
          </div>
        </q-btn>
        <h4 class="col-auto ellipsis gt-min" :class="{ 'q-ml-auto': !fitWidth }">
          <div v-if="greetings && displayName">
            <span class="text-medium">{{ `${$tg('welcome', currentUser.gender)}, ` }}</span>
            <span class="text-light">{{ displayName }}</span>
          </div>
          <div v-else-if="withHeader">
            <span v-t="$route.name" class="text-medium" />
          </div>
        </h4>
        <div v-if="$route.name !== 'userProfile'" class="col-auto q-ml-auto">
          <user-profile-btn v-if="fitWidth" avatar :user="currentUser" />
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-if="!fitWidth"
      v-model="menu"
      :behavior="fitHeight ? 'mobile' : 'desktop'"
      :width="320"
      :breakpoint="breakpoint"
      show-if-above
    >
      <div class="column justify-between no-wrap full-height">
        <div class="col-auto menu-section">
          <menu-btn
            :icon="tabs.home.icon"
            :selected="isTab(tabs.home)"
            :to="{ name: tabs.home.key }"
            :label="tabs.home.key"
            class="nav"
          />
        </div>
        <div class="col-auto menu-section">
          <menu-btn icon="img:statics/icons/exit.svg" label="logout" @click="$auth.logout()" />
        </div>
        <div class="col-auto column justify-between full-width no-wrap menu-section">
          <div v-if="$q.platform.is.desktop" class="menu-section">
            <menu-btn big icon="o_group_add" label="newGroup" :to="{ name: 'newGroup' }" />
          </div>
          <div class="menu-section">
            <user-profile-btn :user="currentUser" />
          </div>
        </div>
      </div>
    </q-drawer>

    <q-page-container>
      <router-view :fit="!drawerHidden" class="content" />
    </q-page-container>

    <q-footer v-if="fitWidth" class="shadow-up">
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
    </q-footer>
  </q-layout>
</template>

<script>
import currentUser from '@/mixins/currentUser';
import screen from '@/mixins/screen';

export default {
  meta: {
    titleTemplate: title => `${title} | Komura`
  },
  components: {
    'menu-btn': () => import('components/MenuButton.vue'),
    'user-profile-btn': () => import('components/UserProfileButton.vue')
  },
  mixins: [screen, currentUser],
  data() {
    return {
      menu: !this.fitWidth,
      tabs: {
        home: {
          key: 'home',
          icon: 'k:home'
        }
      }
    };
  },
  computed: {
    drawerHidden() {
      return !this.menu || this.fitWidth;
    },
    displayName() {
      if (this.currentUser.given_name) {
        return this.currentUser.given_name;
      }
      if (this.$auth.loading) {
        // currentUser will be updated
        // so wait until next displayName call to avoid visual re-rendering changing name to given_name
        return null;
      }
      return this.currentUser.name;
    },
    isHomePage() {
      return this.isTab(this.tabs.home);
    },
    withHeader() {
      return !['home', 'userProfile', 'group'].includes(this.$route.name);
    },
    greetings() {
      return [this.tabs.home.key, 'group'].includes(this.$route.name);
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
    position: absolute;
  }

  &:not(.drawer-hidden) {
    .logo-menu {
      position: fixed;
    }
  }

  $toolbar-height: 50px;

  .q-header {
    padding: $padding-xlg;
  }

  &.fit-height {
    .q-header {
      padding: $content-padding $padding-xlg;
    }

    $header-height: calc(
      #{$toolbar-height} + 2 * #{$content-padding}
    ); // toolbar height + header padding (top & bottom)

    .q-drawer.q-drawer--standard {
      top: $header-height !important;
    }

    .q-page-container {
      padding-top: $header-height !important;
    }
  }

  &.drawer-mobile {
    .q-header {
      padding: $content-padding;
    }
  }

  .q-drawer {
    padding-left: $content-padding;

    &.q-drawer--standard {
      top: calc(
        #{$toolbar-height} + 2 * #{$padding-xlg}
      ) !important; // toolbar height + header padding (top & bottom)

      .q-drawer__content {
        > div > :last-child {
          padding-bottom: $content-padding;
        }
      }
    }

    &.q-drawer--mobile {
      $mobile-padding: 24px;

      padding-left: $mobile-padding;
      padding-right: $mobile-padding;

      .q-drawer__content {
        > div {
          > :first-child {
            padding-top: $mobile-padding;
          }
          > :last-child {
            padding-bottom: $mobile-padding;
          }
        }
      }
    }

    .q-drawer__content {
      max-width: 100%;
    }
  }

  $footer-padding: 12px;

  .q-footer {
    padding: $footer-padding;
  }
}
</style>
