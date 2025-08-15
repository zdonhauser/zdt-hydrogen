import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  "stories": [
    "../app/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../stories/**/*.mdx",
    "../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-essentials",
    "@storybook/addon-onboarding",
    "@storybook/addon-interactions"
  ],
  "framework": {
    "name": "@storybook/react-vite",
    "options": {}
  },
  async viteFinal(config, { configType }) {
    // Use a completely separate Vite config for Storybook
    const { mergeConfig } = await import('vite')
    const storybookViteConfig = await import('./vite.config.ts')
    
    return mergeConfig(config, storybookViteConfig.default)
  },
  typescript: {
    reactDocgen: 'react-docgen-typescript',
  }
};
export default config;