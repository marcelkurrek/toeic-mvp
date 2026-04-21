import { create } from 'zustand'
import type { Question, Answer } from '@/types'

interface ExamState {
  questions: Question[]
  currentIndex: number
  answers: Answer[]
  startTime: number | null
  questionStartTime: number | null
  isFinished: boolean

  setQuestions: (questions: Question[]) => void
  submitAnswer: (questionId: string, userAnswer: string) => void
  nextQuestion: () => void
  finishExam: () => void
  reset: () => void
}

export const useExamStore = create<ExamState>((set, get) => ({
  questions: [],
  currentIndex: 0,
  answers: [],
  startTime: null,
  questionStartTime: null,
  isFinished: false,

  setQuestions: (questions) =>
    set({ questions, currentIndex: 0, answers: [], startTime: Date.now(), questionStartTime: Date.now(), isFinished: false }),

  submitAnswer: (questionId, userAnswer) => {
    const { questions, currentIndex, answers, questionStartTime } = get()
    const question = questions[currentIndex]
    const timeSpentSec = questionStartTime ? Math.round((Date.now() - questionStartTime) / 1000) : 0
    const isCorrect = question.answer === userAnswer

    set({
      answers: [...answers, { questionId, userAnswer, isCorrect, timeSpentSec }],
    })
  },

  nextQuestion: () => {
    const { currentIndex, questions } = get()
    if (currentIndex < questions.length - 1) {
      set({ currentIndex: currentIndex + 1, questionStartTime: Date.now() })
    } else {
      set({ isFinished: true })
    }
  },

  finishExam: () => set({ isFinished: true }),

  reset: () =>
    set({ questions: [], currentIndex: 0, answers: [], startTime: null, questionStartTime: null, isFinished: false }),
}))
