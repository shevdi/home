import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { TextField } from './TextField'

/** `Meta` without `typeof TextField` avoids Storybook requiring `args` for render-only stories. */
const meta: Meta = {
  title: 'Components/TextField',
  component: TextField,
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
        <TextField placeholder="Type here" name="default" />
      </div>
    )
  },
}

export const FocusOnMount: Story = {
  render: function FocusOnMountStory() {
    return (
      <div style={fieldWidth}>
        <TextField focus placeholder="Focused on load" name="focus" />
      </div>
    )
  },
}

export const Disabled: Story = {
  render: function DisabledStory() {
    return (
      <div style={fieldWidth}>
        <TextField disabled value="Saved value" name="disabled" />
      </div>
    )
  },
}

export const Password: Story = {
  render: function PasswordStory() {
    return (
      <div style={fieldWidth}>
        <TextField type="password" placeholder="Password" name="password" autoComplete="new-password" />
      </div>
    )
  },
}

export const Controlled: Story = {
  render: function ControlledStory() {
    const [value, setValue] = useState('')
    return (
      <div style={fieldWidth}>
        <TextField
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Controlled input"
          name="controlled"
          aria-label="Controlled example"
        />
        <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Value: {value || '—'}</p>
      </div>
    )
  },
}

export const Invalid: Story = {
  render: function InvalidStory() {
    return (
      <div style={fieldWidth}>
        <TextField
          defaultValue="bad@example"
          placeholder="Email"
          name="email"
          aria-invalid
          aria-describedby="email-error"
        />
        <p id="email-error" role="alert" style={{ marginTop: '0.4rem', fontSize: '0.8rem', color: 'var(--error-color)' }}>
          Enter a valid email address
        </p>
      </div>
    )
  },
}
