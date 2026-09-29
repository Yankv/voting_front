import { api } from '@/services/api'

export class DashboardServiceError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'DashboardServiceError'
    this.status = status
  }
}

function candidateName(candidate) {
  const parts = [
    candidate.primerNombre,
    candidate.segundoNombre,
    candidate.primerApellido,
    candidate.segundoApellido,
  ]
    .filter((part) => typeof part === 'string' && part.trim())
    .map((part) => part.trim())

  return parts.join(' ')
}

function normalizeCandidate(candidate, index) {
  const id = candidate?.candidatoId
  const name = candidateName(candidate ?? {})
  if ((typeof id !== 'number' && typeof id !== 'string') || !name) {
    throw new DashboardServiceError(`No se pudo interpretar el candidato ${index + 1}.`)
  }

  return {
    id,
    name,
    ballotNumber: Number(candidate.numeroTarjeton) || 0,
    imageUrl: candidate.fotoUrl ?? '',
    totalVotes: Number(candidate.totalVotos) || 0,
    percentage: Number(candidate.porcentaje) || 0,
    totalGeneral: Number(candidate.totalGeneral) || 0,
  }
}

function normalizeElectionState(state, indicators) {
  const isOpen = state?.abierta ?? indicators?.abierta
  if (typeof isOpen !== 'boolean') {
    throw new DashboardServiceError('El servidor no devolvió el estado de la votación.')
  }

  return {
    abierta: isOpen,
    fechaApertura: state?.fechaApertura ?? null,
    fechaCierre: state?.fechaCierre ?? null,
  }
}

function normalizeTrend(trend) {
  if (!Array.isArray(trend)) {
    throw new DashboardServiceError('La tendencia recibida no tiene un formato válido.')
  }

  return trend.map((point, index) => {
    const date = new Date(point?.minuto)
    if (Number.isNaN(date.getTime())) {
      throw new DashboardServiceError(`No se pudo interpretar el punto de tendencia ${index + 1}.`)
    }

    return {
      minute: date.toISOString(),
      votesInMinute: Number(point.votosEnMinuto) || 0,
      accumulatedVotes: Number(point.votosAcumulados) || 0,
    }
  })
}

export function normalizeDashboardPayload(payload, previous = null) {
  if (!payload || typeof payload !== 'object') {
    throw new DashboardServiceError('El servidor devolvió resultados no válidos.')
  }

  const indicators = payload.indicadores
  const rankingPayload = payload.ranking ?? payload.resultados
  if (!Array.isArray(rankingPayload)) {
    throw new DashboardServiceError('El servidor no devolvió el ranking de candidatos.')
  }

  const ranking = rankingPayload.map(normalizeCandidate)
  const electionState = normalizeElectionState(payload.estado, indicators)
  const totalVotes = Number(
    indicators?.totalVotos ?? ranking[0]?.totalGeneral ?? previous?.indicators.totalVotes ?? 0,
  )
  const eligibleVoters = Number(
    indicators?.totalVotantesHabilitados ?? previous?.indicators.eligibleVoters ?? 0,
  )
  const leaderCandidate = indicators?.candidatoLider
    ? normalizeCandidate(indicators.candidatoLider, 0)
    : (ranking[0] ?? previous?.indicators.leader ?? null)
  const leader =
    leaderCandidate && leaderCandidate.totalVotes > 0
      ? leaderCandidate
      : (ranking.find((candidate) => candidate.totalVotes > 0) ?? leaderCandidate)
  const trend = Array.isArray(payload.tendencia)
    ? normalizeTrend(payload.tendencia)
    : updateTrend(previous?.trend ?? [], ranking, totalVotes)

  return {
    state: electionState,
    indicators: {
      totalVotes,
      eligibleVoters,
      participationPercentage:
        Number(indicators?.porcentajeParticipacion) ||
        (eligibleVoters > 0 ? (totalVotes / eligibleVoters) * 100 : 0),
      leader,
    },
    ranking: ranking.sort((left, right) => right.totalVotes - left.totalVotes),
    trend,
  }
}

function updateTrend(previousTrend, ranking, totalVotes) {
  const now = new Date()
  now.setSeconds(0, 0)
  const minute = now.toISOString()
  const previousTotal = previousTrend.at(-1)?.accumulatedVotes ?? 0
  const voteDelta = Math.max(0, totalVotes - previousTotal)
  const trend = [...previousTrend]
  const currentMinute = trend.at(-1)

  if (currentMinute?.minute === minute) {
    trend[trend.length - 1] = {
      minute,
      votesInMinute: currentMinute.votesInMinute + voteDelta,
      accumulatedVotes: Math.max(currentMinute.accumulatedVotes, totalVotes),
    }
  } else if (voteDelta > 0 || trend.length === 0) {
    trend.push({
      minute,
      votesInMinute: voteDelta || 0,
      accumulatedVotes: totalVotes,
    })
  }

  if (trend.length === 0 && ranking.length > 0) {
    trend.push({ minute, votesInMinute: 0, accumulatedVotes: totalVotes })
  }

  return trend
}

export const dashboardService = {
  async getResults() {
    try {
      const { data } = await api.get('/resultados')
      return data
    } catch (error) {
      if (error instanceof DashboardServiceError) throw error
      throw new DashboardServiceError(
        error?.response?.data?.mensaje || 'No fue posible cargar los resultados.',
        error?.response?.status,
      )
    }
  },
}
