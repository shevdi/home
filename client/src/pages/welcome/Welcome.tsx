import styled from 'styled-components'
import { Page } from '@/features'
import { useTitle } from '@/shared/hooks'
import { Link, useLocation } from 'react-router'
import { useAuth } from '@/shared/hooks/useAuth'

const LinkWrapper = styled.div`
  text-align: right;
  margin-bottom: 1rem;
`

const EditLink = styled(Link)`
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--accent);
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`

export function WelcomePage() {
  useTitle('Главная')
  const location = useLocation()
  const { isAdmin } = useAuth()
  return (
    <>
      {isAdmin && (
        <LinkWrapper>
          <EditLink to={location.pathname.length === 1 ? 'home/edit' : 'edit'}>Редактировать</EditLink>
        </LinkWrapper>
      )}
      <Page url='welcome' />
    </>
  )
}
