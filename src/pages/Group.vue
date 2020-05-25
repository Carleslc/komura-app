<template>
  <q-page v-if="$apollo.loading">
    <loading />
  </q-page>
  <q-page v-else-if="found">
    <div class="column">
      <h1>{{ group.name }}</h1>
      <h4>{{ group.description }}</h4>
    </div>
  </q-page>
  <not-found v-else />
</template>

<script>
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
