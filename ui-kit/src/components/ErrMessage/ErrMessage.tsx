import type React from 'react'
import styles from './ErrMessage.module.css'

export function ErrMessage({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={[styles.root, className].filter(Boolean).join(' ')} />
}
