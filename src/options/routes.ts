import * as VueRouter from 'vue-router'
import ExportPage from '~/components/pages/ExportPage.vue'
import ImportPage from '~/components/pages/ImportPage.vue'
import SearchPage from '~/components/pages/SearchPage.vue'
import SettingsPage from '~/components/pages/SettingsPage.vue'
import HelpPage from '~/components/pages/HelpPage.vue'
import DonatePage from '~/components/pages/DonatePage.vue'

export enum RoutePath {
  Search = '/',
  Import = '/import',
  Export = '/export',
  Settings = '/settings',
  Help = '/help',
  Support = '/support',
}

export const routes = [
  { path: RoutePath.Search, component: SearchPage },
  { path: RoutePath.Import, component: ImportPage },
  { path: RoutePath.Export, component: ExportPage },
  { path: RoutePath.Settings, component: SettingsPage },
  { path: RoutePath.Help, component: HelpPage },
  { path: RoutePath.Support, component: DonatePage },
]

export const router = VueRouter.createRouter({
  routes,
  history: VueRouter.createWebHashHistory(),
})
