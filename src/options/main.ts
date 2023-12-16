import { createApp } from 'vue'
import '../styles'
import App from './Options.vue'
import { setupApp } from '~/logic/common-setup'

const app = createApp(App)
setupApp(app)
app.mount('#app')
