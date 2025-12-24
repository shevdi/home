import { Photo } from '@/features/Photos'
import { useTitle } from '@/shared/hooks'
import { useAuth } from '@/shared/hooks/useAuth'
import { Link } from 'react-router'
import styled from 'styled-components'

const LinkWrapper = styled.div`
  text-align: right;
`

export function PhotoPage() {
  useTitle('Фото')
  const { isAdmin } = useAuth()
  return (
    <>
      {isAdmin && (
        <LinkWrapper>
          <Link to='edit'>Редактировать</Link>
        </LinkWrapper>
      )}
      <Photo />
    </>
  )
}
