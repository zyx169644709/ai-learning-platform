import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useUserStore } from './stores/userStore'
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

// 监听 token 过期事件，清除 pinia store 登录状态
window.addEventListener('auth:expired', () => {
  const userStore = useUserStore()
  userStore.clearUserState()
})

