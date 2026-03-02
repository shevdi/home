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
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  color: var(--text-color);
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

export function PhotoNotFound() {
  useTitle('Такого фото нет')
  return (
    <Container>
      <Title>Такого фото нет</Title>
      <StyledLink to='/photos'>К фотографиям</StyledLink>
    </Container>
  )
}
