import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // VITE_API_URL vient des variables d'environnement (Render, CI) ou des fichiers .env* du mode courant
  const env = loadEnv(mode, process.cwd(), 'VITE_')

  // Sans VITE_API_URL, le build passe quand même (Deploy Previews) : l'API est alors appelée sur la même origine.
  // À rendre bloquant avant la mise en production (voir data/audit/13-plan-deploiement.md).
  if (command === 'build' && mode === 'production' && !env.VITE_API_URL) {
    console.warn('⚠ VITE_API_URL absent : le build appellera l\'API sur sa propre origine.')
  }

  return {
    plugins: [
      vue(),
      // Outils de développement : serveur de dev uniquement (ni tests, ni build)
      command === 'serve' && !process.env.VITEST && vueDevTools(),
    ].filter(Boolean),
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
    test: {
      environment: 'jsdom',
      include: ['tests/**/*.test.js'],
    },
  }
})
