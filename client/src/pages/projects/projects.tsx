import { Page } from '@/features'
import { useTitle } from '@/hooks'
import { useAuth } from '@/hooks/useAuth'
import { Link } from 'react-router'
import styled from 'styled-components'

const LinkWrapper = styled.div`
  text-align: right;
`

export function ProjectsPage() {
  useTitle('Проекты')
  const { isAdmin } = useAuth()
  return (
    <>
      {isAdmin && (
        <LinkWrapper>
          <Link to='edit'>Редактировать</Link>
        </LinkWrapper>
      )}
      <Page />
    </>
  )
}
