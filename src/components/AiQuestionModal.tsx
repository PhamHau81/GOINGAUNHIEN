import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Bot,
  AlertCircle,
  CheckCircle2,
  ListPlus,
  Key,
  BookOpen,
  StopCircle,
  Check,
  Calculator,
} from 'lucide-react';
import { Question } from '../types';
import {
  generateQuestionsWithGemini,
  getStoredApiKey,
} from '../utils/geminiAi';
import { MathRenderer } from './MathRenderer';

interface AiQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddQuestions: (newQuestions: Question[]) => void;
  onOpenApiKeyModal: () => void;
}

type StepStatus = 'pending' | 'processing' | 'success' | 'error';

const SAMPLE_TOPICS = [
  { label: '📐 Toán 10: Hệ thức lượng tam giác', topic: 'Toán 10: Hệ thức lượng trong tam giác, định lí sin, định lí cosin', grade: 'Lớp 10' },
  { label: '📈 Toán 10: Bất PT bậc nhất 2 ẩn', topic: 'Toán 10: Bất phương trình và hệ bất phương trình bậc nhất hai ẩn', grade: 'Lớp 10' },
  { label: '📊 Toán 11: Cấp số cộng & nhân', topic: 'Toán 11: Dãy số, cấp số cộng và cấp số nhân', grade: 'Lớp 11' },
  { label: '📉 Toán 12: Khảo sát hàm số', topic: 'Toán 12: Tính đơn điệu, cực trị và tiệm cận của đồ thị hàm số', grade: 'Lớp 12' },
];

export const AiQuestionModal: React.FC<AiQuestionModalProps> = ({
  isOpen,
  onClose,
  onAddQuestions,
  onOpenApiKeyModal,
}) => {
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState<number>(5);
  const [grade, setGrade] = useState('Lớp 10');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const [successInfo, setSuccessInfo] = useState('');

  // 3-step progress tracking according to AI_INSTRUCTIONS.md
  const [step1Status, setStep1Status] = useState<StepStatus>('pending');
  const [step2Status, setStep2Status] = useState<StepStatus>('pending');
  const [step3Status, setStep3Status] = useState<StepStatus>('pending');
  const [progressPercent, setProgressPercent] = useState<number>(0);

  if (!isOpen) return null;

  const currentKey = getStoredApiKey();

  const handleSelectSample = (sample: typeof SAMPLE_TOPICS[0]) => {
    setTopic(sample.topic);
    setGrade(sample.grade);
  };

  const handleGenerate = async () => {
    if (!currentKey) {
      setErrorMsg('Vui lòng cài đặt Gemini API Key trước khi sử dụng tính năng này.');
      return;
    }

    if (!topic.trim()) {
      setErrorMsg('Vui lòng nhập chủ đề hoặc tên bài học cần tạo câu hỏi.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setSuccessInfo('');
    setGeneratedQuestions([]);

    // Step 1: Connecting & Model Initialization
    setStep1Status('processing');
    setStep2Status('pending');
    setStep3Status('pending');
    setProgressPercent(25);

    await new Promise((r) => setTimeout(r, 400));

    // Step 2: Processing Content
    setStep1Status('success');
    setStep2Status('processing');
    setProgressPercent(60);

    const fullPrompt = `${topic} (Trình độ: ${grade}, định dạng công thức toán chuẩn MathType / LaTeX)`;
    const res = await generateQuestionsWithGemini(fullPrompt, count);

    setIsLoading(false);

    if (res.success && res.questions && res.questions.length > 0) {
      // Step 2 completed, Step 3 completed successfully
      setStep2Status('success');
      setStep3Status('success');
      setProgressPercent(100);

      setGeneratedQuestions(res.questions);
      setSuccessInfo(
        `Đã tạo thành công ${res.questions.length} câu hỏi bằng model ${res.usedModel} (hỗ trợ MathType)!`
      );
    } else {
      // Failed: In accordance with AI_INSTRUCTIONS.md
      // Trạng thái các cột đang chờ phải chuyển thành "Đã dừng do lỗi", tuyệt đối không được hiện "Hoàn tất" hoặc checkmark xanh
      setStep2Status('error');
      setStep3Status('error');
      setProgressPercent(40);

      setErrorMsg(
        res.error || 'Đã dừng do lỗi: Không thể tạo câu hỏi. Vui lòng kiểm tra lại API Key hoặc quota của bạn.'
      );
    }
  };

  const handleApplyQuestions = () => {
    if (generatedQuestions.length > 0) {
      onAddQuestions(generatedQuestions);
      onClose();
    }
  };

  const renderStepBadge = (status: StepStatus, label: string) => {
    if (status === 'success') {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs font-semibold">
          <Check className="w-3.5 h-3.5" />
          <span>{label}: Hoàn tất</span>
        </div>
      );
    }
    if (status === 'processing') {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/60 border border-cyan-500/50 text-cyan-300 text-xs font-semibold animate-pulse">
          <Sparkles className="w-3.5 h-3.5 animate-spin" />
          <span>{label}: Đang xử lý...</span>
        </div>
      );
    }
    if (status === 'error') {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/80 border border-rose-500/60 text-rose-300 text-xs font-bold">
          <StopCircle className="w-3.5 h-3.5" />
          <span>{label}: Đã dừng do lỗi</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 text-xs">
        <span className="w-2 h-2 rounded-full bg-slate-700" />
        <span>{label}: Đang chờ</span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#080c22] border border-cyan-500/40 rounded-3xl p-6 sm:p-7 shadow-[0_0_50px_rgba(6,182,212,0.3)] text-slate-100 my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-500 text-white shadow-lg shadow-purple-500/30">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold font-['Orbitron'] text-cyan-200">
              TRỢ LÝ AI SOẠN CÂU HỎI TRẮC NGHIỆM
            </h3>
            <p className="text-xs text-slate-400 font-['Rajdhani']">
              Tạo câu hỏi trắc nghiệm tự động bằng Google Gemini AI • Hỗ trợ chuẩn MathType / LaTeX
            </p>
          </div>
        </div>

        {/* MathType Support Highlight Pill */}
        <div className="mb-4 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-950/70 via-indigo-950/60 to-purple-950/70 border border-cyan-500/30 flex items-center gap-2.5 text-xs text-cyan-300">
          <Calculator className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            <strong className="font-semibold text-cyan-200">Chuẩn MathType:</strong> Tự động hiển thị công thức phân số, căn thức, số mũ, ma trận, véc-tơ, tập hợp... trực quan đẹp mắt!
          </span>
        </div>

        {/* API Key Warning if not configured */}
        {!currentKey && (
          <div className="mb-4 p-3 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>Chưa cài đặt Gemini API Key. Nhấn cài đặt để bắt đầu sử dụng miễn phí!</span>
            </div>
            <button
              onClick={onOpenApiKeyModal}
              className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold font-['Orbitron'] text-[10px] shrink-0 hover:bg-amber-400 transition-colors flex items-center gap-1"
            >
              <Key className="w-3 h-3" />
              CÀI KEY
            </button>
          </div>
        )}

        {/* Controls Form */}
        <div className="space-y-4 mb-5">
          <div>
            <label className="text-xs font-bold font-['Orbitron'] text-slate-300 mb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              CHỦ ĐỀ HOẶC TÊN BÀI HỌC CẦN SOẠN
            </label>
            <textarea
              rows={3}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="VD: Phương trình bậc hai một ẩn, Hệ thức lượng trong tam giác, Khảo sát hàm số, Ba định luật Newton..."
              className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-700 focus:border-cyan-400 rounded-xl text-sm text-slate-200 outline-none transition-all placeholder:text-slate-600 resize-none"
            />
          </div>

          {/* Quick sample topic pills */}
          <div>
            <span className="text-[11px] font-['Rajdhani'] font-semibold text-slate-400 block mb-1.5">
              Gợi ý chủ đề Toán nhanh:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_TOPICS.map((sample, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectSample(sample)}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-[11px] text-cyan-300 border border-slate-700 hover:border-cyan-500/50 transition-colors"
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold font-['Orbitron'] text-slate-300 mb-1.5 block">
                KHỐI LỚP / TRÌNH ĐỘ
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700 focus:border-cyan-400 rounded-xl text-sm text-slate-200 outline-none transition-all"
              >
                <option value="Lớp 6">Lớp 6 (THCS)</option>
                <option value="Lớp 7">Lớp 7 (THCS)</option>
                <option value="Lớp 8">Lớp 8 (THCS)</option>
                <option value="Lớp 9">Lớp 9 (THCS)</option>
                <option value="Lớp 10">Lớp 10 (THPT)</option>
                <option value="Lớp 11">Lớp 11 (THPT)</option>
                <option value="Lớp 12">Lớp 12 (Ôn thi THPTQG)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold font-['Orbitron'] text-slate-300 mb-1.5 block">
                SỐ LƯỢNG CÂU HỎI
              </label>
              <select
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700 focus:border-cyan-400 rounded-xl text-sm text-slate-200 outline-none transition-all"
              >
                <option value={3}>3 câu hỏi nhanh</option>
                <option value={5}>5 câu hỏi tiêu chuẩn</option>
                <option value={8}>8 câu hỏi củng cố</option>
                <option value={10}>10 câu hỏi kiểm tra</option>
              </select>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isLoading || !topic.trim() || !currentKey}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold font-['Orbitron'] text-xs tracking-wider shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Sparkles className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>
              {isLoading
                ? 'AI ĐANG BIÊN SOẠN CÂU HỎI & CÔNG THỨC MATHTYPE...'
                : 'BẮT ĐẦU TẠO CÂU HỎI BẰNG GEMINI AI'}
            </span>
          </button>
        </div>

        {/* 3-Step Progress Indicators according to AI_INSTRUCTIONS.md */}
        {(isLoading || step1Status !== 'pending') && (
          <div className="p-4 mb-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-['Orbitron']">
              <span className="text-slate-400">TIẾN TRÌNH XỬ LÝ AI:</span>
              <span
                className={`font-bold ${
                  step2Status === 'error'
                    ? 'text-rose-400'
                    : progressPercent === 100
                    ? 'text-emerald-400'
                    : 'text-cyan-400'
                }`}
              >
                {step2Status === 'error'
                  ? 'Đã dừng do lỗi'
                  : `${progressPercent}%`}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  step2Status === 'error'
                    ? 'bg-rose-500'
                    : progressPercent === 100
                    ? 'bg-emerald-500'
                    : 'bg-gradient-to-r from-purple-500 to-cyan-500'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Steps Badges Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-['Rajdhani']">
              {renderStepBadge(step1Status, 'Bước 1')}
              {renderStepBadge(step2Status, 'Bước 2')}
              {renderStepBadge(step3Status, 'Bước 3')}
            </div>
          </div>
        )}

        {/* Error message (Plain verbatim text from API as required) */}
        {errorMsg && (
          <div className="p-3.5 mb-4 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs font-mono break-all flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <div>
              <div className="font-bold text-rose-200 mb-0.5">LỖI TỪ MÁY CHỦ GOOGLE API:</div>
              <span>{errorMsg}</span>
            </div>
          </div>
        )}

        {/* Success Preview */}
        {successInfo && (
          <div className="p-3 mb-4 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs font-['Rajdhani'] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successInfo}</span>
          </div>
        )}

        {/* Generated Questions List Preview with MathRenderer */}
        {generatedQuestions.length > 0 && (
          <div className="space-y-3 mb-5 max-h-64 overflow-y-auto pr-1">
            <div className="text-xs font-bold font-['Orbitron'] text-cyan-300">
              DANH SÁCH CÂU HỎI VỪA TẠO ({generatedQuestions.length}):
            </div>
            {generatedQuestions.map((q, idx) => (
              <div
                key={q.id}
                className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs space-y-2"
              >
                <div className="font-semibold text-slate-200">
                  <span className="text-cyan-400 font-['Orbitron'] mr-1.5">
                    Câu {idx + 1}:
                  </span>
                  <MathRenderer text={q.title} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-slate-300 text-[11px]">
                  {q.options.map((opt) => (
                    <div
                      key={opt.key}
                      className={`p-1.5 rounded-lg border ${
                        opt.key === q.correctAnswer
                          ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200 font-bold'
                          : 'bg-slate-950/40 border-slate-800 text-slate-400'
                      }`}
                    >
                      <span className="font-['Orbitron'] mr-1">{opt.key}.</span>
                      <MathRenderer text={opt.text} />
                    </div>
                  ))}
                </div>
                {q.explanation && (
                  <div className="text-[11px] text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 leading-relaxed">
                    💡 <span className="font-semibold text-cyan-300">Giải thích:</span>{' '}
                    <MathRenderer text={q.explanation} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-['Orbitron'] font-bold transition-colors"
          >
            Đóng
          </button>
          {generatedQuestions.length > 0 && (
            <button
              onClick={handleApplyQuestions}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold font-['Orbitron'] text-xs tracking-wider shadow-lg shadow-emerald-500/30 transition-all flex items-center gap-2"
            >
              <ListPlus className="w-4 h-4" />
              NẠP VÀO NGÂN HÀNG CÂU HỎI
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
