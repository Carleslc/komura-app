<template>
  <q-spinner-facebook :size="size" class="text text-grey" />
</template>

<script>
export default {
  props: {
    size: {
      type: String,
      default: '10em'
    }
  }
};
</script>
