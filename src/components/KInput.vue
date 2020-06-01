<template>
  <k-field :label="label" :required="required" :hint="hint">
    <q-input
      ref="input"
      v-model="input"
      v-bind="$attrs"
      filled
      hide-bottom-space
      :debounce="debounce"
      :dense="dense"
      :type="type"
      :input-class="inputClass"
      :class="{ filled: !!value }"
      :hint="limitHint"
      :maxlength="limit"
      :lazy-rules="lazyRules"
      :rules="rules"
    />
  </k-field>
</template>

<script>
export default {
  components: {
    'k-field': require('components/KField').default
  },
  props: {
    value: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true
    },
    hint: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'text'
    },
    debounce: {
      type: Number,
      default: undefined
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
  data() {
    return {
      error: false
    };
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
        return `${this.limit - this.value.length}`;
      }
      return undefined;
    },
    hasError() {
      return this.error;
    }
  },
  mounted() {
    this.$watch(
      () => this.$refs.input.hasError,
      hasError => {
        this.error = hasError;
      }
    );
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
