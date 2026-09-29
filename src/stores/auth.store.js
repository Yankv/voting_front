import { defineStore } from 'pinia'
import { ref } from 'vue'

const ADMIN_TOKEN_KEY = 'neosage.adminToken'
const ADMIN_USERNAME_KEY = 'neosage.adminUsername'

export const useAuthStore = defineStore('auth', () => {
  const adminToken = ref(
    typeof window !== 'undefined' ? window.sessionStorage.getItem(ADMIN_TOKEN_KEY) : null,
  )
  const adminUsername = ref(
    typeof window !== 'undefined' ? window.sessionStorage.getItem(ADMIN_USERNAME_KEY) : null,
  )

  function setAdminSession({ token, username }) {
    if (!token || !username) {
      throw new Error('La sesión requiere un token y un usuario de administrador.')
    }

    adminToken.value = token
    adminUsername.value = username
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(ADMIN_TOKEN_KEY, token)
      window.sessionStorage.setItem(ADMIN_USERNAME_KEY, username)
    }
  }

  function clearAdminSession() {
    adminToken.value = null
    adminUsername.value = null
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(ADMIN_TOKEN_KEY)
      window.sessionStorage.removeItem(ADMIN_USERNAME_KEY)
    }
  }

  return {
    adminToken,
    adminUsername,
    setAdminSession,
    clearAdminSession,
  }
})
