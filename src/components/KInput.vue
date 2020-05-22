<template>
  <div>
    <p class="label q-mb-md">{{ $t(label) }}</p>
    <q-input
      v-model="input"
      v-bind="$attrs"
      filled
      :dense="dense"
      :type="type"
      :class="{ filled: !!value }"
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
    }
  }
};
</script>
