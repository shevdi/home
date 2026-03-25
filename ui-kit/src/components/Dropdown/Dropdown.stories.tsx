import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Dropdown } from './Dropdown'

const SAMPLE_OPTIONS = [
  { value: 'a', label: 'Option A' },
  { value: 'b', label: 'Option B' },
  { value: 'c', label: 'Option C' },
]

/** `Meta` without `typeof Dropdown` avoids Storybook requiring `args` for render-only controlled stories. */
const meta: Meta = {
  title: 'Components/Dropdown',
  component: Dropdown,
  parameters: {
    layout: 'centered',
  },
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: function DefaultStory() {
    const [value, setValue] = useState('a')
    return (
      <div style={{ width: 320 }}>
        <Dropdown
          label="Choose"
          id="dropdown-default"
          name="dropdown"
          options={SAMPLE_OPTIONS}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </div>
    )
  },
}

export const Sizes: Story = {
  render: function SizesStory() {
    const [sm, setSm] = useState('a')
    const [md, setMd] = useState('b')
    const [lg, setLg] = useState('c')
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: 320 }}>
        <Dropdown
          label="Small"
          id="dropdown-sm"
          name="dropdown-sm"
          options={SAMPLE_OPTIONS}
          value={sm}
          size="sm"
          onChange={(e) => setSm(e.target.value)}
        />
        <Dropdown
          label="Medium"
          id="dropdown-md"
          name="dropdown-md"
          options={SAMPLE_OPTIONS}
          value={md}
          size="md"
          onChange={(e) => setMd(e.target.value)}
        />
        <Dropdown
          label="Large"
          id="dropdown-lg"
          name="dropdown-lg"
          options={SAMPLE_OPTIONS}
          value={lg}
          size="lg"
          onChange={(e) => setLg(e.target.value)}
        />
      </div>
    )
  },
}

export const Disabled: Story = {
  render: function DisabledStory() {
    return (
      <div style={{ width: 320 }}>
        <Dropdown
          label="Disabled"
          id="dropdown-disabled"
          name="dropdown-disabled"
          options={SAMPLE_OPTIONS}
          value="a"
          disabled
          onChange={() => {}}
        />
      </div>
    )
  },
}
