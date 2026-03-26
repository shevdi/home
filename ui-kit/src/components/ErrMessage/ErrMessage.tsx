import type React from 'react'
import styles from './ErrMessage.module.css'

export interface ErrMessageProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'size'> {
  size?: 'sm' | 'md' | 'lg'
}

const rootSizeClass = { sm: styles.rootSm, md: styles.rootMd, lg: styles.rootLg } as const

export function ErrMessage({ className, size = 'md', ...props }: ErrMessageProps) {
  return <div {...props} className={[styles.root, rootSizeClass[size], className].filter(Boolean).join(' ')} />
}
