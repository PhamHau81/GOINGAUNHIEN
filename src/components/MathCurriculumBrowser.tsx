import React, { useState } from 'react';
import { Question, MathGradeItem } from '../types';
import { MATH_KNTT_DATA, getAllMathKNTTQuestions, getFilteredMathQuestions } from '../data/mathKNTTData';
import { MathRenderer } from './MathRenderer';
import {
  BookOpen,
  GraduationCap,
  Layers,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Sparkles,
  Rocket,
  Check,
  Eye,
  Award,
} from 'lucide-react';

interface MathCurriculumBrowserProps {
  onLoadQuestions: (questions: Question[], title: string) => void;
  activeQuestionsCount: number;
}

export const MathCurriculumBrowser: React.FC<MathCurriculumBrowserProps> = ({
  onLoadQuestions,
  activeQuestionsCount,
}) => {
  const [selectedGrade, setSelectedGrade] = useState<10 | 11 | 12>(10);
  const [expandedChapterId, setExpandedChapterId] = useState<string | null>('g10-c1');
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null);
  const [loadedNotice, setLoadedNotice] = useState<string | null>(null);

  const currentGradeData = MATH_KNTT_DATA.find((g) => g.grade === selectedGrade);

  const handleApplyPreset = (questions: Question[], label: string) => {
    onLoadQuestions(questions, label);
    setLoadedNotice(`Đã nạp thành công: ${label} (${questions.length} câu hỏi)!`);
    setTimeout(() => setLoadedNotice(null), 3000);
  };

  return (
    <div className="w-full bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-4 sm:p-6 backdrop-blur-md space-y-6 shadow-xl">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/20">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold font-['Orbitron'] text-cyan-200">
                NGÂN HÀNG CÂU HỎI MÔN TOÁN THPT
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-[10px] font-bold text-cyan-300 font-['Rajdhani']">
                KẾT NỐI TRI THỨC VỚI CUỘC SỐNG
              </span>
            </div>
            <p className="text-xs text-slate-400 font-['Rajdhani'] mt-0.5">
              Phân loại chuẩn theo từng Khối lớp (10, 11, 12), từng Chương và từng Bài học
            </p>
          </div>
        </div>

        {/* Quick Batch Load Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              const allQ = getAllMathKNTTQuestions();
              handleApplyPreset(allQ, 'Toàn bộ Toán THPT (Lớp 10, 11, 12)');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/40 border border-indigo-400/40 text-indigo-200 text-xs font-['Orbitron'] font-bold transition-all hover:scale-105 active:scale-95 shadow-sm"
            title="Nạp tất cả câu hỏi cả 3 khối 10, 11, 12"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>NẠP TẤT CẢ TOÁN THPT (3 KHỐI)</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {loadedNotice && (
        <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-['Rajdhani'] font-semibold flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{loadedNotice}</span>
        </div>
      )}

      {/* Grade Selector Tabs (Khối 10, 11, 12) */}
      <div className="flex items-center gap-2.5">
        {([10, 11, 12] as const).map((grade) => {
          const isActive = selectedGrade === grade;
          return (
            <button
              key={grade}
              onClick={() => {
                setSelectedGrade(grade);
                const firstChapter = MATH_KNTT_DATA.find((g) => g.grade === grade)?.chapters[0];
                setExpandedChapterId(firstChapter ? firstChapter.id : null);
                setSelectedLessonId(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-['Orbitron'] font-bold text-xs sm:text-sm tracking-wider transition-all border ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 border-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.4)] scale-[1.02]'
                  : 'bg-slate-950/70 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>TOÁN LỚP {grade}</span>
            </button>
          );
        })}
      </div>

      {/* Grade Action Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
        <div className="flex items-center gap-2 text-xs font-['Rajdhani'] text-slate-300">
          <span className="text-cyan-400 font-bold font-['Orbitron']">
            TOÁN {selectedGrade} - KẾT NỐI TRI THỨC:
          </span>
          <span>
            {currentGradeData?.chapters.length} Chương •{' '}
            {currentGradeData?.chapters.reduce((acc, c) => acc + c.lessons.length, 0)} Bài học
          </span>
        </div>

        <button
          onClick={() => {
            const gradeQ = getAllMathKNTTQuestions(selectedGrade);
            handleApplyPreset(gradeQ, `Toán Lớp ${selectedGrade} (KNTT)`);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold font-['Orbitron'] text-xs tracking-wider transition-all hover:scale-105 active:scale-95 shadow-md shadow-emerald-500/20"
        >
          <Rocket className="w-4 h-4 text-slate-950" />
          <span>NẠP TOÀN BỘ ĐỀ TOÁN LỚP {selectedGrade}</span>
        </button>
      </div>

      {/* Curriculum Chapters and Lessons Tree */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Chapters and Lessons List */}
        <div className="lg:col-span-7 space-y-3 max-h-[500px] overflow-y-auto pr-1">
          {currentGradeData?.chapters.map((chapter) => {
            const isExpanded = expandedChapterId === chapter.id;
            const totalQuestionsInChapter = chapter.lessons.reduce(
              (acc, l) => acc + l.questions.length,
              0
            );

            return (
              <div
                key={chapter.id}
                className="rounded-xl bg-slate-950/70 border border-slate-800 overflow-hidden transition-all"
              >
                {/* Chapter Header */}
                <div
                  onClick={() => setExpandedChapterId(isExpanded ? null : chapter.id)}
                  className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <span className="p-1 rounded-md bg-cyan-500/10 text-cyan-400">
                      <Layers className="w-4 h-4" />
                    </span>
                    <div className="truncate font-['Orbitron'] font-bold text-xs sm:text-sm text-slate-200">
                      {chapter.chapterTitle}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const chapterQ = getFilteredMathQuestions(selectedGrade, chapter.id);
                        handleApplyPreset(chapterQ, `${chapter.chapterTitle}`);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-[10px] font-['Orbitron'] font-bold transition-all"
                      title="Nạp toàn bộ câu hỏi của chương này"
                    >
                      Nạp chương ({totalQuestionsInChapter} câu)
                    </button>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Lessons in this Chapter */}
                {isExpanded && (
                  <div className="p-2.5 bg-slate-900/60 border-t border-slate-800/80 space-y-2">
                    {chapter.lessons.map((lesson) => {
                      const isSelected = selectedLessonId === lesson.id;
                      return (
                        <div
                          key={lesson.id}
                          className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${
                            isSelected
                              ? 'bg-cyan-950/50 border-cyan-500/50 text-cyan-200'
                              : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700 text-slate-300'
                          }`}
                        >
                          <div
                            onClick={() => {
                              setSelectedLessonId(lesson.id);
                              if (lesson.questions.length > 0) {
                                setPreviewQuestion(lesson.questions[0]);
                              }
                            }}
                            className="flex-1 cursor-pointer min-w-0"
                          >
                            <div className="text-xs font-semibold font-['Plus_Jakarta_Sans'] truncate">
                              {lesson.lessonTitle}
                            </div>
                            <div className="text-[10px] text-slate-400 font-['Rajdhani'] mt-0.5">
                              {lesson.questions.length} câu hỏi trắc nghiệm
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => {
                                setSelectedLessonId(lesson.id);
                                if (lesson.questions.length > 0) {
                                  setPreviewQuestion(lesson.questions[0]);
                                }
                              }}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                              title="Xem trước câu hỏi"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => {
                                const lessonQ = getFilteredMathQuestions(
                                  selectedGrade,
                                  chapter.id,
                                  lesson.id
                                );
                                handleApplyPreset(lessonQ, `${lesson.lessonTitle}`);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-[10px] font-['Orbitron'] font-bold transition-all"
                              title="Nạp các câu hỏi của bài học này vào trò chơi"
                            >
                              Nạp bài này
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right: Question Preview Box */}
        <div className="lg:col-span-5 bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold font-['Orbitron'] text-slate-300 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                XEM TRƯỚC CÂU HỎI MÔN TOÁN
              </span>
              {previewQuestion && (
                <span className="text-[10px] font-bold text-amber-400 font-['Orbitron']">
                  +{previewQuestion.points} Điểm
                </span>
              )}
            </div>

            {previewQuestion ? (
              <div className="mt-3 space-y-3">
                <div className="text-[11px] font-['Rajdhani'] font-bold text-cyan-400 uppercase tracking-wider">
                  {previewQuestion.chapterTitle} • {previewQuestion.lessonTitle}
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs sm:text-sm font-medium text-slate-200 leading-relaxed font-['Plus_Jakarta_Sans']">
                  <MathRenderer text={previewQuestion.title} />
                </div>

                <div className="space-y-1.5">
                  {previewQuestion.options.map((opt) => (
                    <div
                      key={opt.key}
                      className={`flex items-center gap-2 p-2 rounded-lg text-xs border ${
                        opt.key === previewQuestion.correctAnswer
                          ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-200 font-semibold'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] shrink-0 ${
                          opt.key === previewQuestion.correctAnswer
                            ? 'bg-emerald-500 text-slate-950 font-bold'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {opt.key}
                      </span>
                      <span className="flex-1">
                        <MathRenderer text={opt.text} />
                      </span>
                      {opt.key === previewQuestion.correctAnswer && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-auto shrink-0" />
                      )}
                    </div>
                  ))}
                </div>

                {previewQuestion.explanation && (
                  <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300 leading-relaxed">
                    <span className="text-cyan-400 font-bold block mb-0.5">Lời giải chi tiết:</span>
                    <MathRenderer text={previewQuestion.explanation} />
                  </div>
                )}
              </div>
            ) : (
              <div className="py-16 text-center text-xs text-slate-500 font-['Rajdhani']">
                Nhấp vào biểu tượng con mắt ở bất kỳ bài học nào bên trái để xem trước nội dung câu hỏi
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
