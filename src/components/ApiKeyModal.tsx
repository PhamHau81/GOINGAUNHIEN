import React, { useState, useEffect } from 'react';
import {
  X,
  Key,
  ExternalLink,
  Check,
  AlertCircle,
  Cpu,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import {
  AVAILABLE_MODELS,
  getStoredApiKey,
  setStoredApiKey,
  getStoredModel,
  setStoredModel,
} from '../utils/geminiAi';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved?: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  onKeySaved,
}) => {
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-3-flash-preview');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [testStatus, setTestStatus] = useState<
    'idle' | 'testing' | 'success' | 'error'
  >('idle');
  const [testMessage, setTestMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setApiKey(getStoredApiKey());
      setSelectedModel(getStoredModel());
      setSavedSuccess(false);
      setTestStatus('idle');
      setTestMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    setStoredApiKey(apiKey);
    setStoredModel(selectedModel);
    setSavedSuccess(true);
    if (onKeySaved) onKeySaved();
    setTimeout(() => {
      onClose();
    }, 800);
  };

  const handleTestKey = async () => {
    if (!apiKey.trim()) {
      setTestStatus('error');
      setTestMessage('Vui lòng nhập API Key trước khi kiểm tra.');
      return;
    }

    setTestStatus('testing');
    setTestMessage('Đang kết nối thử nghiệm với Google Gemini API...');

    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey.trim()}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Trả lời đúng 1 chữ: OK' }] }],
        }),
      });

      if (res.ok) {
        setTestStatus('success');
        setTestMessage('Kết nối thành công! API Key hoạt động hoàn hảo.');
      } else {
        const data = await res.json().catch(() => ({}));
        setTestStatus('error');
        setTestMessage(
          data.error?.message || `Lỗi kết nối HTTP ${res.status}: ${res.statusText}`
        );
      }
    } catch (e: any) {
      setTestStatus('error');
      setTestMessage(e.message || 'Không thể gửi yêu cầu kiểm tra.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-[#090d24] border border-cyan-500/40 rounded-3xl p-6 sm:p-7 shadow-[0_0_50px_rgba(6,182,212,0.3)] text-slate-100 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/30">
            <Key className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold font-['Orbitron'] text-cyan-200">
              CÀI ĐẶT GEMINI AI & API KEY
            </h3>
            <p className="text-xs text-slate-400 font-['Rajdhani']">
              Tự động hóa sinh câu hỏi trắc nghiệm thông minh theo bài học
            </p>
          </div>
        </div>

        {/* Mandatory notice if no key */}
        {!getStoredApiKey() && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2.5 font-['Rajdhani'] font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>
              BẮT BUỘC NHẬP KEY: Vui lòng nhập API Key để sử dụng các tính năng thông minh của app. Nhấn vào link bên dưới để lấy key miễn phí từ Google!
            </span>
          </div>
        )}

        {/* Model Selection Cards */}
        <div className="space-y-2 mb-5">
          <label className="text-xs font-bold font-['Orbitron'] text-slate-300 flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-cyan-400" />
            CHỌN MODEL AI (TỰ ĐỘNG FALLBACK KHI QUÁ TẢI)
          </label>
          <div className="grid grid-cols-1 gap-2.5">
            {AVAILABLE_MODELS.map((m) => {
              const isSelected = selectedModel === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedModel(m.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-cyan-950/60 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] text-cyan-100'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                        isSelected
                          ? 'border-cyan-400 bg-cyan-400'
                          : 'border-slate-600'
                      }`}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-semibold font-['Orbitron'] text-slate-200">
                        {m.id}
                      </div>
                      <div className="text-[11px] text-slate-400 font-['Rajdhani']">
                        {m.name}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      m.tag === 'Khuyên dùng'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : m.tag === 'Nâng cao'
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {m.tag}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* API Key Input */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold font-['Orbitron'] text-slate-300">
              GOOGLE GEMINI API KEY
            </label>
            <a
              href="https://aistudio.google.com/api-keys"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold underline underline-offset-2 animate-pulse"
            >
              <span>Lấy API key miễn phí tại đây</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="relative">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Dán mã AIzaSy... của bạn vào đây"
              className="w-full px-4 py-3 bg-slate-950/80 border border-slate-700 focus:border-cyan-400 rounded-xl text-sm font-mono text-slate-200 outline-none transition-all placeholder:text-slate-600"
            />
            {apiKey && (
              <span className="absolute right-3 top-3.5 text-xs text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" />
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 font-['Rajdhani']">
            🔒 Key được lưu trữ trực tiếp trên trình duyệt của bạn (Local Storage) và chỉ gửi trực tiếp đến máy chủ Google API.
          </p>
        </div>

        {/* Test Result Feedback */}
        {testStatus !== 'idle' && (
          <div
            className={`p-3 rounded-xl mb-4 text-xs font-['Rajdhani'] flex items-start gap-2.5 ${
              testStatus === 'testing'
                ? 'bg-cyan-950/40 border border-cyan-500/40 text-cyan-300'
                : testStatus === 'success'
                ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/40 border border-rose-500/40 text-rose-300'
            }`}
          >
            {testStatus === 'testing' ? (
              <Sparkles className="w-4 h-4 animate-spin shrink-0 mt-0.5" />
            ) : testStatus === 'success' ? (
              <Check className="w-4 h-4 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            )}
            <span>{testMessage}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            onClick={handleTestKey}
            disabled={testStatus === 'testing'}
            className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-['Orbitron'] font-bold transition-all disabled:opacity-50"
          >
            {testStatus === 'testing' ? 'Đang kiểm tra...' : 'Kiểm tra Key'}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white text-xs font-['Orbitron'] font-bold transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold font-['Orbitron'] text-xs tracking-wider shadow-lg shadow-cyan-500/30 transition-all flex items-center gap-2"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Đã lưu!</span>
                </>
              ) : (
                <span>LƯU CÀI ĐẶT</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
