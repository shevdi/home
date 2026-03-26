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

export const Sizes: Story = {
  render: function SizesStory() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-start' }}>
        <DotsProgressIndicator size="sm" />
        <DotsProgressIndicator size="md" />
        <DotsProgressIndicator size="lg" />
      </div>
    )
  },
}
