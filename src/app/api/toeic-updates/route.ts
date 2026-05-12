import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { TOEIC_VERSION, TOEIC_LAST_CHECKED, TOEIC_FORMAT } from '@/lib/toeic-config'

export async function GET() {
  // Return history of past checks
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const checks = await prisma.toeicFormatCheck.findMany({
      orderBy: { checkedAt: 'desc' },
      take: 10,
    }).catch(() => [])

    return NextResponse.json({
      currentVersion: TOEIC_VERSION,
      lastChecked: TOEIC_LAST_CHECKED,
      history: checks,
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY not configured.' },
      { status: 503 },
    )
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const currentSummary = {
    version: TOEIC_VERSION,
    speaking: {
      tasks: TOEIC_FORMAT.speaking.tasks.map(t => ({
        questions: t.questions,
        type: t.type,
        prepSecs: (t as any).prepSecs,
        speakSecs: (t as any).speakSecs,
        scoreScale: t.scoreScale,
      })),
      removedTasks: TOEIC_FORMAT.speaking.removedTasks,
    },
    listening: {
      parts: TOEIC_FORMAT.listening.parts.map(p => ({ part: p.part, type: p.type, questions: p.questions })),
    },
    reading: {
      parts: TOEIC_FORMAT.reading.parts.map(p => ({ part: p.part, type: p.type, questions: (p as any).questions })),
    },
    writing: {
      tasks: TOEIC_FORMAT.writing.tasks.map(t => ({ questions: t.questions, type: t.type, scoreScale: t.scoreScale })),
    },
  }

  let findings: object[] = []
  let hasChanges = false

  try {
    const msg = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      system: `You are a TOEIC test format expert. Your job is to identify any official changes to the TOEIC test format.
The current format version in our system is from August 2021.
Respond with valid JSON only — no markdown, no explanation.`,
      messages: [{
        role: 'user',
        content: `Based on your knowledge up to your training cutoff, are there any known changes to the official TOEIC test format that differ from the structure described below?

Current format in our system (version: ${TOEIC_VERSION}, last checked: ${TOEIC_LAST_CHECKED}):
${JSON.stringify(currentSummary, null, 2)}

Please check for:
1. Changes to Speaking task types, question numbers, or timing
2. Changes to Writing task types or scoring
3. Changes to Listening/Reading part counts or question numbers
4. Any new official ETS announcements about TOEIC format changes after August 2021

Respond with this exact JSON:
{
  "hasChanges": true | false,
  "findings": [
    {
      "area": "Speaking Q3-4",
      "description": "Prep time changed from 30s to 45s",
      "severity": "high | medium | low",
      "source": "URL or 'ETS official announcement'",
      "confidence": "high | medium | low"
    }
  ],
  "summary": "One sentence summary of findings or 'No changes detected'"
}`,
      }],
    })

    const text = msg.content.find(b => b.type === 'text')?.text ?? '{}'
    const cleaned = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim()
    const parsed = JSON.parse(cleaned)
    findings = parsed.findings ?? []
    hasChanges = parsed.hasChanges ?? false
  } catch (err) {
    console.error('[toeic-updates] Claude call failed:', err)
    return NextResponse.json({ error: 'Check failed', detail: String(err) }, { status: 500 })
  }

  // Save check to DB
  let check: { id: string; checkedAt: Date; formatVersion: string; hasChanges: boolean; findings: unknown } | null = null
  try {
    check = await prisma.toeicFormatCheck.create({
      data: {
        formatVersion: TOEIC_VERSION,
        findings,
        hasChanges,
      },
    })
  } catch (err) {
    // DB unavailable in dev — return result without saving
    console.warn('[toeic-updates] DB save skipped:', err)
  }

  return NextResponse.json({
    checkedAt: check?.checkedAt ?? new Date(),
    formatVersion: TOEIC_VERSION,
    hasChanges,
    findings,
    saved: !!check,
  })
}
