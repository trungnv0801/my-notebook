import type { Dictionary } from './en'

const vi: Dictionary = {
  appName: 'Notebook',
  actions: {
    save: 'Lưu',
    cancel: 'Huỷ',
    delete: 'Xoá',
    create: 'Tạo mới',
    back: 'Quay lại',
    open: 'Mở'
  },
  states: {
    loading: 'Đang tải…'
  },
  form: {
    required: 'Trường này là bắt buộc.',
    error: 'Không thể lưu. Vui lòng thử lại.'
  },
  layout: {
    menu: 'Menu',
    language: 'Ngôn ngữ'
  },
  auth: {
    signInTitle: 'Đăng nhập Notebook',
    signUpTitle: 'Tạo tài khoản của bạn',
    email: 'Email',
    password: 'Mật khẩu',
    displayName: 'Tên hiển thị',
    signInAction: 'Đăng nhập',
    signUpAction: 'Đăng ký',
    googleSignIn: 'Tiếp tục với Google',
    noAccount: 'Chưa có tài khoản?',
    haveAccount: 'Đã có tài khoản?',
    signOut: 'Đăng xuất',
    errors: {
      invalidCredentials: 'Email hoặc mật khẩu không đúng.',
      userNotFound: 'Không tìm thấy tài khoản với email này.',
      emailInUse: 'Email này đã được đăng ký.',
      weakPassword: 'Mật khẩu phải có ít nhất 6 ký tự.',
      tooManyRequests: 'Quá nhiều lần thử. Vui lòng thử lại sau.',
      popupClosed: 'Cửa sổ đăng nhập Google đã bị đóng.',
      generic: 'Đã xảy ra lỗi. Vui lòng thử lại.'
    }
  },
  offline: {
    online: 'Trực tuyến',
    offline: 'Ngoại tuyến — thay đổi sẽ được đồng bộ khi có kết nối trở lại',
    syncing: 'Đang đồng bộ…'
  },
  theme: {
    toggle: 'Bật/tắt chế độ tối / sáng'
  },
  notFound: {
    title: 'Không tìm thấy trang',
    backHome: 'Về trang chủ'
  }
}

export default vi
