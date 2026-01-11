import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

const Input = forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        'w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-base',
        'focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:border-blue-400',
        className
      )}
      {...props}
    />
  )
})

Input.displayName = 'Input'

export { Input }
