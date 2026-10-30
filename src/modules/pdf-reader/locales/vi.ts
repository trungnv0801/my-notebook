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
  reader: {
    open: 'Đọc',
    page: 'Trang',
    previousPage: 'Trang trước',
    nextPage: 'Trang sau',
    enterFullscreen: 'Toàn màn hình',
    exitFullscreen: 'Thoát toàn màn hình',
    openExternally: 'Mở trong tab mới',
    saveProgress: 'Lưu tiến độ',
    progressSaved: 'Đã lưu tiến độ',
    fullscreenError: 'Trình duyệt này không hỗ trợ chế độ toàn màn hình.',
    embedHint: 'Nếu PDF không hiển thị, máy chủ của tệp có thể không cho phép nhúng.',
    frameTitle: 'Tài liệu PDF {{title}}'
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
