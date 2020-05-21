<template>
  <q-page class="hidden page-component">
    <q-form class="q-mt-md" @submit="signInWithEmail">
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
      <q-input
        ref="password"
        v-model="password"
        outlined
        :type="showPassword ? 'text' : 'password'"
        :placeholder="$t('enterYourPassword')"
        :hint="!!password && password.length < 8 ? $t('invalidPassword') : ''"
        lazy-rules
        :rules="[
          password => !!password || $t('enterPassword'),
          password => password.length >= 8 || $t('invalidPassword')
        ]"
        :class="{
          filled: !!password,
          'with-message':
            ($refs.password && $refs.password.hasError) || (!!password && password.length < 8)
        }"
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
        :disabled="!isValidEmail(email) || password.length < 8"
        color="primary"
        :label="$t('login')"
        type="submit"
      />
    </q-form>
    <div class="row q-mt-md">
      <div class="row full-width justify-start text-md">
        <p class="col-shrink q-pr-xs text">
          {{ $t('notRegistered') }}
        </p>
        <span class="col-shrink text-button" @click="toggle">
          {{ $t('doRegister') }}
        </span>
      </div>
    </div>
  </q-page>
</template>

<script>
import { isValidEmail } from '@/utils/validations';

export default {
  meta() {
    return {
      title: this.$t('login'),
      validated: false
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
      password: '',
      showPassword: false,
      email: this.defaultEmail
    };
  },
  methods: {
    isValidEmail,
    signInWithEmail() {
      this.$refs.email.validate();
      this.$refs.password.validate();

      if (!this.$refs.email.hasError && !this.$refs.password.hasError) {
        this.$router.push('/');
      }
    },
    toggle() {
      this.$router.push({
        name: 'register',
        params: { defaultEmail: !this.$refs.email.hasError ? this.email : '' }
      });
    }
  }
};
</script>
