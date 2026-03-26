import { useId, useState, type CSSProperties } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from '../components/Button'
import { Calendar } from '../components/Calendar'
import { Checkbox } from '../components/Checkbox'
import { DotsProgressIndicator } from '../components/DotsProgressIndicator'
import { Dropdown } from '../components/Dropdown'
import { ErrMessage } from '../components/ErrMessage'
import { Error } from '../components/Error'
import { Input } from '../components/Input'
import { LabeledInput, LabeledFileInput } from '../components/LabeledInput'
import { TagChips } from '../components/TagChips'
import { UploadLabel } from '../components/UploadLabel'

const meta: Meta = {
  title: 'Foundations/Sizes',
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta

type Story = StoryObj<typeof meta>

const page: CSSProperties = {
  maxWidth: 720,
  margin: '0 auto',
  padding: '2rem 1.5rem 3rem',
}

const intro: CSSProperties = {
  marginBottom: '2rem',
}

const title: CSSProperties = {
  margin: '0 0 0.5rem',
  fontSize: '1.5rem',
  fontWeight: 600,
}

const lead: CSSProperties = {
  margin: 0,
  fontSize: '0.95rem',
  color: 'var(--text-muted)',
  lineHeight: 1.5,
}

const section: CSSProperties = {
  marginBottom: '2.25rem',
}

const sectionTitle: CSSProperties = {
  fontSize: '0.7rem',
  fontWeight: 600,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
  margin: '0 0 0.75rem',
}

const stack: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
  alignItems: 'flex-start',
}

const fieldWidth: CSSProperties = { width: '100%', maxWidth: 320 }

const SAMPLE_OPTIONS = [
  { value: 'a', label: 'Option A' },
  { value: 'b', label: 'Option B' },
  { value: 'c', label: 'Option C' },
]

const SAMPLE_TAGS = ['alpha', 'beta', 'gamma']

const calendarPanel: CSSProperties = {
  width: '100%',
  maxWidth: 300,
  padding: '1rem',
  background: 'var(--input-bg)',
  border: '1px solid var(--input-border)',
  borderRadius: 'var(--radius-lg)',
  boxShadow: 'var(--shadow-md)',
}

export const Overview: Story = {
  render: function OverviewStory() {
    const [ddSm, setDdSm] = useState('a')
    const [ddMd, setDdMd] = useState('b')
    const [ddLg, setDdLg] = useState('c')
    const [cbSm, setCbSm] = useState(true)
    const [cbMd, setCbMd] = useState(true)
    const [cbLg, setCbLg] = useState(true)
    const [calSm, setCalSm] = useState<Date | null>(new Date())
    const [calMd, setCalMd] = useState<Date | null>(new Date())
    const [calLg, setCalLg] = useState<Date | null>(new Date())
    const idSm = useId()
    const idMd = useId()
    const idLg = useId()

    return (
      <div style={page}>
        <header style={intro}>
          <h1 style={title}>Component sizes</h1>
          <p style={lead}>
            Shared scale <code>sm</code> · <code>md</code> · <code>lg</code> across form controls, feedback, and media. Use this page to compare density in one place.
          </p>
        </header>

        <section style={section}>
          <h2 style={sectionTitle}>Button</h2>
          <div style={{ ...stack, flexDirection: 'row', flexWrap: 'wrap', gap: '0.5rem' }}>
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>
        </section>

        <section style={section}>
          <h2 style={sectionTitle}>Input</h2>
          <div style={{ ...stack, ...fieldWidth }}>
            <Input size="sm" placeholder="Small" name="overview-in-sm" aria-label="Small" />
            <Input size="md" placeholder="Medium" name="overview-in-md" aria-label="Medium" />
            <Input size="lg" placeholder="Large" name="overview-in-lg" aria-label="Large" />
          </div>
        </section>

        <section style={section}>
          <h2 style={sectionTitle}>LabeledInput</h2>
          <div style={{ ...stack, ...fieldWidth }}>
            <LabeledInput label="Small" name="overview-li-sm" size="sm" placeholder="Small" />
            <LabeledInput label="Medium" name="overview-li-md" size="md" placeholder="Medium" />
            <LabeledInput label="Large" name="overview-li-lg" size="lg" placeholder="Large" />
          </div>
        </section>

        <section style={section}>
          <h2 style={sectionTitle}>Dropdown</h2>
          <div style={{ ...stack, ...fieldWidth }}>
            <Dropdown
              label="Small"
              id="overview-dd-sm"
              name="overview-dd-sm"
              options={SAMPLE_OPTIONS}
              value={ddSm}
              size="sm"
              onChange={(e) => setDdSm(e.target.value)}
            />
            <Dropdown
              label="Medium"
              id="overview-dd-md"
              name="overview-dd-md"
              options={SAMPLE_OPTIONS}
              value={ddMd}
              size="md"
              onChange={(e) => setDdMd(e.target.value)}
            />
            <Dropdown
              label="Large"
              id="overview-dd-lg"
              name="overview-dd-lg"
              options={SAMPLE_OPTIONS}
              value={ddLg}
              size="lg"
              onChange={(e) => setDdLg(e.target.value)}
            />
          </div>
        </section>

        <section style={section}>
          <h2 style={sectionTitle}>Checkbox</h2>
          <div style={stack}>
            <Checkbox checked={cbSm} onChange={setCbSm} size="sm" label="Small" />
            <Checkbox checked={cbMd} onChange={setCbMd} size="md" label="Medium" />
            <Checkbox checked={cbLg} onChange={setCbLg} size="lg" label="Large" />
          </div>
        </section>

        <section style={section}>
          <h2 style={sectionTitle}>ErrMessage</h2>
          <div style={stack}>
            <ErrMessage role="alert" size="sm">
              Small validation text.
            </ErrMessage>
            <ErrMessage role="alert" size="md">
              Medium validation text.
            </ErrMessage>
            <ErrMessage role="alert" size="lg">
              Large validation text.
            </ErrMessage>
          </div>
        </section>

        <section style={section}>
          <h2 style={sectionTitle}>Error</h2>
          <div style={{ ...stack, width: '100%' }}>
            <Error size="sm" title="Small" message="Compact error panel." />
            <Error size="md" title="Medium" message="Default error panel." />
            <Error size="lg" title="Large" message="Spacious error panel." />
          </div>
        </section>

        <section style={section}>
          <h2 style={sectionTitle}>TagChips</h2>
          <div style={stack}>
            <TagChips tags={SAMPLE_TAGS} size="sm" />
            <TagChips tags={SAMPLE_TAGS} size="md" />
            <TagChips tags={SAMPLE_TAGS} size="lg" />
          </div>
        </section>

        <section style={section}>
          <h2 style={sectionTitle}>DotsProgressIndicator</h2>
          <div style={{ ...stack, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: '1.25rem' }}>
            <DotsProgressIndicator size="sm" aria-label="Loading small" />
            <DotsProgressIndicator size="md" aria-label="Loading medium" />
            <DotsProgressIndicator size="lg" aria-label="Loading large" />
          </div>
        </section>

        <section style={section}>
          <h2 style={sectionTitle}>UploadLabel</h2>
          <div style={stack}>
            <UploadLabel htmlFor={idSm} size="sm">
              Small drop zone
            </UploadLabel>
            <input id={idSm} type="file" style={{ maxWidth: 280 }} />
            <UploadLabel htmlFor={idMd} size="md">
              Medium drop zone
            </UploadLabel>
            <input id={idMd} type="file" style={{ maxWidth: 280 }} />
            <UploadLabel htmlFor={idLg} size="lg">
              Large drop zone
            </UploadLabel>
            <input id={idLg} type="file" style={{ maxWidth: 280 }} />
          </div>
        </section>

        <section style={section}>
          <h2 style={sectionTitle}>LabeledFileInput</h2>
          <div style={{ ...stack, ...fieldWidth }}>
            <LabeledFileInput label="Small upload" name="overview-lf-sm" id="overview-lf-sm" size="sm" />
            <LabeledFileInput label="Medium upload" name="overview-lf-md" id="overview-lf-md" size="md" />
            <LabeledFileInput label="Large upload" name="overview-lf-lg" id="overview-lf-lg" size="lg" />
          </div>
        </section>

        <section style={{ marginBottom: 0 }}>
          <h2 style={sectionTitle}>Calendar</h2>
          <div style={{ ...stack, width: '100%' }}>
            <div style={calendarPanel}>
              <Calendar.Root>
                <Calendar.View size="sm" value={calSm} onChange={(v) => setCalSm(Array.isArray(v) ? v[0] ?? null : v)} />
                <Calendar.Footer>
                  <Calendar.ClearButton size="sm" onClick={() => setCalSm(null)}>
                    Сбросить
                  </Calendar.ClearButton>
                </Calendar.Footer>
              </Calendar.Root>
            </div>
            <div style={calendarPanel}>
              <Calendar.Root>
                <Calendar.View size="md" value={calMd} onChange={(v) => setCalMd(Array.isArray(v) ? v[0] ?? null : v)} />
                <Calendar.Footer>
                  <Calendar.ClearButton size="md" onClick={() => setCalMd(null)}>
                    Сбросить
                  </Calendar.ClearButton>
                </Calendar.Footer>
              </Calendar.Root>
            </div>
            <div style={calendarPanel}>
              <Calendar.Root>
                <Calendar.View
                  size="lg"
                  value={calLg}
                  onChange={(v) => setCalLg(Array.isArray(v) ? v[0] ?? null : v)}
                />
                <Calendar.Footer>
                  <Calendar.ClearButton size="lg" onClick={() => setCalLg(null)}>
                    Сбросить
                  </Calendar.ClearButton>
                </Calendar.Footer>
              </Calendar.Root>
            </div>
          </div>
        </section>
      </div>
    )
  },
}
