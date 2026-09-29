<template>
  <q-page class="voter-page confirmation-page">
    <q-card flat bordered class="confirmation-result">
      <q-card-section class="column items-center text-center q-pa-xl">
        <q-avatar color="green-1" text-color="positive" size="84px">
          <q-icon name="check_circle" size="54px" />
        </q-avatar>
        <q-badge class="q-mt-lg" color="positive" label="VOTO REGISTRADO" />
        <h1 class="text-h4 text-weight-bold q-mt-md q-mb-sm">¡Gracias por participar!</h1>
        <p class="text-body1 text-grey-7 q-mb-none">
          {{ confirmationMessage }} La sesión de votación ha finalizado.
        </p>
        <q-banner class="bg-blue-1 text-blue-10 q-mt-lg text-left" rounded>
          <template #avatar>
            <q-icon name="privacy_tip" color="primary" />
          </template>
          La confirmación no contiene información que vincule tu identidad con tu elección.
        </q-banner>
        <div class="row justify-center q-gutter-sm q-mt-lg">
          <q-btn unelevated color="primary" label="Volver al inicio" to="/" no-caps />
          <q-btn outline color="primary" label="Ver resultados" to="/dashboard" no-caps />
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { computed } from 'vue'
import { useVotingStore } from '@/stores/voting.store'

const votingStore = useVotingStore()
const confirmationMessage = computed(
  () => votingStore.voteConfirmationMessage || 'Tu voto fue recibido correctamente.',
)
</script>
