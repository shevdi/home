import type { CSSProperties, KeyboardEvent } from 'react'
import type { ReactElement, ReactNode } from 'react'
import { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import { Checkbox, Field, Input } from '@/shared/ui'
import { TaggedInput } from '@shevdi-home/ui-kit'
import type { MergedView } from '../utils/perFileOptions'
import type { PerFileOptions } from '../utils/perFileOptions'
import { PLACEHOLDER_MIXED, PLACEHOLDER_SAVE_VALUE } from '../utils/formPlaceholders'
import type { TaggedSuggestion } from '@shevdi-home/ui-kit'
import { createAccessedByRenderTag } from '../utils/accessedByChipLabels'

const smallFormDensity: CSSProperties = {
  ['--font-size-label' as string]: '0.78rem',
  ['--font-size-field-error' as string]: '0.72rem',
  ['--font-size-field-description' as string]: '0.8rem',
}

type TagArrayField = 'country' | 'city' | 'tags' | 'accessedBy'

type BulkEditFormProps = {
  mergedView: MergedView
  selectionCount: number
  totalCount: number
  disabled?: boolean
  onScalarCommit: (field: keyof PerFileOptions, value: unknown) => void
  onTagAdd: (field: TagArrayField, tag: string) => void
  onTagRemove: (field: TagArrayField, tag: string) => void
  fetchUserSuggestions?: (query: string) => Promise<TaggedSuggestion[]>
  /** User id → display name for `accessedBy` chips only. */
  accessedByDisplayNames?: Record<string, string>
  onAccessedBySuggestionPick?: (suggestion: TaggedSuggestion) => void
}

function TagField({
  label,
  tags,
  field,
  disabled,
  placeholder,
  onTagAdd,
  onTagRemove,
  insertAt = 'end',
  fetchSuggestions,
  renderTag,
  onCommitSuggestion,
}: {
  label: string
  tags: string[]
  field: TagArrayField
  disabled?: boolean
  placeholder: string
  onTagAdd: (field: TagArrayField, tag: string) => void
  onTagRemove: (field: TagArrayField, tag: string) => void
  insertAt?: 'start' | 'end'
  fetchSuggestions?: (query: string) => Promise<TaggedSuggestion[]>
  renderTag?: (tag: string, chip: ReactElement) => ReactNode
  onCommitSuggestion?: (suggestion: TaggedSuggestion) => void
}) {
  const [inputValue, setInputValue] = useState('')

  const handleTagsChange = useCallback(
    (next: string[]) => {
      const removed = tags.filter((t) => !next.includes(t))
      const added = next.filter((t) => !tags.includes(t))
      for (const t of removed) onTagRemove(field, t)
      for (const t of added) onTagAdd(field, t)
    },
    [tags, field, onTagAdd, onTagRemove],
  )

  return (
    <Field label={label}>
      <TaggedInput
        tags={tags}
        onTagsChange={handleTagsChange}
        inputValue={inputValue}
        onInputValueChange={setInputValue}
        placeholder={placeholder}
        disabled={disabled}
        size='sm'
        insertAt={insertAt}
        fetchSuggestions={fetchSuggestions}
        renderTag={renderTag}
        onCommitSuggestion={onCommitSuggestion}
      />
    </Field>
  )
}

export function BulkEditForm({
  mergedView,
  selectionCount,
  totalCount,
  disabled = false,
  onScalarCommit,
  onTagAdd,
  onTagRemove,
  fetchUserSuggestions,
  accessedByDisplayNames,
  onAccessedBySuggestionPick,
}: BulkEditFormProps) {
  const [titleDraft, setTitleDraft] = useState('')
  const [priorityDraft, setPriorityDraft] = useState('')

  useEffect(() => {
    setTitleDraft(mergedView.title ?? '')
  }, [mergedView.title])

  useEffect(() => {
    setPriorityDraft(mergedView.priority !== undefined ? String(mergedView.priority) : '')
  }, [mergedView.priority])

  const commitTitle = useCallback(() => {
    onScalarCommit('title', titleDraft)
  }, [onScalarCommit, titleDraft])

  const commitPriority = useCallback(() => {
    const n = Number(priorityDraft)
    onScalarCommit('priority', Number.isFinite(n) ? n : 0)
  }, [onScalarCommit, priorityDraft])

  const handleKeyDown = useCallback(
    (commit: () => void) => (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        commit()
      }
    },
    [],
  )

  const selectionLabel =
    selectionCount > 0
      ? `Редактирование (${selectionCount} из ${totalCount} выбрано)`
      : `Редактирование (все ${totalCount})`

  return (
    <FormRoot style={smallFormDensity}>
      <SectionLabel>{selectionLabel}</SectionLabel>
      <Checkbox
        checked={mergedView.private ?? false}
        onChange={(checked) => onScalarCommit('private', checked)}
        label={mergedView.private === undefined ? 'Скрыть (разные значения)' : 'Скрыть'}
        disabled={disabled}
        size='sm'
      />
      <FieldsGrid>
        <Field label='Заголовок'>
          <Input
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onKeyDown={handleKeyDown(commitTitle)}
            placeholder={
              mergedView.title === undefined ? PLACEHOLDER_MIXED : PLACEHOLDER_SAVE_VALUE
            }
            disabled={disabled}
            size='sm'
          />
        </Field>
        <Field label='Приоритет'>
          <Input
            type='number'
            value={priorityDraft}
            onChange={(e) => setPriorityDraft(e.target.value)}
            onKeyDown={handleKeyDown(commitPriority)}
            placeholder={
              mergedView.priority === undefined
                ? PLACEHOLDER_MIXED
                : PLACEHOLDER_SAVE_VALUE
            }
            disabled={disabled}
            size='sm'
          />
        </Field>
        <TagField
          label='Страна'
          tags={mergedView.country}
          field='country'
          disabled={disabled}
          placeholder={PLACEHOLDER_SAVE_VALUE}
          onTagAdd={onTagAdd}
          onTagRemove={onTagRemove}
          insertAt='start'
        />
        <TagField
          label='Город'
          tags={mergedView.city}
          field='city'
          disabled={disabled}
          placeholder={PLACEHOLDER_SAVE_VALUE}
          onTagAdd={onTagAdd}
          onTagRemove={onTagRemove}
          insertAt='start'
        />
        <TagField
          label='Теги'
          tags={mergedView.tags}
          field='tags'
          disabled={disabled}
          placeholder={PLACEHOLDER_SAVE_VALUE}
          onTagAdd={onTagAdd}
          onTagRemove={onTagRemove}
        />
        {fetchUserSuggestions && (
          <TagField
            label='Доступ для пользователей'
            tags={mergedView.accessedBy}
            field='accessedBy'
            disabled={disabled}
            placeholder={PLACEHOLDER_SAVE_VALUE}
            onTagAdd={onTagAdd}
            onTagRemove={onTagRemove}
            fetchSuggestions={fetchUserSuggestions}
            renderTag={createAccessedByRenderTag(accessedByDisplayNames ?? {})}
            onCommitSuggestion={onAccessedBySuggestionPick}
          />
        )}
      </FieldsGrid>
    </FormRoot>
  )
}

const FormRoot = styled.div`
  margin: 1rem 0;
`

const SectionLabel = styled.div`
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
`

const FieldsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem 1.25rem;
`
