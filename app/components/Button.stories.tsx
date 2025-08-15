import type { Meta, StoryObj } from '@storybook/react'

// Simple Button component for testing Storybook setup
const Button = ({ children, variant = 'primary', ...props }: {
  children: React.ReactNode
  variant?: 'primary' | 'secondary'
} & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const baseClasses = 'px-4 py-2 rounded font-medium focus:outline-none focus:ring-2'
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500'
  }
  
  return (
    <button 
      className={`${baseClasses} ${variantClasses[variant]}`}
      {...props}
    >
      {children}
    </button>
  )
}

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary'],
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'primary',
  },
}

export const Secondary: Story = {
  args: {
    children: 'Secondary Button',
    variant: 'secondary',
  },
}

export const Large: Story = {
  args: {
    children: 'Large Button',
    variant: 'primary',
    style: { fontSize: '1.25rem', padding: '0.75rem 1.5rem' }
  },
}