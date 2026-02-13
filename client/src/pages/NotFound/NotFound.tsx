import styled from 'styled-components'
import { Link } from 'react-router'
import { useTitle } from '@/shared/hooks'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  gap: 1.5rem;
`

const Title = styled.h1`
  font-size: 4rem;
  font-weight: 700;
  margin: 0;
  color: var(--text-color);
  letter-spacing: -0.03em;
`

const Message = styled.p`
  font-size: 1.1rem;
  color: var(--text-muted);
  margin: 0;
`

const StyledLink = styled(Link)`
  color: var(--accent);
  text-decoration: none;
  font-size: 1rem;
  font-weight: 500;
  padding: 0.6rem 1.25rem;
  border-radius: var(--radius-md);
  background: transparent;
  border: 1px solid var(--accent);
  transition: all var(--transition-fast);

  &:hover {
    background: var(--accent);
    color: white;
  }
`

export function NotFoundPage() {
  useTitle('404 - Страница не найдена')
  return (
    <Container>
      <Title>404</Title>
      <Message>Страница не найдена</Message>
      <StyledLink to='/'>Вернуться на главную</StyledLink>
    </Container>
  )
}
