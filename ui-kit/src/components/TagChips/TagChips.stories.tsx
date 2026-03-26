import type { Meta, StoryObj } from '@storybook/react'
import { TagChips } from './index'

const meta: Meta = {
  title: 'Components/TagChips',
  component: TagChips,
  parameters: {
    layout: 'centered',
  },
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: function DefaultStory() {
    return <TagChips tags={['landscape', 'sunset', 'travel']} position="left" />
  },
}

export const Removable: Story = {
  render: function RemovableStory() {
    return (
      <TagChips
        tags={['draft', 'review']}
        onRemove={(tag) => {
          // eslint-disable-next-line no-console
          console.log('remove', tag)
        }}
      />
    )
  },
}

export const RightAligned: Story = {
  render: function RightAlignedStory() {
    return (
      <div style={{ width: 360 }}>
        <TagChips tags={['a', 'b']} position="right" />
      </div>
    )
  },
}
