const en = {
  title: 'Spaced Repetition',
  subtitle: 'Park anything worth remembering — concepts, tips, excerpts — and review it on an expanding schedule',
  fields: {
    title: 'Title (optional)',
    content: 'Content',
    quizUrl: 'Quiz link (optional)'
  },
  list: {
    emptyTitle: 'Nothing saved yet',
    emptyDescription: 'Add the first concept, tip or excerpt you want to remember long-term.',
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
    quiz: {
      open: 'Open quiz',
      done: 'Quiz done'
    }
  },
  review: {
    prompt: 'How well did it stick?',
    again: 'Again',
    hard: 'Hard',
    good: 'Good',
    easy: 'Easy'
  },
  create: {
    title: 'New memory',
    submit: 'Save memory',
    errors: {
      quizUrl: 'Enter a valid http(s) link, e.g. https://example.com/quiz.'
    }
  }
}

export type Dictionary = typeof en

export default en
