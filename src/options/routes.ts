import * as VueRouter from 'vue-router'
import ExportPage from '~/components/pages/ExportPage.vue'
import ImportPage from '~/components/pages/ImportPage.vue'
import SearchPage from '~/components/pages/SearchPage.vue'
import SettingsPage from '~/components/pages/SettingsPage.vue'

export enum RoutePath {
  Search = '/',
  Import = '/import',
  Export = '/export',
  Settings = '/settings',
}

export const routes = [
  { path: RoutePath.Search, component: SearchPage },
  { path: RoutePath.Import, component: ImportPage },
  { path: RoutePath.Export, component: ExportPage },
  { path: RoutePath.Settings, component: SettingsPage },
]

export const router = VueRouter.createRouter({
  routes,
  history: VueRouter.createWebHashHistory(),
})
