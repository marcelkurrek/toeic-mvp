import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isAdminEmail } from '@/lib/admin'
import Link from 'next/link'
import { CSVImportForm } from './CSVImportForm'

export default async function ImportQuestionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdminEmail(user.email)) redirect('/dashboard')

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <Link href="/admin/questions" style={{ fontSize: 12, color: 'var(--muted)', textDecoration: 'none' }}>
          ← Zurück zur Übersicht
        </Link>
        <h1 className="text-3xl font-bold" style={{ marginTop: 10, marginBottom: 6 }}>CSV-Import</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>Fragen in Bulk aus einer CSV-Datei importieren</p>
      </div>

      {/* Format docs */}
      <div className="card" style={{ padding: '22px 24px', marginBottom: 24 }}>
        <h2 className="font-semibold text-sm" style={{ marginBottom: 14 }}>CSV-Format</h2>
        <p className="text-xs" style={{ color: 'var(--muted)', marginBottom: 12, lineHeight: 1.7 }}>
          Die erste Zeile muss die Spaltennamen enthalten. Pflichtfelder sind fett markiert.
        </p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', fontSize: 11, width: '100%' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                {['Spalte', 'Pflicht', 'Beschreibung', 'Beispiel'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['section',       '✓', 'READING / LISTENING / SPEAKING / WRITING', 'READING'],
                ['part',          '✓', 'Zahl (1–7)', '5'],
                ['type',          '✓', 'QuestionType (z.B. INCOMPLETE_SENTENCE)', 'INCOMPLETE_SENTENCE'],
                ['answer',        '✓', 'Korrekte Antwort (A/B/C/D oder Text)', 'A'],
                ['content',       '—', 'Fragetext (einfach, wenn kein JSON)', 'The report ___ yesterday.'],
                ['content_json',  '—', 'Frageinhalt als JSON (überschreibt content)', '{"text":"...","passage":"..."}'],
                ['option_a',      '—', 'Antwort-Option A', 'was submitted'],
                ['option_b',      '—', 'Antwort-Option B', 'submits'],
                ['option_c',      '—', 'Antwort-Option C', 'submit'],
                ['option_d',      '—', 'Antwort-Option D', 'submitting'],
                ['options_json',  '—', 'Optionen als JSON (überschreibt option_a–d)', '{"A":"...","B":"..."}'],
                ['explanation',   '—', 'Erklärung der Antwort', 'Passt tense ist...'],
                ['difficulty',    '—', 'Schwierigkeit 1–5 (Standard: 3)', '3'],
                ['tags',          '—', 'Semikolon-getrennte Tags', 'grammar;past-tense'],
                ['is_diagnostic', '—', 'true / false (Standard: false)', 'false'],
              ].map(([col, req, desc, ex]) => (
                <tr key={col} style={{ borderBottom: '1px solid var(--card-border)' }}>
                  <td style={{ padding: '7px 12px', fontFamily: 'monospace', fontSize: 11, color: req === '✓' ? 'var(--accent)' : 'var(--fg)', fontWeight: req === '✓' ? 700 : 400 }}>{col}</td>
                  <td style={{ padding: '7px 12px', textAlign: 'center', color: req === '✓' ? 'var(--success)' : 'var(--card-border)' }}>{req}</td>
                  <td style={{ padding: '7px 12px', color: 'var(--muted)' }}>{desc}</td>
                  <td style={{ padding: '7px 12px', fontFamily: 'monospace', fontSize: 10, color: 'var(--muted)' }}>{ex}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs" style={{ color: 'var(--muted)', marginTop: 12, lineHeight: 1.6 }}>
          Mindestens eines von <code style={{ background: 'var(--card-border)', padding: '1px 4px', borderRadius: 4 }}>content</code> oder <code style={{ background: 'var(--card-border)', padding: '1px 4px', borderRadius: 4 }}>content_json</code> muss vorhanden sein.
          Für Multiple-Choice-Fragen entweder <code style={{ background: 'var(--card-border)', padding: '1px 4px', borderRadius: 4 }}>option_a</code>–<code style={{ background: 'var(--card-border)', padding: '1px 4px', borderRadius: 4 }}>option_d</code> oder <code style={{ background: 'var(--card-border)', padding: '1px 4px', borderRadius: 4 }}>options_json</code>.
        </p>
      </div>

      <CSVImportForm />
    </div>
  )
}
