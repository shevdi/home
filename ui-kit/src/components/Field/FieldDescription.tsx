import { useLayoutEffect, type ReactNode } from 'react'
import { useFieldContext } from './FieldContext'
import styles from './Field.module.css'

export interface FieldDescriptionProps {
  children: ReactNode
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
