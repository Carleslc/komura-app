<template>
  <div class="container fixed-center text-center">
    <p>
      <img src="~assets/sad.svg" style="width:30vw;max-width:150px;" />
    </p>
    <p class="text text-xl">{{ $t('lost') }}</p>
    <q-btn color="primary" to="/" :label="$t('returnHome')" />
  </div>
</template>

<script>
export default {};
</script>
