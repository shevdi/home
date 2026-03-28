import React, { Fragment } from 'react'
import styles from './TagChips.module.css'

const positions = {
  left: styles.left,
  center: styles.center,
  right: styles.right,
} as const

const sizeClass = { sm: styles.sizeSm, md: styles.sizeMd, lg: styles.sizeLg } as const

export interface TagChipsProps {
  tags?: string[]
  position?: 'left' | 'center' | 'right'
  size?: 'sm' | 'md' | 'lg'
  /** When true, chips are non-interactive (no remove, muted like a disabled input). */
  disabled?: boolean
  /** Called when the user activates the remove control (×) on a tag. */
  onRemove?: (tag: string) => void
  /**
   * Wrap each chip (e.g. with a router link). Receives the tag and the default chip element.
   * Use for navigation; keep tag removal via onRemove on the inner button.
   */
  renderTag?: (tag: string, chip: React.ReactElement) => React.ReactNode
}

export function TagChips({
  tags,
  position = 'left',
  size = 'md',
  disabled = false,
  onRemove,
  renderTag,
}: TagChipsProps) {
  const posClass = positions[position]
  const containerClass = [
    styles.container,
    posClass,
    sizeClass[size],
    disabled ? styles.disabled : '',
  ]
    .filter(Boolean)
    .join(' ')
  if (!tags?.length) {
    return (
      <div
        className={containerClass}
        aria-disabled={disabled || undefined}
      />
    )
  }
  return (
    <div className={containerClass} aria-disabled={disabled || undefined}>
      {tags.map((tag) => {
        const chip = (
          <span className={styles.chip}>
            {tag}
            {onRemove && !disabled ? (
              <button
                type="button"
                className={styles.remove}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onRemove(tag)
                }}
                aria-label={`Удалить тег ${tag}`}
              >
                ×
              </button>
            ) : null}
          </span>
        )
        const inner = renderTag ? renderTag(tag, chip) : chip
        return <Fragment key={tag}>{inner}</Fragment>
      })}
    </div>
  )
}
