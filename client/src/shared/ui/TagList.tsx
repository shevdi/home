import { NavLink } from 'react-router'
import { TagChips } from '@shevdi-home/ui-kit'
import { buildSearchParams, type BuildSearchParamsInput } from '@/shared/utils'

export interface TagListProps {
  tags?: string[]
  position?: 'left' | 'center' | 'right'
  url?: {
    pathname: string
    search: BuildSearchParamsInput
  }
  onClick?: (tagToRemove: string) => void
}

const replaceTagInSearch = (search: BuildSearchParamsInput, tag: string) => {
  return buildSearchParams({ ...search, tags: [tag] })
}

/** Photo search tags with optional links to filtered search; composes `TagChips` from ui-kit with routing. */
export function TagList({ tags, url, position, onClick }: TagListProps) {
  if (!url) {
    return <TagChips tags={tags} position={position} onRemove={onClick} />
  }
  return (
    <TagChips
      tags={tags}
      position={position}
      onRemove={onClick}
      renderTag={(tag, chip) => (
        <NavLink
          to={{
            pathname: url.pathname,
            search: replaceTagInSearch(url.search, tag),
          }}
        >
          {chip}
        </NavLink>
      )}
    />
  )
}
