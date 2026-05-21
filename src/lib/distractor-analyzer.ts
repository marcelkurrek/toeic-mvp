import { DistractorType } from '@prisma/client'

/**
 * Analyzes wrong answer and classifies it by TOEIC distractor type.
 * Uses question content, tags, and answer options to determine which trap was triggered.
 */
export function analyzeDistractor(
  question: {
    part: number
    type: string
    tags: string[]
    options?: any
    content: any
  },
  userAnswer: string,
  correctAnswer: string
): DistractorType | null {
  // If answer is correct, no distractor
  if (userAnswer === correctAnswer) return null

  // Get distractor option text if available
  const wrongOption = question.options?.[userAnswer]
  const correctOptionText = question.options?.[correctAnswer]

  // 1. SOUND_ALIKE detection
  // Check if wrong option sounds similar to correct option
  if (wrongOption && correctOptionText) {
    const wrongText = String(wrongOption).toLowerCase()
    const correctText = String(correctOptionText).toLowerCase()

    // Sound-alike pairs (from Barron's)
    const soundAlikePairs = [
      ['bass', 'base'], ['car', 'core'], ['boots', 'boats'], ['court', 'cart'], ['drug', 'drag'],
      ['hired', 'tired'], ['back', 'pack'], ['race', 'case'], ['place', 'place'], ['hair', 'fair'],
      ['little', 'litter'], ['nab', 'nap'], ['let', 'letter'], ['mark', 'market'],
      ['nation', 'imagination'], ['mind', 'remind'],
    ]

    for (const [word1, word2] of soundAlikePairs) {
      if ((wrongText.includes(word1) && correctText.includes(word2)) ||
          (wrongText.includes(word2) && correctText.includes(word1))) {
        return DistractorType.SOUND_ALIKE
      }
    }

    // Phonetic similarity (rough check)
    if (isSimilarSound(wrongText, correctText)) {
      return DistractorType.SOUND_ALIKE
    }
  }

  // 2. HOMONYM detection
  // Same pronunciation, different meaning (from Barron's)
  const homonymPairs: [string, string][] = [
    ['allowed', 'aloud'], ['bare', 'bear'], ['blew', 'blue'], ['fare', 'fair'],
    ['feat', 'feet'], ['flew', 'flu'], ['flour', 'flower'], ['for', 'four'],
    ['loan', 'lone'], ['made', 'maid'], ['male', 'mail'], ['meat', 'meet'],
    ['morning', 'mourning'], ['one', 'won'], ['pale', 'pail'], ['plain', 'plane'],
    ['right', 'rite'], ['sail', 'sale'], ['scene', 'seen'], ['sight', 'site'],
    ['steak', 'stake'], ['steel', 'steal'], ['tale', 'tail'], ['threw', 'through'],
    ['to', 'too'], ['wait', 'weight'], ['weak', 'week'], ['where', 'ware'],
  ]

  for (const [word1, word2] of homonymPairs) {
    if ((userAnswer.toLowerCase().includes(word1) && correctAnswer.toLowerCase().includes(word2)) ||
        (userAnswer.toLowerCase().includes(word2) && correctAnswer.toLowerCase().includes(word1))) {
      return DistractorType.HOMONYM
    }
  }

  // 3. RELATED_WORD detection
  // Semantically related but incorrect (from Barron's)
  const relatedWordGroups = {
    conference: ['meeting', 'seminar', 'symposium'],
    hotel: ['resort', 'accommodation', 'lodge'],
    travel: ['journey', 'trip', 'voyage'],
    meeting: ['conference', 'gathering', 'assembly'],
    dismiss: ['fire', 'terminate', 'release'],
  }

  for (const [correctWord, relatedWords] of Object.entries(relatedWordGroups)) {
    if (correctAnswer.toLowerCase().includes(correctWord)) {
      for (const related of relatedWords) {
        if (userAnswer.toLowerCase().includes(related)) {
          return DistractorType.RELATED_WORD
        }
      }
    }
  }

  // Also check question tags for hints
  if (question.tags?.includes('related-word-trap')) {
    return DistractorType.RELATED_WORD
  }

  // 4. ALTER_WORD_ORDER detection
  // Check if words are present but in wrong order or grammatical structure
  const wrongWords = userAnswer.toLowerCase().split(/\s+/)
  const correctWords = correctAnswer.toLowerCase().split(/\s+/)

  const commonWords = wrongWords.filter(w => correctWords.includes(w))
  if (commonWords.length >= Math.max(wrongWords.length - 1, 1)) {
    // Most words are the same, but wrong order/grammar
    return DistractorType.ALTER_WORD_ORDER
  }

  // 5. OMIT_NECESSARY_WORD detection
  // User answer is shorter and missing key function word
  if (userAnswer.length < correctAnswer.length * 0.8) {
    // Check if it's missing common function words (preposition, modal, etc.)
    const functionWords = ['to', 'the', 'a', 'an', 'for', 'with', 'at', 'in', 'by', 'of', 'and', 'or', 'is', 'are', 'was', 'were']
    for (const fw of functionWords) {
      if (correctAnswer.toLowerCase().includes(fw) && !userAnswer.toLowerCase().includes(fw)) {
        return DistractorType.OMIT_NECESSARY
      }
    }
  }

  // Default: if none of the specific traps match, likely just wrong
  // Return OMIT_NECESSARY as catch-all (user missed something)
  return null
}

/**
 * Simple phonetic similarity check
 */
function isSimilarSound(word1: string, word2: string): boolean {
  if (!word1 || !word2) return false

  // Remove vowels and compare consonants (rough phonetic similarity)
  const consonants1 = word1.replace(/[aeiou]/g, '')
  const consonants2 = word2.replace(/[aeiou]/g, '')

  // Very rough check: if >60% of consonants match, consider similar
  const common = consonants1
    .split('')
    .filter(c => consonants2.includes(c)).length

  return common >= consonants1.length * 0.6 && consonants1.length > 1
}

/**
 * Calculates urgency score for error pattern
 * Higher = more urgent (frequent + recent + severe)
 */
export function calculateUrgencyScore(
  frequency: number,
  lastOccurredAt: Date,
  severity: number = 1 // 1-5
): number {
  const daysSinceLastError = (Date.now() - lastOccurredAt.getTime()) / (1000 * 60 * 60 * 24)
  const recencyFactor = Math.max(0, 1 - daysSinceLastError / 14) // Decays over 14 days
  return frequency * recencyFactor * severity
}
