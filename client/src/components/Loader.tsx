import React from 'react'
import styled, { keyframes } from 'styled-components'

interface LoaderProps {
  message?: string
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

const Spinner = styled.div`
  border: 4px solid rgba(0, 123, 255, 0.2);
  border-top: 4px solid #007bff;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: ${spin} 0.8s linear infinite;
`

const LoadingMessage = styled.p`
  margin-top: 1rem;
  font-size: 1rem;
  font-weight: 500;
  color: #333;
`

export function Loader({ message }: LoaderProps) {
  return (
    <LoaderWrapper>
      <Spinner />
      {message && <LoadingMessage>{message}</LoadingMessage>}
    </LoaderWrapper>
  )
}
