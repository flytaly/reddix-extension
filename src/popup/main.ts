import { createApp } from 'vue'
import ToastService from 'primevue/toastservice'
import App from './Popup.vue'
import { setupApp } from '~/logic/common-setup'
import '../styles'
import { router } from '~/options/routes'

const app = createApp(App)
setupApp(app, { context: 'popup' }).then(() => {
  app.use(router)
  app.use(ToastService)
  app.mount('#app')
})
