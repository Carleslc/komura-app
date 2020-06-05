<template>
  <q-page class="row justify-center">
    <div class="container column justify-center items-center q-gutter-y-lg">
      <span class="em-xl" :class="`em-${emoji}`" />
      <p v-t="message" class="text text-xl text-center" />
      <q-btn flat color="primary" to="/" :label="$t('returnHome')" />
    </div>
  </q-page>
</template>

<script>
export default {
  props: {
    message: {
      type: String,
      default: '404'
    },
    emoji: {
      type: String,
      default: 'sweat'
    }
  }
};
</script>
