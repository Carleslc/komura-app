<template>
  <q-layout view="lHh lpR lFf">
    <q-page-container>
      <q-page class="row full-height justify-between">
        <div id="login-form" class="row col-xs-12 col-sm-6 col-md-5 col-xl-4 justify-center">
          <div class="container column full-height full-width">
            <div class="header-logo col-auto" @mousedown.prevent>
              <router-link to="/">
                <img alt="Kindly Network" src="~assets/KomuraReducido-Azul.svg" draggable="false" />
              </router-link>
            </div>
            <div class="column col justify-center">
              <div class="col-shrink q-mt-md justify-end">
                <social-providers />
                <!-- ENABLE LOGIN / REGISTER with email -->
                <div class="row hidden">
                  <q-separator class="col-4" />
                  <div class="row col items-center justify-center">
                    <p class="col-shrink text-grey-6 q-ma-none">O</p>
                  </div>
                  <q-separator class="col-4" />
                </div>
                <router-view />
              </div>
            </div>
          </div>
        </div>
        <div id="login-carousel" class="lt-xs col-sm-6 col-md-7 col-xl-8 carousel-overlay">
          <q-carousel
            v-model="currentSlide"
            navigation
            infinite
            animated
            :autoplay="10000"
            control-color="white"
            navigation-icon="o_radio_button_unchecked"
            class="full-height"
          >
            <q-carousel-slide v-for="(slide, i) in slides" :key="i" :name="i" :img-src="slide.path">
              <div
                class="row full-width full-height justify-center content-center text-white"
                :class="{ 'text-center': $q.screen.gt.lg }"
              >
                <h1>{{ slide.title }}</h1>
                <h2>{{ slide.subtitle }}</h2>
              </div>
            </q-carousel-slide>
          </q-carousel>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
export default {
  meta: {
    titleTemplate: title => `${title} | Komura`
  },
  components: {
    'social-providers': require('components/SocialProviders.vue').default
  },
  data() {
    return {
      currentSlide: 0,
      slides: [
        {
          path: 'statics/images/login-background-image-1.jpg',
          title: this.$t('joinOurCommunity'),
          subtitle: 'Siéntete libre haciendo lo que más te gusta'
        },
        {
          path: 'statics/images/login-background-image-2.jpg',
          title: this.$t('joinOurCommunity'),
          subtitle: 'Organiza tu trabajo en grupo'
        }
      ]
    };
  },
  created() {
    this.$auth.redirectOnLoggedIn = this.$route.query.signInSuccessUrl || { name: 'home' };
  }
};
</script>

<style lang="scss">
// $ import quasar variables
@import '@/css/login.scss';
</style>
