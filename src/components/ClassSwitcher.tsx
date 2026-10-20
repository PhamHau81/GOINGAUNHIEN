import React, { useState, useRef, useEffect } from 'react';
import { ClassRoom } from '../types';
import { GraduationCap, ChevronDown, Check, Plus, Users } from 'lucide-react';

interface ClassSwitcherProps {
  classes: ClassRoom[];
  activeClassId: string;
  onSelectClass: (classId: string) => void;
  onOpenClassManager: () => void;
}

export const ClassSwitcher: React.FC<ClassSwitcherProps> = ({
  classes,
  activeClassId,
  onSelectClass,
  onOpenClassManager,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const activeClass = classes.find((c) => c.id === activeClassId) || classes[0];

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  if (!activeClass) return null;

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-cyan-500/40 text-xs font-['Orbitron'] font-bold text-cyan-200 transition-all hover:border-cyan-400 shadow-sm"
        title="Bấm để đổi lớp học đang giảng dạy"
      >
        <GraduationCap className="w-4 h-4 text-cyan-400 shrink-0" />
        <span className="truncate max-w-[120px] sm:max-w-[160px]">{activeClass.name}</span>
        <span className="hidden sm:inline-block px-1.5 py-0.2 rounded bg-cyan-950 text-[10px] text-cyan-300 font-['Rajdhani'] font-semibold">
          {activeClass.students.length} HS
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
            isOpen ? 'rotate-180 text-cyan-300' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#090d26]/95 border border-cyan-500/40 shadow-2xl backdrop-blur-xl z-50 py-2 divide-y divide-slate-800 animate-fade-in">
          <div className="px-3 py-1.5 text-[10px] font-['Rajdhani'] font-bold uppercase tracking-widest text-slate-400">
            CHỌN LỚP ĐANG DẠY ({classes.length} LỚP)
          </div>

          <div className="max-h-60 overflow-y-auto py-1">
            {classes.map((c) => {
              const isCurrent = c.id === activeClassId;
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    onSelectClass(c.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between text-xs transition-colors ${
                    isCurrent
                      ? 'bg-cyan-500/20 text-cyan-200 font-bold'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="font-['Orbitron'] truncate flex items-center gap-1.5">
                      <span>{c.name}</span>
                      <span className="text-[10px] px-1.5 rounded bg-indigo-950 text-indigo-300 font-normal">
                        K{c.grade}
                      </span>
                    </div>
                    {c.note && (
                      <div className="text-[10px] text-slate-400 font-['Rajdhani'] truncate">
                        {c.note}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-slate-400 font-['Rajdhani']">
                      {c.students.length} HS
                    </span>
                    {isCurrent && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Manage classes footer link */}
          <div className="p-2">
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenClassManager();
              }}
              className="w-full py-1.5 px-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 hover:text-cyan-200 text-xs font-['Rajdhani'] font-bold flex items-center justify-center gap-1.5 transition-colors border border-cyan-500/30"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Quản lý & Thêm lớp mới...</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
