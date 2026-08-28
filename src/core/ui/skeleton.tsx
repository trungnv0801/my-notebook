import { cn } from './cn'

/** Layout-stable placeholder shown while content loads (prefers-reduced-motion aware via global CSS). */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden='true' className={cn('animate-pulse rounded-xl bg-surface-2', className)} />
}
