<template>
  <q-page class="page-component">
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
      <q-btn :disabled="!isValidEmail(email)" color="primary" label="Crear cuenta" @click="registerWithEmail" />
    </q-form>
    <div class="row q-mt-md">
      <div class="row full-width justify-start text-md">
        <p class="col-shrink q-pr-xs q-mb-none text-dark">
          ¿Ya tienes una cuenta?
        </p>
        <span class="col-shrink text-button" @click="$router.push('/login')">
          Inicia sesión
        </span>
      </div>
    </div>
  </q-page>
</template>

<script>
import { isValidEmail } from '@/utils/validations';

export default {
  meta: {
    title: 'Registrarse'
  },
  data() {
    return {
      email: ''
    };
  },
  methods: {
    isValidEmail,
    registerWithEmail() {
      this.$refs.email.validate();
      if (!this.$refs.email.hasError) {
        this.$router.push('/');
      }
    }
  }
};
</script>
