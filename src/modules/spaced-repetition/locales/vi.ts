import type { Dictionary } from './en'

const vi: Dictionary = {
  title: 'Lặp lại ngắt quãng',
  subtitle: 'Nhóm các đường link quiz và ôn tập theo lịch giãn dần',
  fields: {
    title: 'Tiêu đề',
    quizUrls: 'Các đường link quiz',
    quizUrlNumber: 'Đường link quiz {{number}}'
  },
  list: {
    emptyTitle: 'Chưa có mục nào',
    emptyDescription: 'Thêm tiêu đề và một hoặc nhiều đường link quiz để bắt đầu ôn tập.',
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
      openNumber: 'Mở quiz {{number}}',
      done: 'Đã làm tất cả quiz'
    }
  },
  review: {
    prompt: 'Bạn nhớ được tốt đến đâu?',
    again: 'Quên',
    hard: 'Khó',
    good: 'Tốt',
    easy: 'Dễ'
  },
  memoryForm: {
    addQuizLink: 'Thêm đường link quiz',
    removeQuizLink: 'Xoá đường link quiz {{number}}',
    errors: {
      quizUrl: 'Nhập đường link http(s) hợp lệ, ví dụ https://example.com/quiz.'
    }
  },
  create: {
    title: 'Bộ quiz mới',
    submit: 'Lưu bộ quiz'
  },
  edit: {
    action: 'Chỉnh sửa bộ quiz',
    title: 'Chỉnh sửa bộ quiz',
    submit: 'Lưu thay đổi',
    notFound: 'Không tìm thấy bộ quiz'
  }
}

export default vi
