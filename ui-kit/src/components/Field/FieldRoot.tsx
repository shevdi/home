import React, { useId, useMemo, useState } from 'react'
import { FieldContext, type FieldContextValue } from './FieldContext'
import styles from './Field.module.css'

export interface FieldRootProps {
  children: React.ReactNode
  error?: string
  required?: boolean
  className?: string
}

export function FieldRoot({ children, error, required = false, className }: FieldRootProps) {
  const base = useId()
  const controlId = `${base}-control`
  const descriptionId = `${base}-description`
  const errorId = `${base}-error`
  const [hasDescription, setHasDescription] = useState(false)

  const value = useMemo<FieldContextValue>(
    () => ({
      controlId,
      descriptionId,
      errorId,
      error,
      required,
      hasDescription,
      setHasDescription,
    }),
    [controlId, descriptionId, errorId, error, required, hasDescription],
  )

  return (
    <FieldContext.Provider value={value}>
      <div className={[styles.field, className].filter(Boolean).join(' ')}>{children}</div>
    </FieldContext.Provider>
  )
}
