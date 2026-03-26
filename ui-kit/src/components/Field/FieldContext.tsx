import { createContext, useContext } from 'react'

export type FieldContextValue = {
  controlId: string
  descriptionId: string
  errorId: string
  error: string | undefined
  required: boolean
  hasDescription: boolean
  setHasDescription: (v: boolean) => void
}

export const FieldContext = createContext<FieldContextValue | null>(null)

export function useFieldContext() {
  const ctx = useContext(FieldContext)
  if (!ctx) {
    throw new Error('Field compound components must be used within Field.Root')
  }
  return ctx
}
