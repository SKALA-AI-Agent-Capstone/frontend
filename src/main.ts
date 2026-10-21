import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router/index.js'
import { i18n } from './shared/i18n'
import { brandAsset } from './shared/constants/site'
import './styles/index.css'

// 브라우저 탭 아이콘을 site.js의 MASCOT 버전에 맞춘다
for (const [id, file] of [['favicon', 'favicon-32.png'], ['apple-touch-icon', 'apple-touch-icon.png']]) {
  document.getElementById(id)?.setAttribute('href', brandAsset(file))
}

createApp(App).use(createPinia()).use(i18n).use(router).mount('#app')
