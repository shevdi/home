import styled from 'styled-components'

interface IProps {
  tags?: string[]
  onClick?: (tagToRemove: string) => void
}

export const TagList = ({ tags, onClick }: IProps) => {
  return (
    <TagContainer>
      {tags &&
        tags.length > 0 &&
        tags.map((tag) => (
          <TagChip key={tag}>
            {tag}
            {onClick && (
              <TagRemoveButton type='button' onClick={() => onClick(tag)} aria-label={`Удалить тег ${tag}`}>
                x
              </TagRemoveButton>
            )}
          </TagChip>
        ))}
    </TagContainer>
  )
}

const TagContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
  min-height: 2rem;
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
