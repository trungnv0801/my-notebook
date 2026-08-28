import { useTranslation } from 'react-i18next'

import type { TaskStatus } from '../lib/schedule'

const badgeClasses: Record<TaskStatus, string> = {
  overdue: 'bg-danger/10 text-danger',
  'due-soon': 'bg-warning/10 text-warning',
  ok: 'bg-success/10 text-success',
  'insufficient-data': 'bg-surface-2 text-text'
}

const labelKeys: Record<TaskStatus, string> = {
  overdue: 'detail.status.overdue',
  'due-soon': 'detail.status.dueSoon',
  ok: 'detail.status.ok',
  'insufficient-data': 'detail.status.insufficientData'
}

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const { t } = useTranslation('recurring-tasks')

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeClasses[status]}`}
    >
      <span aria-hidden='true' className='size-1.5 rounded-full bg-current' />
      {t(labelKeys[status])}
    </span>
  )
}
