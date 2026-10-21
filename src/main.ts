import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router/index.js'
import { i18n } from './shared/i18n'
import './styles/index.css'

createApp(App).use(createPinia()).use(i18n).use(router).mount('#app')
