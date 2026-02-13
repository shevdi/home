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
  margin-bottom: 1rem;
`

const StyledLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  font-size: 0.9rem;
  color: var(--text-muted);
`

const StyledSelect = styled.select`
  width: 100%;
  padding: 0.65rem 1rem;
  border: 1px solid var(--input-border);
  border-radius: var(--radius-md);
  font-size: 0.95rem;
  font-family: inherit;
  color: var(--text-color);
  background-color: var(--input-bg);
  transition:
    border-color var(--transition-fast),
    box-shadow var(--transition-fast);
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b6560' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  padding-right: 2.25rem;

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

  &:hover:not(:disabled) {
    border-color: var(--text-muted);
  }
`
