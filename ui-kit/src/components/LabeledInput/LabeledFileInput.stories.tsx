import type { Meta, StoryObj } from '@storybook/react'
import { LabeledFileInput } from './index'

const meta: Meta = {
  title: 'Components/LabeledFileInput',
  component: LabeledFileInput,
  parameters: {
    layout: 'centered',
  },
}

export default meta

type Story = StoryObj<typeof meta>

const fieldWidth = { width: 320 } as const

export const Default: Story = {
  render: function DefaultStory() {
    return (
      <div style={fieldWidth}>
        <LabeledFileInput label="Choose files" name="files" id="story-file-input" />
      </div>
    )
  },
}

export const Disabled: Story = {
  render: function DisabledStory() {
    return (
      <div style={fieldWidth}>
        <LabeledFileInput label="Upload disabled" name="files-disabled" id="story-file-disabled" disabled />
      </div>
    )
  },
}
