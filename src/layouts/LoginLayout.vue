<template>
  <q-layout view="lHh lpR lFf">
    <q-page-container>
      <q-page class="row full-height justify-between">
        <div id="login-form" class="row col-xs-12 col-sm-6 col-md-5 col-xl-4 justify-center">
          <div class="container column full-height full-width">
            <div class="header-logo col-auto">
              <router-link to="/">
                <img alt="Kindly Network" src="~assets/KomuraReducido-Azul.svg" />
              </router-link>
            </div>
            <div class="column col justify-center">
              <div class="col-shrink q-mt-md justify-end">
                <div id="social-providers" />
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
              <div class="row full-height content-center text-white">
                <h1>{{ slide.title }}</h1>
                <h2>{{ slide.subtitle }}</h2>
                <q-icon></q-icon>
              </div>
            </q-carousel-slide>
          </q-carousel>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import { firebase, firebaseAuth } from '@/boot/firebase';

export default {
  meta: {
    titleTemplate: title => `${title} | Komura`
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
  mounted() {
    this.bindAuthUI();
  },
  methods: {
    /* eslint-disable no-undef */
    bindAuthUI() {
      if (typeof firebaseui !== 'undefined') {
        // firebaseuid already loaded
        this.loadSocialProviders();
      } else {
        // load firebaseuid dynamically
        window.firebase = firebase;
        const locale = this.$q.lang.getLocale();
        const firebaseLocale = locale.split('-')[0];
        const firebaseuiScript = document.createElement('script');
        firebaseuiScript.src = `https://www.gstatic.com/firebasejs/ui/4.4.0/firebase-ui-auth__${firebaseLocale}.js`;
        firebaseuiScript.onload = this.loadSocialProviders;
        document.head.appendChild(firebaseuiScript);
      }
    },
    loadSocialProviders() {
      const authUI = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(firebaseAuth);
      authUI.start('#social-providers', {
        signInSuccessUrl: '/',
        signInOptions: [
          firebase.auth.GoogleAuthProvider.PROVIDER_ID
          // firebase.auth.FacebookAuthProvider.PROVIDER_ID,
          // firebase.auth.TwitterAuthProvider.PROVIDER_ID
        ],
        credentialHelper: firebaseui.auth.CredentialHelper.NONE
      });
    }
  }
};
</script>
