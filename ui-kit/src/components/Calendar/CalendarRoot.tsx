import * as React from 'react'
import styles from './Calendar.module.css'

export function CalendarRoot({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={[styles.root, className].filter(Boolean).join(' ')} {...props} />
}
