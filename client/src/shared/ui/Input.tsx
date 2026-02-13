import React, { useEffect, useRef } from 'react'
import styled from 'styled-components'
import { UploadLabel } from './UploadLabel'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  type?: string
  focus?: boolean
  error?: string
  disabled?: boolean
  onOutsideClick?: () => void
}

export const Input: React.FC<InputProps> = ({ label, type, focus, error, disabled, onOutsideClick, ...props }) => {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const labelRef = useRef<HTMLLabelElement>(null)

  useEffect(() => {
    if (focus) {
      inputRef.current?.focus()
    }
  }, [focus])

  const onClick = () => {
    inputRef.current?.click()
  }

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
      {type === 'file' ? (
        <UploadLabel ref={labelRef} htmlFor={props.id || props.name} disabled={disabled} onClick={onClick}>
          {label}
        </UploadLabel>
      ) : (
        <StyledLabel ref={labelRef} htmlFor={props.id || props.name} onClick={onClick}>
          {label}
        </StyledLabel>
      )}
      <StyledInput ref={inputRef} type={type} disabled={disabled} {...props} />
      {(error || error === null) && <ErrorText>{error}</ErrorText>}
    </InputWrapper>
  )
}

const InputWrapper = styled.div`
  position: relative;
  margin-bottom: 1rem;
`

const StyledInput = styled.input<{
  type?: string
}>`
  width: 100%;
  padding: 0.65rem 1rem;
  border: 1px solid var(--input-border);
  border-radius: var(--radius-md);
  font-size: 0.95rem;
  font-family: inherit;
  color: var(--text-color);
  background-color: var(--input-bg);
  display: ${({ type }) => (type === 'file' ? 'none' : 'initial')};
  transition:
    border-color var(--transition-fast),
    box-shadow var(--transition-fast);

  &::placeholder {
    color: var(--text-muted);
  }

  &:focus {
    outline: none;
    border-color: var(--input-focus);
    box-shadow: 0 0 0 3px rgba(199, 107, 57, 0.2);
  }

  &:disabled {
    background-color: var(--input-disabled-color);
    cursor: not-allowed;
    opacity: 0.7;
  }
`

const StyledLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  font-size: 0.9rem;
  color: var(--text-muted);
`

const ErrorText = styled.div`
  margin-top: 0.4rem;
  font-size: 0.8rem;
  color: var(--error-color);
  min-height: 1rem;
`
