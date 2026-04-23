'use client'
import { useState } from 'react'
import { useLang } from '@/lib/i18n/client'
import {
  LayoutGrid, HelpCircle, BookMarked, CalendarCheck, TrendingUp, Shield,
  Headphones, BookOpen, CheckCircle, XCircle, Clock, Award, FileText,
  ChevronDown, ChevronRight, AlertCircle, Info,
} from 'lucide-react'

type Tab = 'format' | 'faq' | 'prep' | 'testday' | 'scores' | 'policy'

// ── Small shared UI pieces ────────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-lg font-bold" style={{ marginBottom: 16, color: 'var(--foreground)' }}>
      {children}
    </h2>
  )
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-semibold" style={{ marginBottom: 10, color: 'var(--foreground)' }}>
      {children}
    </h3>
  )
}

function InfoCard({ children, accent }: { children: React.ReactNode; accent?: string }) {
  return (
    <div className="card" style={{
      padding: '20px 24px', marginBottom: 16,
      borderLeft: accent ? `3px solid ${accent}` : undefined,
    }}>
      {children}
    </div>
  )
}

function Badge({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span style={{
      display: 'inline-block', padding: '2px 10px', borderRadius: 99,
      fontSize: 11, fontWeight: 700, letterSpacing: '0.05em',
      background: `${color}20`, color,
    }}>
      {children}
    </span>
  )
}

function CheckItem({ children, ok = true }: { children: React.ReactNode; ok?: boolean }) {
  return (
    <li style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
      {ok
        ? <CheckCircle size={15} style={{ color: 'var(--success)', flexShrink: 0, marginTop: 2 }} />
        : <XCircle    size={15} style={{ color: 'var(--error)',   flexShrink: 0, marginTop: 2 }} />}
      <span className="text-sm" style={{ lineHeight: 1.6 }}>{children}</span>
    </li>
  )
}

function Table({ headers, rows, accent }: { headers: string[]; rows: (string | React.ReactNode)[][]; accent?: string }) {
  return (
    <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid var(--card-border)', marginBottom: 20 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: accent ? `${accent}15` : 'var(--surface)' }}>
            {headers.map((h, i) => (
              <th key={i} style={{
                padding: '9px 14px', textAlign: 'left', fontWeight: 700,
                color: accent ?? 'var(--muted)', letterSpacing: '0.04em', fontSize: 11,
                textTransform: 'uppercase', borderBottom: '1px solid var(--card-border)',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: i < rows.length - 1 ? '1px solid var(--card-border)' : 'none' }}>
              {row.map((cell, j) => (
                <td key={j} style={{ padding: '9px 14px', verticalAlign: 'top' }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── FAQ Accordion ─────────────────────────────────────────────────────────────

function FaqItem({ q, a }: { q: string; a: string | React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: '1px solid var(--card-border)' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: 12,
        }}
      >
        <span className="text-sm font-semibold" style={{ color: 'var(--foreground)', lineHeight: 1.5 }}>{q}</span>
        {open
          ? <ChevronDown size={16} style={{ color: 'var(--muted)', flexShrink: 0 }} />
          : <ChevronRight size={16} style={{ color: 'var(--muted)', flexShrink: 0 }} />}
      </button>
      {open && (
        <div className="text-sm" style={{ paddingBottom: 14, color: 'var(--muted)', lineHeight: 1.7 }}>
          {a}
        </div>
      )}
    </div>
  )
}

// ── Tab content components ────────────────────────────────────────────────────

function FormatTab({ isDE }: { isDE: boolean }) {
  const L = '#22d3ee'
  const R = '#4ade80'
  return (
    <div>
      {/* Overview strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 28 }}>
        {[
          { label: isDE ? 'Gesamt Fragen' : 'Total Questions', value: '200', sub: isDE ? '100 Listening + 100 Reading' : '100 Listening + 100 Reading' },
          { label: isDE ? 'Gesamtdauer' : 'Total Duration', value: '≈ 2h 25min', sub: isDE ? '45 min L + 75 min R + Admin' : '45 min L + 75 min R + admin' },
          { label: isDE ? 'Antwortformat' : 'Answer Format', value: 'Multiple Choice', sub: isDE ? 'A/B/C/D — kein Zeitlimit beim Lesen' : 'A/B/C/D — no time limit in Reading' },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: '16px 18px' }}>
            <p className="text-xs font-semibold" style={{ color: 'var(--muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</p>
            <p className="text-xl font-bold" style={{ marginBottom: 4 }}>{s.value}</p>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Listening */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <Headphones size={16} style={{ color: L }} />
        <SectionHeading>{isDE ? 'Listening Section — 45 Minuten, 100 Fragen' : 'Listening Section — 45 Minutes, 100 Questions'}</SectionHeading>
      </div>
      <Table
        accent={L}
        headers={isDE
          ? ['Part', 'Aufgabentyp', 'Fragen', 'Format', 'Optionen']
          : ['Part', 'Task Type', 'Questions', 'Format', 'Options']}
        rows={[
          ['Part 1', isDE ? 'Fotos beschreiben' : 'Photographs', '6', isDE ? '1 Foto → 4 gesprochene Aussagen (nicht gedruckt)' : '1 photo → 4 spoken statements (not printed)', 'A / B / C / D'],
          ['Part 2', isDE ? 'Frage & Antwort' : 'Question-Response', '25', isDE ? '1 gesprochene Frage → 3 gesprochene Antworten (nicht gedruckt)' : '1 spoken question → 3 spoken responses (not printed)', <><Badge color={L}>A / B / C</Badge>{' '}<span style={{ color: 'var(--muted)', fontSize: 11 }}>{isDE ? 'nur 3!' : 'only 3!'}</span></>],
          ['Part 3', isDE ? 'Gespräche' : 'Conversations', '39', isDE ? '13 Gespräche × 3 Fragen — teils mit Grafik' : '13 conversations × 3 questions — some with graphic', 'A / B / C / D'],
          ['Part 4', isDE ? 'Vorträge' : 'Talks', '30', isDE ? '10 Monologe × 3 Fragen — teils mit Grafik' : '10 monologues × 3 questions — some with graphic', 'A / B / C / D'],
        ]}
      />
      <InfoCard accent={L}>
        <p className="text-sm" style={{ color: 'var(--muted)', lineHeight: 1.7 }}>
          <span style={{ color: L, fontWeight: 600 }}>{isDE ? 'Wichtig: ' : 'Key note: '}</span>
          {isDE
            ? 'Part 1 und Part 2 haben keine gedruckten Antwortoptionen — alles läuft über Audio. Part 2 ist der einzige Part mit nur 3 Optionen (A/B/C). In Parts 3 und 4 gibt es Fragen, die auf eine mitgedruckte Grafik (Tabelle, Liste, Zeitplan) verweisen.'
            : 'Parts 1 and 2 have no printed answer choices — everything is audio-only. Part 2 is the only part with just 3 options (A/B/C). Some questions in Parts 3 and 4 refer to a printed graphic (table, list, schedule) shown in the test book.'}
        </p>
      </InfoCard>

      {/* Reading */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, marginTop: 8 }}>
        <BookOpen size={16} style={{ color: R }} />
        <SectionHeading>{isDE ? 'Reading Section — 75 Minuten, 100 Fragen' : 'Reading Section — 75 Minutes, 100 Questions'}</SectionHeading>
      </div>
      <Table
        accent={R}
        headers={isDE
          ? ['Part', 'Aufgabentyp', 'Fragen', 'Format', 'Optionen']
          : ['Part', 'Task Type', 'Questions', 'Format', 'Options']}
        rows={[
          ['Part 5', isDE ? 'Lückensätze' : 'Incomplete Sentences', '30', isDE ? '1 Satz mit 1 Lücke — Wort oder Phrase einfügen' : '1 sentence with 1 blank — choose a word or phrase', 'A / B / C / D'],
          ['Part 6', isDE ? 'Textergänzung' : 'Text Completion', '16', isDE ? '4 Texte × 4 Lücken — auch ganze Sätze als Option möglich' : '4 texts × 4 blanks — full sentence insertion possible', 'A / B / C / D'],
          ['Part 7', isDE ? 'Leseverständnis' : 'Reading Comprehension', '54', isDE ? '10 Einzeltexte, 2 Doppeltexte, 3 Dreifachtexte — je 2–5 Fragen' : '~10 single, 2 double, 3 triple passages — 2–5 questions each', 'A / B / C / D'],
        ]}
      />
      <InfoCard accent={R}>
        <p className="text-sm" style={{ color: 'var(--muted)', lineHeight: 1.7 }}>
          <span style={{ color: R, fontWeight: 600 }}>{isDE ? 'Wichtig: ' : 'Key note: '}</span>
          {isDE
            ? 'Der Reading-Teil hat kein Audiosignal und kein festes Zeittakt — du entscheidest selbst, wie viel Zeit du pro Frage verwendest. Du kannst innerhalb des Reading-Teils zurückgehen und Antworten prüfen. Part 6 ist der einzige, bei dem ganze Sätze als Antwortoptionen auftreten. Part 7 kann Textnachrichten-Ketten, E-Mails, Anzeigen und Berichte enthalten.'
            : 'The Reading section has no audio and no fixed pacing — you control your own time per question. You may go back and review answers within the Reading section. Part 6 uniquely offers full-sentence insertion as one answer type. Part 7 may include text message chains, e-mails, advertisements, and reports.'}
        </p>
      </InfoCard>
    </div>
  )
}

function FaqTab({ isDE }: { isDE: boolean }) {
  const faqs = isDE ? [
    {
      q: 'Wie lange dauert der TOEIC Listening & Reading Test?',
      a: 'Der Test dauert insgesamt ca. 2 Stunden und 25 Minuten. Der Listening-Teil läuft ca. 45 Minuten (wird durch das Audioband vorgegeben), der Reading-Teil dauert 75 Minuten (eigenständig bearbeitet). Dazu kommen Eincheck- und Administrationszeit vor Testbeginn.',
    },
    {
      q: 'Welche Maximalpunktzahl kann ich erreichen?',
      a: '990 Punkte insgesamt. Jede Sektion (Listening und Reading) wird separat auf einer Skala von 5 bis 495 bewertet. Die Gesamtpunktzahl ist die Summe beider Sektionswerte. Scores werden in 5-Punkt-Schritten angegeben.',
    },
    {
      q: 'Welchen Ausweis muss ich mitbringen?',
      a: 'Ein amtlicher Lichtbildausweis ist zwingend erforderlich — zum Beispiel Reisepass, nationaler Personalausweis oder Führerschein. Name und Foto müssen mit der Testanmeldung übereinstimmen. Kopien oder abgelaufene Ausweise werden nicht akzeptiert.',
    },
    {
      q: 'Wann bekomme ich mein Ergebnis?',
      a: 'Ergebnisse sind in der Regel 2–3 Wochen nach dem Testtermin online verfügbar. Das exakte Datum hängt von deinem Testcenter und Land ab. Offizielle Score-Reports können auch postalisch zugesandt werden.',
    },
    {
      q: 'Darf ich einen Taschenrechner oder Notizen verwenden?',
      a: 'Nein. Taschenrechner, Wörterbücher, Notizzettel und andere Hilfsmittel sind im Testraum nicht erlaubt. Im Testbuch selbst darf man schreiben, aber Antworten müssen auf dem Antwortblatt markiert werden.',
    },
    {
      q: 'Wie oft darf ich den Test ablegen?',
      a: 'Du kannst den TOEIC-Test so oft ablegen wie du möchtest. Jedoch empfehlen Testanbieter, ausreichend Vorbereitungszeit zwischen zwei Terminen einzuplanen. Informiere dich beim lokalen Anbieter über spezifische Regeln.',
    },
    {
      q: 'Gibt es den Test auch als Computerversion?',
      a: 'Ja — TOEIC wird sowohl als Papiertest als auch als computerbasierter Test angeboten. Der Aufbau und die Fragen sind identisch, lediglich das Medium unterscheidet sich. Welche Version verfügbar ist, hängt vom Testcenter ab.',
    },
    {
      q: 'Was ist der Unterschied zwischen TOEIC L&R und TOEIC S&W?',
      a: 'TOEIC Listening & Reading (L&R) bewertet rezeptive Fähigkeiten: Hör- und Leseverständnis — ausschließlich Multiple Choice, kein Sprechen oder Schreiben. TOEIC Speaking & Writing (S&W) bewertet produktive Fähigkeiten: Sprechen und Schreiben mit Zeitlimits pro Aufgabe. Für das TOEIC Full Certificate werden beide Prüfungen abgelegt.',
    },
    {
      q: 'Was passiert, wenn ich zu spät zum Test erscheine?',
      a: 'Verspätete Prüflinge werden in der Regel nicht zum Test zugelassen, sobald der Listening-Teil begonnen hat. Plane mindestens 30 Minuten Puffer vor dem offiziellen Testbeginn für den Check-in ein.',
    },
  ] : [
    {
      q: 'How long is the TOEIC Listening & Reading test?',
      a: 'The test takes approximately 2 hours and 25 minutes in total. The Listening section is about 45 minutes (paced by the audio track) and the Reading section is 75 minutes (self-paced). Additional time is needed for check-in and administration before the test begins.',
    },
    {
      q: 'What is the maximum score?',
      a: '990 points total. Each section (Listening and Reading) is scored separately on a scale from 5 to 495. The total score is the sum of both section scores. Scores are reported in 5-point increments.',
    },
    {
      q: 'What ID do I need to bring?',
      a: 'A valid government-issued photo ID is mandatory — for example, a passport, national identity card, or driver\'s licence. The name and photo must match your test registration. Copies and expired documents are not accepted.',
    },
    {
      q: 'When will I receive my score?',
      a: 'Scores are typically available online 2–3 weeks after the test date. The exact date depends on your test centre and country. Official score reports may also be sent by post.',
    },
    {
      q: 'Can I use a calculator or notes?',
      a: 'No. Calculators, dictionaries, notes, and other aids are not permitted in the test room. You may write in the test book itself, but all answers must be marked on the separate answer sheet.',
    },
    {
      q: 'How many times can I take the test?',
      a: 'You can take the TOEIC test as many times as you like. However, test providers recommend allowing adequate preparation time between sittings. Check with your local test provider for any specific restrictions.',
    },
    {
      q: 'Is there a computer-based version of the test?',
      a: 'Yes — TOEIC is offered in both paper-based and computer-based formats. The structure and questions are identical; only the medium differs. Which format is available depends on your test centre.',
    },
    {
      q: 'What is the difference between TOEIC L&R and TOEIC S&W?',
      a: 'TOEIC Listening & Reading (L&R) assesses receptive skills: listening and reading comprehension — multiple choice only, no speaking or writing. TOEIC Speaking & Writing (S&W) assesses productive skills: speaking and writing, each task with a time limit. The TOEIC Full Certificate requires both tests.',
    },
    {
      q: 'What happens if I arrive late to the test?',
      a: 'Late arrivals are generally not admitted once the Listening section has begun. Plan to arrive at least 30 minutes before the scheduled start time to allow for check-in procedures.',
    },
  ]

  return (
    <div>
      <SectionHeading>{isDE ? 'Häufig gestellte Fragen' : 'Frequently Asked Questions'}</SectionHeading>
      <div className="card" style={{ padding: '4px 24px 8px' }}>
        {faqs.map((faq, i) => <FaqItem key={i} q={faq.q} a={faq.a} />)}
      </div>
    </div>
  )
}

function PrepTab({ isDE }: { isDE: boolean }) {
  const L = '#22d3ee'
  const R = '#4ade80'
  const timeline = isDE ? [
    { week: 'Woche 1–2', label: 'Diagnose & Grundlagen', desc: 'Einstufungstest absolvieren, Schwächen identifizieren, Testformat kennenlernen.' },
    { week: 'Woche 3–5', label: 'Grundlagen festigen', desc: 'Fokus auf schwächste Bereiche (Grammar für Part 5, Wortschatz für Part 6 & 7). Täglich 30–45 Min. üben.' },
    { week: 'Woche 6–9', label: 'Intensivtraining', desc: 'Alle Parts regelmäßig trainieren. Hörgeschwindigkeit und Lesegeschwindigkeit steigern. Zeitmanagement üben.' },
    { week: 'Woche 10–11', label: 'Simulationstests', desc: 'Komplette Testsimulationen unter echten Bedingungen. Fehler analysieren und gezielt nacharbeiten.' },
    { week: 'Woche 12', label: 'Feinschliff & Regeneration', desc: 'Leichte Wiederholungen, kein Neulernen. Genug schlafen. Testlogistik klären (Ausweis, Anfahrt, Uhrzeit).' },
  ] : [
    { week: 'Week 1–2', label: 'Diagnose & Foundations', desc: 'Complete the diagnostic test, identify weaknesses, and become familiar with the test format.' },
    { week: 'Week 3–5', label: 'Build the Basics', desc: 'Focus on your weakest areas (grammar for Part 5, vocabulary for Parts 6 & 7). Practice 30–45 min daily.' },
    { week: 'Week 6–9', label: 'Intensive Training', desc: 'Train all parts regularly. Build listening speed and reading speed. Practice time management.' },
    { week: 'Week 10–11', label: 'Full Mock Tests', desc: 'Complete test simulations under real conditions. Analyse mistakes and target weak spots.' },
    { week: 'Week 12', label: 'Polish & Rest', desc: 'Light review only, no new material. Get enough sleep. Confirm logistics: ID, travel, test time.' },
  ]

  const tips = isDE ? [
    { section: 'Part 1 & 2', color: L, tips: ['Fotos: Fokus auf Handlungen (Verben), Objekte und Positionen — nicht auf Vermutungen.', 'Part 2: Antworte auf die eigentliche Frage — vermeide verwandte, aber unpassende Optionen.', 'Ablenkungsoptionen benutzen oft dieselben Wörter aus der Frage — inhaltlich prüfen.'] },
    { section: 'Part 3 & 4', color: L, tips: ['Fragen VOR dem Audio lesen — du weißt dann, worauf du achten musst.', 'Ort, Situation und Beziehung der Sprecher früh erkennen.', 'Grafik-Fragen: Tabelle zuerst überblicken, dann Audioinhalt zuordnen.'] },
    { section: 'Part 5', color: R, tips: ['Wortformfragen (noun/verb/adjective/adverb) anhand der Satzposition lösen.', 'Verbindungswörter (since, although, despite…) und ihre Logik kennen.', 'Kollokationen lernen: "make a decision", "take responsibility", "conduct a meeting".'] },
    { section: 'Part 6', color: R, tips: ['Jeden Text vollständig lesen — der Kontext ist entscheidend für Füllsätze.', 'Verbindungsphrasen (However, Therefore, In addition…) für Übergangsfragen lernen.', 'Füllsatz-Option: passt sie logisch zum vorherigen und nächsten Satz?'] },
    { section: 'Part 7', color: R, tips: ['Frage zuerst lesen, dann gezielt im Text suchen (Scanning).', 'Bei Doppel-/Dreifachtexten: In welchem Text liegt die Antwort wahrscheinlich?', 'Vokabelfragen: Welche Bedeutung passt im Kontext — nicht das erste, was dir einfällt.'] },
  ] : [
    { section: 'Part 1 & 2', color: L, tips: ['Photographs: focus on actions (verbs), objects, and positions — avoid guessing.', 'Part 2: answer the actual question — avoid options that sound related but miss the point.', 'Distractor options often reuse words from the question — always check meaning.'] },
    { section: 'Part 3 & 4', color: L, tips: ['Read the questions BEFORE the audio plays — know what to listen for.', 'Identify location, situation, and relationship of speakers early.', 'Graphic questions: scan the table first, then map audio content to it.'] },
    { section: 'Part 5', color: R, tips: ['Word-form questions (noun/verb/adjective/adverb): use sentence position to decide.', 'Know connectors (since, although, despite…) and their logical function.', 'Learn collocations: "make a decision", "take responsibility", "conduct a meeting".'] },
    { section: 'Part 6', color: R, tips: ['Read each full text — context is essential for sentence-insertion blanks.', 'Learn transition phrases (However, Therefore, In addition…) for connector questions.', 'Sentence insertion: does it fit logically before and after the surrounding sentences?'] },
    { section: 'Part 7', color: R, tips: ['Read the question first, then scan the text for the specific answer.', 'For double/triple passages: decide which text likely holds the answer.', 'Vocabulary questions: which meaning fits the context — not just the first one you think of.'] },
  ]

  return (
    <div>
      <SectionHeading>{isDE ? '12-Wochen-Lernplan' : '12-Week Study Plan'}</SectionHeading>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
        {timeline.map((t, i) => (
          <div key={i} className="card" style={{ padding: '14px 20px', display: 'flex', alignItems: 'flex-start', gap: 16 }}>
            <div style={{ minWidth: 90 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t.week}</span>
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ marginBottom: 4 }}>{t.label}</p>
              <p className="text-sm" style={{ color: 'var(--muted)', lineHeight: 1.6 }}>{t.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <SectionHeading>{isDE ? 'Tipps pro Sektion' : 'Section-by-Section Tips'}</SectionHeading>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {tips.map((s, i) => (
          <InfoCard key={i} accent={s.color}>
            <p className="text-sm font-bold" style={{ color: s.color, marginBottom: 10 }}>{s.section}</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {s.tips.map((tip, j) => <CheckItem key={j}>{tip}</CheckItem>)}
            </ul>
          </InfoCard>
        ))}
      </div>
    </div>
  )
}

function TestDayTab({ isDE }: { isDE: boolean }) {
  return (
    <div>
      <SectionHeading>{isDE ? 'Ablauf am Prüfungstag' : 'Test Day Procedures'}</SectionHeading>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* Timeline */}
        <InfoCard>
          <SubHeading>{isDE ? 'Zeitplan' : 'Timeline'}</SubHeading>
          {(isDE ? [
            { time: '− 30 Min.', text: 'Im Testcenter ankommen, Check-in beginnen' },
            { time: '− 15 Min.', text: 'Ausweis-Kontrolle, Platz einnehmen' },
            { time: '00:00', text: 'Test beginnt — Anweisungen werden erklärt' },
            { time: '+45 Min.', text: 'Listening-Teil abgeschlossen' },
            { time: '+120 Min.', text: 'Reading-Teil (75 Min.) endet — Test beendet' },
          ] : [
            { time: '− 30 min', text: 'Arrive at test centre, check-in begins' },
            { time: '− 15 min', text: 'ID check, take your seat' },
            { time: '00:00', text: 'Test begins — directions are read aloud' },
            { time: '+45 min', text: 'Listening section complete' },
            { time: '+120 min', text: 'Reading section (75 min) ends — test finished' },
          ]).map((row, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 10, alignItems: 'flex-start' }}>
              <span className="text-xs font-mono font-bold" style={{ color: 'var(--accent)', minWidth: 60, paddingTop: 2 }}>{row.time}</span>
              <span className="text-sm" style={{ color: 'var(--muted)', lineHeight: 1.5 }}>{row.text}</span>
            </div>
          ))}
        </InfoCard>

        {/* What to bring / not bring */}
        <div>
          <InfoCard>
            <SubHeading>{isDE ? 'Mitnehmen ✓' : 'Bring with you ✓'}</SubHeading>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {(isDE ? [
                'Amtlicher Lichtbildausweis (Reisepass, Personalausweis)',
                'Anmeldebestätigung (falls vom Testcenter verlangt)',
                'Mehrere gut gespitzte Bleistifte (HB / No. 2)',
                'Radiergummi',
              ] : [
                'Valid government-issued photo ID (passport, national ID)',
                'Registration confirmation (if required by the test centre)',
                'Several sharp pencils (HB / No. 2)',
                'Eraser',
              ]).map((item, i) => <CheckItem key={i} ok={true}>{item}</CheckItem>)}
            </ul>
          </InfoCard>
          <InfoCard>
            <SubHeading>{isDE ? 'Nicht erlaubt ✗' : 'Not Allowed ✗'}</SubHeading>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {(isDE ? [
                'Mobiltelefone und elektronische Geräte',
                'Wörterbücher, Bücher, Notizen',
                'Taschenrechner',
                'Essen und Trinken im Testraum',
                'Ohrhörer oder Kopfhörer (eigene)',
              ] : [
                'Mobile phones and electronic devices',
                'Dictionaries, books, notes',
                'Calculators',
                'Food and drinks in the test room',
                'Personal earphones or headphones',
              ]).map((item, i) => <CheckItem key={i} ok={false}>{item}</CheckItem>)}
            </ul>
          </InfoCard>
        </div>
      </div>

      {/* Test procedures */}
      <SectionHeading>{isDE ? 'Ablauf im Testraum' : 'In the Test Room'}</SectionHeading>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {(isDE ? [
          { icon: <Clock size={15} />, title: 'Listening-Takt', desc: 'Der Listening-Teil läuft im eigenen Audiotakt. Du kannst weder pausieren noch zurückspulen. Wenn du eine Frage verpasst, gehe zur nächsten — verliere keine Zeit.' },
          { icon: <BookOpen size={15} />, title: 'Reading-Selbstverwaltung', desc: 'Im Reading-Teil bestimmst du dein eigenes Tempo. Du kannst zurückgehen, Antworten ändern und Fragen überspringen. Achte auf die Zeit — 75 Min. für 100 Fragen = Ø 45 Sek. pro Frage.' },
          { icon: <AlertCircle size={15} />, title: 'Antwortblatt', desc: 'Alle Antworten müssen auf dem separaten Antwortblatt mit Bleistift eingetragen werden. Antworten im Testbuch werden nicht gewertet. Radiere sauber, wenn du eine Antwort änderst.' },
          { icon: <Info size={15} />, title: 'Raten ist erlaubt', desc: 'Es gibt keine Strafpunkte für falsche Antworten. Lasse keine Frage unbeantwortet — ein gesetzter Antwortkreis ist immer besser als keiner.' },
        ] : [
          { icon: <Clock size={15} />, title: 'Listening Pacing', desc: 'The Listening section follows the audio track. You cannot pause or rewind. If you miss a question, move on immediately — do not lose time.' },
          { icon: <BookOpen size={15} />, title: 'Reading Self-Pacing', desc: 'In the Reading section you control your own pace. You can go back, change answers, and skip questions. Watch the clock — 75 min for 100 questions = avg 45 sec per question.' },
          { icon: <AlertCircle size={15} />, title: 'Answer Sheet', desc: 'All answers must be marked in pencil on the separate answer sheet. Answers written in the test book are not scored. Erase completely when changing an answer.' },
          { icon: <Info size={15} />, title: 'Guessing is Allowed', desc: 'There is no penalty for wrong answers. Never leave a question blank — a marked answer is always better than none.' },
        ]).map((item, i) => (
          <div key={i} className="card" style={{ padding: '14px 20px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <span style={{ color: 'var(--accent)', marginTop: 2, flexShrink: 0 }}>{item.icon}</span>
            <div>
              <p className="text-sm font-semibold" style={{ marginBottom: 4 }}>{item.title}</p>
              <p className="text-sm" style={{ color: 'var(--muted)', lineHeight: 1.6 }}>{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ScoresTab({ isDE }: { isDE: boolean }) {
  const cefrData = [
    { cefr: 'A1', color: '#f87171', range: '10 – 224',   de: 'Grundstufe / Beginner',       en: 'Beginner',             desc: isDE ? 'Versteht vereinzelte bekannte Wörter' : 'Understands isolated familiar words' },
    { cefr: 'A2', color: '#fb923c', range: '225 – 549',  de: 'Grundlegende Kenntnisse',      en: 'Elementary',           desc: isDE ? 'Versteht einfache Alltagsausdrücke' : 'Understands simple everyday expressions' },
    { cefr: 'B1', color: '#fbbf24', range: '550 – 784',  de: 'Mittelstufe / Intermediate',   en: 'Intermediate',         desc: isDE ? 'Versteht klare Standardsprache zu vertrauten Themen' : 'Understands clear standard language on familiar topics' },
    { cefr: 'B2', color: '#4ade80', range: '785 – 899',  de: 'Gehobene Mittelstufe',         en: 'Upper Intermediate',   desc: isDE ? 'Versteht komplexe Texte und abstrakte Themen' : 'Understands complex texts and abstract topics' },
    { cefr: 'C1', color: '#22d3ee', range: '900 – 989',  de: 'Fortgeschrittene Kenntnisse',  en: 'Advanced',             desc: isDE ? 'Versteht anspruchsvolle, längere Texte flüssig' : 'Understands demanding, longer texts fluently' },
    { cefr: 'C2', color: '#a78bfa', range: '990',        de: 'Kompetente Sprachverwendung',  en: 'Proficiency',          desc: isDE ? 'Versteht praktisch alles Gehörte und Gelesene' : 'Understands virtually everything heard or read' },
  ]

  return (
    <div>
      <SectionHeading>{isDE ? 'Score-Skala' : 'Score Scale'}</SectionHeading>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 28 }}>
        {[
          { label: isDE ? 'Gesamtpunktzahl' : 'Total Score', value: '10 – 990', sub: isDE ? 'Summe beider Sektionen' : 'Sum of both sections' },
          { label: isDE ? 'Listening' : 'Listening', value: '5 – 495', sub: isDE ? '5-Punkte-Schritte' : '5-point increments' },
          { label: isDE ? 'Reading' : 'Reading', value: '5 – 495', sub: isDE ? '5-Punkte-Schritte' : '5-point increments' },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: '16px 18px' }}>
            <p className="text-xs font-semibold" style={{ color: 'var(--muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</p>
            <p className="text-2xl font-bold" style={{ marginBottom: 4, color: 'var(--accent)' }}>{s.value}</p>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>{s.sub}</p>
          </div>
        ))}
      </div>

      <SectionHeading>{isDE ? 'CEFR-Zuordnung (Gesamtscore L&R)' : 'CEFR Mapping (Total L&R Score)'}</SectionHeading>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
        {cefrData.map(row => (
          <div key={row.cefr} className="card" style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 16, borderLeft: `3px solid ${row.color}` }}>
            <span style={{ fontSize: 20, fontWeight: 800, color: row.color, minWidth: 32 }}>{row.cefr}</span>
            <span className="text-sm font-mono font-semibold" style={{ minWidth: 100, color: 'var(--muted)' }}>{row.range}</span>
            <div style={{ flex: 1 }}>
              <p className="text-sm font-semibold" style={{ color: row.color }}>{isDE ? row.de : row.en}</p>
              <p className="text-xs" style={{ color: 'var(--muted)', marginTop: 2 }}>{row.desc}</p>
            </div>
            {/* Mini bar */}
            <div style={{ width: 80, height: 6, borderRadius: 99, background: 'var(--card-border)', overflow: 'hidden' }}>
              <div style={{ height: '100%', background: row.color, width: cefrData.indexOf(row) === 5 ? '100%' : `${(cefrData.indexOf(row) + 1) * 17}%`, borderRadius: 99 }} />
            </div>
          </div>
        ))}
      </div>

      <SectionHeading>{isDE ? 'Ergebnismitteilung' : 'Score Reporting'}</SectionHeading>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {(isDE ? [
          { icon: <Clock size={15} />, title: 'Ergebnisse online', desc: 'Testergebnisse sind in der Regel 2–3 Wochen nach dem Testtermin im Online-Portal verfügbar. Das genaue Datum wird vom Testcenter mitgeteilt.' },
          { icon: <Award size={15} />, title: 'Score-Report Inhalt', desc: 'Der offizielle Score-Report enthält: Gesamtpunktzahl, Listening-Score, Reading-Score, CEFR-Level sowie optionale Fotografien der Antwortmarkierungen.' },
          { icon: <FileText size={15} />, title: 'Gültigkeitsdauer', desc: 'TOEIC-Scores sind üblicherweise 2 Jahre gültig. Viele Arbeitgeber und Universitäten akzeptieren nur Ergebnisse aus den letzten 24 Monaten. Prüfe die Anforderungen deiner Zielorganisation.' },
        ] : [
          { icon: <Clock size={15} />, title: 'Online Results', desc: 'Test results are typically available in the online portal 2–3 weeks after the test date. The exact date is communicated by the test centre.' },
          { icon: <Award size={15} />, title: 'Score Report Contents', desc: 'The official score report includes: total score, Listening score, Reading score, CEFR level, and optionally photographs of your answer sheet markings.' },
          { icon: <FileText size={15} />, title: 'Validity Period', desc: 'TOEIC scores are typically valid for 2 years. Many employers and universities only accept results from the past 24 months. Check the requirements of your target organisation.' },
        ]).map((item, i) => (
          <div key={i} className="card" style={{ padding: '14px 20px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <span style={{ color: 'var(--accent)', marginTop: 2, flexShrink: 0 }}>{item.icon}</span>
            <div>
              <p className="text-sm font-semibold" style={{ marginBottom: 4 }}>{item.title}</p>
              <p className="text-sm" style={{ color: 'var(--muted)', lineHeight: 1.6 }}>{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PolicyTab({ isDE }: { isDE: boolean }) {
  const sections = isDE ? [
    {
      title: 'Ausweisanforderungen',
      icon: <FileText size={15} />,
      color: '#22d3ee',
      items: [
        'Ein amtlicher Lichtbildausweis ist zwingend erforderlich — ohne Ausweis kein Testzugang.',
        'Akzeptierte Dokumente: Reisepass, nationaler Personalausweis, Führerschein (je nach Land).',
        'Name, Vorname und Foto müssen exakt mit der Testanmeldung übereinstimmen.',
        'Abgelaufene Ausweise und Kopien werden generell nicht akzeptiert.',
        'Wende dich an deinen lokalen Testanbieter, wenn du Fragen zur Ausweispflicht hast.',
      ],
    },
    {
      title: 'Sicherheitsmaßnahmen',
      icon: <Shield size={15} />,
      color: '#fb923c',
      items: [
        'Testcenter können Fingerabdrücke, Fotos oder Unterschriften zur Identitätsverifikation nutzen.',
        'Alle Taschen und persönlichen Gegenstände müssen außerhalb des Testraums verstaut werden.',
        'Aufsichtspersonen überwachen den Test kontinuierlich — auch per Kamera.',
        'Unerlaubte Hilfsmittel, Kommunikation oder Störungen führen zur sofortigen Disqualifikation.',
        'Betrugsversuche können zu dauerhaftem Ausschluss von TOEIC-Tests führen.',
      ],
    },
    {
      title: 'Barrierefreiheit & Besondere Umstände',
      icon: <Info size={15} />,
      color: '#a78bfa',
      items: [
        'Prüflinge mit Behinderungen oder besonderen Bedürfnissen können Sonderregelungen beantragen.',
        'Beispiele: Verlängerte Testzeit, Vergrößerte Schrift, Assistive Technologien, separate Räumlichkeit.',
        'Anträge müssen im Voraus eingereicht werden — sprich deinen Testanbieter frühzeitig an.',
        'Nachweise einer anerkannten Behinderung oder ärztliche Zertifikate können erforderlich sein.',
      ],
    },
    {
      title: 'Stornierung & Umbuchung',
      icon: <CalendarCheck size={15} />,
      color: '#4ade80',
      items: [
        'Stornierungen und Umbuchungen sind je nach Anbieter mit Fristen verbunden.',
        'In den meisten Ländern ist eine kostenlose Umbuchung bis zu einem bestimmten Datum möglich.',
        'Kurzfristige Absagen (oft < 48h vor dem Test) sind in der Regel kostenpflichtig.',
        'Bei Krankheit oder Notfall mit ärztlichem Attest gelten ggf. Sonderregelungen.',
        'Prüfe die genauen Konditionen auf der Website deines lokalen Testanbieters.',
      ],
    },
  ] : [
    {
      title: 'Identification Requirements',
      icon: <FileText size={15} />,
      color: '#22d3ee',
      items: [
        'A valid government-issued photo ID is mandatory — no ID means no access to the test.',
        'Accepted documents: passport, national identity card, driver\'s licence (varies by country).',
        'Your first name, last name, and photo must match your test registration exactly.',
        'Expired documents and photocopies are generally not accepted.',
        'Contact your local test provider if you have questions about ID requirements.',
      ],
    },
    {
      title: 'Security Measures',
      icon: <Shield size={15} />,
      color: '#fb923c',
      items: [
        'Test centres may collect fingerprints, photographs, or signatures for identity verification.',
        'All bags and personal belongings must be stored outside the test room.',
        'Supervisors monitor the test continuously — including via camera.',
        'Unauthorised aids, communication, or disruptions result in immediate disqualification.',
        'Fraud attempts may result in a permanent ban from TOEIC testing.',
      ],
    },
    {
      title: 'Accessibility & Special Circumstances',
      icon: <Info size={15} />,
      color: '#a78bfa',
      items: [
        'Test-takers with disabilities or special needs may apply for accommodations.',
        'Examples: Extended time, enlarged print, assistive technology, separate testing room.',
        'Requests must be submitted in advance — contact your test provider early.',
        'Supporting documentation (e.g. medical certificate) may be required.',
      ],
    },
    {
      title: 'Cancellation & Rescheduling',
      icon: <CalendarCheck size={15} />,
      color: '#4ade80',
      items: [
        'Cancellation and rescheduling policies vary by provider and include deadlines.',
        'In most countries, free rescheduling is possible up to a certain date before the test.',
        'Late cancellations (often < 48h before the test) typically incur a fee.',
        'Illness or emergencies supported by a medical certificate may be treated differently.',
        'Check the exact terms on your local test provider\'s website.',
      ],
    },
  ]

  return (
    <div>
      <SectionHeading>{isDE ? 'Richtlinien & Bestimmungen' : 'Policy & Guidelines'}</SectionHeading>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {sections.map((s, i) => (
          <InfoCard key={i} accent={s.color}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ color: s.color }}>{s.icon}</span>
              <p className="text-sm font-bold" style={{ color: s.color }}>{s.title}</p>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {s.items.map((item, j) => <CheckItem key={j}>{item}</CheckItem>)}
            </ul>
          </InfoCard>
        ))}
      </div>
      <div style={{ marginTop: 20, padding: '14px 18px', borderRadius: 10, background: 'var(--surface)', border: '1px solid var(--card-border)' }}>
        <p className="text-xs" style={{ color: 'var(--muted)', lineHeight: 1.7 }}>
          {isDE
            ? '⚠️ Die genauen Richtlinien können je nach Land und Testanbieter abweichen. Alle verbindlichen Informationen findest du auf der offiziellen ETS-Website oder bei deinem lokalen TOEIC-Testcenter. Dieser Guide dient der allgemeinen Orientierung.'
            : '⚠️ Exact policies may vary by country and test provider. All binding information is available on the official ETS website or from your local TOEIC test centre. This guide serves as a general reference only.'}
        </p>
      </div>
    </div>
  )
}

// ── Main page component ────────────────────────────────────────────────────────

const TABS: { id: Tab; labelDE: string; labelEN: string; icon: React.ReactNode }[] = [
  { id: 'format',  labelDE: 'Test-Format',   labelEN: 'Test Format',  icon: <LayoutGrid size={14} /> },
  { id: 'faq',     labelDE: 'FAQ',           labelEN: 'FAQ',          icon: <HelpCircle size={14} /> },
  { id: 'prep',    labelDE: 'Vorbereitung',  labelEN: 'Preparing',    icon: <BookMarked size={14} /> },
  { id: 'testday', labelDE: 'Prüfungstag',   labelEN: 'Test Day',     icon: <CalendarCheck size={14} /> },
  { id: 'scores',  labelDE: 'Ergebnisse',    labelEN: 'Scores',       icon: <TrendingUp size={14} /> },
  { id: 'policy',  labelDE: 'Richtlinien',   labelEN: 'Policy',       icon: <Shield size={14} /> },
]

export default function GuidePage() {
  const { lang } = useLang()
  const isDE = lang === 'de'
  const [tab, setTab] = useState<Tab>('format')

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 className="text-2xl font-bold" style={{ marginBottom: 6 }}>
          {isDE ? 'TOEIC Prüfungsguide' : 'TOEIC Test Guide'}
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.6 }}>
          {isDE
            ? 'Alles, was du über die TOEIC Listening & Reading Prüfung wissen musst — von Format und Vorbereitung bis zu Score-Interpretation und Prüfungsregeln.'
            : 'Everything you need to know about the TOEIC Listening & Reading test — from format and preparation to score interpretation and exam rules.'}
        </p>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 28, borderBottom: '1px solid var(--card-border)', flexWrap: 'wrap' }}>
        {TABS.map(t => {
          const active = tab === t.id
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px',
                background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500,
                color: active ? 'var(--accent)' : 'var(--muted)',
                borderBottom: `2px solid ${active ? 'var(--accent)' : 'transparent'}`,
                marginBottom: -1, transition: 'color 0.15s, border-color 0.15s',
                borderRadius: '6px 6px 0 0',
              }}
            >
              <span style={{ color: active ? 'var(--accent)' : 'var(--muted)' }}>{t.icon}</span>
              {isDE ? t.labelDE : t.labelEN}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      {tab === 'format'  && <FormatTab  isDE={isDE} />}
      {tab === 'faq'     && <FaqTab     isDE={isDE} />}
      {tab === 'prep'    && <PrepTab    isDE={isDE} />}
      {tab === 'testday' && <TestDayTab isDE={isDE} />}
      {tab === 'scores'  && <ScoresTab  isDE={isDE} />}
      {tab === 'policy'  && <PolicyTab  isDE={isDE} />}
    </div>
  )
}
