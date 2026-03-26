import React, { useRef } from 'react'
import { Input } from '../Input'
import { UploadLabel } from '../UploadLabel'
import styles from '../Input/Input.module.css'
import { useLabeledFieldOutsideClick } from './useLabeledFieldOutsideClick'

export interface LabeledFileInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
  focus?: boolean
  error?: string
  disabled?: boolean
  onOutsideClick?: () => void
}

export const LabeledFileInput: React.FC<LabeledFileInputProps> = ({
  label,
  focus,
  error,
  disabled,
  onOutsideClick,
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
    <div ref={wrapperRef} className={styles.wrapper}>
      <UploadLabel ref={labelRef} htmlFor={htmlFor} disabled={disabled} onClick={onLabelActivate}>
        {label}
      </UploadLabel>
      <Input
        ref={inputRef}
        className={`${styles.input} ${styles.inputFile}`}
        type="file"
        disabled={disabled}
        focus={focus}
        {...props}
      />
      {(error || error === null) && <div className={styles.error}>{error}</div>}
    </div>
  )
}
