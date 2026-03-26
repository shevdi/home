import type { Meta, StoryObj } from '@storybook/react'
import { Loader } from './index'

const meta: Meta = {
  title: 'Components/Loader',
  component: Loader,
  parameters: {
    layout: 'centered',
  },
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: function DefaultStory() {
    return <Loader />
  },
}

export const WithMessage: Story = {
  render: function WithMessageStory() {
    return <Loader message="Загрузка…" />
  },
}

export const Inline: Story = {
  render: function InlineStory() {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span>Saving</span>
        <Loader inline />
      </div>
    )
  },
}
