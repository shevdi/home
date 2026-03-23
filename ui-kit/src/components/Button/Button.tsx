import type React from 'react'
import styles from './Button.module.css'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  margin?: string
  display?: string
  width?: string
  backgroundColor?: string
  hoverBackgroundColor?: string
}

export function Button({
  margin,
  display,
  width,
  backgroundColor,
  hoverBackgroundColor,
  disabled,
  style,
  className,
  ...rest
}: ButtonProps) {
  const vars: Record<string, string> = {}
  if (disabled) {
    vars['--btn-bg'] = 'var(--text-muted)'
  } else if (backgroundColor !== undefined) {
    vars['--btn-bg'] = backgroundColor
    vars['--btn-hover-bg'] = hoverBackgroundColor ?? backgroundColor
  } else {
    vars['--btn-bg'] = 'var(--accent)'
    vars['--btn-hover-bg'] = hoverBackgroundColor ?? 'var(--accent-hover)'
  }

  return (
    <button
      type="button"
      {...rest}
      disabled={disabled}
      className={[styles.button, className].filter(Boolean).join(' ')}
      style={{ ...vars, margin, display, width, ...style }}
    />
  )
}
