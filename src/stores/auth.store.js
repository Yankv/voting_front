import { defineStore } from 'pinia'
import { ref } from 'vue'

const ADMIN_TOKEN_KEY = 'neosage.adminToken'

export const useAuthStore = defineStore('auth', () => {
  const adminToken = ref(
    typeof window !== 'undefined' ? window.sessionStorage.getItem(ADMIN_TOKEN_KEY) : null,
  )

  function setAdminToken(token) {
    if (!token) {
      throw new Error('El token de administrador no puede estar vacío.')
    }

    adminToken.value = token
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(ADMIN_TOKEN_KEY, token)
    }
  }

  function clearAdminSession() {
    adminToken.value = null
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(ADMIN_TOKEN_KEY)
    }
  }

  return {
    adminToken,
    setAdminToken,
    clearAdminSession,
  }
})
