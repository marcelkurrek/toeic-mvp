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
function analyzeReadAloud(
  transcript: string,
  expectedText: string,
  durationSeconds?: number,
) {
  const tWordList = words(transcript)
  const tWordSet  = new Set(tWordList)
  const eWords    = words(expectedText)

  const matchedCount = eWords.filter(w => tWordSet.has(w)).length
  const pct      = Math.round((matchedCount / eWords.length) * 100)
  const complete = pct >= 85

  // Missing sentences
  const sentences = expectedText.match(/[^.!?]+[.!?]+/g) ?? [expectedText]
  const missingSentences = sentences.filter(s => {
    const sw = words(s)
    return sw.length > 0 && sw.filter(w => tWordSet.has(w)).length / sw.length < 0.5
  })
  const missingPortion = missingSentences.length > 0 ? missingSentences.join(' ').trim() : null

  // Specific missed content words
  const missedSet = eWords.filter(w => w.length > 4 && !tWordSet.has(w) && !STOP_WORDS.has(w))
  const missedWords = Array.from(new Set(missedSet)).slice(0, 3)

  // Pace
  const rate = durationSeconds ? wpm(tWordList.length, durationSeconds) : 0
  const pace = rate > 0 ? paceNote(rate) : ''

  let feedback: string
  if (pct >= 85) {
    const praise = pct === 100
      ? 'Ausgezeichnet! Der gesamte Text wurde vollständig und klar vorgelesen.'
      : `Sehr gut! ${pct}% des Textes wurden klar gesprochen.`
    feedback = pace ? `${praise} ${pace}` : praise
  } else if (pct >= 60) {
    const wordHint = missedWords.length > 0
      ? ` Achten Sie auf die klare Aussprache von: „${missedWords.join('", „')}".`
      : ''
    feedback = `${pct}% des Textes wurden erkannt.${wordHint} Lesen Sie laut, deutlich und lassen Sie keine Sätze aus.`
    if (pace) feedback += ` ${pace}`
    feedback += ' Tipp: Kommas = kurze Pause, Punkte = klare Pause; Wortendungen (-ed, -s) vollständig aussprechen.'
  } else {
    feedback = `Nur ${pct}% des Textes wurden erfasst. Sprechen Sie jeden Satz vollständig und deutlich aus – kein Überspringen.`
    if (pace) feedback += ` ${pace}`
  }

  return { complete, completenessPercent: pct, feedback, missingPortion }
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
  const pace = rate > 0 && rate < 80 ? ' Versuchen Sie, flüssiger zu sprechen – keine langen Pausen.'
    : rate > 190 ? ' Sprechen Sie etwas langsamer für bessere Verständlichkeit.' : ''

  // Target: 45s → approx. 65–80 words
  const pct = Math.min(Math.round((wordCount / 65) * 100), 100)
  const complete = wordCount >= 40 && structureScore >= 2

  const missing: string[] = []
  if (!hasIntro)      missing.push('"The picture shows …" als Einleitung verwenden')
  if (!hasForeground && !hasBackground) missing.push('Vorder- und Hintergrund beschreiben')
  if (!hasAction)     missing.push('Aktivitäten beschreiben: "seems to be … / appears to be …"')
  if (!hasSpeculation && wordCount >= 30) missing.push('Vermutungen einbauen: "It looks like … / They might be …"')

  let feedback: string
  if (wordCount >= 55 && structureScore >= 2) {
    feedback = `Gut! ${wordCount} Wörter erkannt – Sie haben die Szene strukturiert beschrieben.${pace}`
    if (!hasSpeculation) feedback += ' Tipp: Fügen Sie Vermutungen hinzu, z.B. „It looks like they are …"'
  } else if (wordCount >= 25) {
    const tips = missing.length > 0 ? ` Verbesserungen: ${missing.join('; ')}.` : ''
    feedback = `${wordCount} Wörter erkannt.${tips}${pace}`
  } else {
    feedback = `Zu kurz – nur ${wordCount} Wörter. Beschreiben Sie die vollständige Szene: Einleitung, Vordergrund, Hintergrund, Aktivitäten. Ziel: 45 Sekunden sprechen.${pace}`
  }

  return { complete, completenessPercent: pct, feedback, missingPortion: null }
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
  const pace = rate > 0 && rate < 80 ? ' Sprechen Sie flüssiger – keine langen Denkpausen.' : ''

  const pct = Math.min(Math.round((wordCount / 60) * 100), 100)
  const complete = wordCount >= 50 && structureScore >= 3

  const missing: string[] = []
  if (!hasOpinion)    missing.push('Meinungsformulierung fehlt (z.B. „I personally believe that …")')
  if (!hasFirstly)    missing.push('Erster Grund fehlt (z.B. „Firstly, …")')
  if (!hasSecondly)   missing.push('Zweiter Grund fehlt (z.B. „Secondly, … / Moreover, …")')
  if (!hasExample)    missing.push('Beispiel fehlt (z.B. „For example, …")')
  if (!hasConclusion) missing.push('Abschluss fehlt (z.B. „In conclusion, …")')

  let feedback: string
  if (wordCount >= 60 && structureScore >= 3) {
    const exampleNote = hasExample ? '' : ' Tipp: Fügen Sie ein Beispiel hinzu, z.B. „For example, …"'
    feedback = `Gut strukturiert! ${wordCount} Wörter erkannt, klare Argumentation.${exampleNote}${pace}`
  } else {
    const tips = missing.length > 0 ? ` ${missing.join('; ')}.` : ''
    feedback = `${wordCount} Wörter erkannt.${tips}${pace} Denken Sie an: Meinung → Grund 1 → Grund 2 → Beispiel → Fazit.`
  }

  return { complete, completenessPercent: pct, feedback, missingPortion: null }
}

// ── PROPOSE SOLUTION ─────────────────────────────────────────────────────────
function analyzeProposeSolution(transcript: string, durationSeconds?: number) {
  const t = transcript.toLowerCase()
  const wordCount = words(transcript).length

  const hasSympathy = contains(t, /\b(sorry|apologize|understand|hear that)\b/)
  const hasAction   = contains(t, /\b(will|can|arrange|ensure|make sure|take care|resolve|handle)\b/)
  const hasSolution = contains(t, /\b(solution|solve|glad|pleased|offer|provide|help|assist)\b/)

  const pct = Math.min(Math.round((wordCount / 50) * 100), 100)
  const complete = wordCount >= 40 && hasSympathy && (hasAction || hasSolution)

  const missing: string[] = []
  if (!hasSympathy) missing.push('Problem anerkennen fehlt (z.B. „I am sorry to hear that …")')
  if (!hasAction)   missing.push('Maßnahmen fehlen (z.B. „We will … / I can arrange …")')
  if (!hasSolution) missing.push('Lösung fehlt (z.B. „I am glad to tell you that …")')

  const tips = missing.length > 0 ? ` ${missing.join('; ')}.` : ''
  const feedback = wordCount >= 40
    ? `Gute Antwort – ${wordCount} Wörter erkannt.${tips}`
    : `Zu kurz (${wordCount} Wörter). Struktur: 1. Problem anerkennen → 2. Vorgehen erklären → 3. Lösung vorschlagen.${tips}`

  return { complete, completenessPercent: pct, feedback, missingPortion: null }
}

// ── GENERIC FALLBACK ─────────────────────────────────────────────────────────
function analyzeGeneric(transcript: string, durationSeconds?: number) {
  const wordCount = words(transcript).length
  const rate = durationSeconds ? wpm(wordCount, durationSeconds) : 0
  const pace = rate > 180 ? ' Das Tempo war sehr schnell.' : rate > 0 && rate < 80 ? ' Sprechen Sie flüssiger.' : ''
  const pct = Math.min(Math.round((wordCount / 30) * 100), 100)
  const complete = wordCount >= 20
  const feedback = complete
    ? `Gute Antwort – ${wordCount} Wörter erkannt.${pace}`
    : `Zu kurz (${wordCount} Wörter). Versuchen Sie, ausführlicher zu antworten.${pace}`
  return { complete, completenessPercent: pct, feedback, missingPortion: null }
}

// ── DISPATCHER ───────────────────────────────────────────────────────────────
function analyzeLocally(
  transcript: string,
  expectedText: string | undefined,
  questionType: string,
  durationSeconds?: number,
) {
  if (questionType === 'READ_ALOUD' && expectedText)
    return analyzeReadAloud(transcript, expectedText, durationSeconds)
  if (questionType === 'DESCRIBE_PICTURE')
    return analyzeDescribePicture(transcript, durationSeconds)
  if (questionType === 'EXPRESS_OPINION')
    return analyzeExpressOpinion(transcript, durationSeconds)
  if (questionType === 'PROPOSE_SOLUTION')
    return analyzeProposeSolution(transcript, durationSeconds)
  return analyzeGeneric(transcript, durationSeconds)
}

// ── ROUTE HANDLER ─────────────────────────────────────────────────────────────
export async function POST(request: Request) {
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
    const rateNote = rate > 0 ? `Gemessenes Sprechtempo: ${rate} Wörter/Minute (TOEIC-Ideal: 110–145 WPM).` : ''

    const CRITERIA: Record<string, string> = {
      READ_ALOUD: `Kriterien: Aussprache, Intonation, Betonung, Flüssigkeit, Tempo.
Tipps: Wortendungen (-ed, -s) vollständig sprechen; Komma = kurze Pause, Punkt = klare Pause; Stimme am Satzende nicht fallen lassen.`,
      DESCRIBE_PICTURE: `Kriterien: Aussprache, Grammatik, Wortschatz, Kohäsion, Vollständigkeit.
Erwartete Struktur: Einleitung (The picture shows…) → Vordergrund → Hintergrund → Aktivitäten (seems to be / appears to be) → Vermutungen (It looks like…).
Keine erfundenen Details. Ziel: 45 Sekunden sprechen.`,
      RESPOND_FREE: `Kriterien: Relevanz, Vollständigkeit, Aussprache, Grammatik.
Ideal: ca. 15 Sekunden pro Frage, direkt auf die Frage eingehen, Konnektoren verwenden (such as, which, moreover).`,
      RESPOND_EMAIL: `Kriterien: Qualität und Vielfalt der Sätze, Wortschatz, Organisation.
Nützliche Phrasen: Regarding…, I am afraid that…, I would appreciate it if…, Best regards.`,
      PROPOSE_SOLUTION: `Kriterien: Inhalt, Struktur, Aussprache, Grammatik.
Struktur: 1. Problem anerkennen (I am sorry to hear…), 2. Vorgehen erklären, 3. Lösung vorschlagen (I am glad to tell you…).`,
      EXPRESS_OPINION: `Kriterien: Aussprache, Grammatik, Wortschatz, Struktur, Relevanz.
Struktur: Meinung (I personally believe…) → Grund 1 (Firstly…) → Grund 2 (Secondly/Moreover…) → Beispiel → Fazit (In conclusion…).
Mindestens 2 Gründe mit Beispielen. Nicht vom Thema abweichen.`,
    }

    const criteria = CRITERIA[questionType] ?? 'Kriterien: Aussprache, Grammatik, Vollständigkeit, Flüssigkeit.'

    let prompt = `Du bist ein erfahrener TOEIC-Sprachtrainer. Bewerte folgende Aufnahme (Aufgabentyp: ${questionType}).

${criteria}
${rateNote}
${expectedText ? `\nErwarteter Text:\n"${expectedText}"\n` : ''}
Transkript der Aufnahme:
"${transcript || '(keine Sprache erkannt)'}"

Antworte NUR mit validem JSON (kein Markdown, keine Erklärung außerhalb des JSON):
{
  "complete": boolean,
  "completenessPercent": number (0–100),
  "feedback": "2–3 Sätze auf Deutsch: zuerst was gut war, dann was fehlt oder verbessert werden kann, dann ein konkreter TOEIC-Tipp",
  "missingPortion": ${questionType === 'READ_ALOUD' ? '"fehlender Textabschnitt oder null"' : 'null'}
}`

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 450,
      messages: [{ role: 'user', content: prompt }],
    })

    const raw = (message.content[0] as { text: string }).text.trim()
    return NextResponse.json(JSON.parse(raw))
  } catch (err) {
    console.error('[POST /api/speech-feedback] Claude failed, using local analysis:', err)
    return NextResponse.json(analyzeLocally(transcript, expectedText, questionType, durationSeconds))
  }
}
