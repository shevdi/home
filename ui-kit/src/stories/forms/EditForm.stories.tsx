import type { CSSProperties } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Button } from '../../components/Button'
import { Checkbox } from '../../components/Checkbox'
import { Field } from '../../components/Field'
import { Dropdown } from '../../components/Dropdown'
import type { DropdownOption } from '../../components/Dropdown'
import { Input } from '../../components/Input'
import { TaggedInput } from '../../components/TaggedInput'
import { formDensityVars, formStoryCardTag } from './formDensity'

/**
 * Visual reference: photo edit form (Field + Input + Dropdown + Checkbox + TaggedInput).
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

const CATEGORY_OPTIONS: DropdownOption[] = [
  { value: 'album', label: 'Альбом' },
  { value: 'collection', label: 'Коллекция' },
  { value: 'archive', label: 'Архив' },
]

export const Default: Story = {
  render: function DefaultStory() {
    const [category, setCategory] = useState('album')
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
          <div style={fieldWrapper}>
            <Dropdown
              label="Категория"
              id="edit-form-category"
              name="category"
              options={CATEGORY_OPTIONS}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
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

const sizeSectionLabel: CSSProperties = {
  fontSize: '0.7rem',
  fontWeight: 600,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
  margin: '0 0 0.5rem',
}

const sizesStack: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '2rem',
  maxWidth: 520,
  margin: '0 auto',
  padding: '1rem 1rem 2rem',
}

function EditFormAtSize({ size, nameSuffix }: { size: 'sm' | 'md' | 'lg'; nameSuffix: string }) {
  const [category, setCategory] = useState('album')
  return (
    <section style={{ ...card, ...formDensityVars[size] }}>
      <p style={{ ...sizeSectionLabel, ...formStoryCardTag[size] }}>
        {size === 'sm' ? 'Small' : size === 'md' ? 'Medium' : 'Large'} · {size}
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault()
        }}
      >
        <div style={fieldWrapper}>
          <Field label="Заголовок" error="Пример ошибки поля">
            <Input name={`title-${nameSuffix}`} defaultValue="Вечерний пейзаж" size={size} />
          </Field>
        </div>
        <div style={fieldWrapper}>
          <Field label="Приоритет">
            <Input name={`priority-${nameSuffix}`} type="number" defaultValue="3" size={size} />
          </Field>
        </div>
        <div style={fieldWrapper}>
          <Dropdown
            label="Категория"
            id={`edit-category-${nameSuffix}`}
            name={`category-${nameSuffix}`}
            options={CATEGORY_OPTIONS}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            size={size}
          />
        </div>
        <div style={fieldWrapper}>
          <Checkbox checked={false} label="Приватное" onChange={() => {}} size={size} />
        </div>
        <div style={fieldWrapper}>
          <Field label="Теги">
            <TaggedInput
              tags={['landscape', 'sunset']}
              onTagsChange={() => {}}
              inputValue=""
              onInputValueChange={() => {}}
              placeholder="Введите тег и нажмите Enter"
              size={size}
            />
          </Field>
        </div>
        <Button display="block" type="submit" margin="1rem auto 0" size={size}>
          Сохранить
        </Button>
      </form>
    </section>
  )
}

/** `sm` / `md` / `lg` on controls, Field labels, field errors, and card heading. */
export const Sizes: Story = {
  render: function SizesStory() {
    return (
      <div style={sizesStack}>
        <EditFormAtSize size="sm" nameSuffix="sm" />
        <EditFormAtSize size="md" nameSuffix="md" />
        <EditFormAtSize size="lg" nameSuffix="lg" />
      </div>
    )
  },
}
