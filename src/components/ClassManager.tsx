import React, { useState } from 'react';
import { ClassRoom, Student } from '../types';
import { parseStudentsFromText, DEFAULT_STUDENTS_TEXT } from '../data/defaultData';
import {
  Users,
  GraduationCap,
  Plus,
  Edit2,
  Trash2,
  Check,
  CheckCircle2,
  Copy,
  BookOpen,
  Calendar,
  Sparkles,
  X,
  Save,
  Search,
} from 'lucide-react';

interface ClassManagerProps {
  classes: ClassRoom[];
  activeClassId: string;
  onSelectClass: (classId: string) => void;
  onCreateClass: (newClass: ClassRoom) => void;
  onUpdateClass: (updatedClass: ClassRoom) => void;
  onDeleteClass: (classId: string) => void;
}

export const ClassManager: React.FC<ClassManagerProps> = ({
  classes,
  activeClassId,
  onSelectClass,
  onCreateClass,
  onUpdateClass,
  onDeleteClass,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClassId, setEditingClassId] = useState<string | null>(null);

  const [formName, setFormName] = useState('');
  const [formGrade, setFormGrade] = useState<10 | 11 | 12>(10);
  const [formNote, setFormNote] = useState('');
  const [formStudentsText, setFormStudentsText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const activeClass = classes.find((c) => c.id === activeClassId) || classes[0];

  const handleOpenCreate = () => {
    setEditingClassId(null);
    setFormName(`Lớp ${formGrade}A${classes.length + 1}`);
    setFormGrade(10);
    setFormNote('');
    setFormStudentsText(DEFAULT_STUDENTS_TEXT);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: ClassRoom) => {
    setEditingClassId(c.id);
    setFormName(c.name);
    setFormGrade(c.grade);
    setFormNote(c.note || '');
    setFormStudentsText(c.students.map((s) => s.name).join('\n'));
    setIsModalOpen(true);
  };

  const handleDuplicate = (c: ClassRoom) => {
    const newClass: ClassRoom = {
      id: `class-${Date.now()}`,
      name: `${c.name} (Bản sao)`,
      grade: c.grade,
      students: c.students.map((s) => ({ ...s, callCount: 0 })),
      note: c.note ? `${c.note} (Sao chép)` : 'Bản sao',
      createdAt: Date.now(),
    };
    onCreateClass(newClass);
  };

  const handleSave = () => {
    if (!formName.trim()) {
      alert('Vui lòng nhập tên lớp học!');
      return;
    }

    const students = parseStudentsFromText(formStudentsText);
    if (students.length === 0) {
      alert('Vui lòng nhập ít nhất 1 học sinh cho lớp học!');
      return;
    }

    if (editingClassId) {
      // Edit existing
      const existing = classes.find((c) => c.id === editingClassId);
      if (existing) {
        const updated: ClassRoom = {
          ...existing,
          name: formName.trim(),
          grade: formGrade,
          note: formNote.trim(),
          students,
        };
        onUpdateClass(updated);
      }
    } else {
      // Create new
      const newClass: ClassRoom = {
        id: `class-${Date.now()}`,
        name: formName.trim(),
        grade: formGrade,
        note: formNote.trim(),
        students,
        createdAt: Date.now(),
      };
      onCreateClass(newClass);
    }

    setIsModalOpen(false);
  };

  const filteredClasses = classes.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.note && c.note.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-5 backdrop-blur-md space-y-5">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold font-['Orbitron'] text-slate-200">
              QUẢN LÝ NHIỀU LỚP HỌC (DANH SÁCH LỚP)
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-[10px] font-bold text-cyan-300 font-['Rajdhani']">
              {classes.length} Lớp Đã Lưu
            </span>
          </div>
          <p className="text-xs text-slate-400 font-['Rajdhani'] mt-0.5">
            Lưu danh sách riêng cho từng lớp (10A1, 10A2, 11B, 12A...) và chuyển lớp giảng dạy chỉ bằng 1 cú nhấp chuột
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold font-['Orbitron'] text-xs tracking-wider transition-all hover:scale-105 active:scale-95 shadow-md shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>THÊM LỚP MỚI</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative w-full max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm lớp học theo tên hoặc ghi chú..."
          className="w-full bg-slate-950/80 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-['Plus_Jakarta_Sans']"
        />
      </div>

      {/* Grid of Saved Classes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClasses.map((classroom) => {
          const isActive = classroom.id === activeClassId;

          return (
            <div
              key={classroom.id}
              className={`relative flex flex-col justify-between p-4 rounded-2xl border transition-all ${
                isActive
                  ? 'bg-gradient-to-b from-cyan-950/60 to-slate-900 border-cyan-400/80 shadow-[0_0_20px_rgba(6,182,212,0.25)] ring-1 ring-cyan-400/50'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Top Row: Grade Badge and Status */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-0.5 rounded-lg bg-indigo-950/80 text-indigo-300 border border-indigo-500/40 text-[10px] font-bold font-['Orbitron']">
                    KHỐI {classroom.grade}
                  </span>

                  {isActive ? (
                    <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-['Rajdhani'] font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>ĐANG CHỌN DẠY</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => onSelectClass(classroom.id)}
                      className="px-2.5 py-0.5 rounded-lg bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-300 text-[10px] font-['Orbitron'] font-bold transition-all"
                    >
                      CHỌN LỚP NÀY
                    </button>
                  )}
                </div>

                {/* Class Name */}
                <h4 className="text-base font-bold font-['Orbitron'] text-slate-100 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-cyan-400" />
                  <span>{classroom.name}</span>
                </h4>

                {/* Note */}
                {classroom.note && (
                  <p className="text-xs text-slate-400 font-['Rajdhani'] mt-1 line-clamp-2">
                    {classroom.note}
                  </p>
                )}

                {/* Student Count */}
                <div className="flex items-center gap-2 mt-3 text-xs text-cyan-300 font-['Rajdhani'] font-semibold">
                  <Users className="w-3.5 h-3.5 text-cyan-400" />
                  <span>
                    Sĩ số: <strong className="text-white font-['Orbitron']">{classroom.students.length}</strong> học sinh
                  </span>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="flex items-center justify-between pt-3 mt-4 border-t border-slate-800/80">
                <button
                  onClick={() => onSelectClass(classroom.id)}
                  className={`text-xs font-['Orbitron'] font-bold py-1 px-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-cyan-500 text-slate-950 shadow-sm'
                      : 'bg-slate-800 text-slate-300 hover:text-cyan-300'
                  }`}
                >
                  {isActive ? 'ĐANG HOẠT ĐỘNG' : 'CHỌN DẠY LỚP NÀY'}
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleDuplicate(classroom)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200"
                    title="Nhân bản lớp học"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleOpenEdit(classroom)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300"
                    title="Chỉnh sửa danh sách và tên lớp"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  {classes.length > 1 && (
                    <button
                      onClick={() => {
                        if (confirm(`Bạn có chắc muốn xóa lớp ${classroom.name}?`)) {
                          onDeleteClass(classroom.id);
                        }
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400"
                      title="Xóa lớp học"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create / Edit Class Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xl animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#090e28] via-[#06091d] to-[#030511] border-2 border-cyan-500/40 rounded-3xl p-5 sm:p-7 shadow-[0_0_60px_rgba(6,182,212,0.25)] space-y-4 my-auto">
            {/* Close */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold font-['Orbitron'] text-cyan-200">
                  {editingClassId ? 'CHỈNH SỬA LỚP HỌC' : 'THÊM LỚP HỌC MỚI'}
                </h3>
                <p className="text-xs text-slate-400 font-['Rajdhani']">
                  Nhập tên lớp, khối lớp và danh sách học sinh (mỗi bạn 1 dòng)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-['Rajdhani'] font-semibold text-slate-300 mb-1">
                  Tên lớp học:
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ví dụ: Lớp 10A2, Lớp 11B3..."
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 text-slate-200 text-xs focus:outline-none font-['Plus_Jakarta_Sans'] font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-['Rajdhani'] font-semibold text-slate-300 mb-1">
                  Khối lớp THPT:
                </label>
                <select
                  value={formGrade}
                  onChange={(e) => setFormGrade(Number(e.target.value) as 10 | 11 | 12)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none font-['Orbitron'] font-semibold"
                >
                  <option value={10}>Khối 10 (Toán 10 KNTT)</option>
                  <option value={11}>Khối 11 (Toán 11 KNTT)</option>
                  <option value={12}>Khối 12 (Toán 12 KNTT)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-['Rajdhani'] font-semibold text-slate-300 mb-1">
                Ghi chú lớp học (tùy chọn):
              </label>
              <input
                type="text"
                value={formNote}
                onChange={(e) => setFormNote(e.target.value)}
                placeholder="Ví dụ: Lớp chọn tự nhiên, Tiết 2 Thứ Ba..."
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 text-slate-200 text-xs focus:outline-none font-['Plus_Jakarta_Sans']"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-['Rajdhani'] font-semibold text-slate-300">
                  Danh sách học sinh (mỗi bạn 1 dòng):
                </label>
                <div className="flex items-center gap-2">
                  <label className="text-[11px] text-cyan-400 hover:text-cyan-300 cursor-pointer font-['Rajdhani'] font-semibold flex items-center gap-1 bg-cyan-950/60 border border-cyan-800 px-2 py-0.5 rounded-lg">
                    <span>Tải file (.txt/.csv)</span>
                    <input
                      type="file"
                      accept=".txt,.csv"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const content = event.target?.result as string;
                            if (content) {
                              const cleanNames = content
                                .split(/[\r\n]+/)
                                .map((line) => line.replace(/^[\d\s.,\-)\t]+/, '').trim())
                                .filter((name) => name.length > 0)
                                .join('\n');
                              setFormStudentsText(cleanNames);
                            }
                          };
                          reader.readAsText(file);
                        }
                      }}
                    />
                  </label>
                  <span className="text-[11px] text-cyan-400 font-['Rajdhani'] font-semibold">
                    {formStudentsText.split('\n').filter((l) => l.trim()).length} học sinh
                  </span>
                </div>
              </div>
              <textarea
                rows={8}
                value={formStudentsText}
                onChange={(e) => setFormStudentsText(e.target.value)}
                placeholder="Nguyễn Văn A&#10;Trần Thị B&#10;Lê Văn C..."
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 focus:outline-none text-slate-200 font-mono text-xs leading-relaxed"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setFormStudentsText(DEFAULT_STUDENTS_TEXT)}
                className="text-xs text-slate-400 hover:text-cyan-300 font-['Rajdhani']"
              >
                + Điền 30 bạn mẫu
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs font-['Rajdhani']"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold font-['Orbitron'] text-xs tracking-wider transition-all shadow-md shadow-cyan-500/30"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingClassId ? 'LƯU THAY ĐỔI' : 'TẠO LỚP HỌC'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
