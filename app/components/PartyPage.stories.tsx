import type { Meta, StoryObj } from '@storybook/react'
import PartyPage from './PartyPage'

const meta: Meta<typeof PartyPage> = {
  title: 'Pages/PartyPage',
  component: PartyPage,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'The Party Page displays information about available party rooms, pricing, food options, and booking details for ZDT\'s adventure park.',
      },
    },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: 'The default party page showing all party room options, pricing, and booking information.',
      },
    },
  },
}

export const MobileView: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'iphone12',
    },
    docs: {
      description: {
        story: 'Party page optimized for mobile devices with responsive layout.',
      },
    },
  },
}

export const TabletView: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'ipad',
    },
    docs: {
      description: {
        story: 'Party page layout on tablet devices.',
      },
    },
  },
}