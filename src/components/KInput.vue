<template>
  <div>
    <div class="row">
      <p v-t="label" class="label q-mb-md" />
      <span v-if="required" class="q-ml-xs text text-md text-accent">
        *
        <q-tooltip
          anchor="top middle"
          self="top left"
          :offset="[10, 10]"
          content-class="gt-xxxs bg-transparent"
          transition-show="jump-up"
          transition-hide="jump-down"
        >
          <p class="text-sm text-accent">{{ $t('required.label') }}</p>
        </q-tooltip>
      </span>
    </div>
    <q-input
      ref="input"
      v-model="input"
      v-bind="$attrs"
      filled
      hide-bottom-space
      :dense="dense"
      :type="type"
      :input-class="inputClass"
      :class="{ filled: !!value }"
      :hint="limitHint"
      :maxlength="limit"
      :lazy-rules="lazyRules"
      :rules="rules"
    />
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: 'text'
    },
    dense: {
      type: Boolean,
      default: true
    },
    limit: {
      type: Number,
      default: undefined
    },
    required: {
      type: Boolean,
      default: false
    },
    rules: {
      type: Array,
      default: undefined
    },
    lazyRules: {
      type: Boolean,
      default: true
    },
    inputClass: {
      type: [String, Object, Array],
      default: undefined
    }
  },
  computed: {
    input: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit('input', value);
      }
    },
    limitHint() {
      if (this.limit && this.value.length >= 0.8 * this.limit) {
        return this.limit - this.value.length;
      }
      return undefined;
    }
  },
  methods: {
    validate() {
      return this.$refs.input.validate();
    },
    resetValidation() {
      return this.$refs.input.resetValidation();
    }
  }
};
</script>
