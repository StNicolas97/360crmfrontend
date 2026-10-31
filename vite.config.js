import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // VITE_API_URL vient des variables d'environnement (Render, CI) ou des fichiers .env* du mode courant
  const env = loadEnv(mode, process.cwd(), 'VITE_')

  // Un build de production sans adresse d'API doit échouer : plus d'URL de secours codée en dur.
  // Build local de vérification : VITE_API_URL=http://localhost:3000 npm run build
  if (command === 'build' && mode === 'production' && !env.VITE_API_URL) {
    throw new Error(
      'VITE_API_URL est obligatoire pour le build de production (ex. VITE_API_URL=https://api.exemple.com npm run build).'
    )
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
