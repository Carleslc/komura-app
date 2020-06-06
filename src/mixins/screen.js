export default {
  created() {
    this.breakpoint = 800;
  },
  computed: {
    fitWidth() {
      return this.$q.screen.width <= this.breakpoint;
    },
    fitHeight() {
      return this.$q.screen.height <= 512;
    },
    xs() {
      return this.$q.screen.xs;
    },
    xxs() {
      return this.$q.screen.width < 350;
    }
  }
};
