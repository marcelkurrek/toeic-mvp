import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { getGenerationPrompt } from '@/lib/toeic-config'
import type { Section, QuestionType } from '@prisma/client'

const SECTION_MAP: Record<string, Section> = {
  LISTENING: 'LISTENING',
  READING: 'READING',
  SPEAKING: 'SPEAKING',
  WRITING: 'WRITING',
}

function parseRaw(raw: unknown, type: string, section: Section, part: number, difficulty: number) {
  const d = raw as Record<string, unknown>
  const base = { section, part, type: type as QuestionType, difficulty, isDiagnostic: false }
  const rows: object[] = []

  const push = (content: unknown, options: unknown, answer: string, explanation: string | null, tags: string[]) =>
    rows.push({ ...base, content, options, answer, explanation, tags })

  switch (type) {
    case 'INCOMPLETE_SENTENCE':
    case 'QUESTION_RESPONSE': {
      for (const q of (d.questions as any[]) ?? []) {
        push(q.content, q.options, q.answer, q.explanation ?? null, q.tags ?? [])
      }
      break
    }
    case 'TEXT_COMPLETION': {
      for (const p of (d.passages as any[]) ?? []) {
        for (const q of p.questions ?? []) {
          push(
            { passage: p.text, question: `Choose the best option for blank [${q.blank}].`, blank: q.blank },
            q.options, q.answer, q.explanation ?? null, q.tags ?? ['text-completion'],
          )
        }
      }
      break
    }
    case 'SINGLE_PASSAGE': {
      for (const s of (d.sets as any[]) ?? []) {
        for (const q of s.questions ?? []) {
          push(
            { passage: s.passage, question: q.question },
            q.options, q.answer, q.explanation ?? null, q.tags ?? [s.passageType ?? 'reading'],
          )
        }
      }
      break
    }
    case 'DOUBLE_PASSAGE':
    case 'TRIPLE_PASSAGE': {
      for (const q of (d.questions as any[]) ?? []) {
        push(
          { passages: d.passages, question: q.question },
          q.options, q.answer, q.explanation ?? null, q.tags ?? ['multiple-passage'],
        )
      }
      break
    }
    case 'CONVERSATION': {
      for (const c of (d.conversations as any[]) ?? []) {
        for (const q of c.questions ?? []) {
          push(
            { transcript: c.transcript, question: q.question, graphic: c.graphic ?? null },
            q.options, q.answer, q.explanation ?? null, q.tags ?? ['conversation'],
          )
        }
      }
      break
    }
    case 'TALK': {
      for (const t of (d.talks as any[]) ?? []) {
        for (const q of t.questions ?? []) {
          push(
            { transcript: t.transcript, question: q.question, graphic: t.graphic ?? null },
            q.options, q.answer, q.explanation ?? null, q.tags ?? ['talk'],
          )
        }
      }
      break
    }
    // Speaking/Writing open-ended — one DB row per item
    case 'READ_ALOUD':
    case 'DESCRIBE_PICTURE':
    case 'EXPRESS_OPINION':
    case 'PROPOSE_SOLUTION':
    case 'WRITE_SENTENCE':
    case 'RESPOND_EMAIL':
    case 'OPINION_ESSAY': {
      const items = (d.questions as any[]) ?? (d.passages as any[]) ?? []
      for (const q of items) {
        push(q.content, null, '', null, q.tags ?? [])
      }
      break
    }
    case 'RESPOND_FREE':
    case 'RESPOND_INFO': {
      for (const s of (d.sets as any[]) ?? []) {
        push(s.content, null, '', null, s.tags ?? [])
      }
      break
    }
  }
  return rows
}

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY not configured. Add it to .env and restart the server.' },
      { status: 503 },
    )
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const {
    section,
    part,
    type,
    count = 5,
    difficulty = 3,
    saveToDb = true,
  } = body as {
    section: string
    part: number
    type: string
    count: number
    difficulty: number
    saveToDb?: boolean
  }

  const sec = SECTION_MAP[section]
  if (!sec) return NextResponse.json({ error: `Unknown section: ${section}` }, { status: 400 })

  const { system, user: userPrompt } = getGenerationPrompt(type, count, difficulty)

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  let raw: unknown
  try {
    const msg = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 8000,
      system,
      messages: [{ role: 'user', content: userPrompt }],
    })
    const text = msg.content.find(b => b.type === 'text')?.text ?? '{}'
    // Strip any accidental markdown fences
    const cleaned = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim()
    raw = JSON.parse(cleaned)
  } catch (err) {
    console.error('[generate-questions] Claude call failed:', err)
    return NextResponse.json({ error: 'Generation failed', detail: String(err) }, { status: 500 })
  }

  const questions = parseRaw(raw, type, sec, part, difficulty)

  if (saveToDb && questions.length > 0) {
    try {
      await prisma.question.createMany({ data: questions as any[], skipDuplicates: false })
    } catch (err) {
      console.error('[generate-questions] DB save failed:', err)
      return NextResponse.json({ error: 'DB save failed', detail: String(err), questions }, { status: 500 })
    }
  }

  return NextResponse.json({ count: questions.length, questions })
}
