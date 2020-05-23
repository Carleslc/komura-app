<template>
  <q-page class="hidden page-component">
    <q-form class="q-mt-md" @submit="registerWithEmail">
      <q-input
        ref="email"
        v-model="email"
        outlined
        type="email"
        :placeholder="$t('enterYourEmail')"
        lazy-rules
        :rules="[email => isValidEmail(email) || $t('emailInvalid')]"
        :class="{ filled: !!email, 'with-message': $refs.email && $refs.email.hasError }"
      >
        <template v-slot:prepend>
          <q-icon name="o_mail" />
        </template>
      </q-input>
      <q-btn
        color="primary"
        type="submit"
        :label="$t('createAccount')"
        :disabled="!isValidEmail(email)"
      />
    </q-form>
    <div class="row q-mt-md">
      <div class="row full-width justify-start text-md">
        <p v-t="'alreadyRegistered'" class="col-shrink q-pr-xs text" />
        <span v-t="'doLogin'" class="col-shrink text-button" @click="toggle" />
      </div>
    </div>
  </q-page>
</template>

<script>
import { isValidEmail } from '@/utils/validations';

export default {
  meta() {
    return {
      title: this.$t('register')
    };
  },
  props: {
    defaultEmail: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      email: this.defaultEmail
    };
  },
  methods: {
    isValidEmail,
    registerWithEmail() {
      this.$refs.email.validate();
      if (!this.$refs.email.hasError) {
        this.$router.push('/');
      }
    },
    toggle() {
      this.$router.push({
        name: 'login',
        params: { defaultEmail: !this.$refs.email.hasError ? this.email : '' }
      });
    }
  }
};
</script>
