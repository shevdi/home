import * as Select from '@radix-ui/react-select'
import React, { useEffect, useRef, useState } from 'react'
import styles from './Dropdown.module.css'

export interface DropdownOption {
  value: string
  label: string
}

export interface DropdownProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'size'> {
  label: string
  options: DropdownOption[]
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void
  size?: 'sm' | 'md' | 'lg'
}

const triggerSizeClass = { sm: styles.triggerSm, md: styles.triggerMd, lg: styles.triggerLg } as const
const labelSizeClass = { sm: styles.labelSm, md: styles.labelMd, lg: styles.labelLg } as const
const optionSizeClass = { sm: styles.optionSm, md: styles.optionMd, lg: styles.optionLg } as const
const iconSizeClass = { sm: styles.iconSm, md: styles.iconMd, lg: styles.iconLg } as const

function ChevronDownIcon() {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' aria-hidden>
      <path fill='currentColor' d='M6 8L1 3h10z' />
    </svg>
  )
}

export const Dropdown = React.forwardRef<HTMLSelectElement, DropdownProps>(
  ({ label, options, id, name, value, defaultValue, onChange, onBlur, disabled, size = 'md', ...selectProps }, ref) => {
    const controlId = id || name
    const [internalValue, setInternalValue] = useState(() => String(value ?? defaultValue ?? options[0]?.value ?? ''))
    const hiddenRef = useRef<HTMLSelectElement>(null)

    const currentValue = value !== undefined ? value : internalValue
    const radixValue = String(currentValue ?? '')

    useEffect(() => {
      if (value !== undefined) {
        setInternalValue(String(value))
      } else if (defaultValue !== undefined) {
        setInternalValue(String(defaultValue))
      }
    }, [value, defaultValue])

    React.useImperativeHandle(ref, () => hiddenRef.current!)

    const emitChange = (next: string) => {
      setInternalValue(next)
      const syntheticEvent = {
        target: { value: next, name: name ?? '' },
      } as React.ChangeEvent<HTMLSelectElement>
      onChange?.(syntheticEvent)
      onBlur?.(syntheticEvent as unknown as React.FocusEvent<HTMLSelectElement>)
    }

    const handleValueChange = (next: string) => {
      emitChange(next)
    }

    return (
      <div className={styles.wrapper}>
        <label className={[styles.label, labelSizeClass[size]].join(' ')} htmlFor={controlId}>
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
          disabled={disabled}
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
        {options.length > 0 ? (
          <Select.Root value={radixValue} onValueChange={handleValueChange} disabled={disabled}>
            <Select.Trigger className={[styles.trigger, triggerSizeClass[size]].join(' ')} aria-label={label}>
              <Select.Value placeholder=' ' />
              <Select.Icon className={[styles.icon, iconSizeClass[size]].join(' ')}>
                <ChevronDownIcon />
              </Select.Icon>
            </Select.Trigger>
            <Select.Portal>
              <Select.Content className={styles.content} position='popper' sideOffset={4}>
                <Select.Viewport>
                  {options.map((option) => {
                    const isSelected = option.value === radixValue
                    return (
                      <Select.Item
                        key={option.value}
                        value={option.value}
                        className={`${styles.option} ${optionSizeClass[size]} ${styles.optionHighlight}${
                          isSelected ? ` ${styles.optionSelected}` : ''
                        }`}
                      >
                        <Select.ItemText>{option.label}</Select.ItemText>
                      </Select.Item>
                    )
                  })}
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        ) : null}
      </div>
    )
  },
)

Dropdown.displayName = 'Dropdown'
