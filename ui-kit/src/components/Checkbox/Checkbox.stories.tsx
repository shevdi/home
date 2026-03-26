import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Checkbox } from './index'

/** `Meta` without `typeof Checkbox` avoids Storybook requiring `args` for render-only controlled stories. */
const meta: Meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
  },
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: function DefaultStory() {
    const [checked, setChecked] = useState(false)
    return <Checkbox checked={checked} onChange={setChecked} />
  },
}

export const WithLabelRight: Story = {
  render: function WithLabelRightStory() {
    const [checked, setChecked] = useState(false)
    return <Checkbox checked={checked} onChange={setChecked} label="Accept terms" />
  },
}

export const WithLabelLeft: Story = {
  render: function WithLabelLeftStory() {
    const [checked, setChecked] = useState(false)
    return (
      <Checkbox checked={checked} onChange={setChecked} label="Notify me" labelPosition="left" />
    )
  },
}

export const Checked: Story = {
  render: function CheckedStory() {
    const [checked, setChecked] = useState(true)
    return <Checkbox checked={checked} onChange={setChecked} label="Subscribed" />
  },
}

export const Disabled: Story = {
  render: function DisabledStory() {
    const [checked, setChecked] = useState(false)
    return (
      <Checkbox checked={checked} onChange={setChecked} label="Disabled" disabled />
    )
  },
}

export const Sizes: Story = {
  render: function SizesStory() {
    const [sm, setSm] = useState(false)
    const [md, setMd] = useState(true)
    const [lg, setLg] = useState(false)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-start' }}>
        <Checkbox checked={sm} onChange={setSm} size="sm" label="Small" />
        <Checkbox checked={md} onChange={setMd} size="md" label="Medium" />
        <Checkbox checked={lg} onChange={setLg} size="lg" label="Large" />
      </div>
    )
  },
}
