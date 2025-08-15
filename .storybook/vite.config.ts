import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    tailwindcss(),
    // Explicitly exclude React Router and Hydrogen plugins
  ],
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      '~': '/app',
    },
  },
})