import React, { forwardRef } from 'react'
import clsx from 'clsx'
import styles from './UploadLabel.module.css'

const rootSizeClass = { sm: styles.rootSm, md: styles.rootMd, lg: styles.rootLg } as const

export interface UploadLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  isDragActive?: boolean
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export const UploadLabel = forwardRef<HTMLLabelElement, UploadLabelProps>(
  ({ isDragActive, disabled, className, children, size = 'md', ...rest }, ref) => {
    return (
      <label
        ref={ref}
        {...rest}
        data-disabled={disabled ? 'true' : undefined}
        className={clsx(
          styles.root,
          rootSizeClass[size],
          (isDragActive || disabled) && styles.dragOrDisabled,
          className,
        )}
      >
        {children}
      </label>
    )
  },
)

UploadLabel.displayName = 'UploadLabel'
