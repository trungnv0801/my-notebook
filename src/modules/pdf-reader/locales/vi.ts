import type { Dictionary } from './en'

const vi: Dictionary = {
  title: 'Đọc PDF',
  subtitle: 'Đọc từng trang và tiếp tục từ nơi bạn đã dừng lại',
  fields: {
    title: 'Tiêu đề',
    url: 'Liên kết PDF',
    lastReadPage: 'Trang đã đọc đến'
  },
  list: {
    emptyTitle: 'Chưa có tài liệu nào',
    emptyDescription: 'Thêm liên kết PDF để bắt đầu đọc với lưu tiến độ.',
    progress: 'Trang {{page}} / {{total}}',
    progressUnknown: 'Trang {{page}}'
  },
  create: {
    title: 'Thêm PDF',
    submit: 'Lưu PDF'
  },
  edit: {
    action: 'Sửa',
    title: 'Sửa PDF',
    submit: 'Lưu thay đổi',
    notFound: 'Không tìm thấy tài liệu'
  }
}

export default vi
