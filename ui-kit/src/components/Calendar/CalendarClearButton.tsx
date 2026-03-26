import * as React from 'react'
import styles from './Calendar.module.css'

export const CalendarClearButton = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  function CalendarClearButton({ className, type = 'button', ...props }, ref) {
    return (
      <button
        ref={ref}
        type={type}
        className={[styles.clearBtn, className].filter(Boolean).join(' ')}
        {...props}
      />
    )
  },
)

CalendarClearButton.displayName = 'Calendar.ClearButton'
