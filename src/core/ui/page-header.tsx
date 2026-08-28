import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <header className='flex flex-wrap items-center justify-between gap-3'>
      <div className='space-y-1'>
        <h1 className='font-heading text-2xl font-bold tracking-tight text-heading'>{title}</h1>
        {subtitle ? <p className='text-sm text-text'>{subtitle}</p> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </header>
  )
}
