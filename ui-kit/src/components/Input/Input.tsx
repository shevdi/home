import React, { useEffect, useRef } from 'react'
import inputStyles from './Input.module.css'

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Focus the input on mount (e.g. first field in a form). */
  focus?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const inputSizeClass = { sm: inputStyles.inputSm, md: inputStyles.inputMd, lg: inputStyles.inputLg } as const

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, type = 'text', focus, size = 'md', ...props },
  ref,
) {
  const innerRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (focus) {
      innerRef.current?.focus()
    }
  }, [focus])

  return (
    <input
      ref={(node) => {
        innerRef.current = node
        if (typeof ref === 'function') ref(node)
        else if (ref != null) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node
      }}
      type={type}
      className={[inputStyles.input, inputSizeClass[size], className].filter(Boolean).join(' ')}
      {...props}
    />
  )
})
