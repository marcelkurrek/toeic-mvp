import Link from 'next/link'
import { Clock, BookOpen, Headphones, ChevronRight, AlertCircle, Mic, PenLine } from 'lucide-react'

const EXAMS = [
  {
    id: 'lr',
    parts: '1,2,3,4,5,6,7',
    time: 120,
    label: 'Listening & Reading',
    desc: 'Vollständiger Test mit allen 7 Parts — so wie in der echten Prüfung.',
    icon: '📖',
    sections: [
      { label: 'Listening', sub: 'Parts 1–4', color: '#22d3ee', icon: Headphones },
      { label: 'Reading',   sub: 'Parts 5–7', color: '#4ade80', icon: BookOpen },
    ],
    available: true,
  },
  {
    id: 'reading',
    parts: '5,6,7',
    time: 75,
    label: 'Reading Only',
    desc: 'Nur Reading-Sektion mit Parts 5, 6 und 7.',
    icon: '📚',
    sections: [
      { label: 'Reading', sub: 'Parts 5–7', color: '#4ade80', icon: BookOpen },
    ],
    available: true,
  },
  {
    id: 'listening',
    parts: '1,2,3,4',
    time: 45,
    label: 'Listening Only',
    desc: 'Nur Listening-Sektion mit Parts 1–4.',
    icon: '🎧',
    sections: [
      { label: 'Listening', sub: 'Parts 1–4', color: '#22d3ee', icon: Headphones },
    ],
    available: true,
  },
]

export default function MockExamPage() {
  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>

      <div style={{ marginBottom: 36 }}>
        <h1 className="text-3xl font-bold" style={{ marginBottom: 8 }}>Mock-Prüfung</h1>
        <p style={{ color: 'var(--muted)', fontSize: 15, lineHeight: 1.6 }}>
          Simuliere die echte TOEIC-Prüfung. Kein Feedback während der Prüfung — Ergebnisse erst am Ende.
        </p>
      </div>

      {/* Info box */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 12,
        padding: '16px 20px', borderRadius: 12, marginBottom: 32,
        background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.3)',
      }}>
        <AlertCircle size={16} style={{ color: '#fbbf24', flexShrink: 0, marginTop: 2 }} />
        <p className="text-sm" style={{ color: 'var(--foreground)', lineHeight: 1.6 }}>
          Im Mock-Exam-Modus siehst du <strong>keine Antworten</strong> während der Prüfung.
          Alle Fragen werden am Ende ausgewertet. Der Timer läuft — bei Ablauf wird automatisch eingereicht.
        </p>
      </div>

      {/* Exam options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {EXAMS.map(exam => (
          <div key={exam.id} className="card" style={{ padding: '24px 28px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <span style={{ fontSize: 28 }}>{exam.icon}</span>
                  <div>
                    <h2 className="font-bold text-lg" style={{ marginBottom: 2 }}>{exam.label}</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Clock size={12} style={{ color: 'var(--muted)' }} />
                      <span style={{ fontSize: 12, color: 'var(--muted)' }}>{exam.time} Minuten</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm" style={{ color: 'var(--muted)', lineHeight: 1.5, marginBottom: 16 }}>
                  {exam.desc}
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                  {exam.sections.map(s => (
                    <div key={s.label} style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '4px 10px', borderRadius: 99,
                      background: `${s.color}15`, border: `1px solid ${s.color}30`,
                    }}>
                      <s.icon size={11} style={{ color: s.color }} />
                      <span style={{ fontSize: 11, fontWeight: 600, color: s.color }}>{s.label}</span>
                      <span style={{ fontSize: 10, color: 'var(--muted)' }}>{s.sub}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Link
                href={`/mock-exam/exam?parts=${exam.parts}&time=${exam.time}`}
                className="btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap', flexShrink: 0 }}
              >
                Starten <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Speaking & Writing note */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 12,
        padding: '16px 20px', borderRadius: 12, marginTop: 24, marginBottom: 8,
        background: 'rgba(167,139,250,0.07)', border: '1px solid rgba(167,139,250,0.25)',
      }}>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0, marginTop: 2 }}>
          <Mic size={15} style={{ color: '#a78bfa' }} />
          <PenLine size={15} style={{ color: '#a78bfa' }} />
        </div>
        <p className="text-sm" style={{ color: 'var(--foreground)', lineHeight: 1.6 }}>
          <strong>Speaking & Writing</strong> sind als geführte Übungen mit KI-Feedback verfügbar —{' '}
          <Link href="/speaking" style={{ color: '#a78bfa', fontWeight: 600 }}>Speaking</Link>
          {' '}und{' '}
          <Link href="/writing" style={{ color: '#a78bfa', fontWeight: 600 }}>Writing</Link>.
          Im Mock-Exam-Format wird nur Listening & Reading simuliert (wie in der echten L&R-Prüfung).
        </p>
      </div>

      {/* Tips */}
      <div style={{ marginTop: 36 }}>
        <h3 className="font-semibold text-sm" style={{ marginBottom: 12, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: 11 }}>
          Tipps für den Mock-Exam
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[
            { icon: '🔇', tip: 'Ruhige Umgebung schaffen — kein Handy, keine Ablenkungen' },
            { icon: '⏱️', tip: 'Zeit einteilen — nicht zu lange bei einer Frage verweilen' },
            { icon: '📝', tip: 'Alle Fragen beantworten — falsch ist besser als gar nichts' },
          ].map(({ icon, tip }) => (
            <div key={icon} className="card" style={{ padding: '16px 18px' }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
              <p className="text-xs" style={{ color: 'var(--muted)', lineHeight: 1.6 }}>{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
