import * as PopoverPrimitive from '@radix-ui/react-popover'
import * as React from 'react'
import styles from './Popover.module.css'

const Content = React.forwardRef<
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

Content.displayName = 'Popover.Content'

export const Popover = {
  Root: PopoverPrimitive.Root,
  Trigger: PopoverPrimitive.Trigger,
  Anchor: PopoverPrimitive.Anchor,
  Portal: PopoverPrimitive.Portal,
  Content,
  Close: PopoverPrimitive.Close,
  Arrow: PopoverPrimitive.Arrow,
}

export type PopoverContentProps = React.ComponentPropsWithoutRef<typeof Content>
