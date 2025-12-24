import { PhotoGallery } from '@/features/Photos'
import { useTitle } from '@/shared/hooks'
import { useAuth } from '@/shared/hooks/useAuth'
import { Link } from 'react-router'
import styled from 'styled-components'

const LinkWrapper = styled.div`
  text-align: right;
`

export function PhotosPage() {
  useTitle('Галерея фото')
  const { isAdmin } = useAuth()
  return (
    <>
      {isAdmin && (
        <LinkWrapper>
          <Link to='photo/new'>Добавить фото</Link>
        </LinkWrapper>
      )}
      <PhotoGallery />
    </>
  )
}
