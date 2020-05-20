<template>
  <div class="container fixed-center text-center q-gutter-y-lg">
    <span class="em-xl em-sweat" />
    <p class="text text-xl">{{ $t('404') }}</p>
    <q-btn flat color="primary" to="/" :label="$t('returnHome')" />
  </div>
</template>

<script>
export default {};
</script>
