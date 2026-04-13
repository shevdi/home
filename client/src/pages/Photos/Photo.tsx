import { Photo } from '@/features/Photos'
import { reachGoal } from '@/shared/analytics'
import { useTitle } from '@/shared/hooks'
import { useAuth } from '@/shared/hooks/useAuth'
import type { MouseEvent} from 'react';
import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import styled from 'styled-components'

const LinkWrapper = styled.div`
  text-align: right;
`

export function PhotoPage() {
  useTitle('Фото')
  const { id } = useParams()
  const { isAdmin } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (id) {
      reachGoal('photo_view', { photo_id: id })
    }
  }, [id])

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
