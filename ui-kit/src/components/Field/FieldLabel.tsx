import * as Label from '@radix-ui/react-label'
import type { ReactNode } from 'react'
import { useFieldContext } from './FieldContext'
import styles from './Field.module.css'

export interface FieldLabelProps {
  children: ReactNode
  className?: string
}

export function FieldLabel({ children, className }: FieldLabelProps) {
  const { controlId, required } = useFieldContext()
  return (
    <Label.Root htmlFor={controlId} className={[styles.label, className].filter(Boolean).join(' ')}>
      {children}
      {required ? (
        <span className={styles.requiredMark} aria-hidden>
          *
        </span>
      ) : null}
    </Label.Root>
  )
}
