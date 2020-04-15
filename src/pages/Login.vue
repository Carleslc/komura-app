<template>
  <!-- TODO: Split login / register -->
  <q-page class="row justify-between">
    <div id="login-form" class="row col-xs-12 col-sm-6 col-md-5 col-lg-4 justify-center">
      <div class="container column full-height full-width">
        <router-link to="/" class="header-logo col-auto">
          <img alt="Kindly Network" src="~assets/KomuraReducido-Azul.svg" />
        </router-link>
        <div class="column col justify-end">
          <div class="col-shrink q-mt-md">
            <div id="social-providers" />
            <div class="row">
              <q-separator class="col-4" />
              <div class="row col items-center justify-center">
                <p class="col-shrink text-grey-6 q-ma-none">O</p>
              </div>
              <q-separator class="col-4" />
            </div>
            <q-form class="q-mt-md">
              <q-input
                ref="email"
                v-model="email"
                outlined
                type="email"
                placeholder="Introduce tu correo electrónico"
                lazy-rules
                :rules="[email => isValidEmail(email) || 'Introduce un correo electrónico válido']"
                :class="{ filled: !!email }"
              >
                <template v-slot:prepend>
                  <q-icon name="o_mail" />
                </template>
              </q-input>
              <q-input
                v-if="!isRegister"
                ref="password"
                v-model="password"
                outlined
                :type="showPassword ? 'text' : 'password'"
                placeholder="Introduce tu contraseña"
                :hint="!!password && password.length < 8 ? 'Introduce una contraseña con al menos 8 caracteres' : ''"
                lazy-rules
                :rules="[
                  password => !!password || 'Introduce una contraseña',
                  password => password.length >= 8 || 'Introduce una contraseña con al menos 8 caracteres'
                ]"
                :class="{ filled: !!password, 'with-hint': !!password && password.length < 8 }"
              >
                <template v-slot:prepend>
                  <q-icon name="o_vpn_key" />
                </template>
                <template v-slot:append>
                  <q-icon
                    :name="showPassword ? 'o_visibility' : 'o_visibility_off'"
                    class="cursor-pointer"
                    @click="showPassword = !showPassword"
                  />
                </template>
              </q-input>
              <q-btn
                :disabled="!isValidEmail(email) || (!isRegister && password.length < 8)"
                color="primary"
                :label="action"
                @click="isRegister ? registerWithEmail() : signInWithEmail()"
              />
            </q-form>
            <div class="row q-mt-md">
              <div class="row full-width justify-start text-md">
                <p class="col-shrink q-pr-xs q-mb-none text-dark">
                  {{ isRegister ? '¿Ya tienes una cuenta?' : '¿No tienes cuenta todavía?' }}
                </p>
                <span class="col-shrink text-button" @click="toggleRegister">{{
                  isRegister ? 'Inicia sesión' : 'Regístrate'
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div id="login-carousel" class="lt-xs col-sm-6 col-md-7 col-lg-8 carousel-overlay">
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
</template>

<script>
import { firebase, firebaseAuth } from '@/boot/firebase';
import { isValidEmail } from '@/utils/validations';
import { range } from 'lodash';

export default {
  meta() {
    return {
      title: this.action
    };
  },
  data() {
    return {
      email: '',
      password: '',
      showPassword: false,
      currentSlide: 0,
      isRegister: this.$route.name === 'Register',
      slides: [
        {
          path: 'statics/images/login-background-image-1.jpg',
          title: 'Únete a nuestra comunidad',
          subtitle: 'Siéntete libre haciendo lo que más te gusta'
        },
        {
          path: 'statics/images/login-background-image-2.jpg',
          title: 'Únete a nuestra comunidad',
          subtitle: 'Organiza tu trabajo en grupo'
        }
      ]
    };
  },
  computed: {
    action() {
      return this.isRegister ? 'Crear cuenta' : 'Iniciar sesión';
    }
  },
  mounted() {
    this.bindAuthUI();
  },
  methods: {
    range,
    isValidEmail,
    registerWithEmail() {
      this.$refs.email.validate();
      if (!this.$refs.email.hasError) {
        this.$router.push('/');
      }
    },
    signInWithEmail() {
      this.$refs.email.validate();
      this.$refs.password.validate();
      if (!this.$refs.email.hasError && !this.$refs.password.hasError) {
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
    },
    toggleRegister() {
      this.isRegister = !this.isRegister;
      if (this.email === '') {
        this.$refs.email.resetValidation();
      }
      if (this.$refs.password && this.password === '') {
        this.$refs.password.validate();
      }
    }
  }
};
</script>
