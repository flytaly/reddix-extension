import PrimeVue from 'primevue/config'
import ConfirmationService from 'primevue/confirmationservice'
import Toast from 'primevue/toast'
import ToastService from 'primevue/toastservice'
import Tooltip from 'primevue/tooltip'
import type { App } from 'vue'
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

import pkg from '~/../package.json'
import { setupTheme } from '~/logic/theme'
import { router } from '~/options/routes'
import PrimePreset from '~/styles/presets/wind'

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

  // Here you can install additional plugins for all contexts: popup, options page and content-script.
  // example: app.use(i18n)
  // example excluding content-script context: if (context !== 'content-script') app.use(i18n)
  app.use(PrimeVue, {
    unstyled: true,
    pt: PrimePreset,
  })

  app.use(ConfirmationService)
  app.use(router)
  app.use(ToastService)
  app.directive('tooltip', Tooltip)

  app.component('DynamicScroller', DynamicScroller)
  app.component('DynamicScrollerItem', DynamicScrollerItem)

  // for some reason it won't work with autoimport
  app.component('Toast', Toast)
}
