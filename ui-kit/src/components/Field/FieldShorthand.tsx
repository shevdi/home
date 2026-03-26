import type React from 'react'
import { FieldControl } from './FieldControl'
import { FieldDescription } from './FieldDescription'
import { FieldError } from './FieldError'
import { FieldLabel } from './FieldLabel'
import { FieldRoot } from './FieldRoot'

export interface FieldShorthandProps {
  label: React.ReactNode
  description?: React.ReactNode
  error?: string
  required?: boolean
  children: React.ReactElement
  className?: string
}

export function FieldShorthand({ label, description, error, required, children, className }: FieldShorthandProps) {
  return (
    <FieldRoot error={error} required={required} className={className}>
      <FieldLabel>{label}</FieldLabel>
      {description != null && description !== '' ? <FieldDescription>{description}</FieldDescription> : null}
      <FieldControl>{children}</FieldControl>
      <FieldError />
    </FieldRoot>
  )
}
