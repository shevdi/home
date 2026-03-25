import React, { Fragment } from 'react'
import styles from './TagChips.module.css'

const positions = {
  left: styles.left,
  center: styles.center,
  right: styles.right,
} as const

export interface TagChipsProps {
  tags?: string[]
  position?: 'left' | 'center' | 'right'
  /** Called when the user activates the remove control (×) on a tag. */
  onRemove?: (tag: string) => void
  /**
   * Wrap each chip (e.g. with a router link). Receives the tag and the default chip element.
   * Use for navigation; keep tag removal via onRemove on the inner button.
   */
  renderTag?: (tag: string, chip: React.ReactElement) => React.ReactNode
}

export function TagChips({ tags, position = 'left', onRemove, renderTag }: TagChipsProps) {
  const posClass = positions[position]
  if (!tags?.length) {
    return <div className={`${styles.container} ${posClass}`} />
  }
  return (
    <div className={`${styles.container} ${posClass}`}>
      {tags.map((tag) => {
        const chip = (
          <span className={styles.chip}>
            {tag}
            {onRemove ? (
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
