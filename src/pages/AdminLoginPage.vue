<template>
  <q-page class="admin-page">
    <q-card flat bordered class="admin-login-card">
      <q-card-section class="q-pa-lg">
        <q-badge color="primary" label="NEOSAGE · ADMINISTRACIÓN" />
        <h1 class="text-h4 text-weight-bold q-mt-md q-mb-sm">Ingreso administrativo</h1>
        <p class="text-body2 text-grey-7 q-mb-lg">
          Accede con tus credenciales autorizadas para administrar la jornada electoral.
        </p>

        <q-banner v-if="errorMessage" rounded class="bg-red-1 text-red-10 q-mb-md">
          <template #avatar>
            <q-icon name="error_outline" />
          </template>
          {{ errorMessage }}
        </q-banner>

        <q-form class="q-gutter-md" @submit.prevent="submitLogin">
          <q-input
            v-model="username"
            outlined
            autofocus
            autocomplete="username"
            label="Nombre de usuario"
            maxlength="50"
            :disable="loading"
            :rules="[
              (value) => Boolean(value?.trim()) || 'Ingresa tu nombre de usuario.',
              (value) => value.trim().length >= 4 || 'El usuario debe tener al menos 4 caracteres.',
            ]"
          >
            <template #prepend>
              <q-icon name="person" color="primary" />
            </template>
          </q-input>

          <q-input
            v-model="password"
            outlined
            autocomplete="current-password"
            label="Contraseña"
            :type="showPassword ? 'text' : 'password'"
            :disable="loading"
            :rules="[(value) => Boolean(value) || 'Ingresa tu contraseña.']"
          >
            <template #prepend>
              <q-icon name="lock" color="primary" />
            </template>
            <template #append>
              <q-btn
                flat
                round
                dense
                :icon="showPassword ? 'visibility_off' : 'visibility'"
                :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                @click="showPassword = !showPassword"
              />
            </template>
          </q-input>

          <q-btn
            type="submit"
            class="full-width"
            unelevated
            color="primary"
            size="lg"
            no-caps
            icon-right="login"
            label="Iniciar sesión"
            :loading="loading"
          />
        </q-form>
      </q-card-section>
      <q-separator />
      <q-card-section class="row items-center text-caption text-grey-7 q-gutter-sm">
        <q-icon name="verified_user" color="positive" />
        <span>La sesión administrativa se guarda solo en esta pestaña.</span>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAdministrationStore } from '@/stores/administration.store'
import { useAuthStore } from '@/stores/auth.store'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const administrationStore = useAdministrationStore()
const username = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = computed(() => administrationStore.loggingIn)
const errorMessage = computed(() => administrationStore.error)

const safeRedirect = computed(() => {
  const redirect = route.query.redirect
  return typeof redirect === 'string' && (redirect === '/admin' || redirect.startsWith('/admin/'))
    ? redirect
    : '/admin'
})

async function submitLogin() {
  administrationStore.clearFeedbackMessages()
  try {
    const session = await administrationStore.login(username.value.trim(), password.value)
    authStore.setAdminSession(session)
    password.value = ''
    await router.replace(safeRedirect.value)
  } catch {
    // The store exposes the API error in the login form.
  }
}
</script>
