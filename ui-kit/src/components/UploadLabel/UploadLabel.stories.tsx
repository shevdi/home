import type { Meta, StoryObj } from '@storybook/react'
import { useId } from 'react'
import { UploadLabel } from './index'

const meta: Meta = {
  title: 'Components/UploadLabel',
  component: UploadLabel,
  parameters: {
    layout: 'centered',
  },
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: function DefaultStory() {
    const id = useId()
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-start' }}>
        <UploadLabel htmlFor={id}>Choose a file</UploadLabel>
        <input id={id} type="file" style={{ maxWidth: 240 }} />
      </div>
    )
  },
}

export const Sizes: Story = {
  render: function SizesStory() {
    const sm = useId()
    const md = useId()
    const lg = useId()
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-start' }}>
        <UploadLabel htmlFor={sm} size="sm">
          Small drop zone
        </UploadLabel>
        <input id={sm} type="file" style={{ maxWidth: 240 }} />
        <UploadLabel htmlFor={md} size="md">
          Medium drop zone
        </UploadLabel>
        <input id={md} type="file" style={{ maxWidth: 240 }} />
        <UploadLabel htmlFor={lg} size="lg">
          Large drop zone
        </UploadLabel>
        <input id={lg} type="file" style={{ maxWidth: 240 }} />
      </div>
    )
  },
}

export const DragActive: Story = {
  render: function DragActiveStory() {
    const id = useId()
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-start' }}>
        <UploadLabel htmlFor={id} isDragActive>
          Drop files here
        </UploadLabel>
        <input id={id} type="file" />
      </div>
    )
  },
}

export const Disabled: Story = {
  render: function DisabledStory() {
    const id = useId()
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-start' }}>
        <UploadLabel htmlFor={id} disabled>
          Upload disabled
        </UploadLabel>
        <input id={id} type="file" disabled />
      </div>
    )
  },
}
