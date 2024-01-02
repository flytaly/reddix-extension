import { createApp } from 'vue'
import { setupApp } from '~/logic/common-setup'
import '../styles'
import App from './Options.vue'
import { router } from './routes'

const app = createApp(App)
setupApp(app)
app.use(router)
app.mount('#app')
