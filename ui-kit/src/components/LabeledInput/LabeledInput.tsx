import React, { useRef } from 'react'
import { Input } from '../Input'
import styles from '../Input/Input.module.css'
import { useLabeledFieldOutsideClick } from './useLabeledFieldOutsideClick'

export interface LabeledInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label: string
  type?: Exclude<React.HTMLInputTypeAttribute, 'file'>
  focus?: boolean
  error?: string
  disabled?: boolean
  onOutsideClick?: () => void
  size?: 'sm' | 'md' | 'lg'
}

export const LabeledInput: React.FC<LabeledInputProps> = ({
  label,
  type,
  focus,
  error,
  disabled,
  onOutsideClick,
  size = 'md',
  ...props
}) => {
  const wrapperRef = useLabeledFieldOutsideClick(onOutsideClick)
  const inputRef = useRef<HTMLInputElement>(null)
  const labelRef = useRef<HTMLLabelElement>(null)
  const htmlFor = props.id || props.name

  const onLabelActivate = () => {
    inputRef.current?.click()
  }

  return (
    <div ref={wrapperRef} className={styles.wrapper} data-size={size}>
      <label ref={labelRef} className={styles.label} htmlFor={htmlFor} onClick={onLabelActivate}>
        {label}
      </label>
      <Input
        ref={inputRef}
        className={styles.input}
        type={type}
        disabled={disabled}
        focus={focus}
        size={size}
        {...props}
      />
      {(error || error === null) && <div className={styles.error}>{error}</div>}
    </div>
  )
}
