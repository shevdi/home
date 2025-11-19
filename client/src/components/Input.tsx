import React, { useEffect, useRef } from 'react'
import styled from 'styled-components'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { setInputValue, selectInputValue } from '../features/form/formSlice'

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
    background-color: #f8f9fa;
    cursor: not-allowed;
  }
`

const StyledLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #555;
`

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  focus?: boolean
}

export const Input: React.FC<InputProps> = ({ label, focus, ...props }) => {
  const userRef = useRef<HTMLInputElement>(null)
  const dispatch = useAppDispatch()
  const inputValue = useAppSelector(selectInputValue)

  useEffect(() => {
    if (focus) {
      userRef?.current?.focus()
    }
  }, [])

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Dispatch the action to update the value in the Redux store
    dispatch(setInputValue(event.target.value))
  }

  return (
    <InputWrapper>
      <StyledLabel htmlFor={props.id || props.name}>{label}</StyledLabel>
      <StyledInput value={inputValue} ref={userRef} onChange={handleChange} {...props} />
    </InputWrapper>
  )
}
