import { AnswerRecord } from '../types';

export const exportRecordsToCSV = (records: AnswerRecord[], filenamePrefix = 'GoiTenNgauNhien_KetQua') => {
  if (!records || records.length === 0) {
    return false;
  }

  const headers = [
    'STT',
    'Lớp Học',
    'Họ và Tên Học Sinh',
    'Số Câu Hỏi',
    'Nội Dung Câu Hỏi',
    'Đáp Án Đã Chọn',
    'Đáp Án Đúng',
    'Kết Quả',
    'Thời Gian Trả Lời (giây)',
    'Thời Gian Quy Định (giây)',
    'Điểm Số',
    'Thời Gian Ghi Nhận',
  ];

  const escapeCSV = (value: string | number | undefined | null): string => {
    if (value === undefined || value === null) return '""';
    const str = String(value).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = records.map((rec, index) => {
    let statusText = 'Sai';
    if (rec.status === 'CORRECT') statusText = 'Chính xác';
    else if (rec.status === 'TIMEOUT') statusText = 'Hết thời gian';
    else if (rec.status === 'SKIPPED') statusText = 'Bỏ qua';

    let selectedAnswerText: string = rec.selectedAnswer;
    if (rec.selectedAnswer === 'TIMEOUT') selectedAnswerText = 'Hết giờ (Không chọn)';
    if (rec.selectedAnswer === 'SKIPPED') selectedAnswerText = 'Bỏ qua';

    return [
      escapeCSV(index + 1),
      escapeCSV(rec.className || 'Toàn trường'),
      escapeCSV(rec.studentName),
      escapeCSV(`Câu ${rec.questionNumber}`),
      escapeCSV(rec.questionTitle),
      escapeCSV(selectedAnswerText),
      escapeCSV(rec.correctAnswer),
      escapeCSV(statusText),
      escapeCSV(rec.timeSpentSeconds),
      escapeCSV(rec.maxTimeAllowed),
      escapeCSV(rec.pointsEarned),
      escapeCSV(rec.formattedTime),
    ].join(',');
  });

  // Prepend UTF-8 BOM (\uFEFF) so Microsoft Excel opens Vietnamese characters cleanly
  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filenamePrefix}_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
};
