import styled from 'styled-components'
import { Link } from 'react-router'
import { useTitle } from '@/hooks'

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
  font-weight: bold;
  margin: 0;
  color: inherit;
`

const Message = styled.p`
  font-size: 1.25rem;
  color: inherit;
  opacity: 0.8;
  margin: 0;
`

const StyledLink = styled(Link)`
  color: inherit;
  text-decoration: none;
  font-size: 1.1rem;
  transition: opacity 0.2s ease-in-out;

  &:hover {
    opacity: 0.8;
    text-decoration: underline;
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
