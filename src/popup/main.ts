import { createApp } from 'vue'

import App from './Popup.vue'
import { setupApp } from '~/logic/common-setup'
import '../styles'
import { optionsStorage, setupStorage } from '~/logic/browser-storage'

setupStorage().then(() => {
  if (optionsStorage.onBadgeClick == 'openNewTab') {
    browser.runtime.openOptionsPage()
    return
  }

  const app = createApp(App)
  setupApp(app, { context: 'popup' })
  app.mount('#app')
})
