import React, { useState } from 'react';
import { Student, Question, AppSettings, AnswerKey, PlanetType, ClassRoom } from '../types';
import { parseStudentsFromText, DEFAULT_STUDENTS_TEXT, DEFAULT_QUESTIONS, DEFAULT_SETTINGS } from '../data/defaultData';
import { soundFx } from '../utils/audio';
import { speechController } from '../utils/speech';
import { PlanetIcon } from './PlanetIcon';
import { MathRenderer } from './MathRenderer';
import {
  Settings,
  Users,
  HelpCircle,
  Clock,
  Volume2,
  VolumeX,
  RotateCcw,
  Plus,
  Trash2,
  Edit2,
  Check,
  Save,
  Sparkles,
  ListOrdered,
  FileText,
  AlertCircle,
  BookOpen,
  GraduationCap,
} from 'lucide-react';
import { MathCurriculumBrowser } from './MathCurriculumBrowser';
import { ClassManager } from './ClassManager';

interface SettingsViewProps {
  students: Student[];
  questions: Question[];
  settings: AppSettings;
  classes: ClassRoom[];
  activeClassId: string;
  onSelectClass: (classId: string) => void;
  onCreateClass: (newClass: ClassRoom) => void;
  onUpdateClass: (updatedClass: ClassRoom) => void;
  onDeleteClass: (classId: string) => void;
  onUpdateStudents: (students: Student[]) => void;
  onUpdateQuestions: (questions: Question[]) => void;
  onUpdateSettings: (settings: AppSettings) => void;
  onResetAllData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  students,
  questions,
  settings,
  classes,
  activeClassId,
  onSelectClass,
  onCreateClass,
  onUpdateClass,
  onDeleteClass,
  onUpdateStudents,
  onUpdateQuestions,
  onUpdateSettings,
  onResetAllData,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'classes' | 'math-kntt' | 'students' | 'questions' | 'timers'>('classes');

  // Student raw text editor state
  const [studentsText, setStudentsText] = useState<string>(
    students.map((s) => s.name).join('\n')
  );
  const [studentsSavedMsg, setStudentsSavedMsg] = useState(false);

  // New question form state
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  const [qTitle, setQTitle] = useState('');
  const [qPlanetName, setQPlanetName] = useState('Hành tinh mới');
  const [qPlanetType, setQPlanetType] = useState<PlanetType>('mars');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [correctKey, setCorrectKey] = useState<AnswerKey>('A');
  const [explanation, setExplanation] = useState('');
  const [points, setPoints] = useState(100);

  const planetOptions: { type: PlanetType; name: string }[] = [
    { type: 'sun', name: 'Mặt Trời (Sun)' },
    { type: 'mercury', name: 'Sao Thủy (Mercury)' },
    { type: 'venus', name: 'Sao Kim (Venus)' },
    { type: 'earth', name: 'Trái Đất (Earth)' },
    { type: 'moon', name: 'Mặt Trăng (Moon)' },
    { type: 'mars', name: 'Sao Hỏa (Mars)' },
    { type: 'jupiter', name: 'Sao Mộc (Jupiter)' },
    { type: 'saturn', name: 'Sao Thổ (Saturn)' },
    { type: 'uranus', name: 'Sao Thiên Vương (Uranus)' },
    { type: 'neptune', name: 'Sao Hải Vương (Neptune)' },
    { type: 'asteroid', name: 'Tiểu hành tinh Ceres' },
    { type: 'comet', name: 'Sao chổi Halley' },
    { type: 'supernova', name: 'Siêu tân tinh Supernova' },
    { type: 'blackhole', name: 'Hố đen vũ trụ' },
  ];

  // Save student roster
  const handleSaveStudents = () => {
    const parsed = parseStudentsFromText(studentsText);
    onUpdateStudents(parsed);
    setStudentsSavedMsg(true);
    setTimeout(() => setStudentsSavedMsg(false), 2500);
  };

  const handleResetDefaultStudents = () => {
    setStudentsText(DEFAULT_STUDENTS_TEXT);
    const parsed = parseStudentsFromText(DEFAULT_STUDENTS_TEXT);
    onUpdateStudents(parsed);
  };

  // Add / Edit question
  const handleOpenAddQuestion = () => {
    setEditingQuestionId(null);
    setQTitle('');
    setQPlanetName(`Tiểu hành tinh #${questions.length + 1}`);
    setQPlanetType('mars');
    setOptA('');
    setOptB('');
    setOptC('');
    setOptD('');
    setCorrectKey('A');
    setExplanation('');
    setPoints(100);
    setIsAddingQuestion(true);
  };

  const handleOpenEditQuestion = (q: Question) => {
    setEditingQuestionId(q.id);
    setQTitle(q.title);
    setQPlanetName(q.planetName);
    setQPlanetType(q.planetType);
    setOptA(q.options.find((o) => o.key === 'A')?.text || '');
    setOptB(q.options.find((o) => o.key === 'B')?.text || '');
    setOptC(q.options.find((o) => o.key === 'C')?.text || '');
    setOptD(q.options.find((o) => o.key === 'D')?.text || '');
    setCorrectKey(q.correctAnswer);
    setExplanation(q.explanation || '');
    setPoints(q.points || 100);
    setIsAddingQuestion(true);
  };

  const handleSaveQuestion = () => {
    if (!qTitle.trim() || !optA.trim() || !optB.trim()) {
      alert('Vui lòng nhập nội dung câu hỏi và ít nhất 2 đáp án (A và B)!');
      return;
    }

    const options = [
      { key: 'A' as AnswerKey, text: optA.trim() },
      { key: 'B' as AnswerKey, text: optB.trim() },
      { key: 'C' as AnswerKey, text: optC.trim() || 'Không có phương án' },
      { key: 'D' as AnswerKey, text: optD.trim() || 'Không có phương án' },
    ];

    if (editingQuestionId) {
      // Edit
      const updated = questions.map((q) => {
        if (q.id === editingQuestionId) {
          return {
            ...q,
            title: qTitle.trim(),
            planetName: qPlanetName.trim(),
            planetType: qPlanetType,
            options,
            correctAnswer: correctKey,
            explanation: explanation.trim(),
            points,
          };
        }
        return q;
      });
      onUpdateQuestions(updated);
    } else {
      // Add
      const newQuestion: Question = {
        id: `q-${Date.now()}`,
        number: questions.length + 1,
        planetName: qPlanetName.trim(),
        planetType: qPlanetType,
        title: qTitle.trim(),
        options,
        correctAnswer: correctKey,
        explanation: explanation.trim(),
        points,
        isAnswered: false,
      };
      onUpdateQuestions([...questions, newQuestion]);
    }

    setIsAddingQuestion(false);
    setEditingQuestionId(null);
  };

  const handleDeleteQuestion = (id: string) => {
    const filtered = questions.filter((q) => q.id !== id);
    // Re-index question numbers
    const reindexed = filtered.map((q, idx) => ({ ...q, number: idx + 1 }));
    onUpdateQuestions(reindexed);
  };

  const handleResetDefaultQuestions = () => {
    onUpdateQuestions(DEFAULT_QUESTIONS);
  };

  // Timer settings
  const handleUpdateTimerSetting = (key: keyof AppSettings, val: number | boolean) => {
    const updated = { ...settings, [key]: val };
    onUpdateSettings(updated);
    if (key === 'ambientSoundEnabled') {
      soundFx.toggleAmbient(Boolean(val), settings.soundVolume);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-5xl mx-auto px-4 py-4 space-y-6">
      {/* Top Header */}
      <div className="w-full flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-4 shadow-lg shadow-cyan-950/40">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/40 text-cyan-400">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold font-['Orbitron'] tracking-wider text-cyan-200">
              TRẠM ĐIỀU CHỈNH & CÀI ĐẶT
            </h2>
            <p className="text-xs text-slate-400 font-['Rajdhani']">
              Quản lý danh sách học sinh, ngân hàng câu hỏi và thông số thời gian
            </p>
          </div>
        </div>

        {/* Global Reset */}
        <button
          onClick={onResetAllData}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-['Rajdhani'] font-semibold transition-all"
          title="Khôi phục toàn bộ học sinh, câu hỏi và cài đặt về mặc định ban đầu"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Khôi phục mặc định</span>
        </button>
      </div>

      {/* Sub tabs switcher */}
      <div className="w-full flex border-b border-slate-800 gap-2 flex-wrap">
        <button
          onClick={() => setActiveSubTab('classes')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-['Orbitron'] font-bold text-xs tracking-wider border-t border-x transition-all ${
            activeSubTab === 'classes'
              ? 'bg-slate-900 border-cyan-500/40 text-cyan-300 -mb-[1px]'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <GraduationCap className="w-4 h-4 text-cyan-400" />
          <span>QUẢN LÝ LỚP HỌC ({classes.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('math-kntt')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-['Orbitron'] font-bold text-xs tracking-wider border-t border-x transition-all ${
            activeSubTab === 'math-kntt'
              ? 'bg-slate-900 border-cyan-500/40 text-cyan-300 -mb-[1px]'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4 text-cyan-400" />
          <span>TOÁN THPT (KNTT)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('students')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-['Orbitron'] font-bold text-xs tracking-wider border-t border-x transition-all ${
            activeSubTab === 'students'
              ? 'bg-slate-900 border-cyan-500/40 text-cyan-300 -mb-[1px]'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>DANH SÁCH LỚP HIỆN TẠI ({students.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('questions')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-['Orbitron'] font-bold text-xs tracking-wider border-t border-x transition-all ${
            activeSubTab === 'questions'
              ? 'bg-slate-900 border-cyan-500/40 text-cyan-300 -mb-[1px]'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>TÙY CHỈNH CÂU HỎI ({questions.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('timers')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-['Orbitron'] font-bold text-xs tracking-wider border-t border-x transition-all ${
            activeSubTab === 'timers'
              ? 'bg-slate-900 border-cyan-500/40 text-cyan-300 -mb-[1px]'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>THỜI GIAN & HIỆU ỨNG</span>
        </button>
      </div>

      {/* Subtab: Classrooms Manager (Multi-class storage) */}
      {activeSubTab === 'classes' && (
        <ClassManager
          classes={classes}
          activeClassId={activeClassId}
          onSelectClass={onSelectClass}
          onCreateClass={onCreateClass}
          onUpdateClass={onUpdateClass}
          onDeleteClass={onDeleteClass}
        />
      )}

      {/* Subtab: Math KNTT Curriculum Browser */}
      {activeSubTab === 'math-kntt' && (
        <MathCurriculumBrowser
          onLoadQuestions={(qs) => onUpdateQuestions(qs)}
          activeQuestionsCount={questions.length}
        />
      )}

      {/* Subtab 1: Students Roster Management */}
      {activeSubTab === 'students' && (
        <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-md space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold font-['Orbitron'] text-slate-200">
                NHẬP DANH SÁCH HỌC SINH
              </h3>
              <p className="text-xs text-slate-400 font-['Rajdhani']">
                Nhập danh sách học sinh trong lớp (mỗi bạn 1 dòng) rồi nhấn &quot;Lưu danh sách&quot;.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleResetDefaultStudents}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-['Rajdhani'] font-semibold transition-all"
              >
                Tải danh sách mẫu (30 bạn)
              </button>

              <button
                onClick={handleSaveStudents}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold font-['Orbitron'] text-xs tracking-wider shadow-md shadow-cyan-500/30 transition-all hover:scale-105 active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>LƯU DANH SÁCH</span>
              </button>
            </div>
          </div>

          {studentsSavedMsg && (
            <div className="px-4 py-2 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-['Rajdhani'] font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Đã cập nhật danh sách {students.length} học sinh thành công!</span>
            </div>
          )}

          <div className="relative">
            <textarea
              rows={12}
              value={studentsText}
              onChange={(e) => setStudentsText(e.target.value)}
              placeholder="Nguyễn Văn A&#10;Trần Thị B&#10;Lê Văn C..."
              className="w-full p-4 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 focus:outline-none text-slate-200 font-mono text-sm leading-relaxed"
            />
            <div className="text-right text-[11px] text-slate-500 mt-1 font-['Rajdhani']">
              Hiện có {studentsText.split('\n').filter((l) => l.trim()).length} dòng tên học sinh
            </div>
          </div>
        </div>
      )}

      {/* Subtab 2: Question Bank Management */}
      {activeSubTab === 'questions' && (
        <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-md space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold font-['Orbitron'] text-slate-200">
                NGÂN HÀNG CÂU HỎI TRẮC NGHIỆM
              </h3>
              <p className="text-xs text-slate-400 font-['Rajdhani']">
                Mỗi câu hỏi sẽ gắn liền với một hành tinh/thiên thể trong bản đồ vũ trụ.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleResetDefaultQuestions}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-['Rajdhani'] font-semibold transition-all"
              >
                Khôi phục 14 câu mẫu vũ trụ
              </button>

              <button
                onClick={handleOpenAddQuestion}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold font-['Orbitron'] text-xs tracking-wider transition-all hover:scale-105 active:scale-95 shadow-md shadow-emerald-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>THÊM CÂU HỎI MỚI</span>
              </button>
            </div>
          </div>

          {/* Form to add or edit question */}
          {isAddingQuestion && (
            <div className="p-5 rounded-2xl bg-slate-950/90 border-2 border-cyan-500/40 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold font-['Orbitron'] text-cyan-300">
                  {editingQuestionId ? 'CHỈNH SỬA CÂU HỎI' : 'THÊM CÂU HỎI MỚI'}
                </span>
                <button
                  onClick={() => setIsAddingQuestion(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Hủy bỏ
                </button>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-['Rajdhani'] font-semibold text-slate-300 mb-1">
                  Nội dung câu hỏi (hỗ trợ MathType trong $...$):
                </label>
                <textarea
                  rows={2}
                  value={qTitle}
                  onChange={(e) => setQTitle(e.target.value)}
                  placeholder="Nhập câu hỏi... (VD: Cho phương trình $x^2 - 4x + 3 = 0$...)"
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 text-slate-200 text-xs focus:outline-none"
                />
                {qTitle && (qTitle.includes('$') || qTitle.includes('\\')) && (
                  <div className="mt-1.5 p-2 rounded-lg bg-slate-900/80 border border-cyan-500/30 text-xs text-cyan-200">
                    <span className="text-[10px] text-cyan-400 font-bold block mb-0.5">Xem trước công thức MathType:</span>
                    <MathRenderer text={qTitle} />
                  </div>
                )}
              </div>

              {/* Planet assignment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-['Rajdhani'] font-semibold text-slate-300 mb-1">
                    Thiên thể đại diện:
                  </label>
                  <select
                    value={qPlanetType}
                    onChange={(e) => {
                      const val = e.target.value as PlanetType;
                      setQPlanetType(val);
                      const found = planetOptions.find((p) => p.type === val);
                      if (found) setQPlanetName(found.name);
                    }}
                    className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none"
                  >
                    {planetOptions.map((p) => (
                      <option key={p.type} value={p.type}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-['Rajdhani'] font-semibold text-slate-300 mb-1">
                    Tên hiển thị hành tinh:
                  </label>
                  <input
                    type="text"
                    value={qPlanetName}
                    onChange={(e) => setQPlanetName(e.target.value)}
                    className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* 4 Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-['Rajdhani'] font-semibold text-slate-300 mb-1">
                    Phương án A:
                  </label>
                  <input
                    type="text"
                    value={optA}
                    onChange={(e) => setOptA(e.target.value)}
                    placeholder="Phương án A..."
                    className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-['Rajdhani'] font-semibold text-slate-300 mb-1">
                    Phương án B:
                  </label>
                  <input
                    type="text"
                    value={optB}
                    onChange={(e) => setOptB(e.target.value)}
                    placeholder="Phương án B..."
                    className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-['Rajdhani'] font-semibold text-slate-300 mb-1">
                    Phương án C:
                  </label>
                  <input
                    type="text"
                    value={optC}
                    onChange={(e) => setOptC(e.target.value)}
                    placeholder="Phương án C..."
                    className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-['Rajdhani'] font-semibold text-slate-300 mb-1">
                    Phương án D:
                  </label>
                  <input
                    type="text"
                    value={optD}
                    onChange={(e) => setOptD(e.target.value)}
                    placeholder="Phương án D..."
                    className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* Correct answer key & points */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block text-xs font-['Rajdhani'] font-semibold text-slate-300 mb-1">
                    Đáp án chính xác:
                  </label>
                  <div className="flex gap-2">
                    {(['A', 'B', 'C', 'D'] as AnswerKey[]).map((k) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => setCorrectKey(k)}
                        className={`flex-1 py-1.5 rounded-xl text-xs font-bold font-['Orbitron'] border transition-all ${
                          correctKey === k
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                            : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                        }`}
                      >
                        {k}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-['Rajdhani'] font-semibold text-slate-300 mb-1">
                    Điểm thưởng (+điểm):
                  </label>
                  <input
                    type="number"
                    value={points}
                    onChange={(e) => setPoints(Number(e.target.value) || 100)}
                    min={10}
                    step={10}
                    className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* Explanation */}
              <div>
                <label className="block text-xs font-['Rajdhani'] font-semibold text-slate-300 mb-1">
                  Giải thích đáp án (tùy chọn):
                </label>
                <input
                  type="text"
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Kiến thức khoa học mở rộng cho học sinh..."
                  className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingQuestion(false)}
                  className="px-4 py-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs font-['Rajdhani']"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSaveQuestion}
                  className="px-5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-['Orbitron'] text-xs tracking-wider transition-all"
                >
                  LƯU CÂU HỎI
                </button>
              </div>
            </div>
          )}

          {/* List of existing questions */}
          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {questions.map((q) => (
              <div
                key={q.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all gap-3"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-300 font-bold font-['Orbitron'] text-xs flex items-center justify-center shrink-0 border border-cyan-500/30">
                    #{q.number}
                  </span>
                  <div className="truncate flex-1">
                    <div className="text-xs font-bold text-slate-200 truncate">
                      <MathRenderer text={q.title} inline />
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5 font-['Rajdhani']">
                      <span className="text-amber-400 font-semibold">{q.planetName}</span>
                      <span>• Đáp án đúng: <strong className="text-emerald-400 font-bold">{q.correctAnswer}</strong></span>
                      <span>• {q.points} điểm</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleOpenEditQuestion(q)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 transition-colors"
                    title="Chỉnh sửa câu hỏi"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteQuestion(q.id)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition-colors"
                    title="Xóa câu hỏi"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subtab 3: Timers and Effects Configuration */}
      {activeSubTab === 'timers' && (
        <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-md space-y-6">
          <div>
            <h3 className="text-base font-bold font-['Orbitron'] text-slate-200">
              CÀI ĐẶT THỜI GIAN & HIỆU ỨNG ÂM THANH
            </h3>
            <p className="text-xs text-slate-400 font-['Rajdhani']">
              Tùy chỉnh thời gian quay gọi tên học sinh, thời gian đếm ngược trả lời và hiệu ứng âm thanh
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Scan duration slider */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-['Orbitron'] text-cyan-300">
                  THỜI GIAN QUAY GỌI TÊN HỌC SINH
                </span>
                <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-['Orbitron'] text-xs font-bold">
                  {settings.scanDurationSeconds} giây
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-['Rajdhani']">
                Thời gian vòng quay gọi tên trước khi dừng ngẫu nhiên trúng học sinh.
              </p>
              <input
                type="range"
                min={2}
                max={10}
                step={1}
                value={settings.scanDurationSeconds}
                onChange={(e) =>
                  handleUpdateTimerSetting('scanDurationSeconds', Number(e.target.value))
                }
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-['Orbitron']">
                <span>2s (Nhanh)</span>
                <span>4s (Khuyên dùng)</span>
                <span>10s (Kịch tính)</span>
              </div>
            </div>

            {/* Question countdown slider */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-['Orbitron'] text-cyan-300">
                  THỜI GIAN ĐẾM NGƯỢC TRẢ LỜI CÂU HỎI
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-['Orbitron'] text-xs font-bold">
                  {settings.questionDurationSeconds} giây
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-['Rajdhani']">
                Thời gian học sinh suy nghĩ và chọn phương án trước khi cạn năng lượng.
              </p>
              <input
                type="range"
                min={5}
                max={60}
                step={5}
                value={settings.questionDurationSeconds}
                onChange={(e) =>
                  handleUpdateTimerSetting('questionDurationSeconds', Number(e.target.value))
                }
                className="w-full accent-amber-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-['Orbitron']">
                <span>5s</span>
                <span>20s (Chuẩn)</span>
                <span>60s (Thoải mái)</span>
              </div>
            </div>
          </div>

          {/* Sound & Atmosphere Toggles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                  {settings.soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200 font-['Orbitron']">
                    HIỆU ỨNG ÂM THANH SCI-FI
                  </div>
                  <div className="text-[11px] text-slate-400 font-['Rajdhani']">
                    Tiếng radar, khóa mục tiêu, tíc tắc và pháo hoa
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleUpdateTimerSetting('soundEnabled', !settings.soundEnabled)}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                  settings.soundEnabled ? 'bg-cyan-500 justify-end' : 'bg-slate-700 justify-start'
                }`}
              >
                <div className="bg-white w-4 h-4 rounded-full shadow-md transform" />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200 font-['Orbitron']">
                    NHẠC NỀN KHÔNG GIAN AMBIENT
                  </div>
                  <div className="text-[11px] text-slate-400 font-['Rajdhani']">
                    Giai điệu vũ trụ nhẹ nhàng tăng tính tập trung
                  </div>
                </div>
              </div>
              <button
                onClick={() =>
                  handleUpdateTimerSetting('ambientSoundEnabled', !settings.ambientSoundEnabled)
                }
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                  settings.ambientSoundEnabled ? 'bg-purple-500 justify-end' : 'bg-slate-700 justify-start'
                }`}
              >
                <div className="bg-white w-4 h-4 rounded-full shadow-md transform" />
              </button>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-slate-950/80 border border-slate-800 gap-3 md:col-span-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <Volume2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200 font-['Orbitron'] flex items-center gap-2">
                    <span>XƯỚNG TÊN HỌC SINH (GIỌNG ĐỌC NAM CHUẨN XÁC)</span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-['Rajdhani'] font-bold border border-emerald-500/40">
                      GIỌNG NAM VIỆT NAM
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-['Rajdhani'] mt-0.5">
                    Tông nam trầm ấm, phát âm rõ ràng chuẩn dấu tiếng Việt, tự động căn chỉnh nhịp sau tiếng radar
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2.5 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => speechController.testMaleVoice()}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 hover:border-cyan-500/50 text-xs font-['Rajdhani'] font-bold transition-all flex items-center gap-1.5"
                  title="Bấm để nghe thử mẫu giọng nam đọc tên học sinh"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Nghe thử giọng</span>
                </button>
                <button
                  onClick={() =>
                    handleUpdateTimerSetting('autoSpeakName', !settings.autoSpeakName)
                  }
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                    settings.autoSpeakName ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
                  }`}
                  title={settings.autoSpeakName ? 'Đang bật tự động đọc tên' : 'Đang tắt đọc tên'}
                >
                  <div className="bg-white w-4 h-4 rounded-full shadow-md transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
