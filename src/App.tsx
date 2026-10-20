import React, { useState, useEffect } from 'react';
import {
  Student,
  Question,
  AnswerRecord,
  AppSettings,
  ActiveTab,
  ClassRoom,
} from './types';
import {
  DEFAULT_STUDENTS_TEXT,
  DEFAULT_QUESTIONS,
  DEFAULT_SETTINGS,
  DEFAULT_CLASSES,
  parseStudentsFromText,
} from './data/defaultData';
import { getAllMathKNTTQuestions } from './data/mathKNTTData';
import { soundFx } from './utils/audio';
import { CosmicBackground } from './components/CosmicBackground';
import { AstronautScanner } from './components/AstronautScanner';
import { QuestionMap } from './components/QuestionMap';
import { QuestionModal } from './components/QuestionModal';
import { ReportDashboard } from './components/ReportDashboard';
import { SettingsView } from './components/SettingsView';
import { ClassSwitcher } from './components/ClassSwitcher';
import { ApiKeyModal } from './components/ApiKeyModal';
import { AiQuestionModal } from './components/AiQuestionModal';
import { TeamGeneratorModal } from './components/TeamGeneratorModal';
import { getStoredApiKey } from './utils/geminiAi';
import {
  Compass,
  Rocket,
  Globe,
  FileSpreadsheet,
  Settings,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Radio,
  RotateCcw,
  GraduationCap,
  Key,
  Sparkles,
  Users,
} from 'lucide-react';

const STORAGE_KEYS = {
  CLASSES: 'cosmic_scholar_classes_v1',
  ACTIVE_CLASS_ID: 'cosmic_scholar_active_class_id_v1',
  QUESTIONS: 'cosmic_scholar_questions_v1',
  SETTINGS: 'cosmic_scholar_settings_v1',
  RECORDS: 'cosmic_scholar_records_v1',
  CALLED_IDS: 'cosmic_scholar_called_ids_v1',
};

export default function App() {
  // Initialize multiple classes
  const [classes, setClasses] = useState<ClassRoom[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CLASSES);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_CLASSES;
  });

  const [activeClassId, setActiveClassId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_CLASS_ID);
      if (saved) return saved;
    } catch {
      // fallback
    }
    return DEFAULT_CLASSES[0]?.id || 'class-10a1';
  });

  // Current active classroom
  const activeClass = classes.find((c) => c.id === activeClassId) || classes[0] || DEFAULT_CLASSES[0];
  const students = activeClass ? activeClass.students : [];

  const [questions, setQuestions] = useState<Question[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
      if (saved) {
        const parsed: Question[] = JSON.parse(saved);
        const knttList = getAllMathKNTTQuestions();
        const knttMap = new Map(knttList.map((q) => [q.id, q]));
        return parsed.map((q) => {
          const official = knttMap.get(q.id);
          if (official) {
            return {
              ...official,
              number: q.number,
              planetName: q.planetName,
              planetType: q.planetType,
              isAnswered: q.isAnswered ?? false,
            };
          }
          return q;
        });
      }
    } catch {
      // fallback
    }
    return DEFAULT_QUESTIONS;
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_SETTINGS;
  });

  const [records, setRecords] = useState<AnswerRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RECORDS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [];
  });

  const [calledStudentIds, setCalledStudentIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CALLED_IDS);
      if (saved) return new Set(JSON.parse(saved));
    } catch {
      // fallback
    }
    return new Set<string>();
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('scanner');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState<boolean>(false);
  const [hasApiKey, setHasApiKey] = useState<boolean>(() => Boolean(getStoredApiKey()));

  // Auto-open mandatory API Key Modal on launch if no key is present (AI_INSTRUCTIONS.md)
  useEffect(() => {
    if (!hasApiKey) {
      setIsApiKeyModalOpen(true);
    }
  }, []);

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
    } catch {}
  }, [classes]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_CLASS_ID, activeClassId);
    } catch {}
  }, [activeClassId]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
    } catch {}
  }, [questions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch {}
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
    } catch {}
  }, [records]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.CALLED_IDS,
        JSON.stringify(Array.from(calledStudentIds))
      );
    } catch {}
  }, [calledStudentIds]);

  // Fullscreen handler
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(
          (e.target as HTMLElement)?.tagName
        )
      ) {
        return;
      }
      if (e.code === 'KeyF' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    document.addEventListener('fullscreenchange', handleFsChange);
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, []);

  const handleAddAiQuestions = (newQuestions: Question[]) => {
    setQuestions((prev) => [...newQuestions, ...prev]);
    setActiveTab('missions');
    if (settings.soundEnabled) {
      soundFx.playButtonClick(settings.soundVolume);
    }
  };

  // Class management handlers
  const handleSelectClass = (classId: string) => {
    setActiveClassId(classId);
    setSelectedStudent(null);
    setCalledStudentIds(new Set()); // Reset called pool for the new class
    if (settings.soundEnabled) {
      soundFx.playButtonClick(settings.soundVolume);
    }
  };

  const handleCreateClass = (newClass: ClassRoom) => {
    setClasses((prev) => [...prev, newClass]);
    setActiveClassId(newClass.id);
    setSelectedStudent(null);
    setCalledStudentIds(new Set());
    if (settings.soundEnabled) {
      soundFx.playButtonClick(settings.soundVolume);
    }
  };

  const handleUpdateClass = (updatedClass: ClassRoom) => {
    setClasses((prev) => prev.map((c) => (c.id === updatedClass.id ? updatedClass : c)));
    if (settings.soundEnabled) {
      soundFx.playButtonClick(settings.soundVolume);
    }
  };

  const handleDeleteClass = (classId: string) => {
    const remaining = classes.filter((c) => c.id !== classId);
    setClasses(remaining);
    if (activeClassId === classId && remaining.length > 0) {
      setActiveClassId(remaining[0].id);
      setSelectedStudent(null);
      setCalledStudentIds(new Set());
    }
    if (settings.soundEnabled) {
      soundFx.playButtonClick(settings.soundVolume);
    }
  };

  // Update student roster for active class
  const handleUpdateCurrentStudents = (newStudents: Student[]) => {
    setClasses((prev) =>
      prev.map((c) => (c.id === activeClassId ? { ...c, students: newStudents } : c))
    );
  };

  // Astronaut selection
  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    // Add to called pool
    setCalledStudentIds((prev) => {
      const next = new Set(prev);
      next.add(student.id);
      return next;
    });

    // Increment call count in active class
    setClasses((prevClasses) =>
      prevClasses.map((c) => {
        if (c.id === activeClassId) {
          return {
            ...c,
            students: c.students.map((s) =>
              s.id === student.id ? { ...s, callCount: s.callCount + 1 } : s
            ),
          };
        }
        return c;
      })
    );
  };

  // Reset called pool
  const handleResetCalledPool = () => {
    setCalledStudentIds(new Set());
    if (settings.soundEnabled) {
      soundFx.playButtonClick(settings.soundVolume);
    }
  };

  // Reset planetary question bank answered status
  const handleResetQuestions = () => {
    setQuestions((prev) => prev.map((q) => ({ ...q, isAnswered: false })));
    if (settings.soundEnabled) {
      soundFx.playButtonClick(settings.soundVolume);
    }
  };

  // Record submission from question modal
  const handleSubmitRecord = (record: AnswerRecord) => {
    // Attach current active class info
    const recordWithClass: AnswerRecord = {
      ...record,
      classId: activeClass?.id,
      className: activeClass?.name,
    };

    setRecords((prev) => [recordWithClass, ...prev]);

    // Mark question as answered/locked
    setQuestions((prev) =>
      prev.map((q) => (q.id === record.questionId ? { ...q, isAnswered: true } : q))
    );
  };

  // Continue option 1: "CÂU KHÁC" (current student continues with another question)
  const handlePickAnotherQuestion = () => {
    setActiveQuestion(null);
    setActiveTab('missions');
    if (settings.soundEnabled) {
      soundFx.playButtonClick(settings.soundVolume);
    }
  };

  // Continue option 2: "TIẾP TỤC GỌI TÊN" (proceed to scanner for next student)
  const handleScanNextStudent = () => {
    setActiveQuestion(null);
    setSelectedStudent(null);
    setActiveTab('scanner');
    if (settings.soundEnabled) {
      soundFx.playButtonClick(settings.soundVolume);
    }
  };

  // Clear session records
  const handleClearRecords = () => {
    if (confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử trả lời của phiên này?')) {
      setRecords([]);
      if (settings.soundEnabled) {
        soundFx.playButtonClick(settings.soundVolume);
      }
    }
  };

  // Reset all applet data to defaults
  const handleResetAllData = () => {
    if (
      confirm(
        'Khôi phục tất cả dữ liệu (Các lớp học, Câu hỏi, Cài đặt và Lịch sử) về trạng thái mặc định ban đầu?'
      )
    ) {
      setClasses(DEFAULT_CLASSES);
      setActiveClassId(DEFAULT_CLASSES[0].id);
      setQuestions(DEFAULT_QUESTIONS);
      setSettings(DEFAULT_SETTINGS);
      setRecords([]);
      setCalledStudentIds(new Set());
      setSelectedStudent(null);
      setActiveQuestion(null);
      localStorage.clear();
      soundFx.toggleAmbient(false);
    }
  };

  return (
    <div className="relative min-h-screen text-slate-100 flex flex-col font-['Plus_Jakarta_Sans'] select-none">
      {/* Dynamic Cosmic Starfield & Nebula Background */}
      <CosmicBackground />

      {/* Main Top Navigation / Mission Control HUD Header */}
      <header className="sticky top-0 z-40 w-full bg-[#050818]/90 backdrop-blur-xl border-b border-cyan-500/30 px-3 sm:px-6 py-2.5 shadow-lg shadow-black/60">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Logo & Space Mission Branding */}
          <div
            onClick={() => setActiveTab('scanner')}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div className="relative p-2.5 rounded-2xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.5)] group-hover:scale-105 transition-transform">
              <Rocket className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-950 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-black font-['Orbitron'] tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-200 to-amber-200">
                  GỌI TÊN NGẪU NHIÊN
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-gradient-to-r from-amber-500/20 to-cyan-500/20 border border-amber-400/50 text-[10px] font-bold font-['Orbitron'] text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                  PHẠM HẬU
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-['Rajdhani'] font-medium hidden md:block">
                Hệ Thống Gọi Tên Học Sinh Ngẫu Nhiên • Tác giả: Phạm Hậu
              </p>
            </div>
          </div>

          {/* Quick Classroom Switcher in Navigation */}
          <div className="flex items-center">
            <ClassSwitcher
              classes={classes}
              activeClassId={activeClassId}
              onSelectClass={handleSelectClass}
              onOpenClassManager={() => setActiveTab('settings')}
            />
          </div>

          {/* Navigation Tabs HUD */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('scanner')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold font-['Orbitron'] tracking-wider transition-all ${
                activeTab === 'scanner'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                  : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-800/60'
              }`}
            >
              <Compass className="w-4 h-4 shrink-0" />
              <span className="hidden md:inline">GỌI TÊN</span>
              <span className="md:hidden">GỌI TÊN</span>
            </button>

            <button
              onClick={() => setActiveTab('missions')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold font-['Orbitron'] tracking-wider transition-all ${
                activeTab === 'missions'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                  : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-800/60'
              }`}
            >
              <Globe className="w-4 h-4 shrink-0" />
              <span className="hidden md:inline">CÂU HỎI TRẮC NGHIỆM</span>
              <span className="md:hidden">CÂU HỎI</span>
            </button>

            <button
              onClick={() => setActiveTab('report')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold font-['Orbitron'] tracking-wider transition-all ${
                activeTab === 'report'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                  : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-800/60'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 shrink-0" />
              <span className="hidden md:inline">BẢNG ĐIỂM & EXCEL</span>
              <span className="md:hidden">ĐIỂM</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`p-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'settings'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50'
                  : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-800/60'
              }`}
              title="Cài đặt & Quản lý nhiều lớp học, ngân hàng câu hỏi"
            >
              <Settings className="w-4 h-4" />
            </button>
          </nav>

          {/* Quick HUD Action Tools */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Gemini API Key Button & Link (AI_INSTRUCTIONS.md) */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsApiKeyModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-cyan-500/40 bg-slate-900/90 text-xs font-['Orbitron'] font-bold text-cyan-300 hover:border-cyan-400 hover:bg-slate-800 transition-all shadow-md"
                title="Quản lý Gemini API Key và chọn Model AI"
              >
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Settings (API Key)</span>
                <span className="sm:hidden">API KEY</span>
              </button>
              <a
                href="https://aistudio.google.com/api-keys"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold font-['Rajdhani'] text-rose-400 hover:text-rose-300 underline underline-offset-2 animate-pulse hidden lg:inline"
                title="Nhấn để lấy mã Google Gemini API Key miễn phí"
              >
                Lấy API key để sử dụng app
              </a>
            </div>

            {/* Sound Toggle */}
            <button
              onClick={() => {
                const nextSound = !settings.soundEnabled;
                setSettings({ ...settings, soundEnabled: nextSound });
                if (nextSound) soundFx.playButtonClick(settings.soundVolume);
              }}
              className={`p-2 rounded-xl border text-xs transition-colors ${
                settings.soundEnabled
                  ? 'bg-slate-800/80 border-cyan-500/30 text-cyan-400'
                  : 'bg-slate-900 border-slate-700 text-slate-600'
              }`}
              title={settings.soundEnabled ? 'Tắt âm thanh hiệu ứng' : 'Bật âm thanh hiệu ứng'}
            >
              {settings.soundEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-xl bg-slate-800/80 border border-cyan-500/30 text-slate-300 hover:text-cyan-300 transition-colors hidden sm:flex"
              title={isFullscreen ? 'Thu nhỏ cửa sổ' : 'Toàn màn hình trình chiếu'}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main View Area */}
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 flex flex-col justify-center">
        {activeTab === 'scanner' && (
          <AstronautScanner
            students={students}
            calledStudentIds={calledStudentIds}
            selectedStudent={selectedStudent}
            settings={settings}
            onSelectStudent={handleSelectStudent}
            onResetCalled={handleResetCalledPool}
            onStartMission={(student) => {
              setSelectedStudent(student);
              setActiveTab('missions');
            }}
            onOpenTeamGenerator={() => setIsTeamModalOpen(true)}
          />
        )}

        {activeTab === 'missions' && (
          <QuestionMap
            questions={questions}
            selectedStudent={selectedStudent}
            onSelectQuestion={(q) => setActiveQuestion(q)}
            onResetQuestions={handleResetQuestions}
            onNavigateToScanner={() => setActiveTab('scanner')}
            onLoadPresetQuestions={(qs) => {
              setQuestions(qs);
              if (settings.soundEnabled) soundFx.playButtonClick(settings.soundVolume);
            }}
            onOpenAiModal={() => setIsAiModalOpen(true)}
          />
        )}

        {activeTab === 'report' && (
          <ReportDashboard
            records={records}
            classes={classes}
            onClearRecords={handleClearRecords}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            students={students}
            questions={questions}
            settings={settings}
            classes={classes}
            activeClassId={activeClassId}
            onSelectClass={handleSelectClass}
            onCreateClass={handleCreateClass}
            onUpdateClass={handleUpdateClass}
            onDeleteClass={handleDeleteClass}
            onUpdateStudents={handleUpdateCurrentStudents}
            onUpdateQuestions={(newQuestions) => setQuestions(newQuestions)}
            onUpdateSettings={(newSettings) => setSettings(newSettings)}
            onResetAllData={handleResetAllData}
          />
        )}
      </main>

      {/* Interactive Question / Mission Cockpit Modal */}
      {activeQuestion && (
        <QuestionModal
          question={activeQuestion}
          student={selectedStudent}
          settings={settings}
          onClose={() => setActiveQuestion(null)}
          onSubmitRecord={handleSubmitRecord}
          onPickAnotherQuestion={handlePickAnotherQuestion}
          onScanNextStudent={handleScanNextStudent}
        />
      )}

      {/* Gemini API Key & Model Configuration Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onKeySaved={() => setHasApiKey(Boolean(getStoredApiKey()))}
      />

      {/* Gemini AI Auto Question Generator Modal */}
      <AiQuestionModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onAddQuestions={handleAddAiQuestions}
        onOpenApiKeyModal={() => {
          setIsAiModalOpen(false);
          setIsApiKeyModalOpen(true);
        }}
      />

      {/* Random Team Generator Modal */}
      <TeamGeneratorModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        students={students}
        classNameTitle={activeClass?.name}
      />

      {/* Futuristic Space Footer */}
      <footer className="relative z-10 w-full py-3 px-4 border-t border-slate-900 bg-[#030612]/80 backdrop-blur-md text-center text-xs text-slate-500 font-['Rajdhani']">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-cyan-500 animate-pulse" />
            <span>Trạng thái hệ thống: SẴN SÀNG</span>
            {activeClass && (
              <span className="text-cyan-400 font-semibold font-['Orbitron']">
                • Đang chọn: {activeClass.name} ({activeClass.students.length} học sinh)
              </span>
            )}
          </div>
          <div className="text-slate-400 font-medium">
            GỌI TÊN NGẪU NHIÊN - PHẠM HẬU • Ứng dụng gọi tên học sinh công bằng, sôi nổi & hiện đại
          </div>
        </div>
      </footer>
    </div>
  );
}
