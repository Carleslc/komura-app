<template>
  <q-page class="flex flex-center">
    <div class="column no-wrap">
      <router-link to="/" class="row justify-center">
        <div class="logo-mask">
          <img src="~assets/KomuraLogo-Blanco.svg" style="max-width: 250px" class="q-py-lg" />
        </div>
      </router-link>
      <div class="row">
        <q-card id="signInCard" bordered class="q-pa-lg shadow-1">
          <q-card-section class="text-center q-pa-sm">
            <div class="text-h6">Inicia sesión</div>
          </q-card-section>
          <q-card-actions id="social-providers" class="q-py-sm"> </q-card-actions>
          <q-card-section class="text-center q-pt-none">
            <div class="text-grey-6">O</div>
          </q-card-section>
          <q-card-section class="q-pa-sm">
            <q-form>
              <q-input
                v-model="email"
                class="q-pb-none"
                filled
                clearable
                type="email"
                label="Introduce tu correo electrónico"
                error-message="La dirección de correo electrónico está incompleta"
                bottom-slots
                :error="!isValidEmailFormat && showValidationError"
              />
            </q-form>
          </q-card-section>
          <q-card-actions class="q-px-sm">
            <q-btn
              id="signInWithEmailSubmit"
              :disabled="!isValidEmailFormat"
              unelevated
              color="positive"
              size="lg"
              class="full-width"
              :class="{ 'q-mt-sm': !isValidEmailFormat && showValidationError }"
              label="Continuar"
              @click="signInWithEmail"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import { firebase, firebaseAuth } from '@/boot/firebase';

export default {
  data() {
    return {
      email: '',
      withEmailForm: false,
      // eslint-disable-next-line max-len
      EMAIL_REGEX: /^[a-zA-Z0-9.!#$%&''*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?){1,}$/,
      showValidationError: false
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
        this.showValidationError = true;
      }
    },
    /* eslint-disable no-undef */
    bindAuthUI() {
      if (typeof firebaseui !== 'undefined') {
        // firebaseuid already loaded
        this.loadSocialProviders();
      } else {
        // load firebaseuid dynamically
        const locale = this.$q.lang.getLocale();
        const firebaseLocale = locale.split('-')[0];
        const firebaseuiScript = document.createElement('script');
        firebaseuiScript.src = `https://www.gstatic.com/firebasejs/ui/4.4.0/firebase-ui-auth__${firebaseLocale}.js`;
        firebaseuiScript.onload = this.loadSocialProviders;
        document.head.appendChild(firebaseuiScript);
      }
    },
    loadSocialProviders() {
      window.firebase = firebase;
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
      window.firebase = undefined;
    }
  }
};
</script>
