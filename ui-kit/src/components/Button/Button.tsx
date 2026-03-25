import type React from 'react'
import { Slot } from '@radix-ui/react-slot'
import styles from './Button.module.css'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  margin?: string
  display?: string
  width?: string
  backgroundColor?: string
  hoverBackgroundColor?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClass = { sm: styles.buttonSm, md: styles.buttonMd, lg: styles.buttonLg } as const

export function Button({
  asChild = false,
  margin,
  display,
  width,
  backgroundColor,
  hoverBackgroundColor,
  disabled,
  style,
  className,
  type,
  size = 'md',
  ...rest
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button'
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
    <Comp
      {...rest}
      type={asChild ? undefined : (type ?? 'button')}
      disabled={disabled}
      className={[styles.button, sizeClass[size], className].filter(Boolean).join(' ')}
      style={{ ...vars, margin, display, width, ...style }}
    />
  )
}
