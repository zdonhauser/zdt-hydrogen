import type { Preview } from '@storybook/react-vite'
import React from 'react'
import '../app/styles/app.css'

const preview: Preview = {
  decorators: [
    (Story) => (
      <div data-testid="storybook-wrapper">
        <Story />
      </div>
    ),
  ],
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#ffffff',
        },
        {
          name: 'dark',
          value: '#333333',
        },
      ],
    },
  },
};

export default preview;