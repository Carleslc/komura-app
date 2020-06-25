<template>
  <q-page v-if="found">
    <div class="container row">
      <div
        class="column col-12 gutter-y-xlg no-wrap"
        :class="{
          'col-lg-8': fit && side,
          'col-md-8': !fit && side,
          'with-side': side
        }"
      >
        <q-skeleton
          v-if="$apollo.loading || (edit && !group.banner)"
          type="rect"
          :animation="$apollo.loading ? 'wave' : 'none'"
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
          <q-skeleton v-if="$apollo.loading" type="QAvatar" size="80px" class="q-mr-lg" />
          <q-avatar
            v-else
            size="80px"
            :style="`background: ${defaultColor}`"
            class="col-auto group-image q-mr-lg"
          >
            <img
              v-if="group.image || !group.banner"
              draggable="false"
              :src="group.image || defaultIcon"
            />
          </q-avatar>
          <q-skeleton v-if="$apollo.loading" type="text" width="50%" class="text-h2" />
          <h2 v-else class="ellipsis-2-lines">
            {{ group.name }}
          </h2>
        </div>
        <div v-if="$apollo.loading">
          <q-skeleton type="text" width="100%" class="text-lg" />
          <q-skeleton type="text" width="100%" class="text-lg" />
          <q-skeleton type="text" width="75%" class="text-lg" />
        </div>
        <p v-else-if="group.description" class="text-lg text-justify">{{ group.description }}</p>
      </div>
      <div
        v-if="side"
        class="column col-12 side gutter-y-xlg"
        :class="{
          'col-lg-4': fit,
          'col-md-4': !fit
        }"
      >
        <div v-if="$apollo.loading || hasTopics" class="gutter-y-md">
          <q-skeleton v-if="$apollo.loading" type="text" width="64px" class="text-h5" />
          <h5 v-else v-t="'topics'" />
          <div v-if="$apollo.loading" class="row">
            <q-skeleton v-for="i in 2" :key="i" type="QChip" width="96px" class="q-mr-sm" />
          </div>
          <div v-else-if="hasTopics" class="row">
            <q-chip
              v-for="topic in group.topics"
              :key="topic.name"
              :color="getRandomColor(topic)"
              :label="topic.label"
              text-color="white"
              class="q-mr-xs"
            />
          </div>
        </div>
      </div>
    </div>
    <fab v-if="currentMember.admin && !edit" icon="r_edit" label="edit" @click="edit = true" />
    <fab v-else-if="edit" icon="r_done" color="positive" label="done" @click="edit = false" />
  </q-page>
  <not-found v-else message="noGroup" emoji="desert" />
</template>

<script>
import { getMainColorAsync, getRandomColor } from '@/utils/colors';
import { identicon } from '@/services/gravatar';
import { getClientGroup, toClientGroup } from '@/graphql/client/getGroup';
import { getGroup } from '@/graphql/getGroup';
import currentMember from '@/mixins/currentMember';

export default {
  meta() {
    return {
      title: this.group.name,
      titleTemplate: null,
      meta: {
        description: { name: 'description', content: this.group.description },
        og_description: { property: 'og:description', content: this.group.description },
        site_name: { property: 'og:site_name', content: this.group.name },
        image: { property: 'og:image', content: this.group.banner }
      }
    };
  },
  components: {
    banner: () => import('components/Banner.vue'),
    fab: () => import('components/Fab.vue'),
    'not-found': () => import('pages/NotFound.vue')
  },
  mixins: [currentMember],
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
      edit: false,
      cached: !!cached,
      group: cached ? cached.group : {},
      loadingBanner: true,
      defaultColor: 'transparent'
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
          if (this.found) {
            return toClientGroup(data.groups[0]);
          }
          this.$emit('not-found');
          return {};
        }
      };
    }
  },
  computed: {
    hasTopics() {
      return this.group.topics && this.group.topics.length > 0;
    },
    split() {
      return this.fit ? this.$q.screen.gt.md : this.$q.screen.gt.sm;
    },
    side() {
      return this.$apollo.loading || this.hasTopics;
    },
    defaultIcon() {
      return identicon(this.group.name);
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
    },
    getRandomColor(topic) {
      if (!topic.color) {
        topic.color = getRandomColor();
      }
      return topic.color;
    }
  }
};
</script>

<style lang="scss">
.container {
  .group-image {
    height: 80px;
    width: 80px;
  }

  @media (min-width: $breakpoint-lg-min) {
    > .column.side {
      -webkit-transition: padding-left 100ms ease-in-out;
      -moz-transition: padding-left 100ms ease-in-out;
      -o-transition: padding-left 100ms ease-in-out;
      transition: padding-left 100ms ease-in-out;

      padding-left: $padding-xlg;
    }
  }

  > .column {
    -webkit-transition: padding-left 100ms ease-in-out;
    -moz-transition: padding-left 100ms ease-in-out;
    -o-transition: padding-left 100ms ease-in-out;
    transition: padding-left 100ms ease-in-out;

    &.side {
      transition: none;
    }
  }

  @media (max-width: $breakpoint-md-max) {
    > .column.with-side {
      margin-bottom: $padding-xlg;
    }
  }
}

.drawer-hidden,
.no-header {
  .container {
    @media (min-width: $breakpoint-md-min) {
      > .column.with-side {
        margin-bottom: 0;
      }
      > .column.side {
        padding-left: $padding-xlg;
      }
    }
  }
}

.drawer-hidden {
  .container {
    @media (min-width: $breakpoint-lg-min) {
      > .column:first-child {
        // padding so logo is vertically centered (16px + 36px + 16px + 42px)
        $padding: 110px;
        padding-left: $padding;
        padding-right: $padding;

        &.with-side {
          padding-right: 0;
        }
      }
    }
  }
}
</style>
