import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Field } from './Field'
import { TextField } from '../TextField/TextField'

/** Use `Meta` without `typeof Field` so render-only stories are not forced to supply `args` for shorthand props (`label`, `children`). */
const meta: Meta = {
  title: 'Components/Field',
  component: Field,
  parameters: {
    layout: 'centered',
  },
}

export default meta

type Story = StoryObj<typeof meta>

export const Shorthand: Story = {
  render: function ShorthandStory() {
    const [value, setValue] = useState('')
    const [error, setError] = useState<string | undefined>()
    return (
      <form
        style={{ width: 320 }}
        onSubmit={(e) => {
          e.preventDefault()
          setError(value ? undefined : 'Required')
        }}
      >
        <Field label="Email" description="Work email only" error={error} required>
          <TextField value={value} onChange={(ev) => setValue(ev.target.value)} />
        </Field>
        <button type="submit">Submit</button>
      </form>
    )
  },
}

export const Compound: Story = {
  render: function CompoundStory() {
    const [value, setValue] = useState('')
    return (
      <form style={{ width: 320 }}>
        <Field.Root error={value ? undefined : 'Required'} required>
          <Field.Label>Email</Field.Label>
          <Field.Description>Work only</Field.Description>
          <Field.Control>
            <TextField value={value} onChange={(ev) => setValue(ev.target.value)} />
          </Field.Control>
          <Field.Error />
        </Field.Root>
      </form>
    )
  },
}
