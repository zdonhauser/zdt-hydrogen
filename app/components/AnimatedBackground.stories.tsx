import type { Meta, StoryObj } from '@storybook/react-vite'
import { AnimatedBackground } from './AnimatedBackground'

const meta: Meta<typeof AnimatedBackground> = {
  title: 'Components/AnimatedBackground',
  component: AnimatedBackground,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'An animated background component that creates scrolling text patterns. Used to add visual interest behind content sections.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    text: {
      control: 'text',
      description: 'The text to repeat in the animated background',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes for styling',
    },
    textColor: {
      control: 'select',
      options: ['text-blue-200', 'text-red-200', 'text-green-200', 'text-yellow-200', 'text-purple-200'],
      description: 'Tailwind text color class',
    },
    opacity: {
      control: 'select', 
      options: ['opacity-10', 'opacity-20', 'opacity-30', 'opacity-40'],
      description: 'Tailwind opacity class',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    text: 'ZDT\'S AMUSEMENT PARK',
    textColor: 'text-blue-200',
    opacity: 'opacity-20',
  },
  parameters: {
    docs: {
      description: {
        story: 'Default animated background with ZDT\'s branding text.',
      },
    },
  },
}

export const PartyTheme: Story = {
  args: {
    text: 'PARTY TIME',
    textColor: 'text-yellow-200',
    opacity: 'opacity-30',
  },
  parameters: {
    docs: {
      description: {
        story: 'Party-themed animated background with yellow text.',
      },
    },
  },
}

export const CustomText: Story = {
  args: {
    text: 'CUSTOM BACKGROUND',
    textColor: 'text-purple-200',
    opacity: 'opacity-40',
  },
  parameters: {
    docs: {
      description: {
        story: 'Example with custom text and purple coloring.',
      },
    },
  },
}

export const HighContrast: Story = {
  args: {
    text: 'HIGH VISIBILITY',
    textColor: 'text-red-200',
    opacity: 'opacity-40',
  },
  parameters: {
    docs: {
      description: {
        story: 'Higher contrast version for emphasis.',
      },
    },
  },
}