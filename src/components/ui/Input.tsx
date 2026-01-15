import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

const Input = forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        'w-full rounded-lg border border-gray-200 bg-white/50 px-4 py-2.5 text-base',
        'focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'placeholder:text-gray-400',
        'dark:border-gray-600 dark:bg-gray-700/50 dark:text-white dark:focus:border-blue-400 dark:focus:bg-gray-700 dark:placeholder:text-gray-500',
        'transition-colors',
        className
      )}
      {...props}
    />
  )
})

Input.displayName = 'Input'

export { Input }
