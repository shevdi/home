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
  border: 4px solid rgba(0, 123, 255, 0.2);
  border-top: 4px solid #007bff;
  border-radius: 50%;
  width: ${({ $inline }) => ($inline ? '20px' : '40px')};
  height: ${({ $inline }) => ($inline ? '20px' : '40px')};
  margin: ${({ $inline }) => ($inline ? '0 auto' : 'initial')};
  animation: ${spin} 0.8s linear infinite;
`

const LoadingMessage = styled.p`
  margin-top: 1rem;
  font-size: 1rem;
  font-weight: 500;
  color: #333;
`

export function Loader({ message, inline }: LoaderProps) {
  if (inline) {
    return <Spinner $inline={inline} />
  }
  return <LoaderWrapper>{message && <LoadingMessage>{message}</LoadingMessage>}</LoaderWrapper>
}
