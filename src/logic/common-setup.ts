import type { App } from 'vue'
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
import pkg from '~/../package.json'
import { setupTheme } from '~/logic/theme'

import { router } from '~/options/routes'
import 'vue-sonner/style.css'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

export function setupApp(app: App, appContext: { context?: string } = {}) {
  setupTheme()

  // Inject a globally available `$app` object in template
  app.config.globalProperties.$app = {
    context: '',
    version: pkg.version,
    ...appContext,
  }
  // Provide access to `app` in script setup with `const app = inject('app')`
  app.provide('app', app.config.globalProperties.$app)

  app.use(router)

  app.component('DynamicScroller', DynamicScroller)
  app.component('DynamicScrollerItem', DynamicScrollerItem)
}
