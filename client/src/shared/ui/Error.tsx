import styled, { keyframes } from 'styled-components'

interface ErrorProps {
  title: string
  message: string
  onRetry?: () => void
}

export function Error({ title, message, onRetry }: ErrorProps) {
  return (
    <ErrorWrapper>
      <ErrorIcon>
        <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'>
          <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z' />
        </svg>
      </ErrorIcon>
      <ErrorTitle>{title}</ErrorTitle>
      <ErrorMessage>{message}</ErrorMessage>
      {onRetry && <RetryButton onClick={onRetry}>Повторить</RetryButton>}
    </ErrorWrapper>
  )
}

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

const ErrorWrapper = styled.div`
  animation: ${fadeIn} 0.3s ease-out;
  background-color: var(--surface-elevated);
  border: 1px solid var(--error-color);
  border-radius: var(--radius-lg);
  padding: 2rem;
  text-align: center;
  margin: 3rem auto;
  max-width: 420px;
  box-shadow: var(--shadow-md);
  color: var(--text-color);
`

const ErrorIcon = styled.div`
  margin: 0 auto 1rem;
  width: 48px;
  height: 48px;
  opacity: 0.9;

  svg {
    width: 100%;
    height: 100%;
    fill: var(--error-color);
  }
`

const ErrorTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-color);
`

const ErrorMessage = styled.p`
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.5;
  color: var(--text-muted);
`

const RetryButton = styled.button`
  margin-top: 1.25rem;
  background-color: var(--accent);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  padding: 0.6rem 1.25rem;
  font-size: 0.95rem;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition:
    background-color var(--transition-fast),
    transform var(--transition-fast);

  &:hover {
    background-color: var(--accent-hover);
  }

  &:active {
    transform: scale(0.98);
  }
`
