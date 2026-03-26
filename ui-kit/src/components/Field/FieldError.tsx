import { useFieldContext } from './FieldContext'
import styles from './Field.module.css'

export interface FieldErrorProps {
  className?: string
}

export function FieldError({ className }: FieldErrorProps) {
  const { error, errorId } = useFieldContext()
  if (!error) {
    return null
  }
  return (
    <div id={errorId} role="alert" className={[styles.error, className].filter(Boolean).join(' ')}>
      {error}
    </div>
  )
}
