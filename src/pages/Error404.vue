<template>
  <q-page class="row justify-center">
    <div class="container column justify-center items-center q-gutter-y-lg">
      <span class="em-xl em-sweat" />
      <p v-t="'404'" class="text text-xl" />
      <q-btn flat color="primary" to="/" :label="$t('returnHome')" />
    </div>
  </q-page>
</template>

<script>
export default {};
</script>
