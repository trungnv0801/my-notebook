import { forwardRef } from 'react'

import type { HTMLAttributes, LabelHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react'

import { cn } from './cn'

export function Card({
  className,
  interactive = false,
  ...props
}: HTMLAttributes<HTMLDivElement> & { interactive?: boolean }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border bg-surface p-5 shadow-sm',
        interactive && 'transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/35 hover:shadow-md',
        className
      )}
      {...props}
    />
  )
}

export const Label = forwardRef<HTMLLabelElement, LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label ref={ref} className={cn('text-sm font-medium text-heading', className)} {...props} />
  )
)

Label.displayName = 'Label'

const fieldFocusClasses =
  'focus-visible:border-accent focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring'

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        'h-10 cursor-pointer rounded-lg border border-border bg-surface px-3 text-sm text-heading transition-colors duration-200',
        fieldFocusClasses,
        className
      )}
      {...props}
    />
  )
)

Select.displayName = 'Select'

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('font-heading text-base font-semibold tracking-tight text-heading', className)} {...props} />
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mt-1 text-sm text-text', className)} {...props} />
}

export function EmptyState({
  title,
  description,
  action,
  icon
}: {
  title: string
  description?: string
  action?: ReactNode
  icon?: ReactNode
}) {
  return (
    <div className='flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-surface/60 px-6 py-14 text-center'>
      {icon ? (
        <div aria-hidden='true' className='grid size-12 place-items-center rounded-xl bg-accent-bg text-accent'>
          {icon}
        </div>
      ) : null}
      <p className='text-base font-semibold text-heading'>{title}</p>
      {description ? <p className='max-w-sm text-sm text-text'>{description}</p> : null}
      {action ? <div className='mt-1'>{action}</div> : null}
    </div>
  )
}
