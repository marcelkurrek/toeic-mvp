export type Plan = 'FREE' | 'PRO'
export type SessionMode = 'FULL_EXAM' | 'PART_PRACTICE' | 'ADAPTIVE'
export type QuestionType =
  | 'INCOMPLETE_SENTENCE'
  | 'TEXT_COMPLETION'
  | 'SINGLE_PASSAGE'
  | 'DOUBLE_PASSAGE'
  | 'TRIPLE_PASSAGE'

export interface Question {
  id: string
  part: number
  type: QuestionType
  content: QuestionContent
  options: string[] | null
  answer: string
  explanation: string | null
  difficulty: number
  tags: string[]
}

export interface QuestionContent {
  text?: string
  passage?: string
  passages?: string[]
  imageUrl?: string
  question: string
  blanks?: number
}

export interface Answer {
  questionId: string
  userAnswer: string
  isCorrect: boolean
  timeSpentSec: number
}

export interface SessionResult {
  sessionId: string
  score: number
  maxScore: number
  accuracy: number
  durationSec: number
  answers: AnswerWithQuestion[]
}

export interface AnswerWithQuestion extends Answer {
  question: Question
  aiFeedback?: string
}

export interface ProgressData {
  part: number
  accuracy: number
  avgTime: number
  sampleSize: number
}

export interface User {
  id: string
  email: string
  name: string | null
  targetScore: number | null
  examDate: string | null
}
