import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig(({ mode }) => {
  // Carregar variáveis de ambiente do .env na raiz do projeto (um nível acima)
  const envDir = path.resolve(__dirname, '..')
  const env = loadEnv(mode, envDir, '')
  
  // URL da API - padrão: http://localhost:5001
  const apiUrl = env.VITE_API_URL || 'http://localhost:5001/api'
  // Extrair host e porta da URL da API
  const apiMatch = apiUrl.match(/https?:\/\/([^\/]+)/)
  const apiHost = apiMatch ? apiMatch[1] : 'localhost:5001'
  
  return {
    plugins: [react()],
    server: {
      host: env.VITE_FRONTEND_HOST || '0.0.0.0',
      port: parseInt(env.VITE_FRONTEND_PORT || '3000'),
      proxy: {
        '/api': {
          target: apiHost.includes(':') ? `http://${apiHost}` : `http://${apiHost}:5001`,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '/api')
        }
      }
    },
    build: {
      outDir: '../static/dist',
      emptyOutDir: true
    }
  }
})

