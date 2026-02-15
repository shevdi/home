import React, { useRef, useState, useEffect } from 'react'
import styled from 'styled-components'

interface DropdownOption {
  value: string
  label: string
}

interface DropdownProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label: string
  options: DropdownOption[]
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void
}

export const Dropdown = React.forwardRef<HTMLSelectElement, DropdownProps>(
  ({ label, options, id, name, value, defaultValue, onChange, onBlur, disabled, ...selectProps }, ref) => {
    const controlId = id || name
    const [isOpen, setIsOpen] = useState(false)
    const [internalValue, setInternalValue] = useState(
      () => value ?? defaultValue ?? options[0]?.value ?? '',
    )
    const containerRef = useRef<HTMLDivElement>(null)
    const hiddenRef = useRef<HTMLSelectElement>(null)

    const currentValue = value !== undefined ? value : internalValue

    useEffect(() => {
      if (value !== undefined) {
        setInternalValue(value)
      } else if (defaultValue !== undefined) {
        setInternalValue(defaultValue)
      }
    }, [value, defaultValue])
    const selectedOption = options.find((o) => o.value === currentValue)

    React.useImperativeHandle(ref, () => hiddenRef.current!)

    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setIsOpen(false)
        }
      }
      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside)
      }
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [isOpen])

    const handleSelect = (option: DropdownOption) => {
      setInternalValue(option.value)
      const syntheticEvent = {
        target: { value: option.value, name: name ?? '' },
      } as React.ChangeEvent<HTMLSelectElement>
      onChange?.(syntheticEvent)
      onBlur?.(syntheticEvent as unknown as React.FocusEvent<HTMLSelectElement>)
      setIsOpen(false)
    }

    return (
      <DropdownWrapper ref={containerRef}>
        <StyledLabel htmlFor={controlId}>{label}</StyledLabel>
        <select
          ref={(el) => {
            ;(hiddenRef as React.MutableRefObject<HTMLSelectElement | null>).current = el
            if (typeof ref === 'function') ref(el)
            else if (ref) (ref as React.MutableRefObject<HTMLSelectElement | null>).current = el
          }}
          id={controlId}
          name={name}
          value={currentValue}
          tabIndex={-1}
          aria-hidden
          style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }}
          {...selectProps}
          onChange={onChange}
          onBlur={onBlur}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <StyledTrigger
          type='button'
          onClick={() => !disabled && setIsOpen((o) => !o)}
          disabled={disabled}
          aria-haspopup='listbox'
          aria-expanded={isOpen}
        >
          {selectedOption?.label ?? ''}
        </StyledTrigger>
        {isOpen && (
          <OptionsList role='listbox'>
            {options.map((option) => (
              <OptionItem
                key={option.value}
                role='option'
                $selected={option.value === currentValue}
                onClick={() => handleSelect(option)}
              >
                {option.label}
              </OptionItem>
            ))}
          </OptionsList>
        )}
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

const StyledTrigger = styled.button`
  width: 100%;
  min-height: 2.7rem;
  padding: 0.65rem 1rem;
  border: 1px solid var(--input-border);
  border-radius: var(--radius-lg);
  font-size: 0.95rem;
  font-family: inherit;
  color: var(--text-color);
  background-color: var(--input-bg);
  text-align: left;
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
    box-shadow: 0 0 0 3px var(--input-focus-shadow);
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

const OptionsList = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin: 0.25rem 0 0;
  padding: 0.25rem;
  list-style: none;
  background-color: var(--input-bg);
  border: 1px solid var(--input-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  z-index: 100;
`

const OptionItem = styled.li<{ $selected: boolean }>`
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 0.95rem;
  color: var(--text-color);
  transition: background-color var(--transition-fast);

  &:hover {
    background-color: var(--input-focus-shadow);
  }
`
