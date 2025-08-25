import styled, { keyframes } from 'styled-components'

interface ErrorProps {
  title: string
  message: string
  onRetry?: () => void
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

// Styled Components
const ErrorWrapper = styled.div`
  animation: ${fadeIn} 0.3s ease-out;
  background-color: #fff0f0;
  border: 1px solid #ffcccc;
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
  margin: 2rem auto;
  max-width: 500px;
  box-shadow: 0 4px 12px rgba(255, 0, 0, 0.1);
  color: #a30000;
`

const ErrorIcon = styled.div`
  margin: 0 auto 1rem;
  width: 50px;
  height: 50px;

  svg {
    width: 100%;
    height: 100%;
    fill: #dc3545;
  }
`

const ErrorTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #721c24;
`

const ErrorMessage = styled.p`
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.5;
  color: #721c24;
`

const RetryButton = styled.button`
  margin-top: 1.5rem;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 0.6rem 1.2rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition:
    background-color 0.2s ease-in-out,
    transform 0.1s ease;

  &:hover {
    background-color: #c82333;
  }

  &:active {
    transform: scale(0.98);
  }
`

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
      {onRetry && <RetryButton onClick={onRetry}>Try Again</RetryButton>}
    </ErrorWrapper>
  )
}
