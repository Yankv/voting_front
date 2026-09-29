import { api } from '@/services/api'

export class AdministrationServiceError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'AdministrationServiceError'
    this.status = status
  }
}

function readApiError(error, fallback) {
  return new AdministrationServiceError(
    error?.response?.data?.mensaje || fallback,
    error?.response?.status,
  )
}

function readElectionStatus(data) {
  if (!data || typeof data.abierta !== 'boolean') {
    throw new AdministrationServiceError('El servidor devolvió un estado de votación no válido.')
  }

  return {
    abierta: data.abierta,
    fechaApertura: data.fechaApertura ?? null,
    fechaCierre: data.fechaCierre ?? null,
  }
}

function requireAdminToken(token) {
  if (typeof token !== 'string' || token.trim() === '') {
    throw new AdministrationServiceError('La sesión administrativa ha finalizado.', 401)
  }
}

function adminConfig(token) {
  requireAdminToken(token)
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
}

export const administrationService = {
  async login(username, password) {
    try {
      const { data } = await api.post('/admin/login', { username, password })
      if (typeof data?.token !== 'string' || !data.token || typeof data.username !== 'string') {
        throw new AdministrationServiceError('El servidor devolvió una sesión no válida.')
      }

      return {
        token: data.token,
        username: data.username,
      }
    } catch (error) {
      if (error instanceof AdministrationServiceError) throw error
      throw readApiError(error, 'No fue posible iniciar sesión.')
    }
  },

  async getElectionStatus() {
    try {
      const { data } = await api.get('/votacion/estado')
      return readElectionStatus(data)
    } catch (error) {
      if (error instanceof AdministrationServiceError) throw error
      throw readApiError(error, 'No fue posible consultar el estado de la votación.')
    }
  },

  async openElection(token) {
    try {
      const { data } = await api.post('/admin/votacion/abrir', null, adminConfig(token))
      return readElectionStatus(data)
    } catch (error) {
      if (error instanceof AdministrationServiceError) throw error
      throw readApiError(error, 'No fue posible abrir la votación.')
    }
  },

  async closeElection(token) {
    try {
      const { data } = await api.post('/admin/votacion/cerrar', null, adminConfig(token))
      return readElectionStatus(data)
    } catch (error) {
      if (error instanceof AdministrationServiceError) throw error
      throw readApiError(error, 'No fue posible cerrar la votación.')
    }
  },

  async registerAdmin(token, username, password) {
    try {
      const { data } = await api.post(
        '/admin/registrar',
        { username, password },
        adminConfig(token),
      )
      if (
        (typeof data?.id !== 'number' && typeof data?.id !== 'string') ||
        typeof data?.username !== 'string' ||
        typeof data?.activo !== 'boolean'
      ) {
        throw new AdministrationServiceError(
          'El servidor devolvió los datos del administrador incompletos.',
        )
      }

      return data
    } catch (error) {
      if (error instanceof AdministrationServiceError) throw error
      throw readApiError(error, 'No fue posible registrar el administrador.')
    }
  },
}
