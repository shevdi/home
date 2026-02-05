import React from 'react'
import styled from 'styled-components'

interface DropdownOption {
  value: string
  label: string
}

interface DropdownProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  options: DropdownOption[]
}

export const Dropdown = React.forwardRef<HTMLSelectElement, DropdownProps>(
  ({ label, options, id, name, ...props }, ref) => {
    const controlId = id || name

    return (
      <DropdownWrapper>
        <StyledLabel htmlFor={controlId}>{label}</StyledLabel>
        <StyledSelect id={controlId} name={name} ref={ref} {...props}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </StyledSelect>
      </DropdownWrapper>
    )
  },
)

Dropdown.displayName = 'Dropdown'

const DropdownWrapper = styled.div`
  position: relative;
  margin: 1rem 0;
`

const StyledLabel = styled.label`
  display: block;
  margin-bottom: 0.8rem;
  font-weight: 500;
  color: #555;
`

const StyledSelect = styled.select`
  padding: 0.8rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
  color: #333;
  background-color: white;
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

  &:hover {
    cursor: pointer;
  }
`
