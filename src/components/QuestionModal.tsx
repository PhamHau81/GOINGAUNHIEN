import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Question, Student, AnswerKey, AnswerRecord, AppSettings, AnswerStatus } from '../types';
import { soundFx } from '../utils/audio';
import { PlanetIcon } from './PlanetIcon';
import { MathRenderer } from './MathRenderer';
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Users,
  Compass,
  ArrowRight,
  Sparkles,
  Trophy,
  X,
  Volume2,
} from 'lucide-react';

interface QuestionModalProps {
  question: Question;
  student: Student | null;
  settings: AppSettings;
  onClose: () => void;
  onSubmitRecord: (record: AnswerRecord) => void;
  onPickAnotherQuestion: () => void;
  onScanNextStudent: () => void;
}

export const QuestionModal: React.FC<QuestionModalProps> = ({
  question,
  student,
  settings,
  onClose,
  onSubmitRecord,
  onPickAnotherQuestion,
  onScanNextStudent,
}) => {
  const maxTime = settings.questionDurationSeconds || 20;
  const [timeLeft, setTimeLeft] = useState<number>(maxTime);
  const [selectedKey, setSelectedKey] = useState<AnswerKey | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [resultStatus, setResultStatus] = useState<AnswerStatus | null>(null);

  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const hasFinishedRef = useRef<boolean>(false);

  // Trigger cosmic fireworks
  const launchFireworks = () => {
    // Burst 1 - center stars
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#38bdf8', '#818cf8', '#f43f5e', '#fbbf24', '#34d399'],
    });

    // Burst 2 & 3 - lateral cannons
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0.1, y: 0.7 },
        colors: ['#06b6d4', '#a855f7', '#fde047'],
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 0.9, y: 0.7 },
        colors: ['#06b6d4', '#a855f7', '#fde047'],
      });
    }, 250);
  };

  // Countdown timer effect
  useEffect(() => {
    startTimeRef.current = Date.now();
    hasFinishedRef.current = false;

    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleTimeout();
          return 0;
        }

        const newTime = prev - 1;
        // Sound tick
        if (settings.soundEnabled) {
          soundFx.playCountdownTick(settings.soundVolume * 0.4, newTime <= 5);
        }
        return newTime;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleTimeout = () => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;
    setIsAnswered(true);
    setResultStatus('TIMEOUT');

    if (settings.soundEnabled) {
      soundFx.playTimeout(settings.soundVolume);
    }

    const timeSpent = maxTime;
    const record: AnswerRecord = {
      id: `record-${Date.now()}`,
      studentId: student ? student.id : 'unknown',
      studentName: student ? student.name : 'Học sinh',
      questionId: question.id,
      questionNumber: question.number,
      questionTitle: question.title,
      selectedAnswer: 'TIMEOUT',
      correctAnswer: question.correctAnswer,
      status: 'TIMEOUT',
      timeSpentSeconds: timeSpent,
      maxTimeAllowed: maxTime,
      pointsEarned: 0,
      timestamp: Date.now(),
      formattedTime: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };

    onSubmitRecord(record);
  };

  // Keyboard shortcut listener for options (1, 2, 3, 4 or A, B, C, D) and Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (isAnswered) return;

      if (e.code === 'KeyA' || e.code === 'Digit1') {
        handleSelectAnswer('A');
      } else if (e.code === 'KeyB' || e.code === 'Digit2') {
        handleSelectAnswer('B');
      } else if (e.code === 'KeyC' || e.code === 'Digit3') {
        handleSelectAnswer('C');
      } else if (e.code === 'KeyD' || e.code === 'Digit4') {
        handleSelectAnswer('D');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnswered, question, student]);

  const handleSelectAnswer = (optionKey: AnswerKey) => {
    if (isAnswered || hasFinishedRef.current) return;
    hasFinishedRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);

    setSelectedKey(optionKey);
    setIsAnswered(true);

    const isCorrect = optionKey === question.correctAnswer;
    const status: AnswerStatus = isCorrect ? 'CORRECT' : 'WRONG';
    setResultStatus(status);

    const timeSpent = Math.max(1, maxTime - timeLeft);

    if (isCorrect) {
      if (settings.soundEnabled) {
        soundFx.playCorrect(settings.soundVolume);
      }
      launchFireworks();
    } else {
      if (settings.soundEnabled) {
        soundFx.playWrong(settings.soundVolume);
      }
    }

    const record: AnswerRecord = {
      id: `record-${Date.now()}`,
      studentId: student ? student.id : 'unknown',
      studentName: student ? student.name : 'Học sinh',
      questionId: question.id,
      questionNumber: question.number,
      questionTitle: question.title,
      selectedAnswer: optionKey,
      correctAnswer: question.correctAnswer,
      status,
      timeSpentSeconds: timeSpent,
      maxTimeAllowed: maxTime,
      pointsEarned: isCorrect ? question.points : 0,
      timestamp: Date.now(),
      formattedTime: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };

    onSubmitRecord(record);
  };

  // Keyboard shortcut listener for options (1, 2, 3, 4 or A, B, C, D) and Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (isAnswered) return;

      if (e.code === 'KeyA' || e.code === 'Digit1') {
        handleSelectAnswer('A');
      } else if (e.code === 'KeyB' || e.code === 'Digit2') {
        handleSelectAnswer('B');
      } else if (e.code === 'KeyC' || e.code === 'Digit3') {
        handleSelectAnswer('C');
      } else if (e.code === 'KeyD' || e.code === 'Digit4') {
        handleSelectAnswer('D');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnswered, question, student]);

  // Keyboard shortcut listener for A, B, C, D or 1, 2, 3, 4
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAnswered) return;
      const key = e.key.toUpperCase();
      if (['A', 'B', 'C', 'D'].includes(key)) {
        handleSelectAnswer(key as AnswerKey);
      } else if (e.key === '1') handleSelectAnswer('A');
      else if (e.key === '2') handleSelectAnswer('B');
      else if (e.key === '3') handleSelectAnswer('C');
      else if (e.key === '4') handleSelectAnswer('D');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnswered, timeLeft]);

  // Timer circle calculation
  const progressRatio = timeLeft / maxTime;
  const strokeDashoffset = 283 - 283 * progressRatio;

  const timerColor =
    timeLeft <= 5 ? '#ef4444' : timeLeft <= 10 ? '#f59e0b' : '#06b6d4';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xl animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-gradient-to-b from-[#090e28] via-[#06091d] to-[#030511] border-2 border-cyan-500/40 rounded-3xl shadow-[0_0_60px_rgba(6,182,212,0.25)] p-5 sm:p-8 overflow-hidden my-auto">
        {/* Holographic background tech lines */}
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: 'radial-gradient(#38bdf8 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />

        {/* Close button top right */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors border border-slate-700 z-20"
          title="Đóng cửa sổ nhiệm vụ"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header: Mission & Student Briefing */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-cyan-500/20 relative z-10">
          <div className="flex items-center gap-3">
            <PlanetIcon type={question.planetType} size="md" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-['Orbitron'] font-bold text-xs border border-cyan-500/40">
                  CÂU HỎI SỐ #{question.number}
                </span>
                <span className="text-xs text-slate-400 font-['Rajdhani'] font-semibold uppercase tracking-wider">
                  {question.planetName}
                </span>
                {question.grade && (
                  <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[10px] font-bold font-['Rajdhani']">
                    TOÁN {question.grade} (KNTT)
                  </span>
                )}
              </div>
              {question.lessonTitle && (
                <div className="text-xs text-cyan-400 font-['Rajdhani'] font-semibold mt-1">
                  📚 {question.chapterTitle} • {question.lessonTitle}
                </div>
              )}
              <h3 className="text-sm font-['Rajdhani'] font-medium text-slate-300 mt-1">
                Phần thưởng:{' '}
                <span className="text-amber-400 font-bold font-['Orbitron']">
                  +{question.points} Điểm kinh nghiệm
                </span>
              </h3>
            </div>
          </div>

          {/* Active Astronaut Badge */}
          <div className="flex items-center gap-3 bg-slate-800/80 border border-cyan-500/30 rounded-2xl px-4 py-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center font-bold text-white text-sm font-['Orbitron'] shadow-md">
              {student ? student.name.charAt(0) : 'H'}
            </div>
            <div>
              <div className="text-[10px] text-cyan-400 uppercase tracking-widest font-['Rajdhani'] font-bold">
                HỌC SINH ĐANG TRẢ LỜI
              </div>
              <div className="text-sm sm:text-base font-bold font-['Orbitron'] text-white">
                {student ? student.name : 'Chưa chọn học sinh'}
              </div>
            </div>
          </div>
        </div>

        {/* Timer Bar & Dial */}
        <div className="flex items-center justify-between my-4 px-2">
          <div className="flex items-center gap-2 text-xs font-['Rajdhani'] font-semibold text-slate-400">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>Thời gian suy nghĩ</span>
          </div>

          {/* SVG Countdown Ring & Digital Number */}
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-12 h-12 -rotate-90">
                <circle cx="24" cy="24" r="20" stroke="#1e293b" strokeWidth="3" fill="none" />
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke={timerColor}
                  strokeWidth="3.5"
                  fill="none"
                  strokeDasharray="125.6"
                  strokeDashoffset={125.6 - 125.6 * progressRatio}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>
              <span
                className={`absolute text-sm font-bold font-['Orbitron'] ${
                  timeLeft <= 5 ? 'text-red-400 animate-pulse' : 'text-cyan-300'
                }`}
              >
                {timeLeft}s
              </span>
            </div>
          </div>
        </div>

        {/* Question Content */}
        <div className="my-5 p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-inner">
          <div className="text-base sm:text-xl font-medium text-slate-100 leading-relaxed font-['Plus_Jakarta_Sans']">
            <MathRenderer text={question.title} />
          </div>
        </div>

        {/* 4 Answer Options (A, B, C, D) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 my-6">
          {question.options.map((opt) => {
            const isSelected = selectedKey === opt.key;
            const isCorrectAnswer = opt.key === question.correctAnswer;

            let buttonStyle =
              'bg-slate-900/80 hover:bg-slate-800/90 border-slate-700/80 text-slate-200 hover:border-cyan-500/60 hover:shadow-cyan-500/20 hover:scale-[1.01]';
            let badgeStyle = 'bg-slate-800 text-cyan-400 border border-slate-700';

            if (isAnswered) {
              if (isCorrectAnswer) {
                // Correct answer always glows green
                buttonStyle =
                  'bg-emerald-950/80 border-emerald-400 text-emerald-200 shadow-[0_0_20px_rgba(52,211,153,0.3)] ring-2 ring-emerald-400/50';
                badgeStyle = 'bg-emerald-500 text-slate-950 font-extrabold';
              } else if (isSelected && !isCorrectAnswer) {
                // Selected wrong answer glows red
                buttonStyle =
                  'bg-rose-950/80 border-rose-500 text-rose-200 shadow-[0_0_20px_rgba(244,63,94,0.3)]';
                badgeStyle = 'bg-rose-500 text-white font-extrabold';
              } else {
                // Other options fade out
                buttonStyle = 'bg-slate-950/40 border-slate-800 text-slate-500 opacity-50';
                badgeStyle = 'bg-slate-900 text-slate-600 border border-slate-800';
              }
            }

            return (
              <button
                key={opt.key}
                onClick={() => handleSelectAnswer(opt.key)}
                disabled={isAnswered}
                className={`relative flex items-center gap-3.5 p-4 rounded-2xl border text-left transition-all duration-200 shadow-md ${buttonStyle} disabled:cursor-default`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-['Orbitron'] font-bold text-sm shrink-0 transition-all ${badgeStyle}`}
                >
                  {opt.key}
                </div>
                <div className="flex-1 font-['Plus_Jakarta_Sans'] text-sm sm:text-base font-medium">
                  <MathRenderer text={opt.text} />
                </div>
                {isAnswered && isCorrectAnswer && (
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                )}
                {isAnswered && isSelected && !isCorrectAnswer && (
                  <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Result & Explanation Banner (Shows immediately after answer) */}
        {isAnswered && (
          <div className="animate-fade-in-up mt-5 p-4 sm:p-5 rounded-2xl border backdrop-blur-md transition-all">
            {resultStatus === 'CORRECT' && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-emerald-950/50 border border-emerald-500/40 p-4 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    <Trophy className="w-6 h-6 animate-bounce" />
                  </div>
                  <div>
                    <h4 className="text-base sm:text-lg font-bold font-['Orbitron'] text-emerald-300">
                      CHÍNH XÁC! XUẤT SẮC (+{question.points} ĐIỂM)
                    </h4>
                    <p className="text-xs sm:text-sm text-emerald-200/80 font-['Rajdhani']">
                      Học sinh {student?.name} đã hoàn thành xuất sắc câu trả lời!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {resultStatus === 'WRONG' && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-rose-950/50 border border-rose-500/40 p-4 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base sm:text-lg font-bold font-['Orbitron'] text-rose-300">
                      CHƯA CHÍNH XÁC!
                    </h4>
                    <p className="text-xs sm:text-sm text-rose-200/80 font-['Rajdhani']">
                      Đáp án đúng là <span className="font-bold underline text-white">{question.correctAnswer}</span>. Cố gắng ở các nhiệm vụ tiếp theo nhé!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {resultStatus === 'TIMEOUT' && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-amber-950/50 border border-amber-500/40 p-4 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base sm:text-lg font-bold font-['Orbitron'] text-amber-300">
                      HẾT THỜI GIAN SUY NGHĨ!
                    </h4>
                    <p className="text-xs sm:text-sm text-amber-200/80 font-['Rajdhani']">
                      Năng lượng đếm ngược đã cạn. Đáp án chính xác là{' '}
                      <span className="font-bold underline text-white">{question.correctAnswer}</span>.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Explanation box */}
            {question.explanation && (
              <div className="mt-3 p-3.5 rounded-xl bg-slate-900/80 border border-slate-700/60 text-xs sm:text-sm text-slate-300 font-['Plus_Jakarta_Sans'] leading-relaxed">
                <span className="text-cyan-400 font-bold font-['Rajdhani'] uppercase tracking-wider block mb-1">
                  💡 Giải thích khoa học:
                </span>
                <MathRenderer text={question.explanation} />
              </div>
            )}

            {/* ACTION BUTTONS (As requested by user: "Câu khác" hoặc "Tiếp tục gọi tên") */}
            <div className="flex flex-wrap items-center justify-end gap-3 mt-5 pt-3 border-t border-slate-800">
              {/* Option 1: Pick another question for current student */}
              <button
                onClick={onPickAnotherQuestion}
                className="group flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-200 border border-cyan-500/50 text-xs sm:text-sm font-bold font-['Orbitron'] tracking-wider transition-all hover:scale-105 active:scale-95 shadow-md shadow-cyan-900/30"
              >
                <Compass className="w-4 h-4 text-cyan-400 group-hover:rotate-45 transition-transform" />
                <span>CÂU KHÁC ({student?.name || 'HỌC SINH NÀY'})</span>
              </button>

              {/* Option 2: Continue calling next astronaut */}
              <button
                onClick={onScanNextStudent}
                className="group flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold font-['Orbitron'] tracking-wider text-xs sm:text-sm transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/30"
              >
                <Users className="w-4 h-4" />
                <span>TIẾP TỤC GỌI TÊN</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
