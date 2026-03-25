import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import React from 'react'
import styles from './Checkbox.module.css'

export interface CheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  color?: string
  label?: string
  labelPosition?: 'left' | 'right'
  textColor?: string
}

const sizeClass = { sm: styles.sm, md: styles.md, lg: styles.lg } as const
const labelSizeClass = { sm: styles.labelSm, md: styles.labelMd, lg: styles.labelLg } as const

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  disabled = false,
  size = 'md',
  color = '#4caf50',
  label,
  labelPosition = 'right',
  textColor,
}) => {
  const handleCheckedChange = (value: boolean | 'indeterminate') => {
    onChange(value === true)
  }

  const labelStyle: React.CSSProperties = textColor ? { color: textColor } : { color: 'var(--text-color)' }

  const boxStyle: React.CSSProperties = checked
    ? {
        borderColor: color,
        background: color,
      }
    : {}

  const labelEl = label ? (
    <span
      className={[
        styles.label,
        labelPosition === 'left' ? styles.labelLeft : styles.labelRight,
        labelSizeClass[size],
      ].join(' ')}
      style={labelStyle}
    >
      {label}
    </span>
  ) : null

  return (
    <label
      className={[styles.container, disabled ? styles.containerDisabled : styles.containerEnabled].join(' ')}
    >
      {label && labelPosition === 'left' && labelEl}
      <CheckboxPrimitive.Root
        className={`${styles.root} ${sizeClass[size]}`}
        style={boxStyle}
        checked={checked}
        onCheckedChange={handleCheckedChange}
        disabled={disabled}
      >
        <CheckboxPrimitive.Indicator className={styles.indicator} />
      </CheckboxPrimitive.Root>
      {label && labelPosition === 'right' && labelEl}
    </label>
  )
}
