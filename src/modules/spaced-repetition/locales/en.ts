const en = {
  title: 'Spaced Repetition',
  subtitle: 'Group your practice links and review them on an expanding schedule',
  fields: {
    title: 'Title',
    practiceUrls: 'Practice links',
    practiceUrlNumber: 'Practice link {{number}}'
  },
  list: {
    emptyTitle: 'Nothing saved yet',
    emptyDescription: 'Add a title and one or more practice links to start reviewing.',
    totalCount_one: '{{count}} item',
    totalCount_other: '{{count}} items',
    dueCount_one: '{{count}} due for review',
    dueCount_other: '{{count}} due for review',
    dueSection: 'Review now',
    dueEmpty: 'All caught up — nothing awaits review.',
    laterSection: 'Scheduled',
    laterEmpty: 'No upcoming reviews yet.',
    createdAt: 'Created',
    reviews: 'Reviews',
    nextReview: 'Next review',
    lastReview: 'Last reviewed',
    status: {
      new: 'New',
      due: 'Due',
      scheduled: 'Scheduled'
    },
    practice: {
      openNumber: 'Open practice exercise {{number}}',
      done: 'All practice exercises completed'
    }
  },
  review: {
    prompt: 'How well did it stick?',
    again: 'Again',
    hard: 'Hard',
    good: 'Good',
    easy: 'Easy'
  },
  memoryForm: {
    addPracticeLink: 'Add practice link',
    removePracticeLink: 'Remove practice link {{number}}',
    errors: {
      practiceUrl: 'Enter a valid http(s) link, e.g. https://example.com/practice.'
    }
  },
  create: {
    title: 'New practice set',
    submit: 'Save practice set'
  },
  edit: {
    action: 'Edit practice set',
    title: 'Edit practice set',
    submit: 'Save changes',
    notFound: 'Practice set not found'
  }
}

export type Dictionary = typeof en

export default en
