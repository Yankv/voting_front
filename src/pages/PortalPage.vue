<template>
  <q-page class="portal-page">
    <q-card flat bordered class="portal-card">
      <q-card-section class="q-pa-lg">
        <q-badge color="primary" label="NEOSAGE" />
        <div class="row items-center q-gutter-md q-mt-md">
          <q-avatar color="blue-1" text-color="primary" size="56px">
            <q-icon :name="icon" size="28px" />
          </q-avatar>
          <div>
            <div class="text-h4 text-weight-bold">{{ title }}</div>
            <div class="text-body2 text-grey-7 q-mt-xs">{{ description }}</div>
          </div>
        </div>
      </q-card-section>
      <q-separator />
      <q-card-section class="q-pa-lg">
        <q-banner rounded class="bg-blue-1 text-blue-10">
          <template #avatar>
            <q-icon name="construction" color="primary" />
          </template>
          Esta sección está preparada para conectarse con los servicios de votación.
        </q-banner>
        <q-btn class="q-mt-lg" outline color="primary" label="Volver al inicio" to="/" no-caps />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    default: 'how_to_vote',
  },
})
</script>
