<template>
  <q-page class="page-component">
    <q-form class="q-mt-md" @submit="signInWithEmail">
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
        :disabled="!isValidEmail(email) || password.length < 8"
        color="primary"
        label="Iniciar sesión"
        type="submit"
      />
    </q-form>
    <div class="row q-mt-md">
      <div class="row full-width justify-start text-md">
        <p class="col-shrink q-pr-xs q-mb-none text-dark">
          ¿No tienes cuenta todavía?
        </p>
        <span class="col-shrink text-button" @click="toggle">
          Regístrate
        </span>
      </div>
    </div>
  </q-page>
</template>

<script>
import { isValidEmail } from '@/utils/validations';

export default {
  meta: {
    title: 'Iniciar sesión'
  },
  props: {
    email: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      password: '',
      showPassword: false
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
      this.$router.push({ name: 'register', params: { email: !this.$refs.email.hasError ? this.email : '' } });
    }
  }
};
</script>
