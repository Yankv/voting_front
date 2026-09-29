import MainLayout from '@/layouts/MainLayout.vue'
import NotFoundPage from '@/pages/NotFoundPage.vue'
import HomePage from '@/pages/index.vue'
import LoginVotingPage from '@/pages/LoginVotingPage.vue'
import VotingPage from '@/pages/VotingPage.vue'
import VoteConfirmationPage from '@/pages/VoteConfirmationPage.vue'
import AdminLoginPage from '@/pages/AdminLoginPage.vue'
import AdministrationPage from '@/pages/AdministrationPage.vue'
import DashboardPage from '@/pages/DashboardPage.vue'

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
        component: DashboardPage,
      },
      {
        path: 'admin/login',
        name: 'admin-login',
        component: AdminLoginPage,
      },
      {
        path: 'admin',
        name: 'admin',
        component: AdministrationPage,
        meta: {
          requiresAdmin: true,
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
