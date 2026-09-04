import type { Dictionary } from './en'

const vi: Dictionary = {
  title: 'Lặp lại ngắt quãng',
  subtitle: 'Nhóm các link bài luyện tập và ôn tập theo lịch giãn dần',
  fields: {
    title: 'Tiêu đề',
    practiceUrls: 'Các link bài luyện tập',
    practiceUrlNumber: 'Link bài luyện tập {{number}}'
  },
  list: {
    emptyTitle: 'Chưa có mục nào',
    emptyDescription: 'Thêm tiêu đề và một hoặc nhiều link bài luyện tập để bắt đầu ôn tập.',
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
    practice: {
      openNumber: 'Mở bài luyện tập {{number}}',
      done: 'Đã làm tất cả bài luyện tập'
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
    addPracticeLink: 'Thêm link bài luyện tập',
    removePracticeLink: 'Xoá link bài luyện tập {{number}}',
    errors: {
      practiceUrl: 'Nhập link http(s) hợp lệ, ví dụ https://example.com/practice.'
    }
  },
  create: {
    title: 'Bộ bài luyện tập mới',
    submit: 'Lưu bộ bài luyện tập'
  },
  edit: {
    action: 'Chỉnh sửa bộ bài luyện tập',
    title: 'Chỉnh sửa bộ bài luyện tập',
    submit: 'Lưu thay đổi',
    notFound: 'Không tìm thấy bộ bài luyện tập'
  }
}

export default vi
