import React, { useEffect, useRef, useState } from 'react'
import styles from './Dropdown.module.css'

export interface DropdownOption {
  value: string
  label: string
}

export interface DropdownProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
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
      <div ref={containerRef} className={styles.wrapper}>
        <label className={styles.label} htmlFor={controlId}>
          {label}
        </label>
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
          className={styles.hiddenSelect}
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
        <button
          type="button"
          className={styles.trigger}
          onClick={() => !disabled && setIsOpen((o) => !o)}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          {selectedOption?.label ?? ''}
        </button>
        {isOpen && (
          <ul className={styles.options} role="listbox">
            {options.map((option) => (
              <li
                key={option.value}
                role="option"
                className={
                  option.value === currentValue
                    ? `${styles.option} ${styles.optionSelected}`
                    : styles.option
                }
                onClick={() => handleSelect(option)}
              >
                {option.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  },
)

Dropdown.displayName = 'Dropdown'
