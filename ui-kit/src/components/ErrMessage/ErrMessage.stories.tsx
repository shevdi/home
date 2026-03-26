import type { Meta, StoryObj } from '@storybook/react'
import { ErrMessage } from './index'

const meta: Meta = {
  title: 'Components/ErrMessage',
  component: ErrMessage,
  parameters: {
    layout: 'centered',
  },
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: function DefaultStory() {
    return (
      <ErrMessage role="alert" style={{ minWidth: 280 }}>
        Invalid credentials. Check your username and password.
      </ErrMessage>
    )
  },
}

export const Sizes: Story = {
  render: function SizesStory() {
    const text = 'Invalid credentials. Check your username and password.'
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-start', minWidth: 280 }}>
        <ErrMessage role="alert" size="sm">
          {text}
        </ErrMessage>
        <ErrMessage role="alert" size="md">
          {text}
        </ErrMessage>
        <ErrMessage role="alert" size="lg">
          {text}
        </ErrMessage>
      </div>
    )
  },
}
