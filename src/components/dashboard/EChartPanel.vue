<template>
  <div ref="chartElement" class="dashboard-chart" :style="{ height }" />
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { use, init } from 'echarts/core'
import { LineChart, PieChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import 'echarts/theme/dark'

use([LineChart, PieChart, GridComponent, LegendComponent, TooltipComponent, CanvasRenderer])

const props = defineProps({
  option: {
    type: Object,
    required: true,
  },
  height: {
    type: String,
    default: '300px',
  },
  dark: {
    type: Boolean,
    default: false,
  },
})

const chartElement = ref(null)
let chart
let resizeObserver

function renderChart() {
  if (!chartElement.value) return
  if (chart && chart.isDark !== props.dark) {
    chart.dispose()
    chart = null
  }
  if (!chart) {
    chart = init(chartElement.value, props.dark ? 'dark' : undefined, {
      renderer: 'canvas',
    })
    chart.isDark = props.dark
  }
  chart.setOption(props.option, { notMerge: true, lazyUpdate: true })
}

watch(
  () => [props.option, props.dark],
  async () => {
    await nextTick()
    renderChart()
  },
  { deep: true },
)

onMounted(() => {
  renderChart()
  resizeObserver = new ResizeObserver(() => chart?.resize())
  resizeObserver.observe(chartElement.value)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  chart?.dispose()
})
</script>
