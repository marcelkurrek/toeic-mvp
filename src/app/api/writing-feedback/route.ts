import { NextResponse } from 'next/server'

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function containsAny(text: string, ...patterns: RegExp[]): boolean {
  return patterns.some(p => p.test(text))
}

// ── WRITE SENTENCE ────────────────────────────────────────────────────────────
function analyzeWriteSentence(text: string, keywords?: string[]) {
  let score = 0
  const lower = text.toLowerCase()
  const wc = wordCount(text)

  const foundKeywords: string[] = []
  const missingKeywords: string[] = []

  if (keywords && keywords.length > 0) {
    for (const kw of keywords) {
      if (lower.includes(kw.toLowerCase())) {
        foundKeywords.push(kw)
        score += 30
      } else {
        missingKeywords.push(kw)
      }
    }
  }

  const isSingleSentence = !/[.?!]\s/.test(text.trim())
  if (isSingleSentence) score += 20

  if (wc >= 8 && wc <= 25) {
    score += 10
  } else if (wc < 5) {
    score -= 30
  }

  score = Math.max(0, Math.min(100, score))

  let feedbackParts: string[] = []
  if (foundKeywords.length > 0) {
    feedbackParts.push(`Die Keywords „${foundKeywords.join('" und „')}" wurden korrekt verwendet.`)
  }
  if (missingKeywords.length > 0) {
    feedbackParts.push(`Das Keyword ${missingKeywords.length === 1 ? `„${missingKeywords[0]}"` : `„${missingKeywords.join('" und „')}"`} fehlt im Satz.`)
  }
  if (!isSingleSentence) {
    feedbackParts.push('Der Text enthält mehrere Sätze – schreiben Sie genau einen vollständigen Satz.')
  } else {
    feedbackParts.push('Der Text besteht aus einem einzelnen Satz.')
  }
  feedbackParts.push('Achten Sie auf korrekte Grammatik: Subjekt + Verb + Objekt.')

  const feedback = feedbackParts.slice(0, 3).join(' ')

  const tips = [
    'Beide Keywords müssen im Satz vorkommen',
    'Schreiben Sie genau EINEN vollständigen Satz',
    'Bezug zum Bild herstellen',
    'Grammatik: Subjekt + Verb + Objekt',
  ]

  return { score, feedback, tips }
}

// ── RESPOND EMAIL ─────────────────────────────────────────────────────────────
function analyzeRespondEmail(text: string) {
  let score = 0
  const lower = text.toLowerCase()
  const wc = wordCount(text)

  if (containsAny(lower, /\bdear\b/)) score += 15
  if (containsAny(lower, /\bregarding\b/, /\bconcerning\b/)) score += 15
  if (containsAny(lower, /\bi am afraid\b/, /\bi am pleased\b/, /\bi regret\b/, /\bwould appreciate\b/, /\bcould you\b/)) score += 20
  if (containsAny(lower, /\bbest regards\b/, /\bkind regards\b/, /\byours\b/)) score += 15

  if (wc < 30) {
    score -= 20
  } else if (wc >= 30 && wc <= 60) {
    score += 10
  } else {
    score += 20
  }

  score = Math.max(0, Math.min(100, score))

  let feedbackParts: string[] = []
  if (!containsAny(lower, /\bdear\b/)) {
    feedbackParts.push('Eine formelle Anrede (z.B. „Dear Mr./Ms. [Name]") fehlt.')
  } else {
    feedbackParts.push('Die Anrede ist vorhanden.')
  }
  if (!containsAny(lower, /\bbest regards\b/, /\bkind regards\b/, /\byours\b/)) {
    feedbackParts.push('Eine Grußformel (z.B. „Best regards") am Ende fehlt.')
  }
  if (wc < 30) {
    feedbackParts.push('Die E-Mail ist zu kurz – schreiben Sie mindestens 30 Wörter für eine vollständige Antwort.')
  } else {
    feedbackParts.push('Der Umfang der E-Mail ist angemessen.')
  }

  const feedback = feedbackParts.slice(0, 3).join(' ')

  const tips = [
    'Dear Mr./Ms. [Name]',
    'Regarding / Concerning',
    'I am afraid that… / I am pleased to inform you…',
    'Best regards',
  ]

  return { score, feedback, tips }
}

// ── OPINION ESSAY ─────────────────────────────────────────────────────────────
function analyzeOpinionEssay(text: string) {
  let score = 0
  const lower = text.toLowerCase()
  const wc = wordCount(text)

  if (containsAny(lower, /\badvantages?\b/, /\bdisadvantages?\b/, /\bin my opinion\b/, /\bi believe\b/)) score += 20
  if (containsAny(lower, /\bfirst of all\b/, /\bfirstly\b/, /\bfirst reason\b/)) score += 15
  if (containsAny(lower, /\bsecondly\b/, /\bmoreover\b/, /\bfurthermore\b/, /\banother\b/)) score += 15
  if (containsAny(lower, /\bfor example\b/, /\bfor instance\b/, /\bsuch as\b/)) score += 10
  if (containsAny(lower, /\bin conclusion\b/, /\bto summarize\b/, /\btherefore\b/)) score += 20

  if (wc < 100) {
    score -= 20
  } else if (wc >= 100 && wc <= 200) {
    score += 10
  } else {
    score += 20
  }

  score = Math.max(0, Math.min(100, score))

  let feedbackParts: string[] = []
  if (!containsAny(lower, /\badvantages?\b/, /\bdisadvantages?\b/, /\bin my opinion\b/, /\bi believe\b/)) {
    feedbackParts.push('Eine klare Einleitung mit Ihrer Meinung fehlt (z.B. „In my opinion…" oder „I believe that…").')
  } else {
    feedbackParts.push('Die Einleitung mit Meinungsformulierung ist vorhanden.')
  }
  if (!containsAny(lower, /\bin conclusion\b/, /\bto summarize\b/, /\btherefore\b/)) {
    feedbackParts.push('Ein abschließendes Fazit fehlt (z.B. „In conclusion…").')
  }
  if (wc < 100) {
    feedbackParts.push(`Der Aufsatz ist zu kurz (${wc} Wörter) – mindestens 100 Wörter werden erwartet.`)
  } else {
    feedbackParts.push(`Mit ${wc} Wörtern hat der Aufsatz einen guten Umfang.`)
  }

  const feedback = feedbackParts.slice(0, 3).join(' ')

  const tips = [
    'Einleitung: There are advantages and disadvantages to…',
    'Grund 1: First of all, I believe…',
    'Grund 2: Another advantage is that…',
    'Fazit: In conclusion, although…',
  ]

  return { score, feedback, tips }
}

// ── LOCAL DISPATCHER ──────────────────────────────────────────────────────────
function analyzeLocally(
  text: string,
  questionType: string,
  keywords?: string[],
) {
  if (questionType === 'WRITE_SENTENCE') return analyzeWriteSentence(text, keywords)
  if (questionType === 'RESPOND_EMAIL') return analyzeRespondEmail(text)
  if (questionType === 'OPINION_ESSAY') return analyzeOpinionEssay(text)
  return analyzeOpinionEssay(text)
}

// ── ROUTE HANDLER ─────────────────────────────────────────────────────────────
export async function POST(request: Request) {
  const { text, questionType, keywords, expectedStructure } = await request.json() as {
    text: string
    questionType: string
    keywords?: string[]
    expectedStructure?: string
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(analyzeLocally(text, questionType, keywords))
  }

  try {
    const { default: Anthropic } = await import('@anthropic-ai/sdk')
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const prompt = `Du bist ein TOEIC-Schreibtrainer. Bewerte folgenden Text (Aufgabe: ${questionType}).

TOEIC-Kriterien: Grammatik, Wortschatz, Struktur, Relevanz.
${questionType === 'WRITE_SENTENCE' ? `Keywords die verwendet werden müssen: ${keywords?.join(', ')}` : ''}
${questionType === 'RESPOND_EMAIL' ? 'Formelle E-Mail: Anrede, Betreff, Inhalt, Abschluss, Grußformel' : ''}
${questionType === 'OPINION_ESSAY' ? 'Struktur: Einleitung → 2 Gründe mit Beispielen → Fazit' : ''}
${expectedStructure ? `Erwartete Struktur: ${expectedStructure}` : ''}

Text des Schülers:
"${text}"

Antworte NUR mit validem JSON:
{
  "score": number (0-100),
  "feedback": "2-3 Sätze auf Deutsch: was gut ist, was fehlt, konkreter Tipp",
  "tips": ["Tipp 1", "Tipp 2", "Tipp 3"] (2-4 konkrete Verbesserungsvorschläge auf Deutsch)
}`

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    })

    const raw = (message.content[0] as { text: string }).text.trim()
    return NextResponse.json(JSON.parse(raw))
  } catch (err) {
    console.error('[POST /api/writing-feedback] Claude failed, using local analysis:', err)
    return NextResponse.json(analyzeLocally(text, questionType, keywords))
  }
}
