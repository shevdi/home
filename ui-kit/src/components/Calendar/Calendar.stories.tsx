import type { Meta, StoryObj } from '@storybook/react'
import { useState, type CSSProperties } from 'react'
import { Calendar } from './Calendar'

const meta: Meta = {
  title: 'Components/Calendar',
  parameters: {
    layout: 'centered',
  },
}

export default meta

type Story = StoryObj<typeof meta>

const panelStyle: CSSProperties = {
  width: 300,
  padding: '1rem',
  background: 'var(--input-bg)',
  border: '1px solid var(--input-border)',
  borderRadius: 'var(--radius-lg)',
  boxShadow: 'var(--shadow-md)',
}

export const SingleDate: Story = {
  render: function SingleDateStory() {
    const [value, setValue] = useState<Date | null>(new Date())
    return (
      <div style={panelStyle}>
        <Calendar.Root>
          <Calendar.View value={value} onChange={(v) => setValue(Array.isArray(v) ? v[0] ?? null : v)} />
        </Calendar.Root>
      </div>
    )
  },
}

export const DateRange: Story = {
  render: function DateRangeStory() {
    const [value, setValue] = useState<[Date | null, Date | null]>([null, null])
    return (
      <div style={panelStyle}>
        <Calendar.Root>
          <Calendar.View selectRange allowPartialRange value={value} onChange={(v) => setValue(normalizeRange(v))} />
        </Calendar.Root>
      </div>
    )
  },
}

function normalizeRange(v: Date | [Date | null, Date | null] | null): [Date | null, Date | null] {
  if (v == null) return [null, null]
  if (Array.isArray(v)) return v
  return [v, v]
}

export const WithFooterAndClear: Story = {
  render: function WithFooterAndClearStory() {
    const [value, setValue] = useState<[Date | null, Date | null]>([null, null])
    return (
      <div style={panelStyle}>
        <Calendar.Root>
          <Calendar.View selectRange allowPartialRange value={value} onChange={(v) => setValue(normalizeRange(v))} />
          <Calendar.Footer>
            <Calendar.ClearButton onClick={() => setValue([null, null])}>Сбросить</Calendar.ClearButton>
          </Calendar.Footer>
        </Calendar.Root>
      </div>
    )
  },
}
