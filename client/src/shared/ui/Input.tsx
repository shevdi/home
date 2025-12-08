import React, { useEffect, useRef } from 'react'
import styled from 'styled-components'

const InputWrapper = styled.div`
  position: relative;
  margin-bottom: 1rem;
`

const StyledInput = styled.input`
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
  color: #333;
  transition:
    border-color 0.2s ease-in-out,
    box-shadow 0.2s ease-in-out;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
  }

  &:disabled {
    background-color: #708090;
    cursor: not-allowed;
  }
`

const StyledLabel = styled.label`
  display: block;
  margin-bottom: 0.8rem;
  font-weight: 500;
  color: #555;
`

const ErrorText = styled.div`
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: var(--error-color);
  min-height: 1rem;
`

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  focus?: boolean
  error?: string
  onOutsideClick?: () => void
}

export const Input: React.FC<InputProps> = ({ label, focus, error, onOutsideClick, ...props }) => {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const userRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (focus) {
      userRef.current?.focus()
    }
  }, [focus])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!onOutsideClick) return
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        onOutsideClick()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [onOutsideClick])

  return (
    <InputWrapper ref={wrapperRef}>
      <StyledLabel htmlFor={props.id || props.name}>{label}</StyledLabel>
      <StyledInput ref={userRef} {...props} />
      <ErrorText>{error}</ErrorText>
    </InputWrapper>
  )
}
