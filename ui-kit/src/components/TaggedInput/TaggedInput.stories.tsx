import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Field } from '../Field'
import { TaggedInput, type TaggedSuggestion } from './TaggedInput'

/** `Meta` without `typeof TaggedInput` avoids Storybook requiring `args` for render-only stories. */
const meta: Meta = {
  title: 'Components/TaggedInput',
  component: TaggedInput,
  parameters: {
    layout: 'centered',
  },
}

export default meta

type Story = StoryObj<typeof meta>

const MOCK_USERS: TaggedSuggestion[] = [
  { value: '691e10a57ff26396ae21e047', label: 'Диман (691e10a57ff26396ae21e047)' },
  { value: '691e10a57ff26396ae21e048', label: 'Мария (691e10a57ff26396ae21e048)' },
  {
    value: '691e10a57ff26396ae21e049',
    label: (
      <span>
        Длинное имя
        <br />
        <small>вторая строка (691e10a57ff26396ae21e049)</small>
      </span>
    ),
  },
]

async function mockFetchSuggestions(query: string): Promise<TaggedSuggestion[]> {
  await new Promise((r) => setTimeout(r, 400))
  const q = query.trim().toLowerCase()
  if (!q) {
    return MOCK_USERS
  }
  return MOCK_USERS.filter((u) => {
    const text =
      typeof u.label === 'string'
        ? u.label
        : `${u.value}`
    return text.toLowerCase().includes(q)
  })
}

export const Autocomplete: Story = {
  render: function AutocompleteStory() {
    const [tags, setTags] = useState<string[]>([])
    const [draft, setDraft] = useState('')
    return (
      <div style={{ width: 320 }}>
        <Field label='Пользователи (mock autocomplete)'>
          <TaggedInput
            tags={tags}
            onTagsChange={setTags}
            inputValue={draft}
            onInputValueChange={setDraft}
            fetchSuggestions={mockFetchSuggestions}
            suggestionDebounceMs={250}
            placeholder='Начните вводить имя'
            id='tagged-input-autocomplete'
          />
        </Field>
      </div>
    )
  },
}
