<template>
  <q-item class="border">
    <q-item-section avatar>
      <slot name="avatar">
        <q-skeleton type="QAvatar" :class="avatar" />
      </slot>
    </q-item-section>
    <q-item-section>
      <q-item-label lines="2">
        <slot name="label">
          <q-skeleton type="text" :class="label" />
        </slot>
      </q-item-label>
    </q-item-section>
  </q-item>
</template>

<script>
export default {
  props: {
    avatar: {
      type: String,
      default: undefined
    },
    label: {
      type: String,
      default: undefined
    }
  }
};
</script>
