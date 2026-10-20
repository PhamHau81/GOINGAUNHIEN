import React, { useState } from 'react';
import { Question, Student } from '../types';
import { PlanetIcon } from './PlanetIcon';
import {
  Rocket,
  Lock,
  CheckCircle2,
  Sparkles,
  RotateCcw,
  Compass,
  AlertCircle,
  HelpCircle,
  BookOpen,
  GraduationCap,
  Filter,
} from 'lucide-react';
import { getAllMathKNTTQuestions } from '../data/mathKNTTData';
import { DEFAULT_QUESTIONS } from '../data/defaultData';
import { MathRenderer } from './MathRenderer';

interface QuestionMapProps {
  questions: Question[];
  selectedStudent: Student | null;
  onSelectQuestion: (question: Question) => void;
  onResetQuestions: () => void;
  onNavigateToScanner: () => void;
  onLoadPresetQuestions?: (questions: Question[], label: string) => void;
  onOpenAiModal?: () => void;
}

export const QuestionMap: React.FC<QuestionMapProps> = ({
  questions,
  selectedStudent,
  onSelectQuestion,
  onResetQuestions,
  onNavigateToScanner,
  onLoadPresetQuestions,
  onOpenAiModal,
}) => {
  const [filterGrade, setFilterGrade] = useState<'ALL' | 10 | 11 | 12>('ALL');

  const filteredQuestions = questions.filter((q) => {
    if (filterGrade === 'ALL') return true;
    return q.grade === filterGrade;
  });

  const answeredCount = filteredQuestions.filter((q) => q.isAnswered).length;
  const remainingCount = filteredQuestions.length - answeredCount;

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-6xl mx-auto px-4 py-4 space-y-5">
      {/* Top Banner: Mission Command Briefing */}
      <div className="w-full flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-4 shadow-lg shadow-cyan-950/40">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/40 text-cyan-400">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold font-['Orbitron'] tracking-wider text-cyan-200">
              BẢN ĐỒ HÀNH TINH & CÂU HỎI MÔN TOÁN
            </h2>
            <p className="text-xs text-slate-400 font-['Rajdhani']">
              Chọn hành tinh mục tiêu để mở câu hỏi trắc nghiệm Toán THPT Kết Nối Tri Thức
            </p>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Active Assigned Student */}
          {selectedStudent ? (
            <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-cyan-950/60 border border-cyan-400/50 text-xs font-['Rajdhani'] shadow-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-cyan-300">Học sinh trả lời:</span>
              <span className="font-bold text-white font-['Orbitron']">{selectedStudent.name}</span>
            </div>
          ) : (
            <button
              onClick={onNavigateToScanner}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-['Rajdhani'] font-semibold hover:bg-amber-500/25 transition-all"
            >
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span>Chưa chọn học sinh → Quét ngay</span>
            </button>
          )}

          {/* Progress */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-['Rajdhani']">
            <span className="text-slate-400">Đã mở:</span>
            <span className="font-bold text-cyan-300 font-['Orbitron']">
              {answeredCount} / {filteredQuestions.length}
            </span>
          </div>

          {onOpenAiModal && (
            <button
              onClick={onOpenAiModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-['Orbitron'] font-bold shadow-md shadow-purple-600/30 transition-all hover:scale-105 active:scale-95"
              title="Sử dụng Gemini AI để tạo ngân hàng câu hỏi tự động theo bài học"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>TẠO CÂU HỎI AI</span>
            </button>
          )}

          <button
            onClick={onResetQuestions}
            disabled={answeredCount === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-['Rajdhani'] font-semibold transition-all disabled:opacity-40 disabled:pointer-events-none"
            title="Mở khóa lại tất cả các hành tinh câu hỏi"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Mở lại tất cả</span>
          </button>
        </div>
      </div>

      {/* Quick Curriculum Bar: Select Textbook Preset */}
      {onLoadPresetQuestions && (
        <div className="w-full flex flex-wrap items-center justify-between gap-2.5 p-3 rounded-2xl bg-slate-950/80 border border-cyan-500/20 backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs font-['Rajdhani'] font-bold text-slate-300">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span className="uppercase tracking-wider">Bộ đề Toán KNTT:</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => onLoadPresetQuestions(getAllMathKNTTQuestions(10), 'Toán 10 (KNTT)')}
              className="px-3 py-1 rounded-xl bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-200 text-xs font-['Orbitron'] font-bold transition-all hover:scale-105 active:scale-95"
            >
              Toán 10 KNTT
            </button>

            <button
              onClick={() => onLoadPresetQuestions(getAllMathKNTTQuestions(11), 'Toán 11 (KNTT)')}
              className="px-3 py-1 rounded-xl bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-200 text-xs font-['Orbitron'] font-bold transition-all hover:scale-105 active:scale-95"
            >
              Toán 11 KNTT
            </button>

            <button
              onClick={() => onLoadPresetQuestions(getAllMathKNTTQuestions(12), 'Toán 12 (KNTT)')}
              className="px-3 py-1 rounded-xl bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-200 text-xs font-['Orbitron'] font-bold transition-all hover:scale-105 active:scale-95"
            >
              Toán 12 KNTT
            </button>

            <button
              onClick={() =>
                onLoadPresetQuestions(getAllMathKNTTQuestions(), 'Toàn bộ Toán THPT (10-11-12)')
              }
              className="px-3 py-1 rounded-xl bg-indigo-950/60 hover:bg-indigo-900 border border-indigo-500/40 text-indigo-200 text-xs font-['Orbitron'] font-bold transition-all hover:scale-105 active:scale-95"
            >
              Tất cả 3 khối THPT
            </button>

            <button
              onClick={() =>
                onLoadPresetQuestions(DEFAULT_QUESTIONS, 'Kiến thức Vũ Trụ & Khoa Học')
              }
              className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-['Rajdhani'] font-semibold transition-all"
            >
              Đề Vũ trụ
            </button>
          </div>
        </div>
      )}

      {/* Grid of Planets / Asteroids */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredQuestions.map((question) => {
          const isLocked = question.isAnswered;

          return (
            <div
              key={question.id}
              onClick={() => {
                if (!isLocked) {
                  onSelectQuestion(question);
                }
              }}
              className={`group relative flex flex-col items-center justify-between p-4 rounded-2xl border transition-all duration-300 backdrop-blur-md overflow-hidden ${
                isLocked
                  ? 'bg-slate-950/40 border-slate-800/80 opacity-50 cursor-not-allowed'
                  : 'bg-gradient-to-b from-slate-900/90 to-[#070b1e]/90 border-cyan-500/30 hover:border-cyan-400 hover:shadow-[0_0_25px_rgba(6,182,212,0.35)] hover:-translate-y-1 cursor-pointer'
              }`}
            >
              {/* Question Number Badge & Curriculum tag */}
              <div className="w-full flex items-center justify-between mb-2">
                <span
                  className={`px-2.5 py-0.5 rounded-lg text-xs font-bold font-['Orbitron'] border ${
                    isLocked
                      ? 'bg-slate-800 text-slate-500 border-slate-700'
                      : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 group-hover:bg-cyan-500 group-hover:text-slate-950'
                  }`}
                >
                  #{question.number}
                </span>

                {question.grade ? (
                  <span className="text-[10px] font-bold font-['Orbitron'] px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-500/40">
                    LỚP {question.grade}
                  </span>
                ) : (
                  <span className="text-[11px] text-amber-400 font-['Rajdhani'] font-semibold">
                    +{question.points}đ
                  </span>
                )}
              </div>

              {/* Celestial Graphic */}
              <div className="my-2 py-1 flex items-center justify-center">
                <PlanetIcon
                  type={question.planetType}
                  size="md"
                  isAnswered={isLocked}
                />
              </div>

              {/* Lesson / Chapter Tag if present */}
              {question.lessonTitle && (
                <div className="w-full text-center px-1 mb-1">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-cyan-400 line-clamp-1 font-['Rajdhani']">
                    {question.lessonTitle}
                  </span>
                </div>
              )}

              {/* Planet Name */}
              <div className="text-center w-full">
                <h3
                  className={`text-xs font-bold font-['Orbitron'] truncate ${
                    isLocked ? 'text-slate-500' : 'text-slate-200 group-hover:text-cyan-200'
                  }`}
                >
                  {question.planetName}
                </h3>
                <div className="text-[10px] text-slate-400 line-clamp-1 font-['Plus_Jakarta_Sans'] mt-0.5">
                  <MathRenderer text={question.title} inline />
                </div>
              </div>

              {/* Action indicator footer */}
              <div className="w-full mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-center">
                {isLocked ? (
                  <div className="flex items-center gap-1 text-[10px] text-emerald-400/80 font-['Rajdhani'] font-bold uppercase tracking-wider">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>ĐÃ HOÀN THÀNH</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-[10px] text-cyan-400 group-hover:text-cyan-200 font-['Rajdhani'] font-bold uppercase tracking-wider">
                    <Sparkles className="w-3 h-3 group-hover:animate-spin" />
                    <span>CHỌN CÂU HỎI</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* All questions completed celebration notice */}
      {remainingCount === 0 && filteredQuestions.length > 0 && (
        <div className="w-full p-6 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-teal-950/80 to-cyan-950/80 border-2 border-emerald-400/60 text-center flex flex-col items-center justify-center space-y-3 shadow-xl">
          <div className="p-3 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
            <Sparkles className="w-8 h-8 animate-bounce" />
          </div>
          <h3 className="text-xl font-bold font-['Orbitron'] text-emerald-300">
            CHÚC MỪNG! TẤT CẢ CÂU HỎI ĐÃ ĐƯỢC CHINH PHỤC!
          </h3>
          <p className="text-sm text-slate-300 max-w-xl font-['Rajdhani']">
            Các em học sinh đã hoàn thành xuất sắc tất cả câu hỏi trong ngân hàng đề. Thầy cô có thể nhấn &quot;Mở lại tất cả&quot; hoặc chọn bộ đề của lớp khác để tiếp tục!
          </p>
          {onOpenAiModal && (
            <button
              onClick={onOpenAiModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-['Orbitron'] font-bold shadow-md shadow-purple-600/30 transition-all hover:scale-105 active:scale-95"
              title="Sử dụng Gemini AI để tạo ngân hàng câu hỏi tự động theo bài học"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>TẠO CÂU HỎI AI</span>
            </button>
          )}

          <button
            onClick={onResetQuestions}
            className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-['Orbitron'] text-xs tracking-wider transition-all"
          >
            MỞ LẠI TẤT CẢ HÀNH TINH
          </button>
        </div>
      )}
    </div>
  );
};
