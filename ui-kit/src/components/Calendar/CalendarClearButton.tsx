import * as React from 'react'
import styles from './Calendar.module.css'

const clearSizeClass = { sm: styles.clearBtnSm, md: styles.clearBtnMd, lg: styles.clearBtnLg } as const

export interface CalendarClearButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md' | 'lg'
}

export const CalendarClearButton = React.forwardRef<HTMLButtonElement, CalendarClearButtonProps>(
  function CalendarClearButton({ className, type = 'button', size = 'md', ...props }, ref) {
    return (
      <button
        ref={ref}
        type={type}
        className={[styles.clearBtn, clearSizeClass[size], className].filter(Boolean).join(' ')}
        {...props}
      />
    )
  },
)

CalendarClearButton.displayName = 'Calendar.ClearButton'
