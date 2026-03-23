import { NavLink } from 'react-router'
import type { BuildSearchParamsInput } from '../../utils/buildSearchParams'
import { buildSearchParams } from '../../utils/buildSearchParams'
import styles from './TagList.module.css'

export interface TagListProps {
  tags?: string[]
  position?: 'left' | 'center' | 'right'
  url?: {
    pathname: string
    search: BuildSearchParamsInput
  }
  onClick?: (tagToRemove: string) => void
}

const positions = {
  left: styles.left,
  center: styles.center,
  right: styles.right,
} as const

const replaceTagInSearch = (search: BuildSearchParamsInput, tag: string) => {
  return buildSearchParams({ ...search, tags: [tag] })
}

export function TagList({ tags, url, position, onClick }: TagListProps) {
  const posClass = position ? positions[position] : styles.left
  return (
    <div className={`${styles.container} ${posClass}`}>
      {tags &&
        tags.length > 0 &&
        tags.map((tag) =>
          url ? (
            <NavLink
              key={tag}
              to={{
                pathname: url.pathname,
                search: replaceTagInSearch(url.search, tag),
              }}
            >
              <span className={styles.chip}>
                {tag}
                {onClick && (
                  <button
                    type="button"
                    className={styles.remove}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      onClick(tag)
                    }}
                    aria-label={`Удалить тег ${tag}`}
                  >
                    ×
                  </button>
                )}
              </span>
            </NavLink>
          ) : (
            <span key={tag} className={styles.chip}>
              {tag}
              {onClick && (
                <button
                  type="button"
                  className={styles.remove}
                  onClick={() => onClick(tag)}
                  aria-label={`Удалить тег ${tag}`}
                >
                  ×
                </button>
              )}
            </span>
          ),
        )}
    </div>
  )
}
