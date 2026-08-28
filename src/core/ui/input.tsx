import { forwardRef, type InputHTMLAttributes } from 'react'

import { cn } from './cn'

const fieldFocusClasses =
  'focus-visible:border-accent focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'flex h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-heading placeholder:text-text/55 transition-[border-color,box-shadow] duration-200',
        fieldFocusClasses,
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  )
)

Input.displayName = 'Input'
