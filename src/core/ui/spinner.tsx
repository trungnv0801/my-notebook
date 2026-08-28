import { Loader2 } from 'lucide-react'

import { cn } from './cn'

export function Spinner({ className }: { className?: string }) {
  return <Loader2 aria-hidden='true' className={cn('size-5 animate-spin text-accent', className)} />
}
