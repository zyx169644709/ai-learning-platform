import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/styles/themes.css'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
// 开发环境下导入通知测试工具
if (import.meta.env.DEV) {
  import('./utils/test-notification')
}

const app = createApp(App)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(router)

app.mount('#app')

