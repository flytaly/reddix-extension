import * as VueRouter from 'vue-router'
import ExportPage from '~/components/pages/ExportPage.vue'
import ImportPage from '~/components/pages/ImportPage.vue'
import SearchPage from '~/components/pages/SearchPage.vue'

export enum RoutePath {
  Search = '/',
  Import = '/import',
  Export = '/export',
}

export const routes = [
  { path: RoutePath.Search, component: SearchPage },
  { path: RoutePath.Import, component: ImportPage },
  { path: RoutePath.Export, component: ExportPage },
]

export const router = VueRouter.createRouter({
  routes,
  history: VueRouter.createWebHashHistory(),
})
