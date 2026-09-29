import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { VotingServiceError, votingService } from '@/services/voting.service'

function messageFor(error, fallback) {
  if (error instanceof VotingServiceError) {
    return error.message
  }

  return fallback
}

export const useVotingStore = defineStore('voting', () => {
  const electionOpen = ref(null)
  const electionStatus = ref(null)
  const candidates = ref([])
  const selectedCandidateId = ref(null)
  const voterToken = ref(null)
  const voteRegistered = ref(false)
  const voteConfirmationMessage = ref('')
  const loadingStatus = ref(false)
  const validatingVoter = ref(false)
  const submittingVote = ref(false)
  const errorMessage = ref('')

  const selectedCandidate = computed(
    () => candidates.value.find((candidate) => candidate.id === selectedCandidateId.value) ?? null,
  )

  async function refreshElectionStatus() {
    loadingStatus.value = true
    electionOpen.value = null
    errorMessage.value = ''

    try {
      const status = await votingService.getElectionStatus()
      electionStatus.value = status
      electionOpen.value = status.abierta
      return status.abierta
    } catch (error) {
      electionStatus.value = null
      errorMessage.value = messageFor(error, 'No fue posible consultar el estado de la votación.')
      throw error
    } finally {
      loadingStatus.value = false
    }
  }

  async function beginVoting(cedula) {
    validatingVoter.value = true
    errorMessage.value = ''
    voterToken.value = null
    candidates.value = []
    selectedCandidateId.value = null
    voteRegistered.value = false

    try {
      const isOpen = await refreshElectionStatus()
      if (!isOpen) {
        throw new VotingServiceError('La votación está cerrada.')
      }

      const validation = await votingService.validateVoterId(cedula)
      const availableCandidates = await votingService.getCandidates()

      if (availableCandidates.length === 0) {
        throw new VotingServiceError('No hay candidatos disponibles para esta votación.')
      }

      voterToken.value = validation.token
      candidates.value = availableCandidates
      return true
    } catch (error) {
      errorMessage.value = messageFor(error, 'No fue posible iniciar el proceso de votación.')
      throw error
    } finally {
      validatingVoter.value = false
    }
  }

  function selectCandidate(candidateId) {
    if (!voterToken.value) {
      throw new Error('La sesión de votación no está activa.')
    }
    if (!candidates.value.some((candidate) => candidate.id === candidateId)) {
      throw new Error('El candidato seleccionado no está disponible.')
    }

    selectedCandidateId.value = candidateId
    errorMessage.value = ''
  }

  async function submitVote() {
    if (submittingVote.value || voteRegistered.value) {
      return
    }
    if (!voterToken.value) {
      throw new VotingServiceError('La sesión venció. Vuelve a validar tu identidad.')
    }
    if (!selectedCandidate.value) {
      throw new VotingServiceError('Selecciona un candidato antes de confirmar el voto.')
    }

    submittingVote.value = true
    errorMessage.value = ''

    try {
      const electionStatusResponse = await votingService.getElectionStatus()
      electionStatus.value = electionStatusResponse
      electionOpen.value = electionStatusResponse.abierta
      if (!electionStatusResponse.abierta) {
        throw new VotingServiceError('La votación está cerrada.')
      }

      const result = await votingService.submitVote(selectedCandidateId.value, voterToken.value)
      voterToken.value = null
      candidates.value = []
      selectedCandidateId.value = null
      voteRegistered.value = true
      voteConfirmationMessage.value = result.mensaje
    } catch (error) {
      errorMessage.value = messageFor(error, 'No fue posible registrar el voto.')
      if (error instanceof VotingServiceError && [401, 403, 409].includes(error.status)) {
        voterToken.value = null
        candidates.value = []
        selectedCandidateId.value = null
      }
      throw error
    } finally {
      submittingVote.value = false
    }
  }

  function clearError() {
    errorMessage.value = ''
  }

  function endVotingSession() {
    voterToken.value = null
    candidates.value = []
    selectedCandidateId.value = null
    voteRegistered.value = false
    voteConfirmationMessage.value = ''
    errorMessage.value = ''
  }

  return {
    electionOpen,
    electionStatus,
    candidates,
    selectedCandidateId,
    selectedCandidate,
    voterToken,
    voteRegistered,
    voteConfirmationMessage,
    loadingStatus,
    validatingVoter,
    submittingVote,
    errorMessage,
    refreshElectionStatus,
    beginVoting,
    selectCandidate,
    submitVote,
    clearError,
    endVotingSession,
  }
})
