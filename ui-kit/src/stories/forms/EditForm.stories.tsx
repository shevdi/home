import type { CSSProperties } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Button } from '../../components/Button'
import { Checkbox } from '../../components/Checkbox'
import { Field } from '../../components/Field'
import { Input } from '../../components/Input'
import { TaggedInput } from '../../components/TaggedInput'

/**
 * Visual reference: photo edit form (Field + Input + Checkbox + TaggedInput).
 * TagList (router links) stays in the client — chips only here.
 */
const meta: Meta = {
  title: 'Forms/EditForm',
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta

type Story = StoryObj<typeof meta>

const card: CSSProperties = {
  maxWidth: 480,
  margin: '2rem auto',
  padding: '1.5rem',
  background: 'var(--surface-elevated)',
  borderRadius: 'var(--radius-lg)',
  boxShadow: 'var(--shadow-md)',
  border: '1px solid var(--input-border)',
}

const fieldWrapper: CSSProperties = {
  marginBottom: '10px',
}

export const Default: Story = {
  render: function DefaultStory() {
    return (
      <section style={card}>
        <form
          onSubmit={(e) => {
            e.preventDefault()
          }}
        >
          <div style={fieldWrapper}>
            <Field label="Заголовок">
              <Input name="title" defaultValue="Вечерний пейзаж" />
            </Field>
          </div>
          <div style={fieldWrapper}>
            <Field label="Приоритет">
              <Input name="priority" type="number" defaultValue="3" />
            </Field>
          </div>
          <Checkbox checked={false} label="Приватное" onChange={() => {}} />
          <div style={fieldWrapper}>
            <Field label="Теги">
              <TaggedInput
                tags={['landscape', 'sunset']}
                onTagsChange={() => {}}
                inputValue=""
                onInputValueChange={() => {}}
                placeholder="Введите тег и нажмите Enter"
              />
            </Field>
          </div>
          <Button display="block" type="submit" margin="1rem auto 0">
            Сохранить
          </Button>
        </form>
      </section>
    )
  },
}

export const InteractiveTags: Story = {
  render: function InteractiveTagsStory() {
    const [tags, setTags] = useState<string[]>(['draft'])
    const [draft, setDraft] = useState('')
    return (
      <section style={card}>
        <form
          onSubmit={(e) => {
            e.preventDefault()
          }}
        >
          <div style={fieldWrapper}>
            <Field label="Заголовок">
              <Input name="title" defaultValue="Без названия" />
            </Field>
          </div>
          <div style={fieldWrapper}>
            <Field label="Теги">
              <TaggedInput
                tags={tags}
                onTagsChange={setTags}
                inputValue={draft}
                onInputValueChange={setDraft}
                placeholder="Добавьте тег"
              />
            </Field>
          </div>
          <Button type="button" display="block" margin="1rem auto 0" onClick={() => setTags([])}>
            Очистить теги
          </Button>
        </form>
      </section>
    )
  },
}
