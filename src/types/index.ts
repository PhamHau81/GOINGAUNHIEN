export interface Student {
  id: string;
  name: string;
  avatarSeed: number;
  callCount: number;
  lastCalledAt?: number;
  rankTitle?: string;
}

export interface ClassRoom {
  id: string;
  name: string;
  grade: 10 | 11 | 12;
  students: Student[];
  note?: string;
  createdAt: number;
}

export type AnswerKey = 'A' | 'B' | 'C' | 'D';

export interface QuestionOption {
  key: AnswerKey;
  text: string;
}

export type PlanetType =
  | 'sun'
  | 'mercury'
  | 'venus'
  | 'earth'
  | 'mars'
  | 'jupiter'
  | 'saturn'
  | 'uranus'
  | 'neptune'
  | 'moon'
  | 'asteroid'
  | 'supernova'
  | 'comet'
  | 'blackhole';

export interface Question {
  id: string;
  number: number;
  planetName: string;
  planetType: PlanetType;
  title: string;
  options: QuestionOption[];
  correctAnswer: AnswerKey;
  explanation?: string;
  points: number;
  isAnswered: boolean;
  // Metadata for KNTT Math Curriculum
  grade?: 10 | 11 | 12;
  subject?: string;
  curriculum?: string;
  chapterNumber?: number;
  chapterTitle?: string;
  lessonNumber?: number;
  lessonTitle?: string;
}

export type AnswerStatus = 'CORRECT' | 'WRONG' | 'TIMEOUT' | 'SKIPPED';

export interface AnswerRecord {
  id: string;
  classId?: string;
  className?: string;
  studentId: string;
  studentName: string;
  questionId: string;
  questionNumber: number;
  questionTitle: string;
  selectedAnswer: AnswerKey | 'TIMEOUT' | 'SKIPPED';
  correctAnswer: AnswerKey;
  status: AnswerStatus;
  timeSpentSeconds: number;
  maxTimeAllowed: number;
  pointsEarned: number;
  timestamp: number;
  formattedTime: string;
}

export interface AppSettings {
  scanDurationSeconds: number;
  questionDurationSeconds: number;
  soundEnabled: boolean;
  soundVolume: number;
  ambientSoundEnabled: boolean;
  autoSpeakName: boolean;
  callMode?: 'radar' | 'wheel';
}

export type ActiveTab = 'scanner' | 'missions' | 'report' | 'settings';

export interface MathLessonItem {
  id: string;
  lessonNumber: number;
  lessonTitle: string;
  questions: Question[];
}

export interface MathChapterItem {
  id: string;
  chapterNumber: number;
  chapterTitle: string;
  volume: 1 | 2;
  lessons: MathLessonItem[];
}

export interface MathGradeItem {
  grade: 10 | 11 | 12;
  gradeTitle: string;
  chapters: MathChapterItem[];
}
