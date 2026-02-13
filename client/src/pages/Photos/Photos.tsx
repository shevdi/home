import { Filter, PhotoGallery, Search } from '@/features/Photos'
import { useTitle } from '@/shared/hooks'
import { useAuth } from '@/shared/hooks/useAuth'
import { Link } from 'react-router'
import styled from 'styled-components'

const PageHeader = styled.h1`
  text-align: center;
  font-size: 1.75rem;
  margin: 0 0 1.5rem;
  font-weight: 600;
  letter-spacing: -0.02em;
`

const TopBar = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
`

const AddLink = styled(Link)`
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--accent);
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`

export function PhotosPage() {
  useTitle('Галерея фото')
  const { isAdmin } = useAuth()
  return (
    <>
      {isAdmin && (
        <TopBar>
          <AddLink to='photo/new'>Добавить фото</AddLink>
        </TopBar>
      )}

      <PageHeader>Фото</PageHeader>
      <Filter isHiddenFilters={!isAdmin} />
      <Search />
      <PhotoGallery />
    </>
  )
}
