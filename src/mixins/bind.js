export default function bindValue(name, type, def) {
  const mixin = {
    props: {
      value: {
        type,
        required: def === undefined,
        default: def
      }
    },
    computed: {}
  };

  mixin.computed[name] = {
    get() {
      return this.value;
    },
    set(value) {
      this.$emit('input', value);
    }
  };

  return mixin;
}
