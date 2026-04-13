import * as ToastPrimitive from '@radix-ui/react-toast'
import * as React from 'react'
import clsx from 'clsx'
import styles from './Toast.module.css'

export type ToastVariant = 'default' | 'success' | 'error' | 'warning'

const variantClass: Record<ToastVariant, string> = {
  default: styles.variantDefault,
  success: styles.variantSuccess,
  error: styles.variantError,
  warning: styles.variantWarning,
}

export const ToastProvider = ToastPrimitive.Provider

export const ToastViewport = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>
>(function ToastViewport({ className, ...props }, ref) {
  return (
    <ToastPrimitive.Viewport
      ref={ref}
      className={clsx(styles.viewport, className)}
      {...props}
    />
  )
})
ToastViewport.displayName = 'ToastViewport'

export interface ToastRootProps extends React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root> {
  variant?: ToastVariant
}

export const ToastRoot = React.forwardRef<React.ComponentRef<typeof ToastPrimitive.Root>, ToastRootProps>(
  function ToastRoot({ className, variant = 'default', ...props }, ref) {
    return (
      <ToastPrimitive.Root
        ref={ref}
        className={clsx(styles.root, variantClass[variant], className)}
        {...props}
      />
    )
  },
)
ToastRoot.displayName = 'ToastRoot'

export const ToastTitle = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Title>
>(function ToastTitle({ className, ...props }, ref) {
  return <ToastPrimitive.Title ref={ref} className={clsx(styles.title, className)} {...props} />
})
ToastTitle.displayName = 'ToastTitle'

export const ToastDescription = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Description>
>(function ToastDescription({ className, ...props }, ref) {
  return (
    <ToastPrimitive.Description ref={ref} className={clsx(styles.description, className)} {...props} />
  )
})
ToastDescription.displayName = 'ToastDescription'

export const ToastAction = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Action>
>(function ToastAction({ className, ...props }, ref) {
  return <ToastPrimitive.Action ref={ref} className={clsx(styles.action, className)} {...props} />
})
ToastAction.displayName = 'ToastAction'

export const ToastClose = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Close>
>(function ToastClose({ className, children, 'aria-label': ariaLabel = 'Закрыть', ...props }, ref) {
  return (
    <ToastPrimitive.Close
      ref={ref}
      type="button"
      className={clsx(styles.close, className)}
      aria-label={ariaLabel}
      {...props}
    >
      {children ?? (
        <svg className={styles.closeIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden>
          <path
            fill="currentColor"
            d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
          />
        </svg>
      )}
    </ToastPrimitive.Close>
  )
})
ToastClose.displayName = 'ToastClose'

/** Composable toast primitives (Radix Toast), styled with design tokens. */
export const Toast = {
  Provider: ToastProvider,
  Viewport: ToastViewport,
  Root: ToastRoot,
  Title: ToastTitle,
  Description: ToastDescription,
  Action: ToastAction,
  Close: ToastClose,
}
