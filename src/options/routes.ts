import * as VueRouter from 'vue-router'
import DonatePage from '~/components/pages/DonatePage.vue'
import ExportPage from '~/components/pages/ExportPage.vue'
import HelpPage from '~/components/pages/HelpPage.vue'
import ImportPage from '~/components/pages/ImportPage.vue'
import SearchPage from '~/components/pages/SearchPage.vue'
import SettingsPage from '~/components/pages/SettingsPage.vue'

export enum RoutePath {
  Search = '/',
  Import = '/import',
  Export = '/export',
  Settings = '/settings',
  Help = '/help',
  Support = '/support',
}

export const routes = [
  { path: RoutePath.Search, component: SearchPage, meta: { title: 'Reddix | Search' } },
  { path: RoutePath.Import, component: ImportPage, meta: { title: 'Reddix | Import' } },
  { path: RoutePath.Export, component: ExportPage, meta: { title: 'Reddix | Export' } },
  { path: RoutePath.Settings, component: SettingsPage, meta: { title: 'Reddix | Settings' } },
  { path: RoutePath.Help, component: HelpPage, meta: { title: 'Reddix | Help' } },
  { path: RoutePath.Support, component: DonatePage, meta: { title: 'Reddix | Support' } },
] as const

export const router = VueRouter.createRouter({
  routes,
  history: VueRouter.createWebHashHistory(),
})

router.beforeEach((to, from, next) => {
  document.title = (to.meta.title as string) || 'Reddix'
  next()
})
