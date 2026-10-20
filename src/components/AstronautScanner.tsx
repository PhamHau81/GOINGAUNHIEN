import React, { useState, useEffect, useRef } from 'react';
import { Student, AppSettings } from '../types';
import { soundFx } from '../utils/audio';
import { speechController } from '../utils/speech';
import { LuckyWheel } from './LuckyWheel';
import {
  Sparkles,
  RotateCcw,
  Compass,
  Rocket,
  CheckCircle2,
  Users,
  UserCheck,
  ArrowRight,
  Shield,
  Volume2,
  VolumeX,
  Disc,
  Radar,
  Keyboard,
  Shuffle,
} from 'lucide-react';

interface AstronautScannerProps {
  students: Student[];
  calledStudentIds: Set<string>;
  selectedStudent: Student | null;
  settings: AppSettings;
  onSelectStudent: (student: Student) => void;
  onResetCalled: () => void;
  onStartMission: (student: Student) => void;
  onOpenTeamGenerator?: () => void;
}

export const AstronautScanner: React.FC<AstronautScannerProps> = ({
  students,
  calledStudentIds,
  selectedStudent,
  settings,
  onSelectStudent,
  onResetCalled,
  onStartMission,
  onOpenTeamGenerator,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [displayedName, setDisplayedName] = useState<string>('CHỜ GỌI TÊN...');
  const [tempStudent, setTempStudent] = useState<Student | null>(null);
  const [showRoster, setShowRoster] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [callMode, setCallMode] = useState<'radar' | 'wheel'>(
    settings.callMode || 'radar'
  );
  const [autoSpeech, setAutoSpeech] = useState<boolean>(
    settings.autoSpeakName ?? true
  );

  const scanIntervalRef = useRef<number | null>(null);
  const scanTimeoutRef = useRef<number | null>(null);

  // Available students in pool
  const availableStudents = students.filter((s) => !calledStudentIds.has(s.id));
  const poolToUse = availableStudents.length > 0 ? availableStudents : students;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
      if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
      speechController.cancel();
    };
  }, []);

  const handleStudentLocked = (student: Student) => {
    onSelectStudent(student);
    if (autoSpeech) {
      speechController.speakStudentCall(student.name, student.callCount);
    }
  };

  const startScanner = () => {
    if (isScanning || students.length === 0) return;

    const pool = availableStudents.length > 0 ? availableStudents : students;
    if (pool.length === 0) return;

    setIsScanning(true);
    setScanProgress(0);

    const totalDurationMs = Math.max(2, settings.scanDurationSeconds) * 1000;
    const startTime = Date.now();

    let speed = 40;
    let lastTickTime = Date.now();

    const finalTarget = pool[Math.floor(Math.random() * pool.length)];

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / totalDurationMs);
      setScanProgress(progress * 100);

      if (progress < 1) {
        const randomCand = pool[Math.floor(Math.random() * pool.length)];
        setDisplayedName(randomCand.name);
        setTempStudent(randomCand);

        if (settings.soundEnabled && Date.now() - lastTickTime > 80) {
          const pitch = 0.8 + progress * 0.8;
          soundFx.playRadarTick(settings.soundVolume * 0.4, pitch);
          lastTickTime = Date.now();
        }

        speed = 40 + Math.pow(progress, 3) * 350;
        scanTimeoutRef.current = window.setTimeout(tick, speed);
      } else {
        setDisplayedName(finalTarget.name);
        setTempStudent(finalTarget);
        setIsScanning(false);
        setScanProgress(100);

        if (settings.soundEnabled) {
          soundFx.playTargetLocked(settings.soundVolume);
        }

        handleStudentLocked(finalTarget);
      }
    };

    tick();
  };

  // Keyboard shortcut handler (Space = Spin/Call, R = Call next)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input or textarea
      if (
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(
          (e.target as HTMLElement)?.tagName
        )
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        if (!isScanning) {
          startScanner();
        }
      } else if (e.code === 'KeyR' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        if (!isScanning) {
          startScanner();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isScanning, poolToUse]);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-5xl mx-auto px-4 py-4 space-y-6">
      {/* Top Status & Controls Bar */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-4 shadow-lg shadow-cyan-950/40">
        <div className="flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/40 text-cyan-400">
            <Compass className="w-6 h-6 animate-[spin_12s_linear_infinite]" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold font-['Orbitron'] tracking-wider text-cyan-200">
              BÀN QUAY GỌI TÊN HỌC SINH
            </h2>
            <p className="text-xs text-slate-400 font-['Rajdhani']">
              Hệ thống quay và gọi tên học sinh ngẫu nhiên, công bằng và sôi nổi
            </p>
          </div>
        </div>

        {/* Counter badges & Tool actions */}
        <div className="flex items-center gap-2 md:gap-3 flex-wrap">
          {/* Mode Switcher: Radar vs Wheel */}
          <div className="flex items-center p-1 rounded-xl bg-slate-950/80 border border-slate-800">
            <button
              onClick={() => setCallMode('radar')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-['Orbitron'] font-bold transition-all ${
                callMode === 'radar'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Chế độ Radar công nghệ quét tên"
            >
              <Radar className="w-3.5 h-3.5" />
              <span>RADAR</span>
            </button>
            <button
              onClick={() => setCallMode('wheel')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-['Orbitron'] font-bold transition-all ${
                callMode === 'wheel'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Chế độ Vòng quay may mắn đầy màu sắc"
            >
              <Disc className="w-3.5 h-3.5" />
              <span>VÒNG QUAY</span>
            </button>
          </div>

          {/* Voice Reading Toggle (Male Voice) */}
          <button
            onClick={() => {
              const next = !autoSpeech;
              setAutoSpeech(next);
              if (next) {
                speechController.speak('Đã bật giọng đọc nam.');
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-['Rajdhani'] font-bold transition-all ${
              autoSpeech
                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                : 'bg-slate-800/60 border-slate-700 text-slate-500'
            }`}
            title={autoSpeech ? 'Đang bật giọng đọc nam tiếng Việt rõ ràng, chuẩn xác' : 'Bấm để bật giọng đọc nam'}
          >
            {autoSpeech ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">
              {autoSpeech ? 'GIỌNG NAM: BẬT' : 'GIỌNG ĐỌC: TẮT'}
            </span>
          </button>

          {/* Open Team Generator Modal */}
          {onOpenTeamGenerator && (
            <button
              onClick={onOpenTeamGenerator}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/15 border border-purple-500/40 hover:bg-purple-500/25 text-purple-300 text-xs font-bold font-['Orbitron'] transition-all"
              title="Tự động bốc thăm chia nhóm học tập ngẫu nhiên"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">CHIA NHÓM</span>
            </button>
          )}

          {/* Counters */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-['Rajdhani']">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Sĩ số:</span>
            <span className="font-bold text-white font-['Orbitron']">{students.length}</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-xs font-['Rajdhani']">
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-300">Đã gọi:</span>
            <span className="font-bold text-emerald-300 font-['Orbitron']">
              {calledStudentIds.size}/{students.length}
            </span>
          </div>

          <button
            onClick={onResetCalled}
            disabled={calledStudentIds.size === 0 || isScanning}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/40 hover:bg-amber-500/20 text-amber-300 hover:text-amber-200 text-xs font-semibold font-['Rajdhani'] transition-all disabled:opacity-40 disabled:pointer-events-none"
            title="Đưa tất cả học sinh đã gọi quay trở lại danh sách gọi"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {/* Main Container: Lucky Wheel OR Radar Scanner */}
      <div className="w-full relative flex flex-col items-center justify-center p-6 md:p-8 rounded-3xl bg-radial from-slate-900/90 via-[#070b1e]/90 to-[#030612]/95 border border-cyan-500/30 backdrop-blur-xl shadow-2xl shadow-cyan-900/30 overflow-hidden min-h-[460px]">
        {/* Hologram scanlines effect */}
        <div
          className="absolute inset-0 pointer-events-none opacity-15"
          style={{
            backgroundImage:
              'linear-gradient(rgba(14, 165, 233, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(14, 165, 233, 0.2) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {callMode === 'wheel' ? (
          /* Lucky Wheel Mode */
          <div className="py-2">
            <LuckyWheel
              students={students}
              calledStudentIds={calledStudentIds}
              selectedStudent={selectedStudent}
              settings={settings}
              onSelectStudent={handleStudentLocked}
              onSpinStart={() => setIsScanning(true)}
            />
          </div>
        ) : (
          /* Radar Mode */
          <>
            <div className="relative w-72 h-72 sm:w-88 sm:h-88 md:w-96 md:h-96 flex items-center justify-center my-2">
              <div className="absolute inset-0 rounded-full border border-cyan-500/20 border-dashed animate-[spin_60s_linear_infinite]" />
              <div className="absolute inset-4 rounded-full border border-cyan-500/30" />
              <div className="absolute inset-12 rounded-full border border-purple-500/30 border-dashed" />
              <div className="absolute inset-24 rounded-full border border-cyan-400/40" />

              <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
              <div className="absolute h-full w-[1px] bg-gradient-to-b from-transparent via-cyan-500/30 to-transparent" />

              <div
                className={`absolute inset-0 rounded-full overflow-hidden pointer-events-none transition-opacity duration-300 ${
                  isScanning ? 'opacity-100' : 'opacity-20'
                }`}
              >
                <div
                  className={`w-full h-full rounded-full ${
                    isScanning
                      ? 'animate-[spin_1.2s_linear_infinite]'
                      : 'animate-[spin_8s_linear_infinite]'
                  }`}
                  style={{
                    background:
                      'conic-gradient(from 0deg, rgba(6, 182, 212, 0.45) 0deg, rgba(6, 182, 212, 0.1) 45deg, transparent 90deg, transparent 360deg)',
                  }}
                />
              </div>

              {/* Target Central Pod */}
              <div className="relative z-10 w-56 h-56 sm:w-64 sm:h-64 rounded-full bg-[#080d26]/90 border-2 border-cyan-400/80 shadow-[0_0_40px_rgba(6,182,212,0.4)] flex flex-col items-center justify-center p-4 text-center">
                <div className="relative mb-2">
                  <div
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-b from-cyan-400/30 to-purple-600/30 border-2 ${
                      isScanning
                        ? 'border-cyan-400 animate-pulse'
                        : selectedStudent
                        ? 'border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.6)]'
                        : 'border-slate-600'
                    } flex items-center justify-center overflow-hidden`}
                  >
                    <svg viewBox="0 0 64 64" className="w-12 h-12 text-cyan-300">
                      <circle
                        cx="32"
                        cy="30"
                        r="20"
                        fill="#0f172a"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      />
                      <ellipse
                        cx="32"
                        cy="30"
                        rx="14"
                        ry="11"
                        fill={
                          isScanning
                            ? '#06b6d4'
                            : selectedStudent
                            ? '#10b981'
                            : '#38bdf8'
                        }
                        opacity="0.85"
                      />
                      <ellipse
                        cx="28"
                        cy="27"
                        rx="5"
                        ry="3"
                        fill="#ffffff"
                        opacity="0.6"
                      />
                      <rect x="24" y="50" width="16" height="8" rx="3" fill="#334155" />
                    </svg>
                  </div>

                  <div className="absolute -bottom-1 -right-1">
                    {isScanning ? (
                      <span className="flex h-4 w-4 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-cyan-500"></span>
                      </span>
                    ) : selectedStudent ? (
                      <span className="flex h-5 w-5 rounded-full bg-emerald-500 items-center justify-center text-[10px] text-black font-bold">
                        ✓
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="text-[10px] tracking-widest uppercase font-['Rajdhani'] font-bold text-cyan-400/80 mb-1 flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  {isScanning
                    ? 'ĐANG QUAY GỌI TÊN...'
                    : selectedStudent
                    ? selectedStudent.rankTitle || 'HỌC SINH ĐƯỢC CHỌN'
                    : 'SẴN SÀNG GỌI TÊN'}
                </div>

                <div
                  className={`font-['Orbitron'] font-extrabold tracking-wide text-center leading-tight transition-all duration-150 px-2 line-clamp-2 ${
                    isScanning
                      ? 'text-lg sm:text-xl text-cyan-300 scale-95 opacity-80'
                      : selectedStudent
                      ? 'text-xl sm:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-cyan-200 to-amber-200 scale-100 drop-shadow-[0_0_12px_rgba(6,182,212,0.8)]'
                      : 'text-base sm:text-lg text-slate-400'
                  }`}
                >
                  {displayedName}
                </div>

                {selectedStudent && !isScanning && (
                  <div className="mt-1 text-[11px] text-slate-400 font-['Rajdhani']">
                    Đã gọi: <span className="text-cyan-300 font-bold">{selectedStudent.callCount + 1} lần</span>
                  </div>
                )}
              </div>
            </div>

            {/* Scan Progress Bar */}
            {isScanning && (
              <div className="w-full max-w-md h-2 bg-slate-800 rounded-full overflow-hidden border border-cyan-500/40 my-2">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 transition-all duration-75"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
            )}

            {/* Radar Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-4 z-10">
              <button
                onClick={startScanner}
                disabled={isScanning || students.length === 0}
                className={`group relative px-8 py-3.5 rounded-2xl font-['Orbitron'] font-bold tracking-wider text-sm transition-all duration-300 shadow-lg ${
                  isScanning
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    : 'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-cyan-500/30 hover:shadow-cyan-400/50 hover:scale-105 active:scale-95 border border-cyan-400/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Sparkles
                    className={`w-5 h-5 ${isScanning ? 'animate-spin' : 'group-hover:rotate-12 transition-transform'}`}
                  />
                  <span>
                    {isScanning
                      ? 'ĐANG QUAY GỌI TÊN...'
                      : selectedStudent
                      ? 'GỌI BẠN TIẾP THEO'
                      : 'BẮT ĐẦU GỌI TÊN'}
                  </span>
                </div>
              </button>
            </div>
          </>
        )}

        {/* Action Button to proceed directly to Missions/Questions if student is selected */}
        {selectedStudent && !isScanning && (
          <div className="mt-4 z-10 animate-fade-in">
            <button
              onClick={() => onStartMission(selectedStudent)}
              className="group px-7 py-3 rounded-2xl font-['Orbitron'] font-bold tracking-wider text-xs sm:text-sm bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-400/50 hover:scale-105 active:scale-95 border border-emerald-300 transition-all flex items-center gap-2"
            >
              <Rocket className="w-4 h-4 text-slate-950" />
              <span>CHỌN CÂU HỎI CHO {selectedStudent.name.toUpperCase()}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

        {/* Hotkey hint bar */}
        <div className="mt-5 flex items-center gap-4 text-[11px] text-slate-500 font-['Rajdhani']">
          <div className="flex items-center gap-1.5">
            <Keyboard className="w-3.5 h-3.5 text-cyan-400" />
            <span>Phím tắt:</span>
          </div>
          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono font-bold">
            Space
          </span>
          <span>Bắt đầu gọi</span>
          <span className="text-slate-700">•</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono font-bold">
            R
          </span>
          <span>Gọi bạn khác</span>
        </div>

        {/* Notice when all students have been called */}
        {availableStudents.length === 0 && students.length > 0 && !isScanning && (
          <div className="mt-4 px-4 py-2 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs text-center flex items-center gap-2 font-['Rajdhani'] font-semibold">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-amber-400" />
            <span>
              Tất cả học sinh trong danh sách đã được gọi ít nhất một lần. Nhấn &quot;Làm mới lượt gọi&quot; để tiếp tục vòng mới!
            </span>
          </div>
        )}
      </div>

      {/* Quick Astronaut Roster Accordion / Drawer */}
      <div className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-4 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowRoster(!showRoster)}
            className="flex items-center gap-2 text-xs font-bold font-['Orbitron'] text-slate-300 hover:text-cyan-300 transition-colors"
          >
            <Users className="w-4 h-4 text-cyan-400" />
            <span>DANH SÁCH LỚP HỌC ({students.length})</span>
            <span className="text-[11px] text-slate-500 font-normal">
              ({calledStudentIds.size} đã gọi, {availableStudents.length} chưa gọi)
            </span>
          </button>
          <span className="text-xs text-slate-500 font-['Rajdhani']">
            {showRoster ? '▼ Thu gọn' : '▲ Xem chi tiết'}
          </span>
        </div>

        {showRoster && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 mt-4 pt-4 border-t border-slate-800">
            {students.map((student) => {
              const isCalled = calledStudentIds.has(student.id);
              const isCurrent = selectedStudent?.id === student.id;
              return (
                <div
                  key={student.id}
                  onClick={() => {
                    if (!isScanning) {
                      onSelectStudent(student);
                      if (autoSpeech) {
                        speechController.speakStudentCall(student.name, student.callCount, 0);
                      }
                    }
                  }}
                  className={`p-2 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between gap-1.5 ${
                    isCurrent
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-md font-bold'
                      : isCalled
                      ? 'bg-slate-900/40 border-slate-800/80 text-slate-500 line-through'
                      : 'bg-slate-800/50 border-slate-700/60 text-slate-300 hover:border-cyan-500/50 hover:bg-slate-800'
                  }`}
                  title={`Bấm để chọn trực tiếp ${student.name}`}
                >
                  <span className="truncate">{student.name}</span>
                  {student.callCount > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 font-['Orbitron'] shrink-0">
                      {student.callCount}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
