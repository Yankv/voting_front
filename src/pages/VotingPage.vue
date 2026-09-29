<template>
  <q-page class="voter-page ballot-page">
    <div class="ballot-heading">
      <q-badge color="primary" label="BOLETA ELECTORAL" />
      <div class="row items-center justify-between q-mt-md">
        <div>
          <h1 class="text-h4 text-weight-bold q-mb-xs">Elige un candidato</h1>
          <p class="text-body1 text-grey-7 q-mb-none">
            Puedes seleccionar una sola opción. Revisa tu elección antes de confirmarla.
          </p>
        </div>
        <q-badge class="gt-xs" color="positive" icon="lock_open" label="Votación abierta" />
      </div>
    </div>

    <q-banner
      v-if="errorMessage"
      class="q-mb-lg"
      rounded
      :class="electionOpen === false ? 'bg-orange-1 text-orange-10' : 'bg-red-1 text-red-10'"
    >
      <template #avatar>
        <q-icon name="error_outline" />
      </template>
      {{ errorMessage }}
    </q-banner>

    <div class="candidate-list" role="radiogroup" aria-label="Candidatos disponibles">
      <q-card
        v-for="candidate in candidates"
        :key="candidate.id"
        flat
        bordered
        class="candidate-card"
        :class="{ 'candidate-card--selected': selectedCandidateId === candidate.id }"
        role="radio"
        :aria-checked="selectedCandidateId === candidate.id"
        tabindex="0"
        @click="selectCandidate(candidate.id)"
        @keydown.enter.prevent="selectCandidate(candidate.id)"
        @keydown.space.prevent="selectCandidate(candidate.id)"
      >
        <q-card-section class="row items-center no-wrap q-gutter-md">
          <q-avatar v-if="candidate.imageUrl" rounded size="68px" class="candidate-avatar">
            <img :src="candidate.imageUrl" :alt="`Imagen de ${candidate.name}`" />
          </q-avatar>
          <q-avatar v-else rounded color="blue-1" text-color="primary" size="68px">
            <q-icon name="person" size="34px" />
          </q-avatar>
          <div class="col">
            <div class="text-subtitle1 text-weight-bold">{{ candidate.name }}</div>
            <div class="text-body2 text-grey-7 q-mt-xs">
              Tarjetón N.° {{ candidate.ballotNumber }}
            </div>
          </div>
          <q-radio
            :model-value="selectedCandidateId"
            :val="candidate.id"
            color="primary"
            :aria-label="`Seleccionar a ${candidate.name}`"
            @update:model-value="selectCandidate"
          />
        </q-card-section>
      </q-card>
    </div>

    <div class="ballot-actions">
      <div class="text-body2 text-grey-7">
        <q-icon name="privacy_tip" color="positive" class="q-mr-xs" />
        Tu elección se registra de forma confidencial.
      </div>
      <q-btn
        unelevated
        color="primary"
        size="lg"
        no-caps
        label="Revisar mi elección"
        icon-right="arrow_forward"
        :disable="!selectedCandidate || electionOpen === false"
        @click="confirmationOpen = true"
      />
    </div>

    <q-dialog v-model="confirmationOpen" persistent>
      <q-card class="confirmation-card">
        <q-card-section class="row items-center q-gutter-md">
          <q-avatar color="orange-1" text-color="orange-9" size="52px">
            <q-icon name="how_to_vote" size="26px" />
          </q-avatar>
          <div class="col">
            <div class="text-h6 text-weight-bold">Confirma tu voto</div>
            <div class="text-body2 text-grey-7">Esta acción no se puede deshacer.</div>
          </div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <div class="text-body2 text-grey-7">Tu selección:</div>
          <div class="text-h6 text-weight-bold q-mt-xs">{{ selectedCandidate?.name }}</div>
          <q-banner class="bg-blue-1 text-blue-10 q-mt-md" rounded dense>
            Al confirmar, tu voto se registrará y finalizará esta sesión.
          </q-banner>
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn
            flat
            color="grey-8"
            label="Volver"
            no-caps
            :disable="submittingVote"
            @click="confirmationOpen = false"
          />
          <q-btn
            unelevated
            color="primary"
            label="Confirmar voto"
            no-caps
            :loading="submittingVote"
            @click="confirmVote"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useVotingStore } from '@/stores/voting.store'

const router = useRouter()
const votingStore = useVotingStore()
const confirmationOpen = ref(false)

const candidates = computed(() => votingStore.candidates)
const selectedCandidate = computed(() => votingStore.selectedCandidate)
const selectedCandidateId = computed(() => votingStore.selectedCandidateId)
const submittingVote = computed(() => votingStore.submittingVote)
const electionOpen = computed(() => votingStore.electionOpen)
const errorMessage = computed(() => votingStore.errorMessage)

function selectCandidate(candidateId) {
  votingStore.selectCandidate(candidateId)
}

async function confirmVote() {
  try {
    await votingStore.submitVote()
    confirmationOpen.value = false
    await router.replace({ name: 'vote-confirmation' })
  } catch {
    confirmationOpen.value = false
    if (!votingStore.voterToken) {
      await router.replace({ name: 'vote' })
    }
  }
}
</script>
