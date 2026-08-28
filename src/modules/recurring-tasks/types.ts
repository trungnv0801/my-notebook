/**
 * A recurring task definition. Fully data-driven: every task carries its own
 * configuration, so adding a new kind of chore (dental scaling, annual health
 * check-up, career-goal review, …) never requires a code change.
 */
export interface RecurringTask {
  /** Human-readable name, e.g. "Thay dầu xe máy", "Lấy cao răng". */
  name: string
  /** Optional emoji shown next to the name, e.g. "🦷". Null when unused. */
  emoji: string | null
  /** Optional free-form notes about how / where to do the task. Null when unused. */
  notes: string | null
  /** Repeat every this many days (e.g. water the plants every 3). Null when unused. */
  intervalDays: number | null
  /** Repeat every this many months (e.g. dental scaling every 6). Null when unused. */
  intervalMonths: number | null
  /**
   * Whether occurrences record a numeric meter reading (e.g. an odometer).
   * Only metered chores such as an oil change need this; a dental cleaning does not.
   */
  trackReading: boolean
  /**
   * Unit label for the meter reading, e.g. "km" — shown verbatim on forms and history.
   * Required when {@link trackReading} is true, otherwise null.
   */
  readingLabel: string | null
  /** Repeat after this many units accumulate since the last occurrence. Null when unused. */
  intervalReading: number | null
}

/** One logged occurrence of a recurring task: when it was done plus its optional reading. */
export interface RecurringLog {
  /** Id of the {@link RecurringTask} this occurrence belongs to. */
  taskId: string
  /** Epoch milliseconds of the day the work was performed. */
  performedAt: number
  /** Meter reading at the time of the work (odometer km etc.). Null when the task tracks none. */
  readingValue: number | null
}
