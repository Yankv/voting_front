<template>
  <q-page class="dashboard-page" :class="{ 'dashboard-page--fullscreen': isFullscreen }">
    <div class="dashboard-content">
      <header class="dashboard-header">
        <div>
          <q-badge color="primary" label="NEOSAGE · RESULTADOS OFICIALES" />
          <h1 class="text-h4 text-weight-bold q-mt-md q-mb-xs">Centro de resultados</h1>
          <p class="text-body2 dashboard-muted q-mb-none">
            Avance de la jornada electoral actualizado en tiempo real.
          </p>
        </div>
        <div class="dashboard-toolbar">
          <q-badge
            class="connection-badge"
            :color="connectionColor"
            :label="connectionLabel"
            :icon="connectionIcon"
          />
          <q-btn
            flat
            round
            :icon="isFullscreen ? 'fullscreen_exit' : 'fullscreen'"
            :aria-label="isFullscreen ? 'Salir de pantalla completa' : 'Ver en pantalla completa'"
            @click="toggleFullscreen"
          >
            <q-tooltip>
              {{ isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa' }}
            </q-tooltip>
          </q-btn>
          <q-btn
            flat
            round
            icon="refresh"
            aria-label="Actualizar resultados"
            :loading="loading"
            @click="refresh"
          />
        </div>
      </header>

      <q-banner v-if="error" rounded class="dashboard-alert bg-red-1 text-red-10 q-mb-md">
        <template #avatar>
          <q-icon name="error_outline" />
        </template>
        {{ error }}
        <template #action>
          <q-btn flat dense label="Reintentar" no-caps @click="refresh" />
        </template>
      </q-banner>
      <q-banner
        v-else-if="realtimeError"
        rounded
        class="dashboard-alert bg-orange-1 text-orange-10 q-mb-md"
        dense
      >
        <template #avatar>
          <q-icon name="wifi_off" />
        </template>
        Se perdió temporalmente la conexión en vivo. Los resultados volverán a actualizarse al
        reconectar.
      </q-banner>

      <q-banner
        v-if="newVoteSignal"
        class="new-vote-alert q-mb-md"
        rounded
        dense
        role="status"
        aria-live="polite"
      >
        <template #avatar>
          <span class="live-pulse"><q-icon name="how_to_vote" /></span>
        </template>
        Nuevo voto recibido · Resultados actualizados
      </q-banner>

      <section class="dashboard-metrics" aria-label="Indicadores principales">
        <q-card flat bordered class="metric-card metric-card--votes">
          <q-card-section>
            <div class="metric-label">
              <q-icon name="how_to_vote" />
              <span>Total de votos</span>
            </div>
            <div v-if="loading && !dashboard" class="metric-skeleton">
              <q-skeleton type="text" width="110px" height="42px" />
            </div>
            <div v-else class="metric-value">
              <AnimatedNumber :value="totalVotes" />
            </div>
            <div class="metric-footnote">Votos recibidos en la jornada</div>
          </q-card-section>
        </q-card>

        <q-card flat bordered class="metric-card metric-card--leader">
          <q-card-section>
            <div class="metric-label">
              <q-icon name="emoji_events" />
              <span>Candidato que lidera</span>
            </div>
            <template v-if="leader">
              <div class="leader-metric">
                <q-avatar v-if="leader.imageUrl" size="42px" class="dashboard-avatar">
                  <img :src="leader.imageUrl" :alt="`Foto de ${leader.name}`" />
                </q-avatar>
                <q-avatar v-else color="blue-1" text-color="primary" size="42px">
                  <q-icon name="person" />
                </q-avatar>
                <div class="leader-metric-copy">
                  <div class="metric-value metric-value--name">{{ leader.name }}</div>
                  <div class="metric-footnote">
                    Tarjetón {{ leader.ballotNumber }} ·
                    <AnimatedNumber :value="leader.percentage" :decimals="1" suffix="%" />
                  </div>
                </div>
              </div>
            </template>
            <div v-else class="metric-value metric-value--name">Sin votos registrados</div>
          </q-card-section>
        </q-card>

        <q-card flat bordered class="metric-card metric-card--turnout">
          <q-card-section>
            <div class="metric-label">
              <q-icon name="groups" />
              <span>Participación</span>
            </div>
            <div class="metric-value">
              <AnimatedNumber :value="participationPercentage" :decimals="1" suffix="%" />
            </div>
            <div class="metric-footnote">
              <AnimatedNumber :value="eligibleVoters" /> votantes habilitados
            </div>
          </q-card-section>
        </q-card>

        <q-card flat bordered class="metric-card metric-card--status">
          <q-card-section>
            <div class="metric-label">
              <q-icon name="campaign" />
              <span>Estado de votación</span>
            </div>
            <div class="status-metric">
              <span
                class="status-indicator"
                :class="{
                  'status-indicator--open': electionOpen === true,
                  'status-indicator--unknown': electionOpen === null,
                }"
              />
              <span class="metric-value metric-value--status">
                {{ electionOpen === null ? 'Sin datos' : electionOpen ? 'Abierta' : 'Cerrada' }}
              </span>
            </div>
            <div class="metric-footnote">{{ electionTimeLabel }}</div>
          </q-card-section>
        </q-card>
      </section>

      <section class="dashboard-main-grid">
        <q-card flat bordered class="dashboard-panel ranking-panel">
          <q-card-section class="panel-heading">
            <div>
              <div class="text-subtitle1 text-weight-bold">Carrera electoral</div>
              <div class="panel-caption">
                Ranking en vivo · los puestos se reordenan con cada voto
              </div>
            </div>
            <q-icon name="trending_up" color="primary" size="22px" />
          </q-card-section>
          <q-separator />
          <q-card-section class="ranking-list">
            <q-skeleton v-if="loading && !dashboard" type="rect" height="66px" />
            <div v-else-if="ranking.length === 0" class="empty-panel">
              <q-icon name="how_to_vote" size="30px" />
              <span>Aún no hay votos registrados.</span>
            </div>
            <TransitionGroup v-else name="ranking" tag="div" class="ranking-stack">
              <article v-for="(candidate, index) in ranking" :key="candidate.id" class="rank-row">
                <div class="rank-position" :class="`rank-position--${index + 1}`">
                  {{ index + 1 }}
                </div>
                <q-avatar v-if="candidate.imageUrl" size="42px" class="dashboard-avatar">
                  <img :src="candidate.imageUrl" :alt="`Foto de ${candidate.name}`" />
                </q-avatar>
                <q-avatar v-else color="blue-1" text-color="primary" size="42px">
                  <q-icon name="person" />
                </q-avatar>
                <div class="rank-main">
                  <div class="rank-details">
                    <div class="rank-name">
                      <strong>{{ candidate.name }}</strong>
                      <span>Tarjetón {{ candidate.ballotNumber }}</span>
                    </div>
                    <div class="rank-count">
                      <strong><AnimatedNumber :value="candidate.totalVotes" /></strong>
                      <span
                        ><AnimatedNumber :value="candidate.percentage" :decimals="1" suffix="%"
                      /></span>
                    </div>
                  </div>
                  <q-linear-progress
                    rounded
                    size="8px"
                    color="primary"
                    track-color="grey-4"
                    :value="clampPercentage(candidate.percentage) / 100"
                    class="rank-progress"
                  />
                </div>
              </article>
            </TransitionGroup>
          </q-card-section>
        </q-card>

        <q-card flat bordered class="dashboard-panel turnout-panel">
          <q-card-section class="panel-heading">
            <div>
              <div class="text-subtitle1 text-weight-bold">Medidor de participación</div>
              <div class="panel-caption">Votos emitidos frente al censo habilitado</div>
            </div>
            <q-icon name="speed" color="primary" size="22px" />
          </q-card-section>
          <q-separator />
          <q-card-section class="turnout-content">
            <q-circular-progress
              show-value
              :value="clampPercentage(participationPercentage)"
              size="174px"
              :thickness="0.13"
              color="primary"
              track-color="blue-grey-1"
              class="turnout-gauge"
            >
              <div class="gauge-center">
                <div class="gauge-value">
                  <AnimatedNumber :value="participationPercentage" :decimals="1" suffix="%" />
                </div>
                <div class="gauge-label">participación</div>
              </div>
            </q-circular-progress>
            <div class="turnout-count">
              <div>
                <strong><AnimatedNumber :value="totalVotes" /></strong> votos emitidos
              </div>
              <div>
                <strong><AnimatedNumber :value="eligibleVoters" /></strong> habilitados
              </div>
            </div>
            <q-linear-progress
              rounded
              size="10px"
              color="primary"
              track-color="blue-grey-1"
              :value="clampPercentage(participationPercentage) / 100"
            />
          </q-card-section>
        </q-card>
      </section>

      <section class="dashboard-chart-grid">
        <q-card flat bordered class="dashboard-panel chart-panel">
          <q-card-section class="panel-heading">
            <div>
              <div class="text-subtitle1 text-weight-bold">Distribución de votos</div>
              <div class="panel-caption">Porcentaje por candidatura</div>
            </div>
            <q-icon name="donut_small" color="primary" size="22px" />
          </q-card-section>
          <q-separator />
          <q-card-section class="chart-body">
            <EChartPanel :option="distributionOption" :dark="$q.dark.isActive" height="310px" />
          </q-card-section>
        </q-card>

        <q-card flat bordered class="dashboard-panel chart-panel">
          <q-card-section class="panel-heading">
            <div>
              <div class="text-subtitle1 text-weight-bold">Ritmo de votación</div>
              <div class="panel-caption">Votos por minuto y acumulado durante la jornada</div>
            </div>
            <q-icon name="show_chart" color="primary" size="22px" />
          </q-card-section>
          <q-separator />
          <q-card-section class="chart-body">
            <EChartPanel :option="trendOption" :dark="$q.dark.isActive" height="310px" />
          </q-card-section>
        </q-card>
      </section>

      <footer class="dashboard-footer">
        <div class="row items-center q-gutter-xs">
          <q-icon name="privacy_tip" color="positive" />
          <span>Resultados agregados. La identidad de los votantes es confidencial.</span>
        </div>
        <div v-if="lastUpdatedAt">Actualizado {{ formatTime(lastUpdatedAt) }}</div>
      </footer>
    </div>
  </q-page>
</template>

<script setup>
import { computed, defineAsyncComponent, onMounted, onBeforeUnmount, ref } from 'vue'
import { useQuasar } from 'quasar'
import AnimatedNumber from '@/components/dashboard/AnimatedNumber.vue'
import { useDashboard } from '@/composables/useDashboard'

const EChartPanel = defineAsyncComponent(() => import('@/components/dashboard/EChartPanel.vue'))

const $q = useQuasar()
const {
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
} = useDashboard()
const isFullscreen = ref(false)
const chartPalette = ['#2878e3', '#1ea67a', '#eea12d', '#9159d9', '#e45d72', '#13a8bd']

const indicators = computed(() => dashboard.value?.indicators)
const ranking = computed(() => dashboard.value?.ranking ?? [])
const totalVotes = computed(() => indicators.value?.totalVotes ?? 0)
const eligibleVoters = computed(() => indicators.value?.eligibleVoters ?? 0)
const participationPercentage = computed(() => indicators.value?.participationPercentage ?? 0)
const leader = computed(() => {
  const candidate = indicators.value?.leader
  return candidate?.totalVotes > 0 ? candidate : null
})
const electionOpen = computed(() => dashboard.value?.state.abierta ?? null)
const electionTimeLabel = computed(() => {
  if (electionOpen.value === null) return 'Estado no disponible'
  const timestamp = electionOpen.value
    ? dashboard.value?.state.fechaApertura
    : dashboard.value?.state.fechaCierre
  if (!timestamp) return electionOpen.value ? 'Jornada en curso' : 'Jornada finalizada'
  return `${electionOpen.value ? 'Abierta' : 'Cerrada'} ${formatTime(timestamp)}`
})
const connectionColor = computed(() =>
  connectionStatus.value === 'connected'
    ? 'positive'
    : connectionStatus.value === 'connecting'
      ? 'warning'
      : 'grey-7',
)
const connectionLabel = computed(() =>
  connectionStatus.value === 'connected'
    ? 'En vivo'
    : connectionStatus.value === 'connecting'
      ? 'Conectando'
      : 'Reconectando',
)
const connectionIcon = computed(() => (connectionStatus.value === 'connected' ? 'sensors' : 'sync'))

const distributionOption = computed(() => {
  const textColor = $q.dark.isActive ? '#d5dee8' : '#475467'
  const mutedColor = $q.dark.isActive ? '#9aa9b8' : '#667085'
  return {
    animationDurationUpdate: 700,
    color: chartPalette,
    tooltip: {
      trigger: 'item',
      formatter: '{b}<br/>{d}%',
    },
    legend: {
      bottom: 0,
      left: 'center',
      textStyle: { color: mutedColor },
      type: 'scroll',
    },
    series: [
      {
        name: 'Distribución',
        type: 'pie',
        radius: ['48%', '72%'],
        center: ['50%', '44%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderColor: $q.dark.isActive ? '#172330' : '#ffffff',
          borderWidth: 3,
          borderRadius: 8,
        },
        label: {
          color: textColor,
          formatter: '{d}%',
        },
        emphasis: {
          scale: true,
          scaleSize: 8,
          itemStyle: { shadowBlur: 14, shadowColor: 'rgba(0, 0, 0, 0.22)' },
        },
        data: ranking.value.map((candidate, index) => ({
          name: candidate.name,
          value: candidate.percentage,
          itemStyle: { color: chartPalette[index % chartPalette.length] },
        })),
      },
    ],
  }
})

const trendOption = computed(() => {
  const textColor = $q.dark.isActive ? '#9aa9b8' : '#667085'
  const axisColor = $q.dark.isActive ? '#344657' : '#e4e7ec'
  const trend = dashboard.value?.trend ?? []
  return {
    animationDurationUpdate: 700,
    color: ['#2878e3', '#1ea67a'],
    tooltip: {
      trigger: 'axis',
      valueFormatter: (value) => `${value} votos`,
    },
    legend: {
      top: 0,
      textStyle: { color: textColor },
    },
    grid: { left: 42, right: 18, top: 42, bottom: 28 },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: trend.map((point) =>
        new Intl.DateTimeFormat('es', { hour: '2-digit', minute: '2-digit' }).format(
          new Date(point.minute),
        ),
      ),
      axisLabel: { color: textColor, hideOverlap: true },
      axisLine: { lineStyle: { color: axisColor } },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      axisLabel: { color: textColor },
      splitLine: { lineStyle: { color: axisColor, type: 'dashed' } },
    },
    series: [
      {
        name: 'Por minuto',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        data: trend.map((point) => point.votesInMinute),
        areaStyle: { opacity: 0.1 },
      },
      {
        name: 'Acumulados',
        type: 'line',
        smooth: true,
        symbol: 'none',
        data: trend.map((point) => point.accumulatedVotes),
      },
    ],
  }
})

function clampPercentage(value) {
  return Math.min(100, Math.max(0, Number(value) || 0))
}

function formatTime(value) {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return 'hora no disponible'
  return new Intl.DateTimeFormat('es', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date)
}

async function toggleFullscreen() {
  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen()
      isFullscreen.value = true
    } else {
      await document.exitFullscreen()
      isFullscreen.value = false
    }
  } catch {
    $q.notify({
      type: 'warning',
      message: 'El navegador no permitió cambiar el modo de pantalla completa.',
    })
  }
}

function syncFullscreen() {
  isFullscreen.value = Boolean(document.fullscreenElement)
}

onMounted(async () => {
  document.addEventListener('fullscreenchange', syncFullscreen)
  await refresh()
  startRealtime()
})

onBeforeUnmount(() => {
  document.removeEventListener('fullscreenchange', syncFullscreen)
  stopRealtime()
})
</script>
