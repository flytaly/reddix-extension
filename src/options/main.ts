import { createApp } from 'vue'

import { setupStorage } from '~/logic/browser-storage'
import { setupApp } from '~/logic/common-setup'
import App from '~/options/Options.vue'
import '../styles'

setupStorage().then(() => {
  const app = createApp(App)
  setupApp(app, { context: 'options' })
  app.mount('#app')
})
