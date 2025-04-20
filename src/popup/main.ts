import { createApp } from 'vue'

import { optionsStorage, setupStorage } from '~/logic/browser-storage'
import { setupApp } from '~/logic/common-setup'
import App from './Popup.vue'
import '../styles'

setupStorage().then(() => {
  if (optionsStorage.value.onBadgeClick === 'openNewTab') {
    browser.runtime.openOptionsPage()
    return
  }

  const app = createApp(App)
  setupApp(app, { context: 'popup' })
  app.mount('#app')
})
