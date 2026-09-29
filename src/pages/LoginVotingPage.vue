<template>
  <q-page class="voter-page">
    <div class="voter-intro">
      <q-badge color="primary" label="VOTACIÓN NEOSAGE" />
      <h1 class="text-h3 text-weight-bold q-mt-md q-mb-sm">Tu participación importa.</h1>
      <p class="text-body1 text-grey-7 q-mb-none">
        Valida tu identidad para continuar. Tu cédula no se vincula públicamente con tu elección.
      </p>
    </div>

    <q-card flat bordered class="voter-card">
      <q-card-section class="q-pa-lg">
        <div class="row items-center justify-between q-mb-lg">
          <div class="text-h6 text-weight-bold">Ingreso de votante</div>
          <q-badge
            :color="statusColor"
            :label="statusLabel"
            :icon="electionOpen ? 'lock_open' : 'lock'"
          />
        </div>

        <q-banner
          v-if="errorMessage"
          class="q-mb-md"
          rounded
          dense
          :class="electionOpen === false ? 'bg-orange-1 text-orange-10' : 'bg-red-1 text-red-10'"
        >
          <template #avatar>
            <q-icon :name="electionOpen === false ? 'info' : 'error_outline'" />
          </template>
          {{ errorMessage }}
          <template #action>
            <q-btn flat dense icon="close" aria-label="Cerrar aviso" @click="clearError" />
          </template>
        </q-banner>

        <q-form class="q-gutter-md" @submit.prevent="submit">
          <q-input
            v-model="cedula"
            outlined
            autofocus
            label="Número de cédula"
            placeholder="Ingresa tu número de identificación"
            autocomplete="off"
            inputmode="numeric"
            maxlength="30"
            :disable="validatingVoter"
            :rules="[
              (value) => Boolean(value?.trim()) || 'Ingresa tu número de cédula.',
              (value) =>
                (value?.trim().length ?? 0) <= 30 || 'El número no puede superar 30 caracteres.',
            ]"
          >
            <template #prepend>
              <q-icon name="badge" color="primary" />
            </template>
          </q-input>

          <q-btn
            type="submit"
            class="full-width"
            color="primary"
            unelevated
            size="lg"
            no-caps
            icon-right="arrow_forward"
            label="Validar y continuar"
            :loading="validatingVoter"
            :disable="loadingStatus || electionOpen !== true"
          />
        </q-form>

        <div v-if="loadingStatus" class="row items-center justify-center q-gutter-sm q-mt-md">
          <q-spinner color="primary" size="20px" />
          <span class="text-caption text-grey-7">Consultando el estado de la votación</span>
        </div>

        <q-btn
          v-else
          class="q-mt-sm"
          flat
          color="primary"
          icon="refresh"
          label="Actualizar estado"
          no-caps
          @click="refreshStatus"
        />
      </q-card-section>
      <q-separator />
      <q-card-section class="privacy-note">
        <q-icon name="privacy_tip" color="positive" size="20px" />
        <span
          >La autorización de votante se conserva solo durante esta sesión y nunca se guarda en el
          navegador.</span
        >
      </q-card-section>
    </q-card>

    <div class="row items-center justify-center q-gutter-xs q-mt-lg text-caption text-grey-7">
      <q-icon name="verified_user" color="positive" />
      <span>Una cédula = un voto</span>
      <span class="q-mx-sm">·</span>
      <router-link class="text-primary" to="/dashboard">Consultar resultados</router-link>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useVotingStore } from '@/stores/voting.store'

const router = useRouter()
const votingStore = useVotingStore()
const cedula = ref('')

const electionOpen = computed(() => votingStore.electionOpen)
const loadingStatus = computed(() => votingStore.loadingStatus)
const validatingVoter = computed(() => votingStore.validatingVoter)
const errorMessage = computed(() => votingStore.errorMessage)
const statusColor = computed(() => {
  if (loadingStatus.value || electionOpen.value === null) return 'grey-7'
  return electionOpen.value ? 'positive' : 'negative'
})
const statusLabel = computed(() => {
  if (loadingStatus.value) return 'Consultando estado'
  if (electionOpen.value === null) return 'Estado no disponible'
  return electionOpen.value ? 'Votación abierta' : 'Votación cerrada'
})

async function refreshStatus() {
  try {
    await votingStore.refreshElectionStatus()
  } catch {
    // The store exposes a safe, voter-facing error message.
  }
}

function clearError() {
  votingStore.clearError()
}

async function submit() {
  votingStore.clearError()
  try {
    await votingStore.beginVoting(cedula.value.trim())
    cedula.value = ''
    await router.push({ name: 'voting-ballot' })
  } catch {
    cedula.value = ''
  }
}

onMounted(refreshStatus)
</script>
