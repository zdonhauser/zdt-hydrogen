import type { Meta, StoryObj } from '@storybook/react-vite'
import Hero from './Hero'

const meta: Meta<typeof Hero> = {
  title: 'Components/Hero',
  component: Hero,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'The main hero component with video background and scroll-triggered playback. Shows park information and ticket call-to-action.',
      },
    },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    id: 'hero-main',
  },
  parameters: {
    docs: {
      description: {
        story: 'Default hero component as it appears on the homepage with responsive video background.',
      },
    },
  },
}

export const WithCustomId: Story = {
  args: {
    id: 'hero-custom',
  },
  parameters: {
    docs: {
      description: {
        story: 'Hero component with a custom ID for targeting specific instances.',
      },
    },
  },
}