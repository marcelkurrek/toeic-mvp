import { NextResponse } from 'next/server'

const STOP_WORDS = new Set([
  'the','and','for','are','but','not','you','all','can','had','her','was','one',
  'our','out','day','get','has','him','his','how','its','may','new','now','old',
  'see','two','way','who','with','that','this','from','have','will','into','they',
  'them','then','than','when','what','your','some','been','were','more','also',
  'over','such','even','most','just','very','well','each',
])

function words(text: string): string[] {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean)
}

function wpm(wordCount: number, secs: number): number {
  return secs > 3 ? Math.round((wordCount / secs) * 60) : 0
}

function fluencyScore(rate: number): number {
  if (rate <= 0) return 65
  if (rate >= 110 && rate <= 145) return 92
  if (rate >= 90 && rate < 110) return 75
  if (rate > 145 && rate <= 170) return 74
  return 52
}

function paceNote(rate: number): string {
  if (rate > 170) return 'Das Tempo war zu schnell – sprechen Sie ruhiger und betonen Sie wichtige Wörter.'
  if (rate > 148) return 'Das Tempo war etwas zügig – ein gleichmäßigeres Tempo verbessert die Verständlichkeit.'
  if (rate >= 108 && rate <= 148) return 'Das Lesetempo war gut und natürlich.'
  if (rate >= 75) return 'Das Tempo war etwas langsam – versuchen Sie, flüssiger und ohne lange Pausen zu lesen.'
  return 'Das Tempo war sehr langsam. Üben Sie einen gleichmäßigen, flüssigen Lesefluss.'
}

function contains(text: string, ...patterns: RegExp[]): boolean {
  return patterns.some(p => p.test(text))
}

// ── READ ALOUD ────────────────────────────────────────────────────────────────
function analyzeReadAloud(transcript: string, expectedText: string, durationSeconds?: number) {
  const tWordList = words(transcript)
  const tWordSet  = new Set(tWordList)
  const eWords    = words(expectedText)

  const matchedCount = eWords.filter(w => tWordSet.has(w)).length
  const pct      = Math.round((matchedCount / eWords.length) * 100)
  const complete = pct >= 85

  const sentences = expectedText.match(/[^.!?]+[.!?]+/g) ?? [expectedText]
  const missingSentences = sentences.filter(s => {
    const sw = words(s)
    return sw.length > 0 && sw.filter(w => tWordSet.has(w)).length / sw.length < 0.5
  })
  const missingPortion = missingSentences.length > 0 ? missingSentences.join(' ').trim() : null

  const missedSet = eWords.filter(w => w.length > 4 && !tWordSet.has(w) && !STOP_WORDS.has(w))
  const missedWords = Array.from(new Set(missedSet)).slice(0, 3)

  const rate = durationSeconds ? wpm(tWordList.length, durationSeconds) : 0
  const pace = rate > 0 ? paceNote(rate) : ''
  const fluency = fluencyScore(rate)

  let feedback: string
  if (pct >= 85) {
    const praise = pct === 100 ? 'Ausgezeichnet! Der gesamte Text wurde vollständig und klar vorgelesen.' : `Sehr gut! ${pct}% des Textes wurden klar gesprochen.`
    feedback = pace ? `${praise} ${pace}` : praise
  } else if (pct >= 60) {
    const wordHint = missedWords.length > 0 ? ` Achten Sie auf: „${missedWords.join('", „')}".` : ''
    feedback = `${pct}% des Textes wurden erkannt.${wordHint} Lesen Sie laut, deutlich und lassen Sie keine Sätze aus.`
    if (pace) feedback += ` ${pace}`
  } else {
    feedback = `Nur ${pct}% des Textes wurden erfasst. Sprechen Sie jeden Satz vollständig und deutlich aus.`
    if (pace) feedback += ` ${pace}`
  }

  return {
    complete, completenessPercent: pct, feedback, missingPortion,
    dimensions: {
      pronunciation: Math.min(100, pct + 5),
      fluency,
      grammar: 75,
      vocabulary: Math.min(100, Math.round((matchedCount / Math.max(eWords.filter(w => w.length > 3).length, 1)) * 100)),
      taskCompletion: pct,
    },
  }
}

// ── DESCRIBE PICTURE ─────────────────────────────────────────────────────────
function analyzeDescribePicture(transcript: string, durationSeconds?: number) {
  const t = transcript.toLowerCase()
  const wordCount = words(transcript).length

  const hasIntro      = contains(t, /\b(picture|photo|image|shows?|depicts?)\b/)
  const hasForeground = contains(t, /\bforeground\b/)
  const hasBackground = contains(t, /\bbackground\b/)
  const hasAction     = contains(t, /\b(seems? to|appears? to|is (holding|carrying|wearing|standing|sitting|walking|looking|working|eating|talking))\b/)
  const hasSpeculation = contains(t, /\b(looks? like|might be|probably|could be|appears? to)\b/)

  const structureScore = [hasIntro, hasForeground || hasBackground, hasAction].filter(Boolean).length
  const rate = durationSeconds ? wpm(wordCount, durationSeconds) : 0
  const fluency = fluencyScore(rate)
  const pace = rate > 0 && rate < 80 ? ' Versuchen Sie, flüssiger zu sprechen – keine langen Pausen.' : rate > 190 ? ' Sprechen Sie etwas langsamer.' : ''

  const pct = Math.min(Math.round((wordCount / 65) * 100), 100)
  const complete = wordCount >= 40 && structureScore >= 2

  const missing: string[] = []
  if (!hasIntro)      missing.push('"The picture shows …" als Einleitung verwenden')
  if (!hasForeground && !hasBackground) missing.push('Vorder- und Hintergrund beschreiben')
  if (!hasAction)     missing.push('Aktivitäten beschreiben: "seems to be … / appears to be …"')
  if (!hasSpeculation && wordCount >= 30) missing.push('Vermutungen einbauen: "It looks like … / They might be …"')

  let feedback: string
  if (wordCount >= 55 && structureScore >= 2) {
    feedback = `Gut! ${wordCount} Wörter erkannt – strukturierte Beschreibung.${pace}`
    if (!hasSpeculation) feedback += ' Fügen Sie Vermutungen hinzu: „It looks like they are …"'
  } else if (wordCount >= 25) {
    const tips = missing.length > 0 ? ` Verbesserungen: ${missing.slice(0, 2).join('; ')}.` : ''
    feedback = `${wordCount} Wörter erkannt.${tips}${pace}`
  } else {
    feedback = `Zu kurz – nur ${wordCount} Wörter. Beschreiben Sie die Szene: Einleitung, Vordergrund, Hintergrund, Aktivitäten.${pace}`
  }

  return {
    complete, completenessPercent: pct, feedback, missingPortion: null,
    dimensions: {
      pronunciation: 70,
      fluency,
      grammar: hasAction ? 78 : 58,
      vocabulary: Math.min(100, Math.round((wordCount / 65) * 85)),
      taskCompletion: Math.round(structureScore / 3 * 100),
    },
  }
}

// ── EXPRESS OPINION ──────────────────────────────────────────────────────────
function analyzeExpressOpinion(transcript: string, durationSeconds?: number) {
  const t = transcript.toLowerCase()
  const wordCount = words(transcript).length

  const hasOpinion    = contains(t, /\b(believe|think|prefer|opinion|favor|consider|personally)\b/)
  const hasFirstly    = contains(t, /\b(first(ly)?|first of all|to begin with|for one thing|one reason)\b/)
  const hasSecondly   = contains(t, /\b(second(ly)?|also|moreover|furthermore|another|in addition|additionally)\b/)
  const hasConclusion = contains(t, /\b(conclusion|conclude|summary|summarize|therefore|thus|overall|to sum up)\b/)
  const hasExample    = contains(t, /\b(example|instance|for example|for instance|such as|like)\b/)

  const structureScore = [hasOpinion, hasFirstly, hasSecondly, hasConclusion].filter(Boolean).length
  const rate = durationSeconds ? wpm(wordCount, durationSeconds) : 0
  const fluency = fluencyScore(rate)
  const pace = rate > 0 && rate < 80 ? ' Sprechen Sie flüssiger – keine langen Denkpausen.' : ''

  const pct = Math.min(Math.round((wordCount / 60) * 100), 100)
  const complete = wordCount >= 50 && structureScore >= 3

  const missing: string[] = []
  if (!hasOpinion)    missing.push('Meinungsformulierung (z.B. „I personally believe that …")')
  if (!hasFirstly)    missing.push('Erster Grund (z.B. „Firstly, …")')
  if (!hasSecondly)   missing.push('Zweiter Grund (z.B. „Secondly, … / Moreover, …")')
  if (!hasExample)    missing.push('Beispiel (z.B. „For example, …")')
  if (!hasConclusion) missing.push('Abschluss (z.B. „In conclusion, …")')

  let feedback: string
  if (wordCount >= 60 && structureScore >= 3) {
    const exampleNote = hasExample ? '' : ' Tipp: Fügen Sie ein Beispiel hinzu.'
    feedback = `Gut strukturiert! ${wordCount} Wörter erkannt, klare Argumentation.${exampleNote}${pace}`
  } else {
    const tips = missing.length > 0 ? ` Fehlt: ${missing.slice(0, 2).join('; ')}.` : ''
    feedback = `${wordCount} Wörter erkannt.${tips}${pace} Struktur: Meinung → Grund 1 → Grund 2 → Beispiel → Fazit.`
  }

  return {
    complete, completenessPercent: pct, feedback, missingPortion: null,
    dimensions: {
      pronunciation: 70,
      fluency,
      grammar: hasOpinion && hasFirstly ? 78 : 58,
      vocabulary: Math.min(100, Math.round((wordCount / 60) * 80)),
      taskCompletion: Math.round(structureScore / 4 * 100),
    },
  }
}

// ── RESPOND FREE / INFO ──────────────────────────────────────────────────────
function analyzeRespondFree(transcript: string, durationSeconds?: number) {
  const t = transcript.toLowerCase()
  const wordCount = words(transcript).length

  const hasSympathy = contains(t, /\b(sorry|apologize|understand|hear that)\b/)
  const hasAction   = contains(t, /\b(will|can|arrange|ensure|make sure|take care|resolve|handle)\b/)
  const hasSolution = contains(t, /\b(solution|solve|glad|pleased|offer|provide|help|assist)\b/)
  const rate = durationSeconds ? wpm(wordCount, durationSeconds) : 0
  const fluency = fluencyScore(rate)

  const pct = Math.min(Math.round((wordCount / 50) * 100), 100)
  const complete = wordCount >= 20 && (hasSympathy || hasAction || hasSolution)

  const feedback = wordCount >= 25
    ? `Gute Antwort – ${wordCount} Wörter erkannt. Achten Sie auf direkte, vollständige Antworten.`
    : `Zu kurz (${wordCount} Wörter). Antworten Sie in vollständigen Sätzen und gehen Sie direkt auf die Frage ein.`

  return {
    complete, completenessPercent: pct, feedback, missingPortion: null,
    dimensions: {
      pronunciation: 70,
      fluency,
      grammar: 68,
      vocabulary: Math.min(100, Math.round((wordCount / 30) * 70)),
      taskCompletion: pct,
    },
  }
}

// ── GENERIC ──────────────────────────────────────────────────────────────────
function analyzeGeneric(transcript: string, durationSeconds?: number) {
  const wordCount = words(transcript).length
  const rate = durationSeconds ? wpm(wordCount, durationSeconds) : 0
  const fluency = fluencyScore(rate)
  const pct = Math.min(Math.round((wordCount / 30) * 100), 100)
  const complete = wordCount >= 20
  const feedback = complete
    ? `Gute Antwort – ${wordCount} Wörter erkannt.`
    : `Zu kurz (${wordCount} Wörter). Versuchen Sie, ausführlicher zu antworten.`
  return {
    complete, completenessPercent: pct, feedback, missingPortion: null,
    dimensions: { pronunciation: 65, fluency, grammar: 65, vocabulary: 65, taskCompletion: pct },
  }
}

// ── DISPATCHER ───────────────────────────────────────────────────────────────
function analyzeLocally(transcript: string, expectedText: string | undefined, questionType: string, durationSeconds?: number) {
  if (questionType === 'READ_ALOUD' && expectedText) return analyzeReadAloud(transcript, expectedText, durationSeconds)
  if (questionType === 'DESCRIBE_PICTURE') return analyzeDescribePicture(transcript, durationSeconds)
  if (questionType === 'EXPRESS_OPINION') return analyzeExpressOpinion(transcript, durationSeconds)
  if (questionType === 'RESPOND_FREE' || questionType === 'RESPOND_INFO') return analyzeRespondFree(transcript, durationSeconds)
  return analyzeGeneric(transcript, durationSeconds)
}

// ── ROUTE HANDLER ─────────────────────────────────────────────────────────────
export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const { checkRateLimit } = await import('@/lib/rateLimit')
  if (!checkRateLimit(`speech:${ip}`, 20, 10 * 60 * 1000)) {
    return NextResponse.json({ error: 'Zu viele Anfragen. Bitte warte kurz.' }, { status: 429 })
  }

  const { transcript, expectedText, questionType, durationSeconds } = await request.json() as {
    transcript: string
    expectedText?: string
    questionType: string
    durationSeconds?: number
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(analyzeLocally(transcript, expectedText, questionType, durationSeconds))
  }

  try {
    const { default: Anthropic } = await import('@anthropic-ai/sdk')
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const tWordList = words(transcript)
    const rate = durationSeconds ? wpm(tWordList.length, durationSeconds) : 0
    const rateNote = rate > 0 ? `Gemessenes Sprechtempo: ${rate} WPM (TOEIC-Ideal: 110–145 WPM).` : ''

    const CRITERIA: Record<string, string> = {
      READ_ALOUD: `Kriterien: Aussprache, Intonation, Betonung, Flüssigkeit, Tempo. Wortendungen vollständig sprechen.`,
      DESCRIBE_PICTURE: `Struktur: Einleitung (The picture shows…) → Vordergrund → Hintergrund → Aktivitäten → Vermutungen. Ziel: 45 Sekunden.`,
      RESPOND_FREE: `Kriterien: Relevanz, Vollständigkeit, Aussprache, Grammatik. Ca. 15 Sekunden pro Frage.`,
      RESPOND_INFO: `Genauigkeit der Information aus dem Dokument, Vollständigkeit, Aussprache, Grammatik.`,
      EXPRESS_OPINION: `Struktur: Meinung → Grund 1 → Grund 2 → Beispiel → Fazit. Mind. 2 Gründe.`,
    }

    const criteria = CRITERIA[questionType] ?? 'Kriterien: Aussprache, Grammatik, Vollständigkeit, Flüssigkeit.'

    const prompt = `Du bist ein erfahrener TOEIC-Sprachtrainer. Aufgabe: ${questionType}.
${criteria}
${rateNote}
${expectedText ? `\nErwarteter Text: "${expectedText}"\n` : ''}
Transkript: "${transcript || '(keine Sprache erkannt)'}"

Antworte NUR mit validem JSON:
{
  "complete": boolean,
  "completenessPercent": number (0–100),
  "feedback": "2–3 Sätze DE: was gut war, was fehlt, konkreter Tipp",
  "missingPortion": ${questionType === 'READ_ALOUD' ? '"fehlender Abschnitt oder null"' : 'null'},
  "dimensions": {
    "pronunciation": number (0–100),
    "fluency": number (0–100),
    "grammar": number (0–100),
    "vocabulary": number (0–100),
    "taskCompletion": number (0–100)
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
    console.error('[POST /api/speech-feedback] Claude failed, using local analysis:', err)
    return NextResponse.json(analyzeLocally(transcript, expectedText, questionType, durationSeconds))
  }
}
