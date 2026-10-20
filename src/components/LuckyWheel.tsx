import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Student, AppSettings } from '../types';
import { soundFx } from '../utils/audio';
import confetti from 'canvas-confetti';
import { RotateCw, Sparkles, Volume2, Shield } from 'lucide-react';

interface LuckyWheelProps {
  students: Student[];
  calledStudentIds: Set<string>;
  selectedStudent: Student | null;
  settings: AppSettings;
  onSelectStudent: (student: Student) => void;
  onSpinStart?: () => void;
}

const WHEEL_COLORS = [
  '#06b6d4', // cyan-500
  '#3b82f6', // blue-500
  '#8b5cf6', // purple-500
  '#ec4899', // pink-500
  '#f59e0b', // amber-500
  '#10b981', // emerald-500
  '#6366f1', // indigo-500
  '#14b8a6', // teal-500
  '#f97316', // orange-500
  '#0ea5e9', // sky-500
];

export const LuckyWheel: React.FC<LuckyWheelProps> = ({
  students,
  calledStudentIds,
  selectedStudent,
  settings,
  onSelectStudent,
  onSpinStart,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentAngle, setCurrentAngle] = useState(0);

  // Available students in pool
  const availableStudents = students.filter((s) => !calledStudentIds.has(s.id));
  const pool = availableStudents.length > 0 ? availableStudents : students;

  // Draw the lucky wheel on canvas
  const drawWheel = useCallback(
    (angle: number) => {
      const canvas = canvasRef.current;
      if (!canvas || pool.length === 0) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const size = canvas.width;
      const center = size / 2;
      const radius = center - 16;
      const sliceAngle = (2 * Math.PI) / pool.length;

      ctx.clearRect(0, 0, size, size);

      // Save context for rotation
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(angle);

      // Draw each student's slice
      pool.forEach((student, index) => {
        const startA = index * sliceAngle;
        const endA = startA + sliceAngle;

        // Slice background
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius, startA, endA);
        ctx.closePath();
        ctx.fillStyle = WHEEL_COLORS[index % WHEEL_COLORS.length];
        ctx.fill();

        // Slice border
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#040816';
        ctx.stroke();

        // Draw student name text
        ctx.save();
        ctx.rotate(startA + sliceAngle / 2);
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';

        // Dynamic font size depending on student count
        const fontSize = Math.max(10, Math.min(14, 280 / pool.length));
        ctx.font = `bold ${fontSize}px Orbitron, sans-serif`;

        // Text shadow for high contrast
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 4;

        // Truncate name if too long
        let displayName = student.name;
        if (displayName.length > 18) {
          displayName = displayName.substring(0, 16) + '...';
        }
        ctx.fillText(displayName, radius - 20, 0);
        ctx.restore();
      });

      // Outer ring border
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, 2 * Math.PI);
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#38bdf8';
      ctx.stroke();

      // Outer neon glow
      ctx.beginPath();
      ctx.arc(0, 0, radius + 4, 0, 2 * Math.PI);
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.stroke();

      ctx.restore();

      // Central Hub
      ctx.beginPath();
      ctx.arc(center, center, 32, 0, 2 * Math.PI);
      ctx.fillStyle = '#0b112c';
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#38bdf8';
      ctx.stroke();

      // Center decorative ring
      ctx.beginPath();
      ctx.arc(center, center, 14, 0, 2 * Math.PI);
      ctx.fillStyle = '#38bdf8';
      ctx.fill();
    },
    [pool]
  );

  useEffect(() => {
    drawWheel(currentAngle);
  }, [drawWheel, currentAngle]);

  const spinWheel = () => {
    if (isSpinning || pool.length === 0) return;

    setIsSpinning(true);
    if (onSpinStart) onSpinStart();

    // Pick random target
    const targetIndex = Math.floor(Math.random() * pool.length);
    const targetStudent = pool[targetIndex];

    const sliceAngle = (2 * Math.PI) / pool.length;
    // Pointer is at the top (angle = 3 * Math.PI / 2 or -Math.PI / 2)
    // To land on targetIndex slice at top pointer:
    const targetSliceCenter = targetIndex * sliceAngle + sliceAngle / 2;
    const pointerAngle = (3 * Math.PI) / 2; // top position

    // Calculate rotation to align targetSliceCenter with pointerAngle
    const baseRotations = 6 + Math.floor(Math.random() * 4); // 6 to 9 full spins
    const finalAngle =
      currentAngle +
      baseRotations * 2 * Math.PI +
      (pointerAngle - (targetSliceCenter % (2 * Math.PI)));

    const duration = Math.max(3, settings.scanDurationSeconds) * 1000;
    const startTime = performance.now();
    const initialAngle = currentAngle;
    const angleDelta = finalAngle - initialAngle;

    let lastTickSlice = -1;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);

      // Ease-out cubic deceleration
      const ease = 1 - Math.pow(1 - progress, 3);
      const angle = initialAngle + angleDelta * ease;

      setCurrentAngle(angle);
      drawWheel(angle);

      // Play tick sound when a slice crosses the pointer
      const currentSlice = Math.floor((angle / sliceAngle) % pool.length);
      if (currentSlice !== lastTickSlice) {
        if (settings.soundEnabled) {
          const pitch = 0.9 + progress * 0.4;
          soundFx.playRadarTick(settings.soundVolume * 0.35, pitch);
        }
        lastTickSlice = currentSlice;
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        setCurrentAngle(finalAngle);

        if (settings.soundEnabled) {
          soundFx.playTargetLocked(settings.soundVolume);
        }

        // Fire festive confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#06b6d4', '#3b82f6', '#10b981', '#f59e0b'],
        });

        onSelectStudent(targetStudent);
      }
    };

    requestAnimationFrame(animate);
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      {/* Canvas Wheel Container */}
      <div className="relative w-80 h-80 sm:w-96 sm:h-96 flex items-center justify-center">
        {/* Top Pointer Indicator Arrow */}
        <div className="absolute top-0 z-20 -mt-2 flex flex-col items-center filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]">
          <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[28px] border-t-amber-400" />
          <div className="w-3 h-3 rounded-full bg-amber-200 -mt-7 border-2 border-slate-950" />
        </div>

        {/* Ambient Glow Ring */}
        <div className="absolute inset-0 rounded-full bg-cyan-500/10 blur-xl pointer-events-none" />

        {/* The HTML5 Wheel Canvas */}
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="w-full h-full rounded-full shadow-2xl"
        />

        {/* Center Spin Button Overlay */}
        <button
          onClick={spinWheel}
          disabled={isSpinning || pool.length === 0}
          className={`absolute z-20 w-20 h-20 rounded-full flex flex-col items-center justify-center text-[11px] font-['Orbitron'] font-black tracking-wider transition-transform active:scale-95 shadow-xl border-2 ${
            isSpinning
              ? 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed'
              : 'bg-gradient-to-tr from-cyan-500 to-blue-600 hover:scale-105 border-white text-slate-950 shadow-cyan-500/50 cursor-pointer'
          }`}
          title="Bấm để quay số gọi tên"
        >
          <RotateCw className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
          <span>{isSpinning ? 'ĐANG QUAY' : 'QUAY'}</span>
        </button>
      </div>

      {/* Selected Result Card if available */}
      {selectedStudent && !isSpinning && (
        <div className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-950/80 via-blue-950/80 to-slate-950/80 border border-cyan-400/50 shadow-lg animate-fade-in">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center font-black font-['Orbitron'] text-slate-950 text-sm">
            {selectedStudent.name.charAt(0)}
          </div>
          <div>
            <div className="text-[10px] uppercase font-['Rajdhani'] font-bold text-cyan-300">
              {selectedStudent.rankTitle || 'HỌC SINH ĐƯỢC CHỌN'}
            </div>
            <div className="text-base sm:text-lg font-black font-['Orbitron'] text-white">
              {selectedStudent.name}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
