import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    // Note: React Router plugin is disabled for testing to avoid conflicts
    // !process.env.VITEST && reactRouter()
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './app/test/setup.ts',
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/e2e/**', // Exclude Playwright e2e tests
    ],
  },
})