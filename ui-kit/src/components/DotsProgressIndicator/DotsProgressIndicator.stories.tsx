import type { Meta, StoryObj } from '@storybook/react'
import { DotsProgressIndicator } from './index'

const meta: Meta = {
  title: 'Components/DotsProgressIndicator',
  component: DotsProgressIndicator,
  parameters: {
    layout: 'centered',
  },
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: function DefaultStory() {
    return <DotsProgressIndicator />
  },
}
