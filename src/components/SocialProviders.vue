<template>
  <div id="social-providers" />
</template>

<script>
import { firebase, firebaseAuth } from '@/boot/firebase';

export default {
  data() {
    return {
      isPendingRedirect: false
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
      this.isPendingRedirect = authUI.isPendingRedirect();
      authUI.start('#social-providers', {
        signInSuccessUrl: this.$route.query.signInSuccessUrl,
        signInOptions: [
          {
            provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
            scopes: [
              'https://www.googleapis.com/auth/user.gender.read'
              // PRIVATE SCOPES (Needs verification: https://support.google.com/cloud/answer/7454865)
              // 'https://www.googleapis.com/auth/profile.agerange.read',
              // 'https://www.googleapis.com/auth/contacts.readonly'
            ]
          }
          // firebase.auth.FacebookAuthProvider.PROVIDER_ID,
          // firebase.auth.TwitterAuthProvider.PROVIDER_ID
        ],
        callbacks: {
          signInSuccessWithAuthResult: this.$auth.socialSignInSuccess.bind(this.$auth)
        }
        // tosUrl: 'url',
        // privacyPolicyUrl: 'url'
      });
    }
  }
};
</script>
