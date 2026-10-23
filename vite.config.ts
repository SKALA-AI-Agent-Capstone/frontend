import { defineConfig, loadEnv, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// 배경 지우기 라이브러리(@imgly/background-removal)는 onnxruntime의 wasm 경로를 자체 CDN으로 덮어써서 받는다.
// 그래서 Vite가 onnxruntime-web에서 따라 내보내는 wasm(약 24MB)은 쓰이지 않으므로 빌드 결과에서 뺀다.
const dropUnusedOrtWasm: Plugin = {
  name: 'drop-unused-ort-wasm',
  apply: 'build',
  generateBundle(_options, bundle) {
    for (const file of Object.keys(bundle)) {
      if (/(^|\/)ort-wasm[^/]*\.wasm$/.test(file)) delete bundle[file]
    }
  },
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [vue(), dropUnusedOrtWasm],
    resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
    server: {
      host: '127.0.0.1',
      port: 5173,
      strictPort: true,
      proxy: {
        '/api': {
          target: process.env.API_PROXY_TARGET || env.API_PROXY_TARGET || 'http://127.0.0.1:8080',
          changeOrigin: true,
        },
      },
    },
  }
})
