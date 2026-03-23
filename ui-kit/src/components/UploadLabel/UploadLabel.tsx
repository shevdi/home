import React, { forwardRef } from 'react'
import styles from './UploadLabel.module.css'

export interface UploadLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  isDragActive?: boolean
  disabled?: boolean
}

export const UploadLabel = forwardRef<HTMLLabelElement, UploadLabelProps>(
  ({ isDragActive, disabled, className, children, ...rest }, ref) => {
    const stateClass = isDragActive || disabled ? styles.dragOrDisabled : ''
    return (
      <label
        ref={ref}
        {...rest}
        data-disabled={disabled ? 'true' : undefined}
        className={[styles.root, stateClass, className].filter(Boolean).join(' ')}
      >
        {children}
      </label>
    )
  },
)

UploadLabel.displayName = 'UploadLabel'
