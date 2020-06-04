<template>
  <q-page v-if="$apollo.loading">
    <loading />
  </q-page>
  <q-page v-else-if="found">
    <div class="row container">
      <div
        class="column q-gutter-y-xl"
        :class="{
          'q-pb-xl': fit ? $q.screen.lt.lg : $q.screen.lt.md,
          'col-lg-8': fit,
          'col-md-8': !fit
        }"
      >
        <q-img :src="banner" native-context-menu draggable="false" class="banner" />
        <div class="row items-center no-wrap">
          <q-avatar size="80px" class="col-auto q-pr-lg">
            <img draggable="false" :src="logo" style="height: 80px; width: 80px;" />
          </q-avatar>
          <h2>{{ group.name }}</h2>
        </div>
        <p class="text-lg">{{ group.description }}</p>
      </div>
      <div
        class="column inner q-gutter-y-xl"
        :class="{
          'col-lg-4': fit,
          'col-md-4': !fit
        }"
      >
        <h5 class="q-pb-md">{{ $t('topics') }}</h5>
      </div>
    </div>
  </q-page>
  <not-found v-else />
</template>

<script>
import { defaultAvatar } from '@/services/gravatar';

export default {
  meta() {
    return {
      title: this.group.name
    };
  },
  components: {
    loading: require('components/Loading.vue').default,
    'not-found': require('pages/Error404.vue').default
  },
  props: {
    path: {
      type: String,
      required: true
    },
    fit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    const cached = this.apollo.readQuery({
      query: require('@/graphql/client/getGroup.gql'),
      variables: {
        path: this.path
      }
    });

    return {
      found: !!cached,
      group: cached ? cached.group : {}
    };
  },
  computed: {
    logo() {
      return (
        this.group.image ||
        'https://images.unsplash.com/photo-1589120206612-3a21ed976d36?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=64&ixid=eyJhcHBfaWQiOjF9&ixlib=rb-1.2.1&q=80&w=64' ||
        defaultAvatar(this.group.name, 'identicon', { s: 80 })
      );
    },
    banner() {
      return (
        this.group.banner ||
        'https://images.unsplash.com/photo-1581878879399-c933ccf51c36?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=200&ixid=eyJhcHBfaWQiOjF9&ixlib=rb-1.2.1&q=80&w=800'
      );
    }
  },
  apollo: {
    group() {
      return {
        skip: this.found,
        query: require('@/graphql/getGroup.gql'),
        variables: {
          path: this.path
        },
        update(data) {
          this.found = data.groups && data.groups.length > 0;
          return this.found ? data.groups[0] : {};
        }
      };
    }
  }
};
</script>

<style lang="scss">
.container {
  -webkit-transition: padding-right 50ms ease-in-out;
  -moz-transition: padding-right 50ms ease-in-out;
  -o-transition: padding-right 50ms ease-in-out;
  transition: padding-right 50ms ease-in-out;

  .banner {
    border-radius: 20px;
    max-height: 256px;
  }

  > .column {
    &:first-child {
      -webkit-transition: padding-left 100ms ease-in-out;
      -moz-transition: padding-left 100ms ease-in-out;
      -o-transition: padding-left 100ms ease-in-out;
      transition: padding-left 100ms ease-in-out;
    }

    &.inner {
      -webkit-transition: padding-left 50ms ease-in-out;
      -moz-transition: padding-left 50ms ease-in-out;
      -o-transition: padding-left 50ms ease-in-out;
      transition: padding-left 50ms ease-in-out;
    }

    @media (min-width: $breakpoint-lg-min) {
      &.inner {
        padding-left: 3.33vw;
      }
    }
  }
}

.drawer-hidden {
  .container {
    > .column {
      @media (min-width: $breakpoint-md-min) {
        &.inner {
          padding-left: 3.33vw;
        }
      }
    }

    @media (min-width: $breakpoint-lg-min) {
      // padding so logo is vertically centered (2*16px + 36px + 3.33vw);
      $padding: calc(68px + 3.33vw);
      padding-right: $padding;

      > .column {
        padding-left: $padding;
      }
    }
  }
}
</style>
