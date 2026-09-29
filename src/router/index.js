import { defineRouter } from '#q-app'
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useVotingStore } from '@/stores/voting.store'
import routes from './routes'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(({ store }) => {
  const createHistory = import.meta.env.QUASAR_SERVER
    ? createMemoryHistory
    : import.meta.env.QUASAR_VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(import.meta.env.QUASAR_VUE_ROUTER_BASE),
  })

  Router.beforeEach((to) => {
    const authStore = useAuthStore(store)
    if (to.matched.some((record) => record.meta.requiresAdmin) && !authStore.adminToken) {
      return {
        name: 'admin-login',
        query: { redirect: to.fullPath },
      }
    }

    const votingStore = useVotingStore(store)
    if (to.meta.requiresVoterSession && !votingStore.voterToken) {
      return { name: 'vote' }
    }

    if (to.meta.requiresVoteConfirmation && !votingStore.voteRegistered) {
      return { name: 'vote' }
    }

    if (to.name === 'vote' && votingStore.voterToken) {
      return { name: 'voting-ballot' }
    }

    if (to.name === 'vote' && votingStore.voteRegistered) {
      return { name: 'vote-confirmation' }
    }

    return true
  })

  return Router
})
