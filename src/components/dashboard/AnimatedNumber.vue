<template>
  <span>{{ formattedValue }}</span>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps({
  value: {
    type: Number,
    default: 0,
  },
  decimals: {
    type: Number,
    default: 0,
  },
  suffix: {
    type: String,
    default: '',
  },
})

const displayedValue = ref(0)
let animationFrame = 0

const formattedValue = computed(
  () =>
    `${new Intl.NumberFormat('es', {
      minimumFractionDigits: props.decimals,
      maximumFractionDigits: props.decimals,
    }).format(displayedValue.value)}${props.suffix}`,
)

watch(
  () => props.value,
  (target) => {
    cancelAnimationFrame(animationFrame)
    const start = displayedValue.value
    const difference = target - start
    const duration = 750
    const startTime = performance.now()

    const animate = (now) => {
      const progress = Math.min((now - startTime) / duration, 1)
      const eased = 1 - (1 - progress) ** 3
      displayedValue.value = start + difference * eased
      if (progress < 1) animationFrame = requestAnimationFrame(animate)
    }

    animationFrame = requestAnimationFrame(animate)
  },
  { immediate: true },
)

onBeforeUnmount(() => cancelAnimationFrame(animationFrame))
</script>
