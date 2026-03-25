import type { CSSProperties } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Button } from '../../components/Button/Button'
import { Checkbox } from '../../components/Checkbox/Checkbox'
import { Field } from '../../components/Field/Field'
import { Input } from '../../components/Input/Input'
import { TaggedInput } from '../../components/TaggedInput/TaggedInput'

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

export const Default: Story = {
  render: function DefaultStory() {
    return (
      <section style={card}>
        <form
          onSubmit={(e) => {
            e.preventDefault()
          }}
        >
          <Field label="Заголовок">
            <Input name="title" defaultValue="Вечерний пейзаж" />
          </Field>
          <Field label="Приоритет">
            <Input name="priority" type="number" defaultValue="3" />
          </Field>
          <Checkbox checked={false} label="Приватное" onChange={() => {}} />
          <Field label="Теги">
            <TaggedInput
              tags={['landscape', 'sunset']}
              onTagsChange={() => {}}
              inputValue=""
              onInputValueChange={() => {}}
              placeholder="Введите тег и нажмите Enter"
            />
          </Field>
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
          <Field label="Заголовок">
            <Input name="title" defaultValue="Без названия" />
          </Field>
          <Field label="Теги">
            <TaggedInput
              tags={tags}
              onTagsChange={setTags}
              inputValue={draft}
              onInputValueChange={setDraft}
              placeholder="Добавьте тег"
            />
          </Field>
          <Button type="button" display="block" margin="1rem auto 0" onClick={() => setTags([])}>
            Очистить теги
          </Button>
        </form>
      </section>
    )
  },
}
