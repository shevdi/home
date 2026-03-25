import React, { useCallback } from 'react'
import { Input } from '../Input/Input'
import { TagChips } from '../TagChips/TagChips'
import type { TagChipsProps } from '../TagChips/TagChips'
import inputStyles from '../Input/Input.module.css'
import { useLabeledFieldOutsideClick } from '../LabeledInput/useLabeledFieldOutsideClick'
import styles from './TaggedInput.module.css'

export interface TaggedInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue' | 'onChange' | 'type'> {
  tags: string[]
  onTagsChange: (tags: string[]) => void
  inputValue: string
  onInputValueChange: (value: string) => void
  /** Where new tokens are inserted. `start` matches prepend + dedupe (e.g. location lists); `end` appends (e.g. tags). */
  insertAt?: 'start' | 'end'
  /** Chip row alignment (passed to `TagChips`). */
  position?: TagChipsProps['position']
  renderTag?: TagChipsProps['renderTag']
  /** When the draft is empty, Backspace removes the last tag. */
  backspaceRemovesLast?: boolean
  onOutsideClick?: () => void
}

function addCommittedToken(
  tags: string[],
  raw: string,
  insertAt: 'start' | 'end',
): { next: string[]; duplicate: boolean } {
  const trimmed = raw.trim()
  if (!trimmed) {
    return { next: tags, duplicate: false }
  }
  if (insertAt === 'end') {
    if (tags.includes(trimmed)) {
      return { next: tags, duplicate: true }
    }
    return { next: [...tags, trimmed], duplicate: false }
  }
  return { next: Array.from(new Set([trimmed, ...tags])), duplicate: false }
}

function splitPaste(text: string): string[] {
  return text
    .split(/[\n,;]+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

export const TaggedInput = React.forwardRef<HTMLInputElement, TaggedInputProps>(function TaggedInput(
  {
    tags,
    onTagsChange,
    inputValue,
    onInputValueChange,
    insertAt = 'end',
    position = 'left',
    renderTag,
    backspaceRemovesLast = true,
    onOutsideClick,
    disabled,
    className,
    onKeyDown,
    onPaste,
    ...rest
  },
  ref,
) {
  const wrapperRef = useLabeledFieldOutsideClick(onOutsideClick)

  const commitDraft = useCallback(
    (draft: string) => {
      const trimmed = draft.trim()
      if (!trimmed) {
        onInputValueChange('')
        return
      }
      const { next, duplicate } = addCommittedToken(tags, draft, insertAt)
      if (duplicate) {
        onInputValueChange('')
        return
      }
      onTagsChange(next)
      onInputValueChange('')
    },
    [insertAt, onInputValueChange, onTagsChange, tags],
  )

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event)
    if (event.defaultPrevented) return
    if (event.nativeEvent.isComposing) return

    if (event.key === 'Enter') {
      event.preventDefault()
      commitDraft(inputValue)
      return
    }

    if (event.key === ',') {
      event.preventDefault()
      commitDraft(inputValue)
      return
    }

    if (event.key === 'Backspace' && backspaceRemovesLast && inputValue === '' && tags.length > 0) {
      event.preventDefault()
      onTagsChange(tags.slice(0, -1))
    }
  }

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    onPaste?.(event)
    if (event.defaultPrevented) return
    const text = event.clipboardData.getData('text')
    if (!text || !/[\n,;]/.test(text)) return
    event.preventDefault()
    const parts = splitPaste(text)
    if (parts.length === 0) return
    let next = tags
    for (const part of parts) {
      const { next: merged, duplicate } = addCommittedToken(next, part, insertAt)
      if (!duplicate || insertAt === 'start') {
        next = merged
      }
    }
    if (next !== tags) {
      onTagsChange(next)
    }
    onInputValueChange('')
  }

  const handleRemove = (tag: string) => {
    onTagsChange(tags.filter((t) => t !== tag))
  }

  const rootClass = [styles.root, className].filter(Boolean).join(' ')

  return (
    <div ref={wrapperRef} className={rootClass}>
      <Input
        ref={ref}
        type="text"
        disabled={disabled}
        className={inputStyles.input}
        value={inputValue}
        onChange={(e) => onInputValueChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        {...rest}
      />
      <TagChips tags={tags} position={position} onRemove={handleRemove} renderTag={renderTag} />
    </div>
  )
})
