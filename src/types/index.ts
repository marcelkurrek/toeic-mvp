export type Section = 'LISTENING' | 'READING' | 'SPEAKING' | 'WRITING'
export type SessionMode = 'DIAGNOSTIC' | 'FULL_EXAM' | 'PART_PRACTICE' | 'ADAPTIVE'

export type QuestionType =
  | 'INCOMPLETE_SENTENCE'
  | 'TEXT_COMPLETION'
  | 'SINGLE_PASSAGE'
  | 'DOUBLE_PASSAGE'
  | 'TRIPLE_PASSAGE'
  | 'PHOTOGRAPH'
  | 'QUESTION_RESPONSE'
  | 'CONVERSATION'
  | 'TALK'
  | 'READ_ALOUD'
  | 'DESCRIBE_PICTURE'
  | 'RESPOND_FREE'
  | 'RESPOND_INFO'
  | 'EXPRESS_OPINION'
  | 'WRITE_SENTENCE'
  | 'RESPOND_EMAIL'
  | 'OPINION_ESSAY'

export interface Question {
  id: string
  section: Section
  part: number
  type: QuestionType
  content: Record<string, unknown>
  options: Record<string, string> | string[] | null
  answer: string
  explanation: string | null
  difficulty: number
  tags: string[]
  isDiagnostic: boolean
}

export interface Answer {
  questionId: string
  userAnswer: string
  isCorrect: boolean
  timeSpentSec: number
}

export interface AnswerWithQuestion extends Answer {
  question: Question
  aiFeedback?: string
}

export interface ProgressData {
  section: Section
  part: number
  type: QuestionType
  accuracy: number
  avgTime: number
  sampleSize: number
}

export interface User {
  id: string
  email: string
  name: string | null
  examType: string | null
  examDate: string | null
  diagnosticDone: boolean
}
