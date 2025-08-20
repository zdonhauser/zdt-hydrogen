import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: [
    "../app/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../stories/**/*.mdx", 
    "../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  addons: [
    "@storybook/addon-onboarding",
    "storybook-addon-remix-react-router",
    "@storybook/addon-docs"
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {
      builder: {
        viteConfigPath: 'storybook-vite.config.ts',
      },
    }
  },
  core: {
    disableTelemetry: true,
  },
  // Using separate storybook-vite.config.ts to avoid React Router plugin conflicts
  typescript: {
    reactDocgen: 'react-docgen-typescript',
  }
};
export default config;