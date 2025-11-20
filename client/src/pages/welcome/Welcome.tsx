import styled from 'styled-components'
import { Page } from '@/features'
import { useTitle } from '@/hooks'
import { Link } from 'react-router'
import { useAuth } from '@/hooks/useAuth'

const LinkWrapper = styled.div`
  text-align: right;
`

export function WelcomePage() {
  useTitle('Главная')
  const { isAdmin } = useAuth()
  return (
    <>
      {isAdmin && (
        <LinkWrapper>
          <Link to='home/edit'>Редактировать</Link>
        </LinkWrapper>
      )}
      <Page url='welcome' />
    </>
  )
}
