import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { isAdminEmail } from '@/lib/admin'
import { Section, QuestionType } from '@prisma/client'

const VALID_SECTIONS  = new Set(Object.values(Section))
const VALID_TYPES     = new Set(Object.values(QuestionType))

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(l => l.trim())
  if (lines.length < 2) return []

  function parseLine(line: string): string[] {
    const result: string[] = []
    let current = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') { current += '"'; i++ }
        else inQuotes = !inQuotes
      } else if (ch === ',' && !inQuotes) {
        result.push(current.trim()); current = ''
      } else {
        current += ch
      }
    }
    result.push(current.trim())
    return result
  }

  const headers = parseLine(lines[0]).map(h => h.toLowerCase().trim())
  return lines.slice(1).map(line => {
    const values = parseLine(line)
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? '']))
  })
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !isAdminEmail(user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'Keine Datei hochgeladen' }, { status: 400 })
    if (!file.name.endsWith('.csv')) return NextResponse.json({ error: 'Nur CSV-Dateien erlaubt' }, { status: 400 })
    if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: 'Datei zu groß (max 5 MB)' }, { status: 400 })

    const text = await file.text()
    const rows = parseCSV(text)
    if (rows.length === 0) return NextResponse.json({ error: 'CSV ist leer oder ungültig' }, { status: 400 })

    const errors: string[] = []
    const toCreate: Parameters<typeof prisma.question.create>[0]['data'][] = []

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const rowNum = i + 2 // 1-based, +1 for header

      const section = (row.section ?? '').toUpperCase()
      const type    = (row.type ?? '').toUpperCase().replace(/\s+/g, '_')
      const part    = parseInt(row.part ?? '')
      const answer  = (row.answer ?? '').trim()

      if (!VALID_SECTIONS.has(section as Section)) { errors.push(`Zeile ${rowNum}: Ungültige Section "${section}"`); continue }
      if (!VALID_TYPES.has(type as QuestionType))  { errors.push(`Zeile ${rowNum}: Ungültiger Typ "${type}"`); continue }
      if (isNaN(part) || part < 1)                  { errors.push(`Zeile ${rowNum}: Ungültiger Part "${row.part}"`); continue }
      if (!answer)                                   { errors.push(`Zeile ${rowNum}: Antwort fehlt`); continue }

      // Build content object
      let content: Record<string, unknown>
      try {
        content = row.content_json ? JSON.parse(row.content_json) : { text: row.content ?? row.question ?? '' }
      } catch { errors.push(`Zeile ${rowNum}: content_json ist kein gültiges JSON`); continue }

      // Build options object (either JSON or A,B,C,D columns)
      let options: Record<string, string> | null = null
      if (row.options_json) {
        try { options = JSON.parse(row.options_json) } catch { errors.push(`Zeile ${rowNum}: options_json ungültig`); continue }
      } else if (row.option_a) {
        options = { A: row.option_a, B: row.option_b ?? '', C: row.option_c ?? '', D: row.option_d ?? '' }
      }

      toCreate.push({
        section: section as Section,
        part,
        type: type as QuestionType,
        content: content as never,
        options: options as never,
        answer,
        explanation: row.explanation || null,
        difficulty: row.difficulty ? Math.min(5, Math.max(1, parseInt(row.difficulty))) : 3,
        tags: row.tags ? row.tags.split(';').map((t: string) => t.trim()).filter(Boolean) : [],
        isDiagnostic: (row.is_diagnostic ?? '').toLowerCase() === 'true',
      })
    }

    if (toCreate.length === 0) {
      return NextResponse.json({ error: 'Keine gültigen Zeilen gefunden', errors }, { status: 400 })
    }

    // Batch insert
    const created = await prisma.$transaction(
      toCreate.map(data => prisma.question.create({ data: data as never }))
    )

    return NextResponse.json({
      imported: created.length,
      skipped: rows.length - toCreate.length,
      errors: errors.slice(0, 20),
    })
  } catch (err) {
    console.error('[POST /api/admin/questions/import]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
