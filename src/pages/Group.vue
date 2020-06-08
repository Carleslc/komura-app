<template>
  <q-page v-if="found" class="row container">
    <div
      class="column col-12 q-gutter-y-xl"
      :class="{
        'q-pb-xl': fit ? $q.screen.lt.lg : $q.screen.lt.md,
        'col-lg-8': fit,
        'col-md-8': !fit
      }"
    >
      <q-skeleton
        v-if="$apollo.loading || !group.banner"
        type="rect"
        :animation="$apollo.loading || group.banner ? 'wave' : 'none'"
        class="banner"
      />
      <banner
        v-else
        ref="banner"
        :src="group.banner"
        @load="setDefaultColor"
        @error="loadingBanner = false"
      />
      <div class="row items-center no-wrap">
        <q-skeleton
          v-if="loadingBanner"
          type="QAvatar"
          size="80px"
          class="q-mr-lg"
          :animation="$apollo.loading || group.banner ? 'wave' : 'none'"
        />
        <q-avatar
          v-else
          size="80px"
          :style="`background: ${defaultColor}`"
          class="col-auto group-image q-mr-lg"
        >
          <img v-if="group.image" draggable="false" :src="group.image" />
        </q-avatar>
        <q-skeleton v-if="$apollo.loading" type="text" width="50%" class="text-h2" />
        <h2 v-else>{{ group.name }}</h2>
      </div>
      <div v-if="$apollo.loading">
        <q-skeleton type="text" width="100%" class="text-lg" />
        <q-skeleton type="text" width="100%" class="text-lg" />
        <q-skeleton type="text" width="75%" class="text-lg" />
      </div>
      <p v-else class="text-lg text-justify">{{ group.description }}</p>
    </div>
    <div
      class="column col-12 inner q-gutter-y-xl"
      :class="{
        'col-lg-4': fit,
        'col-md-4': !fit
      }"
    >
      <q-skeleton v-if="$apollo.loading" type="text" width="64px" class="text-h5 q-pb-md" />
      <h5 v-else class="q-pb-md">{{ $t('topics') }}</h5>
    </div>
  </q-page>
  <not-found v-else message="noGroup" emoji="desert" />
</template>

<script>
import { getMainColorAsync, getPaletteColor } from '@/utils/colors';
import { getClientGroup, toClientGroup } from '@/graphql/client/getGroup';
import { getGroup } from '@/graphql/getGroup';

export default {
  meta() {
    return {
      title: this.group.name
    };
  },
  components: {
    banner: () => import('components/Banner.vue'),
    'not-found': () => import('pages/NotFound.vue')
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
      query: getClientGroup,
      variables: {
        path: this.path
      }
    });

    return {
      found: true,
      cached: !!cached,
      group: cached ? cached.group : {},
      loadingBanner: true,
      defaultColor: getPaletteColor('primary')
    };
  },
  apollo: {
    group() {
      return {
        skip: this.cached,
        query: getGroup,
        variables: {
          path: this.path
        },
        update(data) {
          this.found = data.groups && data.groups.length > 0;
          return this.found ? toClientGroup(data.groups[0]) : {};
        }
      };
    }
  },
  methods: {
    setDefaultColor() {
      // waiting for next tick prevents img from being null
      this.$nextTick(async () => {
        this.defaultColor = await getMainColorAsync(
          this.$refs.banner.$el.querySelector('img'),
          this.defaultColor
        );
        this.loadingBanner = false;
      });
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

  .group-image {
    height: 80px;
    width: 80px;
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
