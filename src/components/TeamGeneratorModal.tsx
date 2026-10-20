import React, { useState } from 'react';
import {
  X,
  Users,
  Shuffle,
  Crown,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';
import { Student } from '../types';
import confetti from 'canvas-confetti';

interface TeamGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  classNameTitle?: string;
}

interface Team {
  id: number;
  name: string;
  leader: Student;
  members: Student[];
  color: string;
}

const TEAM_COLORS = [
  'from-cyan-600/30 to-blue-700/30 border-cyan-500/50 text-cyan-300',
  'from-purple-600/30 to-pink-700/30 border-purple-500/50 text-purple-300',
  'from-emerald-600/30 to-teal-700/30 border-emerald-500/50 text-emerald-300',
  'from-amber-600/30 to-orange-700/30 border-amber-500/50 text-amber-300',
  'from-rose-600/30 to-red-700/30 border-rose-500/50 text-rose-300',
  'from-indigo-600/30 to-violet-700/30 border-indigo-500/50 text-indigo-300',
];

export const TeamGeneratorModal: React.FC<TeamGeneratorModalProps> = ({
  isOpen,
  onClose,
  students,
  classNameTitle,
}) => {
  const [numTeams, setNumTeams] = useState<number>(4);
  const [teams, setTeams] = useState<Team[]>([]);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerateTeams = () => {
    if (students.length === 0) return;

    // Fisher-Yates shuffle
    const shuffled = [...students];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const teamCount = Math.min(numTeams, shuffled.length);
    const createdTeams: Team[] = Array.from({ length: teamCount }, (_, i) => ({
      id: i + 1,
      name: `Nhóm ${i + 1}`,
      leader: shuffled[i],
      members: [],
      color: TEAM_COLORS[i % TEAM_COLORS.length],
    }));

    // Distribute members evenly
    shuffled.forEach((student, index) => {
      const teamIdx = index % teamCount;
      createdTeams[teamIdx].members.push(student);
    });

    setTeams(createdTeams);

    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.5 },
    });
  };

  const handleCopyTeams = () => {
    if (teams.length === 0) return;

    let text = `DANH SÁCH CHIA NHÓM - LỚP ${classNameTitle || ''}\n\n`;
    teams.forEach((t) => {
      text += `--- ${t.name.toUpperCase()} (Nhóm trưởng: ${t.leader.name}) ---\n`;
      t.members.forEach((m, idx) => {
        text += `  ${idx + 1}. ${m.name} ${m.id === t.leader.id ? '⭐ (Nhóm trưởng)' : ''}\n`;
      });
      text += '\n';
    });

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#080d24] border border-cyan-500/40 rounded-3xl p-6 sm:p-7 shadow-[0_0_50px_rgba(6,182,212,0.3)] text-slate-100 my-8 max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-5 shrink-0">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 text-white shadow-lg shadow-cyan-500/30">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold font-['Orbitron'] text-cyan-200">
              CÔNG CỤ CHIA NHÓM HỌC TẬP NGẪU NHIÊN
            </h3>
            <p className="text-xs text-slate-400 font-['Rajdhani']">
              Tự động bốc thăm chia nhóm và chỉ định nhóm trưởng ngẫu nhiên cho {classNameTitle || 'lớp'}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 mb-5 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold font-['Orbitron'] text-slate-300">
              SỐ LƯỢNG NHÓM:
            </span>
            <div className="flex items-center gap-1.5">
              {[2, 3, 4, 5, 6, 8].map((n) => (
                <button
                  key={n}
                  onClick={() => setNumTeams(n)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold font-['Orbitron'] transition-all ${
                    numTeams === n
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <span className="text-[11px] text-slate-400 font-['Rajdhani'] ml-2">
              (Khoảng ~{Math.ceil(students.length / numTeams)} bạn/nhóm)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerateTeams}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold font-['Orbitron'] text-xs tracking-wider shadow-lg shadow-cyan-500/30 transition-all flex items-center gap-2"
            >
              <Shuffle className="w-4 h-4" />
              <span>BỐC THĂM CHIA NHÓM</span>
            </button>

            {teams.length > 0 && (
              <button
                onClick={handleCopyTeams}
                className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-['Orbitron'] font-bold transition-all flex items-center gap-1.5"
                title="Sao chép toàn bộ danh sách nhóm để dán vào Word/Zalo"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'ĐÃ SAO CHÉP!' : 'COPY'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Teams Output Grid */}
        <div className="flex-1 overflow-y-auto pr-1">
          {teams.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center space-y-3 border-2 border-dashed border-slate-800 rounded-2xl">
              <Sparkles className="w-8 h-8 text-cyan-400/60" />
              <p className="text-sm text-slate-400 font-['Rajdhani']">
                Chọn số nhóm mong muốn và nhấn nút &quot;BỐC THĂM CHIA NHÓM&quot; để bắt đầu!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {teams.map((t) => (
                <div
                  key={t.id}
                  className={`p-4 rounded-2xl bg-gradient-to-br ${t.color} border backdrop-blur-sm flex flex-col justify-between`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
                      <span className="font-bold font-['Orbitron'] text-sm tracking-wider">
                        {t.name}
                      </span>
                      <span className="text-[11px] font-['Orbitron'] px-2 py-0.5 rounded-full bg-black/40">
                        {t.members.length} bạn
                      </span>
                    </div>

                    {/* Team Leader */}
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-black/30 border border-amber-400/30 mb-3 text-amber-300 text-xs font-semibold">
                      <Crown className="w-4 h-4 shrink-0 text-amber-400" />
                      <div className="truncate">
                        <span className="text-[10px] block opacity-75 font-['Rajdhani'] uppercase">
                          Nhóm trưởng:
                        </span>
                        <span className="font-['Orbitron']">{t.leader.name}</span>
                      </div>
                    </div>

                    {/* Member list */}
                    <div className="space-y-1.5 text-xs">
                      {t.members.map((m, idx) => (
                        <div
                          key={m.id}
                          className="flex items-center justify-between py-1 px-2 rounded-lg bg-black/20"
                        >
                          <span className="text-slate-200">
                            {idx + 1}. {m.name}
                          </span>
                          {m.id === t.leader.id && (
                            <span className="text-[10px] text-amber-300 font-bold">
                              ★
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
