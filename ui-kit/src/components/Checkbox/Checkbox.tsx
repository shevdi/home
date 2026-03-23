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
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.checked)
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
      <input
        type="checkbox"
        className={styles.hidden}
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
      />
      <span className={`${styles.box} ${sizeClass[size]}`} style={boxStyle} />
      {label && labelPosition === 'right' && labelEl}
    </label>
  )
}
