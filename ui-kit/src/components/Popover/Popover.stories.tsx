import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Calendar } from '../Calendar/Calendar'
import { Popover } from './Popover'

const meta: Meta = {
  title: 'Components/Popover',
  parameters: {
    layout: 'centered',
  },
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: function DefaultStory() {
    return (
      <div style={{ minHeight: 280 }}>
        <Popover.Root>
          <Popover.Trigger asChild>
            <button
              type="button"
              style={{
                padding: '0.5rem 1rem',
                fontFamily: 'inherit',
                cursor: 'pointer',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--input-border)',
                background: 'var(--input-bg)',
                color: 'var(--text-color)',
              }}
            >
              Open popover
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content side="bottom" align="start">
              <p style={{ margin: 0, maxWidth: 240, fontSize: '0.9rem', color: 'var(--text-color)' }}>
                Popover content uses Radix positioning, focus management, and outside click to dismiss.
              </p>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>
    )
  },
}

function normalizeRange(v: Date | [Date | null, Date | null] | null): [Date | null, Date | null] {
  if (v == null) return [null, null]
  if (Array.isArray(v)) return v
  return [v, v]
}

export const WithCalendar: Story = {
  render: function WithCalendarStory() {
    const [open, setOpen] = useState(false)
    const [range, setRange] = useState<[Date | null, Date | null]>([null, null])

    const label =
      range[0] && range[1]
        ? `${range[0].toLocaleDateString('ru-RU')} — ${range[1].toLocaleDateString('ru-RU')}`
        : range[0]
          ? `${range[0].toLocaleDateString('ru-RU')} — …`
          : 'Выберите период'

    return (
      <div style={{ minHeight: 420 }}>
        <Popover.Root open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <button
              type="button"
              style={{
                minWidth: 280,
                padding: '0.65rem 1rem',
                fontFamily: 'inherit',
                cursor: 'pointer',
                textAlign: 'left' as const,
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--input-border)',
                background: 'var(--input-bg)',
                color: 'var(--text-color)',
              }}
            >
              {label}
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content side="bottom" align="start">
              <Calendar.Root>
                <Calendar.View
                  selectRange
                  allowPartialRange
                  value={range}
                  onChange={(v) => {
                    const next = normalizeRange(v)
                    setRange(next)
                    if (next[0] && next[1]) setOpen(false)
                  }}
                />
                <Calendar.Footer>
                  <Calendar.ClearButton
                    onClick={() => {
                      setRange([null, null])
                      setOpen(false)
                    }}
                  >
                    Сбросить
                  </Calendar.ClearButton>
                </Calendar.Footer>
              </Calendar.Root>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>
    )
  },
}
