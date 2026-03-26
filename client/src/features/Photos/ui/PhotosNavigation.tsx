import styled from 'styled-components'
import { Link } from 'react-router'
import { ILink } from '@shevdi-home/shared'

interface PhotosNavigationProps {
  photo: ILink | null | undefined
  neighbours: (ILink | undefined)[]
  pathSuffix?: string
}

export function PhotosNavigation({ photo, neighbours, pathSuffix = '' }: PhotosNavigationProps) {
  return (
    <Container>
      <div>
        {neighbours[0] && (
          <NavLink to={{ pathname: `/photos/${neighbours[0]._id}${pathSuffix}` }}>← Предыдущее</NavLink>
        )}
      </div>
      <div>
        {photo && (
          <FullSizeLink href={photo?.fullSizeUrl} target='_blank' rel='noreferrer'>
            Полный размер
          </FullSizeLink>
        )}
      </div>
      <div>
        {neighbours[1] && <NavLink to={{ pathname: `/photos/${neighbours[1]._id}${pathSuffix}` }}>Следующее →</NavLink>}
      </div>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
`

const NavLink = styled(Link)`
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--accent);
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`

const FullSizeLink = styled.a`
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--accent);
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`
