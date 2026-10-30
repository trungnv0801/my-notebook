import { forwardRef, type InputHTMLAttributes } from 'react'

import { cn } from './cn'

const fieldFocusClasses =
  'focus-visible:border-accent focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'flex min-h-11 w-full min-w-0 rounded-xl border border-border bg-surface px-3.5 py-2.5 text-base text-heading placeholder:text-text/70 transition-[border-color,box-shadow] duration-200 sm:text-sm',
        fieldFocusClasses,
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  )
)

Input.displayName = 'Input'
