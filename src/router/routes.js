import MainLayout from '@/layouts/MainLayout.vue'
import NotFoundPage from '@/pages/NotFoundPage.vue'
import HomePage from '@/pages/index.vue'
import PortalPage from '@/pages/PortalPage.vue'
import LoginVotingPage from '@/pages/LoginVotingPage.vue'
import VotingPage from '@/pages/VotingPage.vue'
import VoteConfirmationPage from '@/pages/VoteConfirmationPage.vue'

const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'home',
        component: HomePage,
      },
      {
        path: 'votar',
        name: 'vote',
        component: LoginVotingPage,
      },
      {
        path: 'votar/seleccionar',
        name: 'voting-ballot',
        component: VotingPage,
        meta: {
          requiresVoterSession: true,
        },
      },
      {
        path: 'votar/confirmacion',
        name: 'vote-confirmation',
        component: VoteConfirmationPage,
        meta: {
          requiresVoteConfirmation: true,
        },
      },
      {
        path: 'dashboard',
        name: 'dashboard',
        component: PortalPage,
        props: {
          title: 'Resultados de la votación',
          description: 'Consulta el avance y los resultados públicos de la jornada.',
          icon: 'bar_chart',
        },
      },
      {
        path: 'admin/login',
        name: 'admin-login',
        component: PortalPage,
        props: {
          title: 'Acceso administrativo',
          description: 'Ingresa con una cuenta autorizada para administrar la jornada.',
          icon: 'admin_panel_settings',
        },
      },
      {
        path: 'admin',
        name: 'admin',
        component: PortalPage,
        meta: {
          requiresAdmin: true,
        },
        props: {
          title: 'Administración de la jornada',
          description: 'Controla el estado de la votación y la operación del sistema.',
          icon: 'settings',
        },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundPage,
  },
]

export default routes
