import { Question } from '../types';

export const GEMINI_STORAGE_KEYS = {
  API_KEY: 'cosmic_scholar_gemini_api_key_v1',
  SELECTED_MODEL: 'cosmic_scholar_gemini_model_v1',
};

export const AVAILABLE_MODELS = [
  {
    id: 'gemini-3-flash-preview',
    name: 'Gemini 3 Flash (Mặc định - Nhanh & Ổn định)',
    tag: 'Khuyên dùng',
  },
  {
    id: 'gemini-3-pro-preview',
    name: 'Gemini 3 Pro (Tư duy sâu & Đề nâng cao)',
    tag: 'Nâng cao',
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash (Dự phòng tốc độ cao)',
    tag: 'Dự phòng',
  },
];

export const getStoredApiKey = (): string => {
  try {
    return localStorage.getItem(GEMINI_STORAGE_KEYS.API_KEY) || '';
  } catch {
    return '';
  }
};

export const setStoredApiKey = (key: string): void => {
  try {
    localStorage.setItem(GEMINI_STORAGE_KEYS.API_KEY, key.trim());
  } catch {}
};

export const getStoredModel = (): string => {
  try {
    return (
      localStorage.getItem(GEMINI_STORAGE_KEYS.SELECTED_MODEL) ||
      'gemini-3-flash-preview'
    );
  } catch {
    return 'gemini-3-flash-preview';
  }
};

export const setStoredModel = (modelId: string): void => {
  try {
    localStorage.setItem(GEMINI_STORAGE_KEYS.SELECTED_MODEL, modelId);
  } catch {}
};

interface GenerateResult {
  success: boolean;
  questions?: Question[];
  error?: string;
  usedModel?: string;
}

/**
 * Bulletproof JSON parser for AI outputs that may contain MathType / LaTeX backslashes,
 * markdown backticks, leading/trailing explanations, or trailing commas.
 */
export function cleanAndParseAiQuestionsJson(rawText: string): any[] {
  if (!rawText || !rawText.trim()) return [];

  let str = rawText.trim();

  // 1. Extract JSON array block [ ... ] if surrounded by extra text
  const firstBracket = str.indexOf('[');
  const lastBracket = str.lastIndexOf(']');
  if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
    str = str.substring(firstBracket, lastBracket + 1);
  } else {
    // Strip markdown code fences if any
    str = str.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  }

  // 2. Try direct JSON parse first
  try {
    const direct = JSON.parse(str);
    if (Array.isArray(direct)) return direct;
  } catch {
    // Fall through to repair logic
  }

  // 3. Repair unescaped LaTeX backslashes and trailing commas
  // Remove trailing commas before closing braces/brackets
  let repaired = str.replace(/,\s*([\}\]])/g, '$1');

  // Protect valid JSON escapes
  repaired = repaired.replace(/\\\\/g, '__ESCAPED_SLASH__');
  repaired = repaired.replace(/\\"/g, '__ESCAPED_QUOTE__');
  repaired = repaired.replace(/\\\//g, '__ESCAPED_SLASH_FWD__');
  repaired = repaired.replace(/\\n/g, '__ESCAPED_N__');
  repaired = repaired.replace(/\\r/g, '__ESCAPED_R__');
  repaired = repaired.replace(/\\b/g, '__ESCAPED_B__');

  // Any remaining single backslash is an unescaped LaTeX backslash (e.g. \sqrt, \frac, \Delta, \in, \le)
  // Double it so JSON.parse won't crash with "Bad escaped character"
  repaired = repaired.replace(/\\/g, '\\\\');

  // Restore protected valid escapes
  repaired = repaired.replace(/__ESCAPED_QUOTE__/g, '\\"');
  repaired = repaired.replace(/__ESCAPED_SLASH_FWD__/g, '\\/');
  repaired = repaired.replace(/__ESCAPED_N__/g, '\\n');
  repaired = repaired.replace(/__ESCAPED_R__/g, '\\r');
  repaired = repaired.replace(/__ESCAPED_B__/g, '\\b');
  repaired = repaired.replace(/__ESCAPED_SLASH__/g, '\\\\');

  try {
    const parsed = JSON.parse(repaired);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // Fall through to regex extraction
  }

  // 4. Ultimate fallback: Regex object extractor
  const extractedQuestions: any[] = [];
  const objectRegex = /\{[\s\S]*?"title"[\s\S]*?"options"[\s\S]*?\}/g;
  let match: RegExpExecArray | null;

  while ((match = objectRegex.exec(str)) !== null) {
    try {
      let objStr = match[0].replace(/,\s*([\}\]])/g, '$1');
      objStr = objStr.replace(/\\/g, '\\\\').replace(/\\\\"/g, '\\"');
      const obj = JSON.parse(objStr);
      if (obj && obj.title) {
        extractedQuestions.push(obj);
      }
    } catch {
      // Continue to next match
    }
  }

  return extractedQuestions;
}

export async function generateQuestionsWithGemini(
  topic: string,
  count: number = 5,
  apiKeyParam?: string
): Promise<GenerateResult> {
  const apiKey = (apiKeyParam || getStoredApiKey()).trim();

  if (!apiKey) {
    return {
      success: false,
      error: 'Vui lòng nhập Gemini API Key để sử dụng tính năng tạo câu hỏi tự động bằng AI.',
    };
  }

  // Model fallback chain:
  // Starts with the preferred model, then tries the rest of AVAILABLE_MODELS,
  // and includes extended fallbacks to guarantee generation even with restrictive API tiers.
  const preferredModel = getStoredModel();
  const allCandidateModels = [
    preferredModel,
    'gemini-3-flash-preview',
    'gemini-3-pro-preview',
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
  ];
  const modelsToTry = Array.from(new Set(allCandidateModels));

  const prompt = `Bạn là một chuyên gia giáo dục biên soạn đề kiểm tra trắc nghiệm cho học sinh.
Hãy tạo ${count} câu hỏi trắc nghiệm chất lượng cao, bám sát chương trình về chủ đề sau:
"${topic}"

QUY TẮC CÔNG THỨC TOÁN MATHTYPE / LATEX (BẮT BUỘC):
- Tất cả công thức toán học, biểu thức đại số, hình học, số mũ, phân số, căn thức, góc, véc-tơ, tập hợp, bất đẳng thức, phương trình, hệ phương trình, ký hiệu toán học PHẢI được viết theo chuẩn MathType / LaTeX và đặt trong cặp dấu $...$ (ví dụ: $x^2 - 3x + 2 = 0$, $\\frac{a}{b}$, $\\sqrt{x}$, $\\Delta > 0$, $\\forall x \\in \\mathbb{R}$, $a \\le b$).
- QUY TẮC VỀ KÍ HIỆU VECTƠ (ĐẶC BIỆT CHÍNH XÁC THEO SGK VIỆT NAM):
  + Vectơ đi qua hai điểm (hai chữ cái in hoa như AB, CD, MN, AC): BẮT BUỘC dùng "\\\\overrightarrow{AB}", "\\\\overrightarrow{CD}" (TUYỆT ĐỐI KHÔNG dùng "\\\\vec{AB}" vì mũi tên sẽ bị cụt ngắn, không bao quát được hai chữ cái; và TUYỆT ĐỐI KHÔNG viết dạng chữ cái thường không có dấu mũi tên "AB").
  + Vectơ một chữ cái: dùng "\\\\vec{u}", "\\\\vec{v}", "\\\\vec{n}", "\\\\vec{a}", "\\\\vec{b}", "\\\\vec{0}".
  + Tích vô hướng của hai vectơ: dùng dấu chấm "\\\\cdot" (ví dụ: "\\\\vec{u} \\\\cdot \\vec{v}" hoặc "\\\\overrightarrow{AB} \\\\cdot \\\\overrightarrow{AC}").
  + Độ dài vectơ: đặt trong dấu giá trị tuyệt đối (ví dụ: "|\\\\vec{u}|", "|\\\\overrightarrow{AB}|").
- QUAN TRỌNG VỀ ĐỊNH DẠNG JSON: Trong chuỗi JSON, mọi dấu gạch chéo ngược (\\) của công thức LaTeX PHẢI ĐƯỢC ESCAPE thành hai dấu gạch chéo ngược (\\\\) (ví dụ: "\\\\frac{a}{b}", "\\\\sqrt{x}", "\\\\overrightarrow{AB}", "\\\\vec{u}", "\\\\Delta", "\\\\alpha", "\\\\in", "\\\\le").

YÊU CẦU ĐỊNH DẠNG BẮT BUỘC:
Trả về DUY NHẤT một mảng JSON thuần túy (không chứa markdown backticks, không kèm lời dẫn nào khác), cấu trúc mỗi phần tử như sau:
[
  {
    "title": "Nội dung câu hỏi (chứa công thức toán chuẩn MathType trong $...$ nếu có)",
    "options": [
      { "key": "A", "text": "Nội dung phương án A (chứa công thức toán $...$ nếu có)" },
      { "key": "B", "text": "Nội dung phương án B (chứa công thức toán $...$ nếu có)" },
      { "key": "C", "text": "Nội dung phương án C (chứa công thức toán $...$ nếu có)" },
      { "key": "D", "text": "Nội dung phương án D (chứa công thức toán $...$ nếu có)" }
    ],
    "correctAnswer": "A",
    "explanation": "Giải thích chi tiết các bước giải và áp dụng công thức toán chuẩn MathType trong $...$",
    "points": 100
  }
]
Đảm bảo đáp án đúng phân bổ đều giữa các lựa chọn A, B, C, D. Câu hỏi rõ ràng, chính xác khoa học, không tối nghĩa.`;

  let lastError = '';

  for (const model of modelsToTry) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192,
            responseMimeType: 'application/json',
          },
        }),
      });

      if (!response.ok) {
        // If 400 with responseMimeType issue, try without responseMimeType
        if (response.status === 400) {
          const fallbackRes = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 8192,
              },
            }),
          });

          if (fallbackRes.ok) {
            const fbData = await fallbackRes.json();
            const rawText =
              fbData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
            const parsed = cleanAndParseAiQuestionsJson(rawText);

            if (Array.isArray(parsed) && parsed.length > 0) {
              const formattedQuestions: Question[] = parsed.map((item, idx) => ({
                id: `ai-q-${Date.now()}-${idx + 1}`,
                number: idx + 1,
                planetName: `Câu số ${idx + 1}`,
                planetType: 'jupiter',
                title: item.title || `Câu hỏi số ${idx + 1}`,
                options: item.options || [
                  { key: 'A', text: 'Phương án A' },
                  { key: 'B', text: 'Phương án B' },
                  { key: 'C', text: 'Phương án C' },
                  { key: 'D', text: 'Phương án D' },
                ],
                correctAnswer: (item.correctAnswer || 'A').toUpperCase() as 'A' | 'B' | 'C' | 'D',
                explanation: item.explanation || 'Không có giải thích chi tiết.',
                points: item.points || 100,
                isAnswered: false,
              }));

              return {
                success: true,
                questions: formattedQuestions,
                usedModel: model,
              };
            }
          }
        }

        const errorData = await response.json().catch(() => ({}));
        const rawCode = errorData.error?.code || response.status;
        const rawStatus = errorData.error?.status || `HTTP_${response.status}`;
        const rawMessage = errorData.error?.message || response.statusText;
        lastError = `${rawCode} ${rawStatus}: ${rawMessage}`;
        continue; // Try next fallback model
      }

      const data = await response.json();
      const rawText =
        data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

      const parsed = cleanAndParseAiQuestionsJson(rawText);

      if (Array.isArray(parsed) && parsed.length > 0) {
        const formattedQuestions: Question[] = parsed.map((item, idx) => ({
          id: `ai-q-${Date.now()}-${idx + 1}`,
          number: idx + 1,
          planetName: `Câu số ${idx + 1}`,
          planetType: 'jupiter',
          title: item.title || `Câu hỏi số ${idx + 1}`,
          options: item.options || [
            { key: 'A', text: 'Phương án A' },
            { key: 'B', text: 'Phương án B' },
            { key: 'C', text: 'Phương án C' },
            { key: 'D', text: 'Phương án D' },
          ],
          correctAnswer: (item.correctAnswer || 'A').toUpperCase() as 'A' | 'B' | 'C' | 'D',
          explanation: item.explanation || 'Không có giải thích chi tiết.',
          points: item.points || 100,
          isAnswered: false,
        }));

        return {
          success: true,
          questions: formattedQuestions,
          usedModel: model,
        };
      } else {
        lastError = `[Model ${model}]: AI không trả về dữ liệu câu hỏi hợp lệ.`;
      }
    } catch (err: any) {
      lastError = `[Model ${model}]: ${err.message || String(err)}`;
    }
  }

  return {
    success: false,
    error:
      lastError ||
      'Không thể tạo câu hỏi. Vui lòng kiểm tra lại API Key hoặc quota của bạn.',
  };
}
