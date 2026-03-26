import React from 'react'
import { useFieldContext } from './FieldContext'

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
