import React, { useCallback, useId } from 'react'
import { Input } from '../Input'
import inputStyles from '../Input/Input.module.css'
import { TagChips } from '../TagChips'
import type { TagChipsProps } from '../TagChips'
import styles from './TaggedInput.module.css'
import { addCommittedToken, splitPaste } from './taggedInputTokens'
import type { TaggedSuggestion } from './taggedInputTypes'
import { useTaggedInputFieldRef } from './useTaggedInputFieldRef'
import { useTaggedInputSuggestions } from './useTaggedInputSuggestions'

export type { TaggedSuggestion } from './taggedInputTypes'

export interface TaggedInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue' | 'onChange' | 'type' | 'size'> {
  tags: string[]
  onTagsChange: (tags: string[]) => void
  inputValue: string
  onInputValueChange: (value: string) => void
  /** Matches `Input` and `TagChips` density. */
  size?: 'sm' | 'md' | 'lg'
  /** Where new tokens are inserted. `start` matches prepend + dedupe (e.g. location lists); `end` appends (e.g. tags). */
  insertAt?: 'start' | 'end'
  /** Chip row alignment (passed to `TagChips`). */
  position?: TagChipsProps['position']
  renderTag?: TagChipsProps['renderTag']
  /** When the draft is empty, Backspace removes the last tag. */
  backspaceRemovesLast?: boolean
  onOutsideClick?: () => void
  /**
   * When set, enables autocomplete: after `suggestionDebounceMs` the query is passed here and results are shown in a dropdown.
   * Domain-specific fetching (e.g. user search) lives in the parent.
   */
  fetchSuggestions?: (query: string) => Promise<TaggedSuggestion[]>
  /** Debounce before calling `fetchSuggestions` (default 250). */
  suggestionDebounceMs?: number
  /** When the user commits a row from the suggestion list (mouse or keyboard). */
  onCommitSuggestion?: (suggestion: TaggedSuggestion) => void
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
    size = 'md',
    disabled,
    className,
    onKeyDown,
    onPaste,
    fetchSuggestions,
    suggestionDebounceMs = 250,
    onCommitSuggestion,
    ...rest
  },
  ref,
) {
  const listboxId = useId()
  const {
    suggestions,
    loading,
    highlightIndex,
    setHighlightIndex,
    menuDismissed,
    setMenuDismissed,
    closeMenu,
    showPanel,
    autocompleteEnabled,
  } = useTaggedInputSuggestions({
    inputValue,
    fetchSuggestions,
    suggestionDebounceMs,
    disabled,
  })

  const wrapperRef = useTaggedInputFieldRef(onOutsideClick, closeMenu)

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

  const pickSuggestion = useCallback(
    (value: string) => {
      const picked = suggestions.find((s) => s.value === value)
      if (picked) onCommitSuggestion?.(picked)
      const { next, duplicate } = addCommittedToken(tags, value, insertAt)
      if (!duplicate) {
        onTagsChange(next)
      }
      onInputValueChange('')
      closeMenu()
    },
    [insertAt, onInputValueChange, onTagsChange, tags, closeMenu, suggestions, onCommitSuggestion],
  )

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event)
    if (event.defaultPrevented) return
    if (event.nativeEvent.isComposing) return

    const listLen = suggestions.length
    const hasHighlight = highlightIndex >= 0 && highlightIndex < listLen

    if (event.key === 'Escape' && showPanel) {
      event.preventDefault()
      closeMenu()
      return
    }

    if (showPanel && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
      event.preventDefault()
      if (event.key === 'ArrowDown') {
        if (listLen === 0) return
        setMenuDismissed(false)
        setHighlightIndex((i) => (i < listLen - 1 ? i + 1 : i))
      } else {
        setHighlightIndex((i) => (i > 0 ? i - 1 : -1))
      }
      return
    }

    if (menuDismissed && (event.key === 'ArrowDown' || event.key === 'ArrowUp') && listLen > 0) {
      event.preventDefault()
      setMenuDismissed(false)
      setHighlightIndex(event.key === 'ArrowDown' ? 0 : listLen - 1)
      return
    }

    if (event.key === 'Enter') {
      if (showPanel && hasHighlight) {
        event.preventDefault()
        pickSuggestion(suggestions[highlightIndex]!.value)
        return
      }
      event.preventDefault()
      commitDraft(inputValue)
      return
    }

    if (event.key === ',') {
      event.preventDefault()
      commitDraft(inputValue)
      closeMenu()
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
    closeMenu()
  }

  const handleRemove = (tag: string) => {
    onTagsChange(tags.filter((t) => t !== tag))
  }

  const activeDescendantId =
    showPanel && highlightIndex >= 0 && highlightIndex < suggestions.length
      ? `${listboxId}-opt-${highlightIndex}`
      : undefined

  const rootClass = [styles.root, className].filter(Boolean).join(' ')

  return (
    <div ref={wrapperRef} className={rootClass}>
      <div className={styles.inputWrap}>
        <Input
          ref={ref}
          type='text'
          disabled={disabled}
          className={inputStyles.input}
          size={size}
          value={inputValue}
          onChange={(e) => onInputValueChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          {...rest}
          {...(autocompleteEnabled
            ? {
                role: 'combobox' as const,
                'aria-expanded': showPanel,
                'aria-controls': showPanel ? listboxId : undefined,
                'aria-autocomplete': 'list' as const,
                'aria-activedescendant': activeDescendantId,
              }
            : {})}
        />
        {showPanel && (
          <ul
            id={listboxId}
            className={styles.suggestions}
            role='listbox'
            aria-label='Suggestions'
          >
            {loading && suggestions.length === 0 ? (
              <li className={styles.suggestionMuted} role='presentation'>
                …
              </li>
            ) : null}
            {suggestions.map((s, index) => (
              <li
                key={`${s.value}-${index}`}
                id={`${listboxId}-opt-${index}`}
                role='option'
                aria-selected={highlightIndex === index}
                className={[
                  styles.suggestion,
                  highlightIndex === index ? styles.suggestionActive : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onMouseDown={(e) => {
                  e.preventDefault()
                  pickSuggestion(s.value)
                }}
                onMouseEnter={() => setHighlightIndex(index)}
              >
                {s.label}
              </li>
            ))}
          </ul>
        )}
      </div>
      <TagChips
        tags={tags}
        position={position}
        size={size}
        disabled={disabled}
        onRemove={handleRemove}
        renderTag={renderTag}
      />
    </div>
  )
})
