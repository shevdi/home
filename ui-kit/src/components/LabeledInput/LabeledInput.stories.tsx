import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { LabeledInput } from './index'

const meta: Meta = {
  title: 'Components/LabeledInput',
  component: LabeledInput,
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
        <LabeledInput label="Title" name="title" placeholder="Enter title" />
      </div>
    )
  },
}

export const Sizes: Story = {
  render: function SizesStory() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', ...fieldWidth }}>
        <LabeledInput label="Small" name="s-sm" size="sm" placeholder="Small" />
        <LabeledInput label="Medium" name="s-md" size="md" placeholder="Medium" />
        <LabeledInput label="Large" name="s-lg" size="lg" placeholder="Large" />
      </div>
    )
  },
}

export const WithError: Story = {
  render: function WithErrorStory() {
    return (
      <div style={fieldWidth}>
        <LabeledInput label="Email" name="email" error="Invalid email" defaultValue="bad" />
      </div>
    )
  },
}

export const FocusOnMount: Story = {
  render: function FocusOnMountStory() {
    return (
      <div style={fieldWidth}>
        <LabeledInput label="Search" name="search" focus placeholder="Focused on load" />
      </div>
    )
  },
}

export const Controlled: Story = {
  render: function ControlledStory() {
    const [value, setValue] = useState('')
    return (
      <div style={fieldWidth}>
        <LabeledInput
          label="Name"
          name="name"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Type to update value below"
        />
        <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Value: {value || '—'}</p>
      </div>
    )
  },
}

export const OutsideClick: Story = {
  render: function OutsideClickStory() {
    const [log, setLog] = useState<string[]>([])
    return (
      <div style={fieldWidth}>
        <LabeledInput
          label="Click outside"
          name="outside"
          placeholder="Blur wrapper logs"
          onOutsideClick={() => setLog((prev) => [...prev, `outside ${prev.length + 1}`])}
        />
        <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Events: {log.join(', ') || '—'}</p>
      </div>
    )
  },
}
