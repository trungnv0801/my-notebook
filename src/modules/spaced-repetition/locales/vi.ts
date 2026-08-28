import type { Dictionary } from './en'

const vi: Dictionary = {
  title: 'Lặp lại ngắt quãng',
  subtitle: 'Lưu lại bất cứ điều đáng nhớ — khái niệm, mẹo, đoạn trích — và ôn theo lịch giãn dần',
  fields: {
    title: 'Tiêu đề (tuỳ chọn)',
    content: 'Nội dung',
    quizUrl: 'Đường link quiz (tuỳ chọn)'
  },
  list: {
    emptyTitle: 'Chưa có mục nào',
    emptyDescription: 'Thêm khái niệm, mẹo hoặc đoạn trích đầu tiên bạn muốn ghi nhớ lâu dài.',
    totalCount_one: '{{count}} mục',
    totalCount_other: '{{count}} mục',
    dueCount_one: '{{count}} mục cần ôn hôm nay',
    dueCount_other: '{{count}} mục cần ôn hôm nay',
    dueSection: 'Ôn ngay',
    dueEmpty: 'Bạn đã ôn hết — không còn mục nào đến hạn.',
    laterSection: 'Đã lên lịch',
    laterEmpty: 'Chưa có lịch ôn nào.',
    createdAt: 'Ngày tạo',
    reviews: 'Số lần ôn',
    nextReview: 'Ôn lần tới',
    lastReview: 'Ôn gần nhất',
    status: {
      new: 'Mới',
      due: 'Đến hạn',
      scheduled: 'Đã lên lịch'
    },
    quiz: {
      open: 'Mở quiz',
      done: 'Đã làm quiz'
    }
  },
  review: {
    prompt: 'Bạn nhớ được tốt đến đâu?',
    again: 'Quên',
    hard: 'Khó',
    good: 'Tốt',
    easy: 'Dễ'
  },
  create: {
    title: 'Mục ghi nhớ mới',
    submit: 'Lưu mục',
    errors: {
      quizUrl: 'Nhập đường link http(s) hợp lệ, ví dụ https://example.com/quiz.'
    }
  }
}

export default vi
