import { NextResponse } from 'next/server'

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function containsAny(text: string, ...patterns: RegExp[]): boolean {
  return patterns.some(p => p.test(text))
}

// ── WRITE SENTENCE ────────────────────────────────────────────────────────────
function analyzeWriteSentence(text: string, keywords?: string[]) {
  const lower = text.toLowerCase()
  const wc = wordCount(text)

  const foundKeywords: string[] = []
  const missingKeywords: string[] = []
  let keywordScore = 0

  if (keywords && keywords.length > 0) {
    for (const kw of keywords) {
      if (lower.includes(kw.toLowerCase())) { foundKeywords.push(kw); keywordScore += 50 }
      else missingKeywords.push(kw)
    }
  } else {
    keywordScore = 50
  }

  const isSingleSentence = !/[.?!]\s/.test(text.trim())
  const hasGoodLength = wc >= 8 && wc <= 25
  const grammarScore = isSingleSentence ? 80 : 50
  const vocabScore = hasGoodLength ? 75 : wc < 5 ? 40 : 65

  const score = Math.max(0, Math.min(100, Math.round(keywordScore * 0.5 + grammarScore * 0.3 + vocabScore * 0.2)))

  const parts: string[] = []
  if (foundKeywords.length > 0) parts.push(`Keywords „${foundKeywords.join('" und „')}" korrekt verwendet.`)
  if (missingKeywords.length > 0) parts.push(`Keyword „${missingKeywords.join('" und „')}" fehlt.`)
  if (!isSingleSentence) parts.push('Schreiben Sie genau einen Satz.')
  else parts.push('Einzelner Satz — gut.')

  return {
    score, feedback: parts.slice(0, 3).join(' '),
    tips: ['Beide Keywords einbauen', 'Genau EINEN vollständigen Satz', 'Bezug zum Bild herstellen'],
    dimensions: { content: keywordScore, structure: isSingleSentence ? 85 : 50, grammar: grammarScore, vocabulary: vocabScore },
  }
}

// ── RESPOND EMAIL ─────────────────────────────────────────────────────────────
function analyzeRespondEmail(text: string) {
  const lower = text.toLowerCase()
  const wc = wordCount(text)

  const hasGreeting    = containsAny(lower, /\bdear\b/)
  const hasRef         = containsAny(lower, /\bregarding\b/, /\bconcerning\b/)
  const hasPhrases     = containsAny(lower, /\bi am afraid\b/, /\bi am pleased\b/, /\bi regret\b/, /\bwould appreciate\b/, /\bcould you\b/)
  const hasClosing     = containsAny(lower, /\bbest regards\b/, /\bkind regards\b/, /\byours\b/)
  const hasBody        = wc >= 40

  const structure = [hasGreeting, hasRef || hasPhrases, hasBody, hasClosing].filter(Boolean).length
  const structureScore = Math.round(structure / 4 * 100)
  const contentScore = wc < 30 ? 35 : wc >= 60 ? 80 : 60
  const grammarScore = hasPhrases ? 78 : 62
  const vocabScore = hasRef ? 78 : 62
  const score = Math.round(structureScore * 0.35 + contentScore * 0.3 + grammarScore * 0.2 + vocabScore * 0.15)

  const parts: string[] = []
  if (!hasGreeting) parts.push('Anrede „Dear Mr./Ms. [Name]" fehlt.')
  else parts.push('Anrede vorhanden.')
  if (!hasClosing) parts.push('Grußformel „Best regards" fehlt.')
  if (wc < 30) parts.push('E-Mail zu kurz — mind. 60 Wörter.')
  else parts.push(`Umfang (${wc} Wörter) angemessen.`)

  return {
    score, feedback: parts.slice(0, 3).join(' '),
    tips: ['Dear Mr./Ms. [Name]', 'Regarding / Concerning', 'I am afraid that… / I am pleased to inform you…', 'Best regards'],
    dimensions: { content: contentScore, structure: structureScore, grammar: grammarScore, vocabulary: vocabScore },
  }
}

// ── OPINION ESSAY ─────────────────────────────────────────────────────────────
function analyzeOpinionEssay(text: string) {
  const lower = text.toLowerCase()
  const wc = wordCount(text)

  const hasIntro  = containsAny(lower, /\badvantages?\b/, /\bin my opinion\b/, /\bi believe\b/, /\bi think\b/)
  const hasFirst  = containsAny(lower, /\bfirst of all\b/, /\bfirstly\b/)
  const hasSecond = containsAny(lower, /\bsecondly\b/, /\bmoreover\b/, /\bfurthermore\b/)
  const hasExampl = containsAny(lower, /\bfor example\b/, /\bfor instance\b/, /\bsuch as\b/)
  const hasConc   = containsAny(lower, /\bin conclusion\b/, /\bto summarize\b/, /\btherefore\b/)

  const structureScore = Math.round([hasIntro, hasFirst, hasSecond, hasExampl, hasConc].filter(Boolean).length / 5 * 100)
  const contentScore = wc < 100 ? 35 : wc >= 250 ? 85 : Math.round(35 + (wc - 100) / 150 * 50)
  const grammarScore = hasIntro && hasFirst ? 78 : 60
  const vocabScore = hasExampl && hasSecond ? 78 : 60
  const score = Math.round(structureScore * 0.35 + contentScore * 0.3 + grammarScore * 0.2 + vocabScore * 0.15)

  const parts: string[] = []
  if (!hasIntro) parts.push('Meinungsformulierung fehlt (z.B. „In my opinion…").')
  else parts.push('Einleitung mit Meinung vorhanden.')
  if (!hasConc) parts.push('Fazit fehlt (z.B. „In conclusion…").')
  if (wc < 100) parts.push(`Zu kurz (${wc} Wörter).`)
  else parts.push(`${wc} Wörter — guter Umfang.`)

  return {
    score, feedback: parts.slice(0, 3).join(' '),
    tips: ['Einleitung: There are advantages… / In my opinion…', 'Erst: First of all, I believe…', 'Weiter: Another advantage is…', 'Fazit: In conclusion, although…'],
    dimensions: { content: contentScore, structure: structureScore, grammar: grammarScore, vocabulary: vocabScore },
  }
}

// ── LOCAL DISPATCHER ──────────────────────────────────────────────────────────
function analyzeLocally(text: string, questionType: string, keywords?: string[]) {
  if (questionType === 'WRITE_SENTENCE') return analyzeWriteSentence(text, keywords)
  if (questionType === 'RESPOND_EMAIL')  return analyzeRespondEmail(text)
  return analyzeOpinionEssay(text)
}

// ── ROUTE HANDLER ─────────────────────────────────────────────────────────────
export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const { checkRateLimit } = await import('@/lib/rateLimit')
  if (!checkRateLimit(`writing:${ip}`, 20, 10 * 60 * 1000)) {
    return NextResponse.json({ error: 'Zu viele Anfragen. Bitte warte kurz.' }, { status: 429 })
  }

  // Accept both param naming conventions
  const body = await request.json() as {
    text?: string; answer?: string
    questionType?: string; type?: string
    keywords?: string[]
    expectedStructure?: string
    question?: Record<string, unknown>
  }

  const text = body.text ?? body.answer ?? ''
  const questionType = body.questionType ?? body.type ?? 'OPINION_ESSAY'
  const keywords = body.keywords ?? (body.question?.keywords as string[] | undefined)

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(analyzeLocally(text, questionType, keywords))
  }

  try {
    const { default: Anthropic } = await import('@anthropic-ai/sdk')
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const prompt = `Du bist ein TOEIC-Schreibtrainer. Aufgabe: ${questionType}.
${questionType === 'WRITE_SENTENCE' ? `Pflicht-Keywords: ${keywords?.join(', ') ?? '–'}` : ''}
${questionType === 'RESPOND_EMAIL' ? 'Formelle E-Mail: Anrede, Hauptteil mit Geschäftsphrasen, Grußformel.' : ''}
${questionType === 'OPINION_ESSAY' ? 'Struktur: Einleitung → 2 Gründe mit Beispielen → Fazit. Mind. 300 Wörter.' : ''}

Text des Schülers:
"${text || '(kein Text eingegeben)'}"

Antworte NUR mit validem JSON:
{
  "score": number (0–100),
  "feedback": "2–3 Sätze DE: was gut ist, was fehlt, konkreter Tipp",
  "tips": ["Tipp 1", "Tipp 2", "Tipp 3"],
  "dimensions": {
    "content": number (0–100),
    "structure": number (0–100),
    "grammar": number (0–100),
    "vocabulary": number (0–100)
  }
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
