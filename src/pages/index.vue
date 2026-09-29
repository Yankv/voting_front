<template>
  <q-page class="landing-page">
    <section class="hero-section">
      <div class="hero-copy">
        <q-badge class="hero-eyebrow" color="primary" label="NEOSAGE · PARTICIPACIÓN" />
        <h1 class="hero-title">Tu voz construye el futuro.</h1>
        <p class="hero-description">
          Un espacio confiable para participar, elegir y consultar los resultados de forma
          transparente.
        </p>
        <div class="hero-actions">
          <q-btn unelevated color="primary" icon-right="arrow_forward" label="Ir a votar" to="/votar" no-caps
            size="lg" />
          <q-btn flat color="primary" icon="bar_chart" label="Ver resultados" to="/dashboard" no-caps size="lg" />
        </div>
        <div class="secure-note">
          <q-icon name="verified_user" color="positive" size="20px" />
          <span>Un voto por persona. Tu selección es privada.</span>
        </div>
      </div>

      <q-card flat bordered class="status-card">
        <q-card-section class="row items-center no-wrap q-gutter-md">
          <div class="status-icon">
            <q-icon name="how_to_vote" size="28px" color="primary" />
          </div>
          <div>
            <div class="text-overline text-grey-7">SISTEMA DE VOTACIÓN</div>
            <div class="text-h6 text-weight-bold">Listo para participar</div>
          </div>
        </q-card-section>
        <q-separator />
        <q-card-section class="status-details">
          <div class="row items-center justify-between">
            <span class="text-body2 text-grey-7">Conexión con servicios</span>
            <q-badge color="grey-7" label="En preparación" />
          </div>
          <p class="q-mb-none q-mt-md text-body2 text-grey-7">
            La apertura de la jornada y los resultados se mostrarán aquí al conectar el backend.
          </p>
        </q-card-section>
        <q-card-section class="status-footer">
          <q-icon name="lock" size="18px" />
          <span>Acceso seguro · Datos protegidos</span>
        </q-card-section>
      </q-card>
    </section>

    <section class="features-section">
      <div class="section-heading">
        <div class="text-overline text-primary">CONFIANZA EN CADA ETAPA</div>
        <h2 class="text-h4 text-weight-bold q-mt-sm q-mb-none">Participación transparente</h2>
      </div>
      <div class="feature-grid">
        <q-card flat bordered class="feature-card">
          <q-icon name="fingerprint" color="primary" size="28px" />
          <div class="text-subtitle1 text-weight-bold q-mt-md">Identidad verificada</div>
          <p class="text-body2 text-grey-7 q-mb-none q-mt-sm">
            Validación de identidad para cuidar la regla de un voto por persona.
          </p>
        </q-card>
        <q-card flat bordered class="feature-card">
          <q-icon name="visibility_off" color="primary" size="28px" />
          <div class="text-subtitle1 text-weight-bold q-mt-md">Voto confidencial</div>
          <p class="text-body2 text-grey-7 q-mb-none q-mt-sm">
            La identidad del votante se mantiene separada de su elección.
          </p>
        </q-card>
        <q-card flat bordered class="feature-card">
          <q-icon name="monitor" color="primary" size="28px" />
          <div class="text-subtitle1 text-weight-bold q-mt-md">Resultados en vivo</div>
          <p class="text-body2 text-grey-7 q-mb-none q-mt-sm">
            Consulta los resultados públicos durante la jornada electoral.
          </p>
        </q-card>
      </div>
    </section>
  </q-page>
</template>
