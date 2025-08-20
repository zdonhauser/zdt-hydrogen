import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'

// Separate Vite config for Storybook that excludes React Router plugin
export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    tailwindcss(),
    // Explicitly exclude React Router, Hydrogen, and Oxygen plugins
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