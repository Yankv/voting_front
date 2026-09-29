<template>
  <q-page class="admin-page">
    <div class="admin-content">
      <div class="admin-heading">
        <q-badge color="primary" label="PANEL DE CONTROL" />
        <div class="row items-center justify-between q-mt-md">
          <div>
            <h1 class="text-h4 text-weight-bold q-mb-xs">Administración electoral</h1>
            <p class="text-body1 text-grey-7 q-mb-none">
              Gestiona el estado de la jornada y las cuentas administrativas.
            </p>
          </div>
          <q-btn
            outline
            color="grey-8"
            icon="logout"
            label="Cerrar sesión"
            no-caps
            class="gt-xs"
            @click="logout"
          />
        </div>
        <div class="text-caption text-grey-7 q-mt-md">
          Sesión: <strong>{{ authStore.adminUsername }}</strong>
        </div>
      </div>

      <q-banner v-if="store.error" rounded class="bg-red-1 text-red-10 q-mb-md">
        <template #avatar>
          <q-icon name="error_outline" />
        </template>
        {{ store.error }}
      </q-banner>
      <q-banner v-if="store.notice" rounded class="bg-green-1 text-green-10 q-mb-md">
        <template #avatar>
          <q-icon name="check_circle" />
        </template>
        {{ store.notice }}
      </q-banner>

      <div class="admin-grid">
        <q-card flat bordered class="admin-card election-card">
          <q-card-section class="row items-center justify-between">
            <div>
              <div class="text-overline text-grey-7">ESTADO DE LA JORNADA</div>
              <div class="text-h6 text-weight-bold">Control de votación</div>
            </div>
            <q-badge
              v-if="electionStatus"
              :color="electionStatus.abierta ? 'positive' : 'negative'"
              :icon="electionStatus.abierta ? 'lock_open' : 'lock'"
              :label="electionStatus.abierta ? 'Abierta' : 'Cerrada'"
            />
            <q-badge v-else color="grey-7" label="Sin datos" />
          </q-card-section>
          <q-separator />
          <q-card-section>
            <div v-if="loadingStatus" class="column q-gutter-md">
              <q-skeleton type="text" width="45%" />
              <q-skeleton type="text" width="60%" />
              <q-skeleton type="text" width="55%" />
            </div>
            <template v-else-if="electionStatus">
              <div class="status-datetime">
                <q-icon name="event_available" color="primary" />
                <span>Apertura</span>
                <strong>{{ formatDate(electionStatus.fechaApertura) }}</strong>
              </div>
              <div class="status-datetime q-mt-md">
                <q-icon name="event_busy" color="grey-7" />
                <span>Cierre</span>
                <strong>{{ formatDate(electionStatus.fechaCierre) }}</strong>
              </div>
            </template>
            <div v-else class="text-body2 text-grey-7">No se pudo cargar el estado actual.</div>

            <div class="row q-gutter-sm q-mt-lg">
              <q-btn
                v-if="!electionStatus?.abierta"
                unelevated
                color="positive"
                icon="lock_open"
                label="Abrir votación"
                no-caps
                :loading="store.processingAction"
                :disable="loadingStatus"
                @click="requestElectionChange(true)"
              />
              <q-btn
                v-else
                unelevated
                color="negative"
                icon="lock"
                label="Cerrar votación"
                no-caps
                :loading="store.processingAction"
                :disable="loadingStatus"
                @click="requestElectionChange(false)"
              />
              <q-btn
                flat
                color="primary"
                icon="refresh"
                label="Actualizar"
                no-caps
                :loading="loadingStatus"
                @click="loadStatus"
              />
            </div>
          </q-card-section>
        </q-card>

        <q-card flat bordered class="admin-card registration-card">
          <q-card-section>
            <div class="text-overline text-grey-7">GESTIÓN DE ACCESO</div>
            <div class="text-h6 text-weight-bold">Registrar administrador</div>
            <p class="text-body2 text-grey-7 q-mt-sm q-mb-none">
              Crea una cuenta nueva. La contraseña se enviará al servidor para que sea almacenada de
              forma segura.
            </p>
          </q-card-section>
          <q-separator />
          <q-card-section>
            <q-form class="q-gutter-md" @submit.prevent="registerAdmin">
              <q-input
                v-model="newUsername"
                outlined
                autocomplete="off"
                label="Nombre de usuario"
                hint="Entre 4 y 50 caracteres"
                maxlength="50"
                :disable="store.registeringAdmin"
                :rules="[
                  (value) => Boolean(value?.trim()) || 'Ingresa un nombre de usuario.',
                  (value) =>
                    (value?.trim().length ?? 0) >= 4 || 'Debe tener al menos 4 caracteres.',
                  (value) => (value?.trim().length ?? 0) <= 50 || 'No puede superar 50 caracteres.',
                ]"
              >
                <template #prepend>
                  <q-icon name="person_add" color="primary" />
                </template>
              </q-input>
              <q-input
                v-model="newPassword"
                outlined
                autocomplete="new-password"
                label="Contraseña temporal"
                hint="Mínimo 8 caracteres"
                :type="showNewPassword ? 'text' : 'password'"
                :disable="store.registeringAdmin"
                :rules="[
                  (value) => Boolean(value) || 'Ingresa una contraseña.',
                  (value) =>
                    (value?.length ?? 0) >= 8 || 'La contraseña debe tener al menos 8 caracteres.',
                ]"
              >
                <template #prepend>
                  <q-icon name="lock" color="primary" />
                </template>
                <template #append>
                  <q-btn
                    flat
                    round
                    dense
                    :icon="showNewPassword ? 'visibility_off' : 'visibility'"
                    :aria-label="showNewPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                    @click="showNewPassword = !showNewPassword"
                  />
                </template>
              </q-input>
              <q-btn
                type="submit"
                unelevated
                color="primary"
                icon="person_add"
                label="Registrar cuenta"
                no-caps
                :loading="store.registeringAdmin"
              />
            </q-form>
          </q-card-section>
        </q-card>
      </div>

      <q-btn
        class="lt-sm full-width q-mt-md"
        outline
        color="grey-8"
        icon="logout"
        label="Cerrar sesión"
        no-caps
        @click="logout"
      />
    </div>

    <q-dialog v-model="confirmDialog">
      <q-card class="confirmation-card">
        <q-card-section class="row items-center q-gutter-md">
          <q-avatar
            :color="confirmOpen ? 'green-1' : 'red-1'"
            :text-color="confirmOpen ? 'positive' : 'negative'"
          >
            <q-icon :name="confirmOpen ? 'lock_open' : 'lock'" />
          </q-avatar>
          <div class="col">
            <div class="text-h6 text-weight-bold">
              {{ confirmOpen ? 'Abrir la votación' : 'Cerrar la votación' }}
            </div>
            <div class="text-body2 text-grey-7">
              {{
                confirmOpen
                  ? 'Los votantes podrán emitir su voto.'
                  : 'Los votantes ya no podrán votar.'
              }}
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" no-caps v-close-popup />
          <q-btn
            unelevated
            :color="confirmOpen ? 'positive' : 'negative'"
            :label="confirmOpen ? 'Sí, abrir' : 'Sí, cerrar'"
            no-caps
            :loading="store.processingAction"
            @click="confirmElectionChange"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAdministrationStore } from '@/stores/administration.store'
import { useAuthStore } from '@/stores/auth.store'

const router = useRouter()
const store = useAdministrationStore()
const authStore = useAuthStore()
const newUsername = ref('')
const newPassword = ref('')
const showNewPassword = ref(false)
const confirmDialog = ref(false)
const confirmOpen = ref(false)

const electionStatus = computed(() => store.electionStatus)
const loadingStatus = computed(() => store.loadingStatus)

function formatDate(value) {
  if (!value) return 'Sin registro'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Fecha no disponible'
  return new Intl.DateTimeFormat('es', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

async function loadStatus() {
  try {
    await store.loadElectionStatus()
  } catch {
    if (!authStore.adminToken) await logout()
  }
}

function requestElectionChange(shouldOpen) {
  confirmOpen.value = shouldOpen
  confirmDialog.value = true
}

async function confirmElectionChange() {
  try {
    await store.setElectionOpen(confirmOpen.value)
    confirmDialog.value = false
  } catch {
    if (!authStore.adminToken) await logout()
  }
}

async function registerAdmin() {
  try {
    await store.registerAdmin(newUsername.value.trim(), newPassword.value)
    newUsername.value = ''
    newPassword.value = ''
  } catch {
    if (!authStore.adminToken) await logout()
  }
}

async function logout() {
  authStore.clearAdminSession()
  await router.replace({ name: 'admin-login' })
}

watch(
  () => authStore.adminToken,
  (token) => {
    if (!token) router.replace({ name: 'admin-login' })
  },
)

onMounted(loadStatus)
</script>
