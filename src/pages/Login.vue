<template>
  <q-page class="row justify-between">
    <div id="login-form" class="row col-xs-12 col-md-5 col-lg-4 justify-center">
      <div class="container column full-height full-width">
        <router-link to="/" class="header-logo col-auto">
          <img alt="Kindly Network" src="~assets/KomuraReducido-Azul.svg" />
        </router-link>
        <div class="column col justify-end">
          <div class="col-shrink q-mt-md">
            <div id="social-providers"></div>
            <div class="row">
              <q-separator class="col-4" />
              <div class="row col items-center justify-center">
                <p class="col-shrink text-grey-6 q-ma-none">O</p>
              </div>
              <q-separator class="col-4" />
            </div>
            <q-form class="q-my-md">
              <q-input
                ref="email"
                v-model="email"
                rounded
                outlined
                type="email"
                placeholder="Introduce tu correo electrónico"
                lazy-rules
                :rules="[_ => !submitted || isValidEmailFormat || 'Introduce un correo electrónico válido']"
                :class="{ filled: email != '' }"
              >
                <template v-slot:prepend>
                  <q-icon name="mail_outline" />
                </template>
              </q-input>
              <q-btn :disabled="!isValidEmailFormat" color="primary" label="Iniciar sesión" @click="signInWithEmail" />
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
            <q-icon></q-icon>
          </div>
        </q-carousel-slide>
      </q-carousel>
    </div>
  </q-page>
</template>

<script>
import { firebase, firebaseAuth } from '@/boot/firebase';
import { isValidEmail } from '@/utils/validations';

export default {
  meta: {
    title: 'Iniciar sesión'
  },
  data() {
    return {
      slide: 1,
      email: '',
      submitted: false
    };
  },
  computed: {
    isValidEmailFormat() {
      return isValidEmail(this.email);
    }
  },
  mounted() {
    this.bindAuthUI();
  },
  methods: {
    signInWithEmail() {
      this.submitted = true;
      this.$refs.email.validate();
      if (!this.$refs.email.hasError) {
        this.$router.push('/');
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
