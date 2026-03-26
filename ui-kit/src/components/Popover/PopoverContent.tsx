import * as PopoverPrimitive from '@radix-ui/react-popover'
import * as React from 'react'
import styles from './Popover.module.css'

export const PopoverContent = React.forwardRef<
  React.ComponentRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(function PopoverContent({ className, sideOffset = 4, ...props }, ref) {
  return (
    <PopoverPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={[styles.content, className].filter(Boolean).join(' ')}
      {...props}
    />
  )
})

PopoverContent.displayName = 'Popover.Content'

export type PopoverContentProps = React.ComponentPropsWithoutRef<typeof PopoverContent>
