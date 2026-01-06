import { Photo } from '@/features/Photos'
import { useTitle } from '@/shared/hooks'
import { useAuth } from '@/shared/hooks/useAuth'
import { MouseEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import styled from 'styled-components'

const LinkWrapper = styled.div`
  text-align: right;
`

export function PhotoPage() {
  useTitle('Фото')
  const { isAdmin } = useAuth()
  const navigate = useNavigate()

  const handleNavigate = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    navigate(-1)
  }

  return (
    <>
      {isAdmin && (
        <LinkWrapper>
          <Link to='edit'>Редактировать</Link>
        </LinkWrapper>
      )}
      <LinkWrapper>
        <Link to={'..'} onClick={handleNavigate}>
          Назад
        </Link>
      </LinkWrapper>
      <Photo />
    </>
  )
}
