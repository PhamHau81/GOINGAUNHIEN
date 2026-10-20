// Web Speech API Voice synthesis helper with authentic Vietnamese Male Voice optimization

export interface SpeechOptions {
  volume?: number;
  rate?: number;
  pitch?: number;
  delayMs?: number;
}

class SpeechController {
  private synth: SpeechSynthesis | null = null;
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private isNativeMaleVoice: boolean = false;
  private isSupported: boolean = false;
  private activeUtterance: SpeechSynthesisUtterance | null = null;
  private delayTimer: number | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.isSupported = true;
      this.initVoices();

      // Listen for voiceschanged event (Chrome / Edge loads voices asynchronously)
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.initVoices();
      }
      window.speechSynthesis?.addEventListener('voiceschanged', () => this.initVoices());
    }
  }

  /**
   * Scan available browser voices and pick the best Vietnamese Male voice
   */
  public initVoices(): void {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    if (!voices || voices.length === 0) return;

    // 1. Filter Vietnamese voices (vi-VN, vi)
    const viVoices = voices.filter(
      (v) =>
        v.lang === 'vi-VN' ||
        v.lang === 'vi_VN' ||
        v.lang.toLowerCase().startsWith('vi') ||
        v.name.toLowerCase().includes('vietnam')
    );

    // 2. Look for explicit Male Vietnamese voice (e.g. Microsoft Nam, Microsoft An, Google Male, vi-vn-x-vic)
    const explicitMaleVoice = viVoices.find((v) => {
      const lower = v.name.toLowerCase();
      const isExcludedFemale =
        lower.includes('hoaimy') ||
        lower.includes('linh') ||
        lower.includes('female') ||
        lower.includes('nu') ||
        lower.includes('nữ') ||
        lower.includes('woman') ||
        lower.includes('girl');

      const isMaleIndicator =
        lower.includes('nam') ||
        lower.includes('an ') ||
        lower.includes('male') ||
        lower.includes('man') ||
        lower.includes('vic') ||
        lower.includes('boy');

      return isMaleIndicator && !isExcludedFemale;
    });

    if (explicitMaleVoice) {
      this.selectedVoice = explicitMaleVoice;
      this.isNativeMaleVoice = true;
      return;
    }

    // 3. If any Vietnamese voice exists (e.g. Google tiếng Việt, Microsoft HoaiMy)
    // We will apply male pitch calibration (pitch = 0.80) to render a masculine baritone
    if (viVoices.length > 0) {
      this.selectedVoice = viVoices[0];
      this.isNativeMaleVoice = false;
      return;
    }

    // 4. Fallback: Any available browser voice
    const fallbackMale = voices.find((v) =>
      v.name.toLowerCase().includes('male')
    );
    this.selectedVoice = fallbackMale || voices[0] || null;
    this.isNativeMaleVoice = false;
  }

  /**
   * Clean and normalize student name for accurate Vietnamese pronunciation
   */
  public cleanStudentName(rawName: string): string {
    if (!rawName) return '';
    return rawName
      .replace(/^\s*\d+[\.\)\/\-:\s]+/g, '') // Remove prefixes like "01. ", "1/ "
      .replace(/\s*\([^)]*\)/g, '') // Remove parenthesized notes like "(lớp trưởng)"
      .replace(/\s*\[[^\]]*\]/g, '') // Remove brackets like "[vắng]"
      .replace(/[_\-*#]/g, '')
      .trim();
  }

  /**
   * Speak arbitrary text with male voice tuning and anti-collision delay
   */
  public speak(text: string, options?: SpeechOptions): void {
    if (!this.isSupported || !this.synth) return;

    if (this.delayTimer) {
      window.clearTimeout(this.delayTimer);
      this.delayTimer = null;
    }

    const executeSpeak = () => {
      try {
        if (!this.selectedVoice) {
          this.initVoices();
        }

        // Chrome safety: cancel pending speech and ensure synth is resumed
        this.synth?.cancel();
        if (this.synth?.paused) {
          this.synth.resume();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        this.activeUtterance = utterance; // Prevent garbage collection in Chrome

        if (this.selectedVoice) {
          utterance.voice = this.selectedVoice;
          utterance.lang = this.selectedVoice.lang || 'vi-VN';
        } else {
          utterance.lang = 'vi-VN';
        }

        utterance.volume = options?.volume ?? 1.0;

        // Rate: 0.88 - 0.92 provides crisp, distinct tonal pronunciation for Vietnamese names
        utterance.rate = options?.rate ?? 0.89;

        // Pitch calibration:
        // If native male voice: pitch 0.95
        // If female/generic voice: pitch 0.78 creates an authentic, deep, warm male announcer voice
        const defaultMalePitch = this.isNativeMaleVoice ? 0.95 : 0.78;
        utterance.pitch = options?.pitch ?? defaultMalePitch;

        utterance.onend = () => {
          this.activeUtterance = null;
        };

        utterance.onerror = () => {
          this.activeUtterance = null;
        };

        this.synth?.speak(utterance);
      } catch {
        // Safe catch if browser blocks audio autoplay
      }
    };

    const delay = options?.delayMs ?? 0;
    if (delay > 0) {
      this.delayTimer = window.setTimeout(executeSpeak, delay);
    } else {
      executeSpeak();
    }
  }

  /**
   * Announce selected student name using clear male phrasing and deliberate punctuation pause
   */
  public speakStudentCall(
    studentName: string,
    callCount: number = 0,
    delayMs: number = 380
  ): void {
    const cleanName = this.cleanStudentName(studentName);
    if (!cleanName) return;

    // Templates formatted with a comma pause before the name
    // The comma gives TTS a natural breath, making the student's name pronounced with high clarity & proper tone
    const templates = [
      `Xin mời bạn, ${cleanName}.`,
      `Chúc mừng bạn, ${cleanName}! Mời em trả lời câu hỏi.`,
      `Người được chọn là bạn, ${cleanName}.`,
      `Xin mời phi hành gia, ${cleanName}, bắt đầu nhiệm vụ!`,
      `Mời bạn, ${cleanName}.`,
    ];

    const phrase = templates[Math.floor(Math.random() * templates.length)];

    // 380ms delay ensures sound effects (target locked chime) don't drown out the speech
    this.speak(phrase, {
      volume: 1.0,
      rate: 0.89,
      delayMs,
    });
  }

  /**
   * Test male voice pronunciation
   */
  public testMaleVoice(): void {
    this.speak('Xin mời bạn, Nguyễn Hoàng Nam.', {
      volume: 1.0,
      rate: 0.89,
      delayMs: 100,
    });
  }

  /**
   * Get current voice status for debugging or UI display
   */
  public getVoiceInfo(): { name: string; isMale: boolean; lang: string } {
    if (!this.selectedVoice) {
      this.initVoices();
    }
    return {
      name: this.selectedVoice ? this.selectedVoice.name : 'Giọng mặc định hệ thống',
      isMale: true,
      lang: this.selectedVoice ? this.selectedVoice.lang : 'vi-VN',
    };
  }

  public cancel(): void {
    if (this.delayTimer) {
      window.clearTimeout(this.delayTimer);
      this.delayTimer = null;
    }
    if (this.synth) {
      this.synth.cancel();
      this.activeUtterance = null;
    }
  }
}

export const speechController = new SpeechController();
