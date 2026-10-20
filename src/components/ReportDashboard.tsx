import React, { useState } from 'react';
import { AnswerRecord, ClassRoom } from '../types';
import { exportRecordsToCSV } from '../utils/csvExport';
import { StatsChart } from './StatsChart';
import {
  FileSpreadsheet,
  Download,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  BarChart3,
  Award,
  Calendar,
  AlertCircle,
  GraduationCap,
} from 'lucide-react';

interface ReportDashboardProps {
  records: AnswerRecord[];
  classes?: ClassRoom[];
  onClearRecords: () => void;
}

export const ReportDashboard: React.FC<ReportDashboardProps> = ({
  records,
  classes = [],
  onClearRecords,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'CORRECT' | 'WRONG' | 'TIMEOUT'>('ALL');
  const [classFilter, setClassFilter] = useState<string>('ALL');

  // Filtered records
  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.questionTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `câu ${r.questionNumber}`.includes(searchTerm.toLowerCase()) ||
      (r.className && r.className.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === 'ALL' ? true : r.status === statusFilter;

    const matchesClass =
      classFilter === 'ALL' ? true : r.classId === classFilter || r.className === classFilter;

    return matchesSearch && matchesStatus && matchesClass;
  });

  // Stats calculation on filtered set
  const total = filteredRecords.length;
  const correctCount = filteredRecords.filter((r) => r.status === 'CORRECT').length;
  const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  const totalPoints = filteredRecords.reduce((acc, curr) => acc + curr.pointsEarned, 0);

  const avgTime =
    total > 0
      ? (filteredRecords.reduce((acc, curr) => acc + curr.timeSpentSeconds, 0) / total).toFixed(1)
      : '0';

  const handleExport = () => {
    exportRecordsToCSV(filteredRecords, 'BaoCao_TrangThaiHocSinh_VũTrụ');
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-6xl mx-auto px-4 py-4 space-y-6">
      {/* Top Header & Export Controls */}
      <div className="w-full flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-4 shadow-lg shadow-cyan-950/40">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/40 text-cyan-400">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold font-['Orbitron'] tracking-wider text-cyan-200">
              NHẬT KÝ SỨ MỆNH & BẢNG ĐIỂM
            </h2>
            <p className="text-xs text-slate-400 font-['Rajdhani']">
              Theo dõi chi tiết câu trả lời theo từng lớp học, thời gian phản xạ và xuất file Excel
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleExport}
            disabled={filteredRecords.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold font-['Orbitron'] text-xs tracking-wider transition-all shadow-md shadow-emerald-500/20 disabled:opacity-40 disabled:pointer-events-none hover:scale-105 active:scale-95"
            title="Tải tệp Excel định dạng CSV chuẩn UTF-8 BOM tiếng Việt"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>XUẤT EXCEL (CSV)</span>
            <Download className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onClearRecords}
            disabled={records.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-['Rajdhani'] font-semibold transition-all disabled:opacity-30 disabled:pointer-events-none"
            title="Xóa dữ liệu nhật ký của phiên học này"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Xóa lịch sử</span>
          </button>
        </div>
      </div>

      {/* Overview Statistics Cards */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
          <div className="text-[11px] text-slate-400 font-['Rajdhani'] uppercase tracking-wider">
            Tổng lượt trả lời
          </div>
          <div className="text-2xl font-bold font-['Orbitron'] text-white mt-1">
            {total}
          </div>
          <div className="text-[11px] text-cyan-400 mt-1">
            {classFilter === 'ALL' ? 'Tất cả các lớp' : 'Lớp được lọc'}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 backdrop-blur-md">
          <div className="text-[11px] text-emerald-400 font-['Rajdhani'] uppercase tracking-wider">
            Tỷ lệ trả lời đúng
          </div>
          <div className="text-2xl font-bold font-['Orbitron'] text-emerald-300 mt-1">
            {accuracy}%
          </div>
          <div className="text-[11px] text-emerald-400/80 mt-1">
            {correctCount} / {total} lượt
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 backdrop-blur-md">
          <div className="text-[11px] text-amber-400 font-['Rajdhani'] uppercase tracking-wider">
            Tổng điểm thưởng
          </div>
          <div className="text-2xl font-bold font-['Orbitron'] text-amber-300 mt-1">
            {totalPoints}đ
          </div>
          <div className="text-[11px] text-amber-400/80 mt-1">
            Điểm toàn phi đội
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 backdrop-blur-md">
          <div className="text-[11px] text-indigo-400 font-['Rajdhani'] uppercase tracking-wider">
            Thời gian phản xạ TB
          </div>
          <div className="text-2xl font-bold font-['Orbitron'] text-indigo-300 mt-1">
            {avgTime}s
          </div>
          <div className="text-[11px] text-indigo-400/80 mt-1">
            Tốc độ tư duy
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts Section (d3-visualization style) */}
      <StatsChart
        records={filteredRecords}
        students={
          classFilter === 'ALL'
            ? classes.flatMap((c) => c.students)
            : classes.find((c) => c.id === classFilter)?.students || []
        }
        currentClass={classes.find((c) => c.id === classFilter)}
      />

      {/* Filter and Search Bar */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên học sinh, lớp hoặc câu hỏi..."
            className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-['Plus_Jakarta_Sans']"
          />
        </div>

        {/* Class Filter Dropdown */}
        {classes.length > 0 && (
          <div className="flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-cyan-400" />
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 font-['Orbitron']"
            >
              <option value="ALL">Tất cả các lớp</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} (Khối {c.grade})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Status Filter buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {(['ALL', 'CORRECT', 'WRONG', 'TIMEOUT'] as const).map((st) => {
            const labels = {
              ALL: 'Tất cả',
              CORRECT: 'Chính xác',
              WRONG: 'Sai',
              TIMEOUT: 'Hết giờ',
            };
            const isActive = statusFilter === st;

            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-xl text-xs font-['Rajdhani'] font-semibold transition-all ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {labels[st]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table of Records */}
      <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-md shadow-xl">
        {filteredRecords.length === 0 ? (
          <div className="p-10 text-center flex flex-col items-center justify-center space-y-3">
            <AlertCircle className="w-10 h-10 text-slate-600" />
            <p className="text-sm text-slate-400 font-['Rajdhani']">
              {records.length === 0
                ? 'Chưa có lượt trả lời nào được ghi nhận. Hãy gọi tên học sinh và bắt đầu câu hỏi!'
                : 'Không tìm thấy kết quả phù hợp với bộ lọc.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950/90 border-b border-slate-800 text-slate-400 font-['Orbitron'] text-[11px]">
                  <th className="py-3 px-3 w-12 text-center">STT</th>
                  <th className="py-3 px-3">Lớp</th>
                  <th className="py-3 px-3">Học sinh</th>
                  <th className="py-3 px-3">Câu hỏi</th>
                  <th className="py-3 px-3 text-center">Đáp án chọn</th>
                  <th className="py-3 px-3 text-center">Đáp án đúng</th>
                  <th className="py-3 px-3 text-center">Kết quả</th>
                  <th className="py-3 px-3 text-center">Thời gian</th>
                  <th className="py-3 px-3 text-center">Điểm</th>
                  <th className="py-3 px-3 text-right">Thời điểm</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-['Plus_Jakarta_Sans']">
                {filteredRecords.map((rec, index) => {
                  let statusBadge = null;
                  if (rec.status === 'CORRECT') {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-[10px]">
                        <CheckCircle2 className="w-3 h-3" /> Đúng
                      </span>
                    );
                  } else if (rec.status === 'WRONG') {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold text-[10px]">
                        <XCircle className="w-3 h-3" /> Sai
                      </span>
                    );
                  } else if (rec.status === 'TIMEOUT') {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-[10px]">
                        <Clock className="w-3 h-3" /> Hết giờ
                      </span>
                    );
                  }

                  return (
                    <tr
                      key={rec.id}
                      className="hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-3 px-3 text-center text-slate-500 font-['Orbitron']">
                        {index + 1}
                      </td>
                      <td className="py-3 px-3 font-semibold text-cyan-400 font-['Orbitron'] text-[11px]">
                        {rec.className || 'Chung'}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-200">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 flex items-center justify-center text-[10px] font-bold">
                            {rec.studentName.charAt(0)}
                          </div>
                          <span>{rec.studentName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-300 max-w-xs truncate" title={rec.questionTitle}>
                        <span className="text-cyan-400 font-['Orbitron'] font-bold mr-1">
                          #{rec.questionNumber}:
                        </span>
                        {rec.questionTitle}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`font-['Orbitron'] font-bold px-2 py-0.5 rounded ${
                            rec.selectedAnswer === rec.correctAnswer
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-rose-500/20 text-rose-300'
                          }`}
                        >
                          {rec.selectedAnswer}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-['Orbitron'] font-bold text-emerald-400">
                        {rec.correctAnswer}
                      </td>
                      <td className="py-3 px-3 text-center">{statusBadge}</td>
                      <td className="py-3 px-3 text-center font-['Orbitron'] text-slate-300">
                        {rec.timeSpentSeconds}s / {rec.maxTimeAllowed}s
                      </td>
                      <td className="py-3 px-3 text-center font-['Orbitron'] font-bold text-amber-400">
                        +{rec.pointsEarned}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-500 font-['Rajdhani']">
                        {rec.formattedTime}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
