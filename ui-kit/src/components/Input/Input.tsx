import React, { useEffect, useRef } from 'react'
import { TextField } from '../TextField/TextField'
import { UploadLabel } from '../UploadLabel/UploadLabel'
import styles from './Input.module.css'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  type?: string
  focus?: boolean
  error?: string
  disabled?: boolean
  onOutsideClick?: () => void
}

export const Input: React.FC<InputProps> = ({
  label,
  type,
  focus,
  error,
  disabled,
  onOutsideClick,
  ...props
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const labelRef = useRef<HTMLLabelElement>(null)

  const onClick = () => {
    inputRef.current?.click()
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!onOutsideClick) return
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        onOutsideClick()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [onOutsideClick])

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      {type === 'file' ? (
        <UploadLabel ref={labelRef} htmlFor={props.id || props.name} disabled={disabled} onClick={onClick}>
          {label}
        </UploadLabel>
      ) : (
        <label ref={labelRef} className={styles.label} htmlFor={props.id || props.name} onClick={onClick}>
          {label}
        </label>
      )}
      <TextField
        ref={inputRef}
        className={type === 'file' ? `${styles.input} ${styles.inputFile}` : styles.input}
        type={type}
        disabled={disabled}
        focus={focus}
        {...props}
      />
      {(error || error === null) && <div className={styles.error}>{error}</div>}
    </div>
  )
}
