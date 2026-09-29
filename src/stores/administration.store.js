import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  AdministrationServiceError,
  administrationService,
} from '@/services/administration.service'
import { useAuthStore } from '@/stores/auth.store'

function errorMessage(error, fallback) {
  return error instanceof AdministrationServiceError ? error.message : fallback
}

export const useAdministrationStore = defineStore('administration', () => {
  const authStore = useAuthStore()
  const electionStatus = ref(null)
  const loadingStatus = ref(false)
  const processingAction = ref(false)
  const registeringAdmin = ref(false)
  const loggingIn = ref(false)
  const error = ref('')
  const notice = ref('')

  function clearFeedback() {
    error.value = ''
    notice.value = ''
  }

  function handleError(errorValue, fallback) {
    error.value = errorMessage(errorValue, fallback)
    if (
      errorValue instanceof AdministrationServiceError &&
      [401, 403].includes(errorValue.status)
    ) {
      authStore.clearAdminSession()
    }
  }

  async function login(username, password) {
    if (loggingIn.value) return

    loggingIn.value = true
    clearFeedback()
    try {
      return await administrationService.login(username, password)
    } catch (requestError) {
      handleError(requestError, 'No fue posible iniciar sesión.')
      throw requestError
    } finally {
      loggingIn.value = false
    }
  }

  async function loadElectionStatus() {
    loadingStatus.value = true
    clearFeedback()
    try {
      electionStatus.value = await administrationService.getElectionStatus()
      return electionStatus.value
    } catch (requestError) {
      handleError(requestError, 'No fue posible consultar el estado de la votación.')
      throw requestError
    } finally {
      loadingStatus.value = false
    }
  }

  async function setElectionOpen(shouldOpen) {
    if (processingAction.value) return

    processingAction.value = true
    clearFeedback()
    try {
      electionStatus.value = shouldOpen
        ? await administrationService.openElection(authStore.adminToken)
        : await administrationService.closeElection(authStore.adminToken)
      notice.value = shouldOpen
        ? 'La votación se abrió correctamente.'
        : 'La votación se cerró correctamente.'
      return electionStatus.value
    } catch (requestError) {
      handleError(
        requestError,
        shouldOpen ? 'No fue posible abrir la votación.' : 'No fue posible cerrar la votación.',
      )
      throw requestError
    } finally {
      processingAction.value = false
    }
  }

  async function registerAdmin(username, password) {
    if (registeringAdmin.value) return

    registeringAdmin.value = true
    clearFeedback()
    try {
      const registeredAdmin = await administrationService.registerAdmin(
        authStore.adminToken,
        username,
        password,
      )
      notice.value = `El administrador ${registeredAdmin.username} se registró correctamente.`
      return registeredAdmin
    } catch (requestError) {
      handleError(requestError, 'No fue posible registrar el administrador.')
      throw requestError
    } finally {
      registeringAdmin.value = false
    }
  }

  function clearFeedbackMessages() {
    clearFeedback()
  }

  return {
    electionStatus,
    loadingStatus,
    processingAction,
    registeringAdmin,
    loggingIn,
    error,
    notice,
    login,
    loadElectionStatus,
    setElectionOpen,
    registerAdmin,
    clearFeedbackMessages,
  }
})
