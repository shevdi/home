import * as React from 'react'
import styles from './Calendar.module.css'

export function CalendarFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={[styles.footer, className].filter(Boolean).join(' ')} {...props} />
}
