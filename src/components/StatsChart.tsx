import React from 'react';
import { AnswerRecord, Student, ClassRoom } from '../types';
import { Award, BarChart3, PieChart, Users } from 'lucide-react';

interface StatsChartProps {
  records: AnswerRecord[];
  students: Student[];
  currentClass?: ClassRoom;
}

export const StatsChart: React.FC<StatsChartProps> = ({
  records,
  students,
  currentClass,
}) => {
  // 1. Calculate call counts for each student in current class
  const callDistribution = {
    zero: 0,
    one: 0,
    two: 0,
    threePlus: 0,
  };

  students.forEach((s) => {
    if (s.callCount === 0) callDistribution.zero++;
    else if (s.callCount === 1) callDistribution.one++;
    else if (s.callCount === 2) callDistribution.two++;
    else callDistribution.threePlus++;
  });

  // 2. Calculate Answer Status counts
  const correctCount = records.filter((r) => r.status === 'CORRECT').length;
  const wrongCount = records.filter((r) => r.status === 'WRONG').length;
  const timeoutCount = records.filter((r) => r.status === 'TIMEOUT').length;
  const totalAnswers = records.length;

  const correctPct = totalAnswers > 0 ? Math.round((correctCount / totalAnswers) * 100) : 0;
  const wrongPct = totalAnswers > 0 ? Math.round((wrongCount / totalAnswers) * 100) : 0;
  const timeoutPct = totalAnswers > 0 ? 100 - correctPct - wrongPct : 0;

  // 3. Top student points leaderboard
  const studentPointsMap: Record<string, { name: string; points: number; correct: number }> = {};
  records.forEach((r) => {
    if (!studentPointsMap[r.studentId]) {
      studentPointsMap[r.studentId] = {
        name: r.studentName,
        points: 0,
        correct: 0,
      };
    }
    studentPointsMap[r.studentId].points += r.pointsEarned;
    if (r.status === 'CORRECT') {
      studentPointsMap[r.studentId].correct++;
    }
  });

  const topStudents = Object.values(studentPointsMap)
    .sort((a, b) => b.points - a.points)
    .slice(0, 5);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 my-6">
      {/* Chart 1: Call Frequency Distribution */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-bold font-['Orbitron'] text-slate-200">
              ĐỘ CÔNG BẰNG LƯỢT GỌI
            </h4>
          </div>
          <p className="text-[11px] text-slate-400 font-['Rajdhani'] mb-4">
            Phân bổ số lần học sinh được gọi tên trong lớp {currentClass?.name || ''}
          </p>

          <div className="space-y-2.5">
            <div>
              <div className="flex justify-between text-xs font-['Rajdhani'] mb-1">
                <span className="text-rose-400 font-semibold">Chưa gọi (0 lần)</span>
                <span className="font-bold text-white">
                  {callDistribution.zero} học sinh
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${students.length ? (callDistribution.zero / students.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-['Rajdhani'] mb-1">
                <span className="text-emerald-400 font-semibold">Đã gọi 1 lần</span>
                <span className="font-bold text-white">
                  {callDistribution.one} học sinh
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${students.length ? (callDistribution.one / students.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-['Rajdhani'] mb-1">
                <span className="text-cyan-400 font-semibold">Đã gọi 2 lần</span>
                <span className="font-bold text-white">
                  {callDistribution.two} học sinh
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${students.length ? (callDistribution.two / students.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-['Rajdhani'] mb-1">
                <span className="text-amber-400 font-semibold">Đã gọi ≥ 3 lần</span>
                <span className="font-bold text-white">
                  {callDistribution.threePlus} học sinh
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${students.length ? (callDistribution.threePlus / students.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/80 text-[10px] text-slate-500 font-['Rajdhani'] text-center">
          Tổng sĩ số: <strong className="text-cyan-300">{students.length}</strong> học sinh
        </div>
      </div>

      {/* Chart 2: Answer Status Rate */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <PieChart className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-bold font-['Orbitron'] text-slate-200">
              TỶ LỆ TRẢ LỜI CÂU HỎI
            </h4>
          </div>
          <p className="text-[11px] text-slate-400 font-['Rajdhani'] mb-4">
            Hiệu suất trả lời bài của học sinh trong phiên học này
          </p>

          {totalAnswers === 0 ? (
            <div className="h-32 flex items-center justify-center text-xs text-slate-500 font-['Rajdhani']">
              Chưa có dữ liệu trả lời
            </div>
          ) : (
            <div className="space-y-3">
              {/* Stacked Progress Bar */}
              <div className="h-4 rounded-full overflow-hidden flex bg-slate-800 shadow-inner">
                <div
                  style={{ width: `${correctPct}%` }}
                  className="bg-emerald-500 transition-all duration-500"
                  title={`Đúng: ${correctCount} câu (${correctPct}%)`}
                />
                <div
                  style={{ width: `${wrongPct}%` }}
                  className="bg-rose-500 transition-all duration-500"
                  title={`Sai: ${wrongCount} câu (${wrongPct}%)`}
                />
                <div
                  style={{ width: `${timeoutPct}%` }}
                  className="bg-amber-500 transition-all duration-500"
                  title={`Hết giờ: ${timeoutCount} câu (${timeoutPct}%)`}
                />
              </div>

              {/* Legend */}
              <div className="grid grid-cols-3 gap-2 text-center pt-2">
                <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
                  <div className="text-[10px] text-emerald-400 font-['Rajdhani']">ĐÚNG</div>
                  <div className="text-sm font-bold font-['Orbitron'] text-emerald-300">
                    {correctPct}%
                  </div>
                  <div className="text-[9px] text-slate-400">({correctCount} câu)</div>
                </div>

                <div className="p-2 rounded-xl bg-rose-950/40 border border-rose-500/30">
                  <div className="text-[10px] text-rose-400 font-['Rajdhani']">SAI</div>
                  <div className="text-sm font-bold font-['Orbitron'] text-rose-300">
                    {wrongPct}%
                  </div>
                  <div className="text-[9px] text-slate-400">({wrongCount} câu)</div>
                </div>

                <div className="p-2 rounded-xl bg-amber-950/40 border border-amber-500/30">
                  <div className="text-[10px] text-amber-400 font-['Rajdhani']">HẾT GIỜ</div>
                  <div className="text-sm font-bold font-['Orbitron'] text-amber-300">
                    {timeoutPct}%
                  </div>
                  <div className="text-[9px] text-slate-400">({timeoutCount} câu)</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/80 text-[10px] text-slate-500 font-['Rajdhani'] text-center">
          Tổng số lượt trả lời: <strong className="text-white">{totalAnswers}</strong> lượt
        </div>
      </div>

      {/* Chart 3: Top Students Leaderboard */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-bold font-['Orbitron'] text-slate-200">
              VINH DANH ĐIỂM SỐ CAO NHẤT
            </h4>
          </div>
          <p className="text-[11px] text-slate-400 font-['Rajdhani'] mb-4">
            Top học sinh có điểm tích lũy câu trả lời xuất sắc
          </p>

          {topStudents.length === 0 ? (
            <div className="h-32 flex items-center justify-center text-xs text-slate-500 font-['Rajdhani']">
              Chưa có học sinh ghi điểm
            </div>
          ) : (
            <div className="space-y-2">
              {topStudents.map((s, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold font-['Orbitron'] ${
                        idx === 0
                          ? 'bg-amber-400 text-slate-950'
                          : idx === 1
                          ? 'bg-slate-300 text-slate-950'
                          : idx === 2
                          ? 'bg-amber-700 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-slate-200 truncate max-w-[130px]">
                      {s.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">
                      {s.correct} câu đúng
                    </span>
                    <span className="font-bold font-['Orbitron'] text-amber-300">
                      {s.points}đ
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/80 text-[10px] text-slate-500 font-['Rajdhani'] text-center">
          Tuyên dương các em học sinh tích cực phát biểu
        </div>
      </div>
    </div>
  );
};
