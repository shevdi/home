import type { Meta, StoryObj } from '@storybook/react'
import { ErrMessage } from './ErrMessage'

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
