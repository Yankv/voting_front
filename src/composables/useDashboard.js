import { onBeforeUnmount, ref } from 'vue'
import {
  DashboardServiceError,
  dashboardService,
  normalizeDashboardPayload,
} from '@/services/dashboard.service'

export function useDashboard() {
  const dashboard = ref(null)
  const loading = ref(false)
  const error = ref('')
  const realtimeError = ref('')
  const connectionStatus = ref('connecting')
  const newVoteSignal = ref(false)
  const lastUpdatedAt = ref(null)
  let connection
  let voteSignalTimeout
  let stopRequested = false

  function showVoteSignal() {
    newVoteSignal.value = true
    clearTimeout(voteSignalTimeout)
    voteSignalTimeout = setTimeout(() => {
      newVoteSignal.value = false
    }, 2600)
  }

  function applyPayload(payload) {
    const hasPreviousData = dashboard.value !== null
    const previousVotes = dashboard.value?.indicators.totalVotes ?? 0
    const next = normalizeDashboardPayload(payload, dashboard.value)
    dashboard.value = next
    lastUpdatedAt.value = new Date()
    error.value = ''
    realtimeError.value = ''

    if (hasPreviousData && next.indicators.totalVotes > previousVotes) {
      showVoteSignal()
    }
  }

  async function refresh() {
    loading.value = true
    try {
      const result = await dashboardService.getResults()
      applyPayload(result)
    } catch (requestError) {
      error.value =
        requestError instanceof DashboardServiceError
          ? requestError.message
          : 'No fue posible actualizar el dashboard.'
    } finally {
      loading.value = false
    }
  }

  async function startRealtime() {
    stopRequested = false
    let realtimeModule
    try {
      realtimeModule = await import('@/services/realtime.service')
    } catch {
      realtimeError.value = 'No fue posible cargar el módulo de resultados en tiempo real.'
      connectionStatus.value = 'reconnecting'
      return
    }
    if (stopRequested) return
    connection = realtimeModule.createResultsConnection({
      onMessage: applyPayload,
      onStatus: (status) => {
        connectionStatus.value = status
        if (status === 'connected') realtimeError.value = ''
      },
      onError: (connectionError) => {
        realtimeError.value = connectionError.message
      },
    })
    connection.activate()
  }

  function stopRealtime() {
    stopRequested = true
    clearTimeout(voteSignalTimeout)
    return connection?.deactivate()
  }

  onBeforeUnmount(stopRealtime)

  return {
    dashboard,
    loading,
    error,
    realtimeError,
    connectionStatus,
    newVoteSignal,
    lastUpdatedAt,
    refresh,
    startRealtime,
    stopRealtime,
  }
}
