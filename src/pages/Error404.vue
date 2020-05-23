<template>
  <div class="container fixed-center text-center q-gutter-y-lg">
    <span class="em-xl em-sweat" />
    <p v-t="'404'" class="text text-xl" />
    <q-btn flat color="primary" to="/" :label="$t('returnHome')" />
  </div>
</template>

<script>
export default {};
</script>
