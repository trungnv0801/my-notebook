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
    forgotPasswordTitle: 'Đặt lại mật khẩu',
    forgotPasswordDescription: 'Nhập email để nhận liên kết đặt lại mật khẩu.',
    resetPasswordSent: 'Nếu email này có tài khoản, bạn sẽ nhận được liên kết đặt lại mật khẩu.',
    resetPasswordTitle: 'Tạo mật khẩu mới',
    resetPasswordDescription: 'Nhập mật khẩu mới cho {{email}}.',
    resetPasswordSuccess: 'Mật khẩu đã được cập nhật. Bạn có thể đăng nhập ngay.',
    email: 'Email',
    password: 'Mật khẩu',
    newPassword: 'Mật khẩu mới',
    confirmPassword: 'Xác nhận mật khẩu',
    signInAction: 'Đăng nhập',
    forgotPassword: 'Quên mật khẩu?',
    sendResetLink: 'Gửi liên kết đặt lại',
    resendResetLinkIn: 'Gửi lại sau {{seconds}} giây',
    updatePassword: 'Cập nhật mật khẩu',
    backToSignIn: 'Quay lại đăng nhập',
    signOut: 'Đăng xuất',
    errors: {
      invalidCredentials: 'Email hoặc mật khẩu không đúng.',
      userNotFound: 'Không tìm thấy tài khoản với email này.',
      weakPassword: 'Mật khẩu phải có ít nhất 6 ký tự.',
      tooManyRequests: 'Quá nhiều lần thử. Vui lòng thử lại sau.',
      passwordMismatch: 'Mật khẩu xác nhận không khớp.',
      resetLinkInvalid: 'Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.',
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
