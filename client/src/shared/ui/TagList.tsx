import { NavLink } from 'react-router'
import styled from 'styled-components'
import type { BuildSearchParamsInput } from '../utils/buildSearchParams'
import { buildSearchParams } from '../utils'

interface IProps {
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

export const TagList = ({ tags, url, position, onClick }: IProps) => {
  return (
    <TagContainer position={position}>
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
              <TagChip>
                {tag}
                {onClick && (
                  <TagRemoveButton
                    type='button'
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      onClick(tag)
                    }}
                    aria-label={`Удалить тег ${tag}`}
                  >
                    ×
                  </TagRemoveButton>
                )}
              </TagChip>
            </NavLink>
          ) : (
            <TagChip key={tag}>
              {tag}
              {onClick && (
                <TagRemoveButton type='button' onClick={() => onClick(tag)} aria-label={`Удалить тег ${tag}`}>
                  ×
                </TagRemoveButton>
              )}
            </TagChip>
          ),
        )}
    </TagContainer>
  )
}

const positions = {
  left: 'flex-start',
  center: 'center',
  right: 'flex-end',
} as const

const TagContainer = styled.div<{
  position?: keyof typeof positions
}>`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0.5rem 0;
  min-height: 2rem;
  justify-content: ${({ position }) => (position ? positions[position] : 'flex-start')};
`

const TagChip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.75rem;
  border: 1px solid var(--input-border);
  border-radius: var(--radius-xl);
  background: var(--surface-elevated);
  color: var(--text-color);
  font-size: 0.85rem;
  font-weight: 500;
  text-decoration: none;
  transition:
    background-color var(--transition-fast),
    border-color var(--transition-fast);
  box-shadow: var(--shadow-sm);

  &:hover {
    background: var(--accent);
    border-color: var(--accent);
    color: white;
  }
`

const TagRemoveButton = styled.button`
  border: none;
  background: transparent;
  color: inherit;
  font-size: 1.1rem;
  line-height: 1;
  cursor: pointer;
  padding: 0;
  opacity: 0.8;

  &:hover {
    opacity: 1;
  }
`
