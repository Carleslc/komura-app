<template>
  <fab v-if="!edit" icon="r_edit" label="edit" :to="to" @click="start" />
  <fab v-else icon="r_done" color="positive" label="done" @click="done" />
</template>

<script>
export default {
  components: {
    fab: () => import('components/Fab.vue')
  },
  props: {
    to: {
      type: Object,
      default: undefined
    },
    active: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      edit: this.active
    };
  },
  methods: {
    start() {
      this.edit = true;
      this.$emit('edit');
    },
    done() {
      this.edit = false;
      this.$emit('done');
    }
  }
};
</script>
