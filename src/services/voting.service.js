import { api } from '@/services/api'

const API_ERROR_MESSAGES = {
  400: 'Los datos enviados no son válidos.',
  401: 'La autorización venció. Vuelve a validar tu identidad.',
  403: 'No fue posible autorizar esta operación. Vuelve a validar tu identidad.',
  404: 'No se encontró el recurso solicitado.',
  409: 'La votación está cerrada o esta cédula ya registró su voto.',
}

export class VotingServiceError extends Error {
  constructor(message, options = {}) {
    super(message)
    this.name = 'VotingServiceError'
    this.code = options.code
    this.status = options.status
  }
}

function getResponseData(response) {
  return response?.data
}

function getApiError(error, fallback) {
  const status = error?.response?.status
  const message = error?.response?.data?.mensaje || API_ERROR_MESSAGES[status] || fallback

  return new VotingServiceError(message, {
    code: error?.code,
    status,
  })
}

function readElectionStatus(data) {
  if (!data || typeof data.abierta !== 'boolean') {
    throw new VotingServiceError('El servidor devolvió un estado de votación no válido.')
  }

  return {
    abierta: data.abierta,
    fechaApertura: data.fechaApertura ?? null,
    fechaCierre: data.fechaCierre ?? null,
  }
}

function readVoterValidation(data) {
  if (!data || typeof data.habilitadoParaVotar !== 'boolean') {
    throw new VotingServiceError('El servidor devolvió una respuesta de validación no válida.')
  }

  const message = typeof data.mensaje === 'string' ? data.mensaje : ''
  if (!data.habilitadoParaVotar) {
    throw new VotingServiceError(message || 'Esta cédula no está habilitada para votar.')
  }

  if (typeof data.token !== 'string' || data.token.trim() === '') {
    throw new VotingServiceError('No se recibió la autorización para continuar con el voto.')
  }

  return {
    token: data.token,
    mensaje: message,
  }
}

function readCandidates(data) {
  if (!Array.isArray(data)) {
    throw new VotingServiceError('La lista de candidatos recibida no tiene un formato válido.')
  }

  return data.map((candidate, index) => {
    if (
      (typeof candidate?.id !== 'number' && typeof candidate?.id !== 'string') ||
      typeof candidate?.primerNombre !== 'string' || 
      typeof candidate?.primerApellido !== 'string' ||
      typeof candidate?.numeroTarjeton !== 'number'
    ) {
      throw new VotingServiceError(`No se pudo interpretar el candidato ${index + 1}.`)
    }

    return {
      id: candidate.id,
      name: candidate.primerNombre + (candidate.segundoNombre ? ` ${candidate.segundoNombre}` : '') + ' ' + candidate.primerApellido + (candidate.segundoApellido ? ` ${candidate.segundoApellido}` : ''),
      ballotNumber: candidate.numeroTarjeton,
      imageUrl: candidate.fotoUrl ?? '',
    }
  })
}

export const votingService = {
  async getElectionStatus() {
    try {
      const response = await api.get('/votacion/estado')
      console.log(response.data)
      return readElectionStatus(getResponseData(response))
    } catch (error) {
      if (error instanceof VotingServiceError) {
        throw error
      }
      throw getApiError(error, 'No fue posible consultar el estado de la votación.')
    }
  },

  async validateVoterId(cedula) {
    try {
      const response = await api.post('/votantes/validar-cedula', { cedula })
      return readVoterValidation(getResponseData(response))
    } catch (error) {
      if (error instanceof VotingServiceError) {
        throw error
      }
      throw getApiError(error, 'No fue posible validar la cédula.')
    }
  },

  async getCandidates() {
    try {
      const response = await api.get('/votantes/candidatos')
      return readCandidates(getResponseData(response))
    } catch (error) {
      if (error instanceof VotingServiceError) {
        throw error
      }
      throw getApiError(error, 'No fue posible cargar los candidatos.')
    }
  },

  async submitVote(candidateId, voterToken) {
    try {
      const response = await api.post(
        '/votantes/voto',
        { candidatoId: candidateId },
        {
          headers: {
            Authorization: `Bearer ${voterToken}`,
          },
        },
      )
      const data = getResponseData(response)
      if (data?.exitoso !== true) {
        throw new VotingServiceError(
          data?.mensaje || 'El servidor no confirmó el registro del voto.',
        )
      }

      return { mensaje: data.mensaje || 'Voto registrado correctamente.' }
    } catch (error) {
      if (error instanceof VotingServiceError) {
        throw error
      }
      throw getApiError(error, 'No fue posible registrar el voto. Inténtalo de nuevo.')
    }
  },
}
