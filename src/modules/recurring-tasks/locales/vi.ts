import type { Dictionary } from './en'

const vi: Dictionary = {
  title: 'Việc định kỳ',
  subtitle: 'Ghi nhận mọi việc lặp lại — thay dầu, lấy cao răng, khám định kỳ — và xem ngày cần làm tiếp theo',
  fields: {
    name: 'Tên việc',
    emoji: 'Biểu tượng (emoji)',
    notes: 'Ghi chú',
    intervalDays: 'Chu kỳ (ngày)',
    intervalMonths: 'Chu kỳ (tháng)',
    intervalReading: 'Chu kỳ (chỉ số)',
    readingLabel: 'Đơn vị chỉ số',
    performedAt: 'Ngày thực hiện',
    readingValue: 'Chỉ số đo'
  },
  list: {
    emptyTitle: 'Chưa có việc định kỳ nào',
    emptyDescription:
      'Thêm bất cứ việc gì lặp lại — “Lấy cao răng”, “Khám sức khỏe tổng quát”, “Đánh giá sự nghiệp” — rồi ghi nhận mỗi lần bạn thực hiện.',
    nextDue: 'Lần tới vào',
    remaining: 'Còn lại',
    latestLog: 'Lần gần nhất',
    everyDays: 'Mỗi {{days}} ngày',
    everyMonths: 'Mỗi {{months}} tháng',
    everyReading: 'Mỗi {{amount}} {{unit}}'
  },
  create: {
    title: 'Thêm việc định kỳ',
    namePlaceholder: 'VD: Lấy cao răng',
    submit: 'Lưu việc',
    intervalsHint: 'Nhập ít nhất một chu kỳ — ngày, tháng, chỉ số, hoặc kết hợp tuỳ ý.',
    readingUnitHint: 'Sẽ hiển thị ở những chỗ nhập chỉ số của việc này.',
    firstRecordTitle: 'Lần đầu tiên (tuỳ chọn)',
    firstRecordHint: 'Đã làm rồi? Ghi lại ngày thực hiện — cùng chỉ số nếu việc này có theo dõi.',
    defaultReadingUnit: 'km',
    errors: {
      intervalRequired: 'Chọn ít nhất một chu kỳ — ngày, tháng hoặc chỉ số.',
      firstRecordIncomplete: 'Cần nhập cả ngày thực hiện và chỉ số đo.'
    }
  },
  detail: {
    status: {
      overdue: 'Trễ hạn',
      dueSoon: 'Sắp đến hạn',
      ok: 'Đúng tiến độ',
      insufficientData: 'Chưa đủ dữ liệu'
    },
    notesTitle: 'Ghi chú',
    summaryTitle: 'Lịch nhắc',
    nextDue: 'Ngày cần làm tiếp theo',
    nextDueReading: 'Hạn tiếp theo ({{unit}})',
    remaining: 'Ước tính còn lại',
    avgPerDay: 'TB {{unit}} / ngày',
    lastDone: 'Lần gần nhất',
    lastDoneWithReading: '{{date}} · {{value}} {{unit}}',
    addLog: {
      title: 'Ghi nhận lần mới',
      submit: 'Lưu lần này',
      invalidDate: 'Nhập ngày hợp lệ.',
      invalidReading: 'Nhập ngày và chỉ số hợp lệ.'
    },
    history: {
      title: 'Lịch sử các lần đã làm',
      empty: 'Chưa có lần nào — hãy ghi nhận lần đầu tiên ở trên.',
      deltaReading: '+{{amount}} {{unit}} so với lần trước'
    },
    notFoundTitle: 'Không tìm thấy việc này'
  },
  notifications: {
    open: 'Việc cần nhắc',
    panelTitle: 'Việc cần nhắc',
    countBadge: '{{count}} việc cần chú ý',
    emptyTitle: 'Bạn đã ổn hết rồi',
    emptyDescription: 'Không có việc nào trễ hạn hay đến hạn trong {{days}} ngày tới.'
  }
}

export default vi
