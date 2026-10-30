import { forwardRef, type TextareaHTMLAttributes } from 'react'

import { cn } from './cn'

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'min-h-24 w-full rounded-xl border border-border bg-surface px-3.5 py-3 text-base text-heading placeholder:text-text/70 transition-[border-color,box-shadow] duration-200 sm:text-sm',
        'focus-visible:border-accent focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  )
)

Textarea.displayName = 'Textarea'
