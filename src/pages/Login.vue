<template>
  <q-page class="row justify-between">
    <div id="login-form" class="row col-xs-12 col-md-5 col-lg-4 justify-center">
      <div class="container column full-height full-width">
        <router-link to="/" class="header-logo col-auto">
          <img alt="Kindly Network" src="~assets/KomuraReducido-Azul.svg" />
        </router-link>
        <div class="column col justify-center">
          <div class="col-shrink q-mt-xl">
            <div>
              <div id="social-providers" class="q-pa-none"></div>
            </div>
            <div class="row">
              <q-separator class="col-4 q-my-xl" />
              <div class="row col items-center justify-center">
                <p class="col-shrink grey q-ma-none text-weight-light">O</p>
              </div>
              <q-separator class="col-4 q-my-xl" />
            </div>
            <q-form>
              <div class="q-gutter-y-lg">
                <q-input
                  v-model="email"
                  class="q-pb-none"
                  clearable
                  type="email"
                  label="Introduce tu correo electrónico"
                  bottom-slots
                  :error-message="emailError"
                  :error="!isValidEmailFormat && emailError"
                />
                <q-btn
                  :disabled="!isValidEmailFormat"
                  color="primary"
                  class="btn-round full-width"
                  :class="{ 'q-mt-sm': !isValidEmailFormat && emailError }"
                  label="Iniciar sesión"
                  @click="signInWithEmail"
                />
              </div>
            </q-form>
          </div>
        </div>
      </div>
    </div>
    <div class="xs-hide col-md-7 col-lg-8 carousel-overlay">
      <q-carousel
        v-model="slide"
        navigation
        infinite
        autoplay
        control-color="white"
        navigation-icon="radio_button_unchecked"
        class="full-height"
      >
        <q-carousel-slide :name="1" img-src="~assets/login-background-image-1.png">
          <div class="row full-height content-center text-white">
            <h1>Únete a nuestra comunidad</h1>
            <h2>Siéntete libre haciendo lo que más te gusta</h2>
          </div>
        </q-carousel-slide>
      </q-carousel>
    </div>
  </q-page>
</template>

<script>
import { firebase, firebaseAuth } from '@/boot/firebase';

export default {
  meta: {
    title: 'Iniciar sesión'
  },
  data() {
    return {
      slide: 1,
      email: '',
      withEmailForm: false,
      // eslint-disable-next-line max-len
      EMAIL_REGEX: /^[a-zA-Z0-9.!#$%&''*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?){1,}$/,
      emailError: null
    };
  },
  computed: {
    isValidEmailFormat() {
      return this.EMAIL_REGEX.test(this.email);
    }
  },
  mounted() {
    this.bindAuthUI();
  },
  methods: {
    signInWithEmail() {
      if (this.isValidEmailFormat) {
        this.$router.push('/');
      } else {
        this.emailError = 'Introduce un correo electrónico válido';
      }
    },
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
          firebase.auth.GoogleAuthProvider.PROVIDER_ID,
          firebase.auth.FacebookAuthProvider.PROVIDER_ID,
          firebase.auth.TwitterAuthProvider.PROVIDER_ID
        ],
        credentialHelper: firebaseui.auth.CredentialHelper.NONE
      });
    }
  }
};
</script>
