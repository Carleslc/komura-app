<template>
  <q-item v-ripple clickable :to="{ name: 'group', params: { path: group.path } }" class="border">
    <q-item-section avatar>
      <q-img :src="group.image" basic class="rounded shadow-3 group-icon" />
    </q-item-section>
    <q-item-section>
      <q-item-label lines="2">
        <h4>{{ group.name }}</h4>
      </q-item-label>
    </q-item-section>
    <q-item-section v-if="group.admin" side>
      <q-icon name="r_star" color="grey">
        <q-tooltip
          anchor="center left"
          self="center right"
          transition-show="jump-left"
          transition-hide="jump-right"
        >
          <p class="text-sm">{{ $t('admin') }}</p>
        </q-tooltip>
      </q-icon>
    </q-item-section>
  </q-item>
</template>

<script>
export default {
  props: {
    group: {
      type: Object,
      required: true
    }
  }
};
</script>
