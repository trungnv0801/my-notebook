import { type ButtonHTMLAttributes, forwardRef } from 'react'

import { cn } from './cn'

type Variant = 'primary' | 'outline' | 'ghost' | 'danger'
type Size = 'sm' | 'md'

const variantClasses: Record<Variant, string> = {
  primary: 'bg-accent text-on-accent shadow-sm hover:bg-accent-strong hover:shadow-md',
  outline:
    'border border-border bg-surface text-heading shadow-xs hover:border-accent/40 hover:bg-accent-bg hover:text-accent',
  ghost: 'bg-transparent text-text hover:bg-surface-2 hover:text-heading',
  danger: 'bg-danger text-on-danger shadow-sm hover:bg-danger/90'
}

const sizeClasses: Record<Size, string> = {
  sm: 'min-h-11 min-w-11 px-3 py-2 text-sm',
  md: 'min-h-11 min-w-11 px-4 py-2.5 text-sm'
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex touch-manipulation cursor-pointer items-center justify-center gap-2 rounded-xl font-medium transition-[color,background-color,border-color,box-shadow] duration-200',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
        'disabled:pointer-events-none disabled:opacity-50',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  )
)

Button.displayName = 'Button'
