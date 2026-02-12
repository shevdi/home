import { NavLink } from 'react-router'
import styled from 'styled-components'
import { IPhotoSearchParams } from '../types'
import { buildSearchParams } from '../utils'

interface IProps {
  tags?: string[]
  position?: 'left' | 'center' | 'right'
  url?: {
    pathname: string
    search: IPhotoSearchParams
  }
  onClick?: (tagToRemove: string) => void
}

const replaceTagInSearch = (search: IPhotoSearchParams, tag: string) => {
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
                  <TagRemoveButton type='button' onClick={() => onClick(tag)} aria-label={`Удалить тег ${tag}`}>
                    x
                  </TagRemoveButton>
                )}
              </TagChip>
            </NavLink>
          ) : (
            <TagChip key={tag}>
              {tag}
              {onClick && (
                <TagRemoveButton type='button' onClick={() => onClick(tag)} aria-label={`Удалить тег ${tag}`}>
                  x
                </TagRemoveButton>
              )}
            </TagChip>
          ),
        )}
    </TagContainer>
  )
}

const positions = {
  left: 'start',
  center: 'center',
  right: 'end',
} as const

const TagContainer = styled.div<{
  position?: keyof typeof positions
}>`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0.5rem 0;
  min-height: 2rem;
  justify-content: ${({ position }) => (position ? positions[position] : 'start')};
`
const TagChip = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.6rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  background: #f5f5f5;
  color: #333;
  font-size: 0.9rem;
`

const TagRemoveButton = styled.button`
  border: none;
  background: transparent;
  color: #666;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0;

  &:hover {
    color: #000;
  }
`
