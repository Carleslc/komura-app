<template>
  <div class="column no-wrap">
    <p class="text-break">{{ name }}</p>
    <p class="ellipsis text-light">@{{ username }}</p>
  </div>
</template>

<script>
export default {
  props: {
    name: {
      type: String,
      required: true
    },
    username: {
      type: String,
      required: true
    }
  }
};
</script>
