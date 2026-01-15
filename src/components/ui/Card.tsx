import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {}

const Card = forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'rounded-xl border shadow-sm',
        'bg-white dark:bg-gray-800',
        'border-gray-200 dark:border-gray-700',
        className
      )}
      {...props}
    />
  )
})

Card.displayName = 'Card'

export { Card }
