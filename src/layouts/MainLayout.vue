<template>
  <q-layout view="hHh lpR fFf">
    <q-header class="app-header" height-hint="72">
      <q-toolbar class="q-px-lg toolbar-content">
        <router-link class="brand-link" to="/" aria-label="NEOSAGE, inicio">
          <span class="brand-mark">
            <q-icon name="how_to_vote" size="22px" />
          </span>
          <span class="q-ml-sm">
            <span class="brand-name">NEOSAGE</span>
            <span class="brand-caption block">SISTEMA DE VOTACIONES</span>
          </span>
        </router-link>

        <q-space />

        <nav class="main-nav gt-sm" aria-label="Navegación principal">
          <q-btn flat no-caps label="Inicio" to="/" />
          <q-btn flat no-caps label="Votar" to="/votar" />
          <q-btn flat no-caps label="Resultados" to="/dashboard" />
        </nav>

        <q-btn
          flat
          round
          :icon="$q.dark.isActive ? 'light_mode' : 'dark_mode'"
          :aria-label="$q.dark.isActive ? 'Activar modo claro' : 'Activar modo oscuro'"
          @click="$q.dark.toggle()"
        >
          <q-tooltip>{{ $q.dark.isActive ? 'Modo claro' : 'Modo oscuro' }}</q-tooltip>
        </q-btn>

        <q-btn
          class="lt-md"
          flat
          round
          icon="menu"
          aria-label="Abrir navegación"
        >
          <q-menu>
            <q-list style="min-width: 180px">
              <q-item v-for="link in navigation" :key="link.to" v-close-popup clickable :to="link.to">
                <q-item-section>{{ link.label }}</q-item-section>
              </q-item>
              <q-separator />
              <q-item v-close-popup clickable to="/admin/login">
                <q-item-section>Administración</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>

        <q-btn
          class="gt-sm q-ml-sm"
          outline
          color="primary"
          icon="admin_panel_settings"
          label="Administración"
          no-caps
          to="/admin/login"
        />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
const navigation = [
  { label: 'Inicio', to: '/' },
  { label: 'Votar', to: '/votar' },
  { label: 'Resultados', to: '/dashboard' },
]
</script>

<style scoped>
.toolbar-content {
  margin: 0 auto;
  max-width: 1280px;
  min-height: 72px;
}

.brand-link {
  align-items: center;
  color: inherit;
  display: inline-flex;
  text-decoration: none;
}
</style>
