<template>
  <div class="row full-width">
    <p v-t="label" class="label q-mb-md" />
    <span v-if="required" class="q-ml-xs text text-md text-accent">
      *
      <q-tooltip
        anchor="top middle"
        self="top left"
        :offset="[10, 10]"
        content-class="gt-min bg-transparent"
        transition-show="jump-up"
        transition-hide="jump-down"
      >
        <p class="text-sm text-accent">{{ $t('required.label') }}</p>
      </q-tooltip>
    </span>
    <p v-if="hint" v-t="hint" class="full-width q-mb-md text" />
    <div class="full-width">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    label: {
      type: String,
      required: true
    },
    required: {
      type: Boolean,
      default: false
    },
    hint: {
      type: String,
      default: ''
    }
  }
};
</script>
