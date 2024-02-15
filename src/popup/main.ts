import { createApp } from 'vue'
import ToastService from 'primevue/toastservice'
import App from './Popup.vue'
import { setupApp } from '~/logic/common-setup'
import '../styles'

const app = createApp(App)
setupApp(app, { context: 'popup' })
app.use(ToastService)
app.mount('#app')
