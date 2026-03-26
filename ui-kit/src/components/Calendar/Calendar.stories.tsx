import type { Meta, StoryObj } from '@storybook/react'
import { useState, type CSSProperties } from 'react'
import { Calendar } from './index'

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

export const Sizes: Story = {
  render: function SizesStory() {
    const [sm, setSm] = useState<Date | null>(new Date())
    const [md, setMd] = useState<Date | null>(new Date())
    const [lg, setLg] = useState<Date | null>(new Date())
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'flex-start' }}>
        <div style={panelStyle}>
          <Calendar.Root>
            <Calendar.View size="sm" value={sm} onChange={(v) => setSm(Array.isArray(v) ? v[0] ?? null : v)} />
            <Calendar.Footer>
              <Calendar.ClearButton size="sm" onClick={() => setSm(null)}>
                Сбросить
              </Calendar.ClearButton>
            </Calendar.Footer>
          </Calendar.Root>
        </div>
        <div style={panelStyle}>
          <Calendar.Root>
            <Calendar.View size="md" value={md} onChange={(v) => setMd(Array.isArray(v) ? v[0] ?? null : v)} />
            <Calendar.Footer>
              <Calendar.ClearButton size="md" onClick={() => setMd(null)}>
                Сбросить
              </Calendar.ClearButton>
            </Calendar.Footer>
          </Calendar.Root>
        </div>
        <div style={panelStyle}>
          <Calendar.Root>
            <Calendar.View size="lg" value={lg} onChange={(v) => setLg(Array.isArray(v) ? v[0] ?? null : v)} />
            <Calendar.Footer>
              <Calendar.ClearButton size="lg" onClick={() => setLg(null)}>
                Сбросить
              </Calendar.ClearButton>
            </Calendar.Footer>
          </Calendar.Root>
        </div>
      </div>
    )
  },
}
