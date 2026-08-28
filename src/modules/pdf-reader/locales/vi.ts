import type { Dictionary } from './en'

const vi: Dictionary = {
  title: 'Đọc PDF',
  subtitle: 'Đọc từng trang và tiếp tục từ nơi bạn đã dừng lại',
  fields: {
    title: 'Tiêu đề',
    url: 'Liên kết PDF',
    totalPages: 'Tổng số trang (không bắt buộc)'
  },
  list: {
    emptyTitle: 'Chưa có tài liệu nào',
    emptyDescription: 'Thêm liên kết PDF để bắt đầu đọc với lưu tiến độ.',
    progress: 'Trang {{page}} / {{total}}',
    progressUnknown: 'Trang {{page}}'
  },
  view: {
    notFound: 'Không tìm thấy tài liệu',
    pageOf: 'Trang {{page}} / {{total}}',
    page: 'Trang {{page}}',
    previous: 'Trang trước',
    next: 'Trang sau',
    zoomIn: 'Phóng to',
    zoomOut: 'Thu nhỏ',
    zoomReset: 'Đặt lại thu phóng',
    loadErrorTitle: 'Không thể hiển thị tệp PDF này',
    loadErrorDescription: 'Máy chủ có thể chặn yêu cầu liên trang (CORS), hoặc liên kết không truy cập được.',
    openOriginal: 'Mở bản gốc PDF'
  },
  create: {
    title: 'Thêm PDF',
    submit: 'Lưu PDF'
  }
}

export default vi
