import * as Label from '@radix-ui/react-label'
import React, { createContext, useContext, useId, useLayoutEffect, useMemo, useState } from 'react'
import styles from './Field.module.css'

type FieldContextValue = {
  controlId: string
  descriptionId: string
  errorId: string
  error: string | undefined
  required: boolean
  hasDescription: boolean
  setHasDescription: (v: boolean) => void
}

const FieldContext = createContext<FieldContextValue | null>(null)

function useFieldContext() {
  const ctx = useContext(FieldContext)
  if (!ctx) {
    throw new Error('Field compound components must be used within Field.Root')
  }
  return ctx
}

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

export interface FieldLabelProps {
  children: React.ReactNode
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

export interface FieldDescriptionProps {
  children: React.ReactNode
  className?: string
}

export function FieldDescription({ children, className }: FieldDescriptionProps) {
  const { descriptionId, setHasDescription } = useFieldContext()

  useLayoutEffect(() => {
    const has = children != null && children !== false && children !== ''
    setHasDescription(!!has)
    return () => setHasDescription(false)
  }, [children, setHasDescription])

  if (children == null || children === false || children === '') {
    return null
  }

  return (
    <div id={descriptionId} className={[styles.description, className].filter(Boolean).join(' ')}>
      {children}
    </div>
  )
}

export interface FieldControlProps {
  children: React.ReactElement
}

export function FieldControl({ children }: FieldControlProps) {
  const ctx = useFieldContext()
  const child = React.Children.only(children)

  const describedByParts: string[] = []
  if (ctx.hasDescription) describedByParts.push(ctx.descriptionId)
  if (ctx.error) describedByParts.push(ctx.errorId)

  const childProps = child.props as {
    id?: string
    'aria-describedby'?: string
    'aria-invalid'?: boolean
    'aria-required'?: boolean
  }

  const merged = [...describedByParts]
  if (childProps['aria-describedby']) {
    merged.push(childProps['aria-describedby'])
  }
  const ariaDescribedBy = merged.length > 0 ? merged.join(' ') : undefined

  const baseProps = child.props as Record<string, unknown>
  return React.cloneElement(child, {
    ...baseProps,
    id: childProps.id ?? ctx.controlId,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ctx.error ? true : childProps['aria-invalid'],
    'aria-required': ctx.required ? true : childProps['aria-required'],
  } as never)
}

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

export interface FieldShorthandProps {
  label: React.ReactNode
  description?: React.ReactNode
  error?: string
  required?: boolean
  children: React.ReactElement
  className?: string
}

function FieldShorthand({ label, description, error, required, children, className }: FieldShorthandProps) {
  return (
    <FieldRoot error={error} required={required} className={className}>
      <FieldLabel>{label}</FieldLabel>
      {description != null && description !== '' ? <FieldDescription>{description}</FieldDescription> : null}
      <FieldControl>{children}</FieldControl>
      <FieldError />
    </FieldRoot>
  )
}

export const Field = Object.assign(FieldShorthand, {
  Root: FieldRoot,
  Label: FieldLabel,
  Control: FieldControl,
  Description: FieldDescription,
  Error: FieldError,
})
