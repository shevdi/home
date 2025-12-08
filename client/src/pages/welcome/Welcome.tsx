import styled from 'styled-components'
import { Page } from '@/features'
import { useTitle } from '@/shared/hooks'
import { Link, useLocation } from 'react-router'
import { useAuth } from '@/shared/hooks/useAuth'

const LinkWrapper = styled.div`
  text-align: right;
`

export function WelcomePage() {
  useTitle('Главная')
  const location = useLocation()
  const { isAdmin } = useAuth()
  return (
    <>
      {isAdmin && (
        <LinkWrapper>
          <Link to={location.pathname.length === 1 ? 'home/edit' : 'edit'}>Редактировать</Link>
        </LinkWrapper>
      )}
      <Page url='welcome' />
    </>
  )
}
