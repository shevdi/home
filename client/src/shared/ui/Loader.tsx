import styled, { keyframes } from 'styled-components'

interface LoaderProps {
  message?: string
  inline?: boolean
}

const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`

const LoaderWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 10;
  border-radius: inherit;
`

const Spinner = styled.div<{ $inline?: boolean }>`
  border: 3px solid var(--input-border);
  border-top-color: var(--accent);
  border-radius: 50%;
  width: ${({ $inline }) => ($inline ? '24px' : '44px')};
  height: ${({ $inline }) => ($inline ? '24px' : '44px')};
  margin: ${({ $inline }) => ($inline ? '0 auto' : 'initial')};
  animation: ${spin} 0.7s linear infinite;
`

const LoadingMessage = styled.p`
  margin-top: 1rem;
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text-muted);
`

export function Loader({ message, inline }: LoaderProps) {
  if (inline) {
    return <Spinner $inline={inline} />
  }
  return (
    <LoaderWrapper>{message ? <LoadingMessage>{message}</LoadingMessage> : <Spinner $inline={inline} />}</LoaderWrapper>
  )
}
