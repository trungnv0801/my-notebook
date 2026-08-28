const en = {
  title: 'Recurring Tasks',
  subtitle: 'Track anything that repeats — oil changes, dental visits, yearly check-ups — and see the next due date',
  fields: {
    name: 'Task name',
    emoji: 'Icon (emoji)',
    notes: 'Notes',
    intervalDays: 'Interval (days)',
    intervalMonths: 'Interval (months)',
    intervalReading: 'Interval (usage)',
    readingLabel: 'Usage unit',
    performedAt: 'Date done',
    readingValue: 'Meter reading'
  },
  list: {
    emptyTitle: 'No recurring tasks yet',
    emptyDescription:
      'Add anything that repeats — “Dental scaling”, “Annual health check”, “Career review” — then log every time you do it.',
    nextDue: 'Next due',
    remaining: 'Remaining',
    latestLog: 'Last done',
    everyDays: 'Every {{days}} days',
    everyMonths: 'Every {{months}} months',
    everyReading: 'Every {{amount}} {{unit}}'
  },
  create: {
    title: 'Add recurring task',
    namePlaceholder: 'e.g. Dental scaling',
    submit: 'Save task',
    intervalsHint: 'Fill at least one interval — days, months, usage, or any combination.',
    readingUnitHint: 'Shown wherever this task records readings.',
    firstRecordTitle: 'First entry (optional)',
    firstRecordHint: 'Already done it? Log when — plus the meter reading, if this task tracks one.',
    defaultReadingUnit: 'km',
    errors: {
      intervalRequired: 'Set at least one interval — days, months or usage.',
      firstRecordIncomplete: 'Fill in both the date and the meter reading.'
    }
  },
  detail: {
    status: {
      overdue: 'Overdue',
      dueSoon: 'Due soon',
      ok: 'On track',
      insufficientData: 'Not enough data yet'
    },
    notesTitle: 'Notes',
    summaryTitle: 'Schedule',
    nextDue: 'Next due date',
    nextDueReading: 'Next due at ({{unit}})',
    remaining: 'Estimated remaining',
    avgPerDay: 'Avg {{unit}} / day',
    lastDone: 'Last done',
    lastDoneWithReading: '{{date}} · {{value}} {{unit}}',
    addLog: {
      title: 'Log an occurrence',
      submit: 'Save entry',
      invalidDate: 'Enter a valid date.',
      invalidReading: 'Enter a valid date and meter reading.'
    },
    history: {
      title: 'History',
      empty: 'Nothing logged yet — record your first occurrence above.',
      deltaReading: '+{{amount}} {{unit}} since previous'
    },
    notFoundTitle: 'This task no longer exists'
  },
  notifications: {
    open: 'Reminders',
    panelTitle: 'Reminders',
    countBadge: '{{count}} tasks need attention',
    emptyTitle: "You're all caught up",
    emptyDescription: 'Nothing is overdue or due within the next {{days}} days.'
  }
}

export type Dictionary = typeof en

export default en
