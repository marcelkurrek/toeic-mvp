# TOEIC MVP — Claude Context File

Diese Datei wird von Claude Code automatisch gelesen. Sie enthält alle projektrelevanten Informationen, TOEIC-Recherche, Plattform-Analyse und den Maßnahmenplan.

---

## 1. Projekt & Stack

**Repo:** `marcelkurrek/toeic-mvp`
**Branch:** `claude/start-server-vbQti`
**Stack:** Next.js 14 App Router · Supabase Auth + PostgreSQL · Prisma ORM · Tailwind CSS · Lucide Icons · `@anthropic-ai/sdk`

**Git Push (PAT):** Vor jedem Push ausführen (PAT aus `.env` oder GitHub Secrets holen):
```bash
git remote set-url origin https://<GITHUB_PAT>@github.com/marcelkurrek/toeic-mvp.git
```

**Wichtig für Umgebung:**
- TCP-Ports 6543/5432 sind in Claude Code blockiert → Prisma nur über HTTPS-Supabase-URL erreichbar
- Alle Prisma-Queries in Claude Code-Umgebung mit `.catch(() => null)` absichern
- Deployment/Testing läuft in GitHub Codespaces

---

## 2. Was bereits implementiert ist

| Feature | Status | Datei/Route |
|---------|--------|-------------|
| Supabase Auth (Login/Register) | ✅ | `src/app/(auth)/` |
| Sidebar Navigation | ✅ | `src/components/Sidebar.tsx` |
| Dashboard | ✅ | `src/app/(app)/dashboard/page.tsx` |
| Listening/Reading/Speaking/Writing Seiten | ✅ | `src/app/(app)/[section]/` |
| Diagnostic Mode | ✅ | `src/app/(app)/diagnostic/` |
| Progress Page | ✅ | `src/app/(app)/progress/page.tsx` |
| Guide Page | ✅ | `src/app/(app)/guide/page.tsx` |
| Admin Page (KI-Generator + Update-Checker) | ✅ | `src/app/(app)/admin/page.tsx` |
| API: Fragen generieren via Claude | ✅ | `src/app/api/generate-questions/route.ts` |
| API: TOEIC-Format Update-Checker | ✅ | `src/app/api/toeic-updates/route.ts` |
| TOEIC Config (kanonische Struktur + Prompts) | ✅ | `src/lib/toeic-config.ts` |
| ~180 Seed-Fragen (alle Parts, kein API-Key) | ✅ | `prisma/seed.ts` |
| Prisma Schema inkl. ToeicFormatCheck | ✅ | `prisma/schema.prisma` |
| Einheitliches Layout (maxWidth 820px) | ✅ | Alle Seiten |
| Language Switcher (DE/EN) | ✅ | `src/components/LanguageSwitcher.tsx` |
| Theme Switcher (Dark/Light) | ✅ | `src/components/ThemeSwitcher.tsx` |

**Seed-Daten starten:**
```bash
npx prisma db push   # neue Tabellen erstellen (einmalig)
npx prisma db seed   # ~180 Fragen laden
```

---

## 3. Prisma Schema (Übersicht)

```prisma
model Question {
  id          String       @id @default(cuid())
  section     Section      // LISTENING | READING | SPEAKING | WRITING
  part        Int          // 1-7 für L&R; 1-5 für Speaking; 1-3 für Writing
  type        QuestionType
  content     Json         // text, imageUrl, audioUrl, transcript, keywords etc.
  options     Json?        // MC-Optionen oder null für open-ended
  answer      String       // korrekter Key (A/B/C/D) oder Modellantwort
  explanation String?
  difficulty  Int          @default(3) // 1-5 (A1-C1)
  tags        String[]
  isDiagnostic Boolean     @default(false)
}

enum QuestionType {
  // Listening
  PHOTOGRAPH QUESTION_RESPONSE CONVERSATION TALK
  // Reading
  INCOMPLETE_SENTENCE TEXT_COMPLETION SINGLE_PASSAGE DOUBLE_PASSAGE TRIPLE_PASSAGE
  // Speaking
  READ_ALOUD DESCRIBE_PICTURE RESPOND_FREE RESPOND_INFO EXPRESS_OPINION PROPOSE_SOLUTION
  // Writing
  WRITE_SENTENCE RESPOND_EMAIL OPINION_ESSAY
}
```

---

## 4. TOEIC-Recherche (offizielles Format seit August 2021)

### TOEIC Listening & Reading (L&R)
- **Gesamtpunkte:** 990 (L: 5–495, R: 5–495)
- **Dauer:** 120 Minuten, 200 Fragen

| Part | Typ | Fragen | Details |
|------|-----|--------|---------|
| 1 | PHOTOGRAPH | 6 | 4 gesprochene Aussagen über Foto, beste wählen |
| 2 | QUESTION_RESPONSE | 25 | Frage hören + 3 Antworten (A/B/C), beste wählen |
| 3 | CONVERSATION | 39 | 13 Gespräche × 3 Fragen (teils mit Grafik) |
| 4 | TALK | 30 | 10 Monologe × 3 Fragen (teils mit Grafik) |
| 5 | INCOMPLETE_SENTENCE | 30 | Lückentext, 4 Optionen, Grammatik/Vokabular |
| 6 | TEXT_COMPLETION | 16 | 4 Texte × 4 Lücken (Lücke 4 = Satz-Einfügung) |
| 7 | SINGLE_PASSAGE | 29 | 10 Texte, je 2-4 Fragen |
| 7 | DOUBLE_PASSAGE | 10 | 2 Sets × 5 Fragen, zwei verwandte Texte |
| 7 | TRIPLE_PASSAGE | 15 | 3 Sets × 5 Fragen, drei verwandte Texte |

### TOEIC Speaking & Writing (S&W)
- **Speaking:** 11 Aufgaben, ~20 Minuten, Score 0–200
- **Writing:** 8 Aufgaben, ~60 Minuten, Score 0–200

**Speaking (aktuelle Format seit Aug 2021):**
| Task | Typ | Anzahl | Timing | Score |
|------|-----|--------|--------|-------|
| Q1-2 | READ_ALOUD | 2 | 45s Prep, 45s Speak | 0-3 |
| Q3-4 | DESCRIBE_PICTURE | 2 | 30s Prep, 45s Speak | 0-3 |
| Q5-7 | RESPOND_FREE | 3 | 3s Prep, 15/15/30s Speak | 0-3 |
| Q8-10 | RESPOND_INFO | 3 | 45s Lesen, 15/15/30s Speak | 0-3 |
| Q11 | EXPRESS_OPINION | 1 | 45s Prep, 60s Speak | 0-5 |

**⚠️ WICHTIG:** `PROPOSE_SOLUTION` wurde im August 2021 von ETS entfernt. Im Schema behalten für Legacy/Extra-Übungen, aber nicht im Standard-Curriculum.

**Writing:**
| Task | Typ | Anzahl | Zeit | Score |
|------|-----|--------|------|-------|
| Q1-5 | WRITE_SENTENCE | 5 | 8 Min gesamt | 0-3 |
| Q6-7 | RESPOND_EMAIL | 2 | 10 Min je | 0-4 |
| Q8 | OPINION_ESSAY | 1 | 30 Min, ≥300 Wörter | 0-5 |

### Content JSON-Struktur pro Typ
```typescript
// PHOTOGRAPH: { imageUrl, transcript: string[] }
// QUESTION_RESPONSE: { question, responses: string[] }
// CONVERSATION / TALK: { transcript, question, graphic?: { type, title, headers, rows } }
// INCOMPLETE_SENTENCE: { question }
// TEXT_COMPLETION: { passage, question }
// SINGLE_PASSAGE: { passage, question } | { messages: [{sender,time,text}], question }
// DOUBLE_PASSAGE / TRIPLE_PASSAGE: { passages: [{title,text}], question }
// READ_ALOUD: { text, prepSeconds, speakSeconds }
// DESCRIBE_PICTURE: { imageUrl, prompt, prepSeconds, speakSeconds, hints }
// RESPOND_FREE: { scenario, questions: [{id,text,prepSeconds,speakSeconds}] }
// RESPOND_INFO: { scenario, document: {title,type,headers,rows}, questions: [{id,text,...}] }
// EXPRESS_OPINION: { prompt, prepSeconds, speakSeconds, structure: string[] }
// WRITE_SENTENCE: { imageUrl, keywords: string[], instructions, timeLimitSec }
// RESPOND_EMAIL: { email: {from,to,subject,body}, instructions, timeLimitSec }
// OPINION_ESSAY: { prompt, timeLimitSec, minWords, structure: string[] }
```

### TOEIC Business-Themen (relevant für Content-Generierung)
Finance, HR, Marketing, Operations, Legal, Travel, Meetings, Customer Service, Technology, Real Estate, Manufacturing, Healthcare, Retail, Events, Logistics

### CEFR / Difficulty Mapping
| Difficulty | CEFR | Bedeutung |
|------------|------|-----------|
| 1 | A1 | Einsteiger |
| 2 | A2 | Grundkenntnisse |
| 3 | B1 | Mittelstufe |
| 4 | B2 | Obere Mittelstufe |
| 5 | C1 | Fortgeschritten |

---

## 5. Plattform-Analyse (neutrale Bewertung)

### Kernproblem
Die Plattform hat eine solide Datenbasis und Struktur, aber die **Lernschleife** — das was den User täglich zurückbringt und messbar besser macht — ist noch unvollständig.

### User Journey (Soll vs. Ist)
| Schritt | Soll | Ist |
|---------|------|-----|
| Anmeldung | Einfach + Onboarding | ✅ Auth vorhanden, ❌ kein Onboarding |
| Level-Einschätzung | Diagnosetest | ✅ vorhanden |
| Studienplan | Tagesplan basierend auf Ziel+Datum | ❌ fehlt |
| Tägliches Üben | Audio-basiertes Listening, Timer, Feedback | 🟡 teilweise |
| Listening | Mit Audio üben | ❌ kein Audio |
| Speaking/Writing | Bewertetes Sprechen/Schreiben | ❌ ohne API-Key nicht möglich |
| Schwächen erkennen | Analyse nach Tags/Gramm.-Punkt | 🟡 Basic-Progress vorhanden |
| Mock Exam | Vollständige Prüfungssimulation | ❌ fehlt |
| Fortschritt sehen | Kurve, CEFR-Entwicklung | 🟡 Basic vorhanden |

---

## 6. Maßnahmenplan

### 🔴 PHASE 1 — Kritisch

**1. Audio/TTS für Listening**
- Problem: Listening ohne Audio = kein echtes TOEIC-Training
- Lösung: Browser `window.speechSynthesis` API (kostenlos, kein Backend nötig)
- Komponente: `<AudioPlayer transcript={...} onEnd={...} />` — liest einmal vor, kein Replay
- Für Part 1: nur die 4 Statements vorlesen, Bild sichtbar, Text ausgeblendet
- Für Part 2: Frage vorlesen, dann 3 Antworten — User wählt während/nach dem Hören
- Für Part 3/4: Transcript vorlesen, dann Fragen erscheinen

**2. Speaking/Writing ohne API-Key nutzbar machen**
- Self-Assessment-Komponente nach jedem Task: Rubrik anzeigen, User gibt sich 1–5 Sterne
- Modellantwort/Scoring-Guide einblendbar (aus `explanation`-Feld)
- Timer-Komponente: Prep-Countdown + Speak-Countdown sichtbar
- RESPOND_INFO: Dokument/Tabelle 45s anzeigen, dann Timer startet

**3. Session-Flow vollständig machen**
- Fragen desselben Transcripts/Passages MÜSSEN gruppiert werden
- Ablauf: Intro → [Frage(n)] → Feedback → Weiter → Auswertung
- Auswertungs-Screen: Richtig/Falsch, Erklärungen, Weiter-Button

### 🟠 PHASE 2 — Hoch

**4. Spaced Repetition System (SRS)**
- Algorithmus: SM-2 (wie Anki) — bewährt, einfach implementierbar
- Schema-Erweiterung: `nextReview DateTime?` + `easeFactor Float?` auf Answer-Modell
- API-Route: `GET /api/review` → Questions die heute fällig sind
- Dashboard: "X Karten zur Wiederholung" Badge

**5. Studienplan-Generator**
- Input: Prüfungsdatum + Ziel-Score (z.B. 700 L&R)
- Basiert auf aktuellem CEFR-Level (aus Diagnostic) + verbleibenden Tagen
- Output: "Heute 25 Min, Fokus: Part 5 Grammatik + 1 Part 3 Conversation"
- Schema: `examDate DateTime?` bereits auf User-Modell vorhanden

**6. Mock-Exam-Modus**
- L&R: 200 Fragen, 120 Minuten Countdown, kein Pause
- S&W: exakte TOEIC-Timer pro Task
- Finale Score-Auswertung auf ETS-Skala (10–990)
- Score-Umrechnung: Raw Score → Scaled Score (ETS-Tabelle hardcoden)

### 🟡 PHASE 3 — Mittel

**7. Onboarding-Flow**
- `user.diagnosticDone === false` → Redirect zu `/onboarding`
- 3 Schritte: Prüfungsdatum wählen → Diagnosetest → Studienplan starten
- Danach nie wieder anzeigen (Flag in DB setzen)

**8. Gamification**
- Streak: Tage in Folge mit mindestens 1 Session
- XP: +10 pro richtige Antwort, +50 pro abgeschlossene Session
- Badges: "Erste Woche", "Part 5 Meister", "Mock Exam bestanden"
- Schema: `streak Int @default(0)`, `xp Int @default(0)`, `badges String[]` auf User

**9. Mobile-Optimierung**
- Unter 768px: Sidebar ausblenden → Bottom Navigation Bar
- Bottom-Nav: Dashboard / Üben / Diagnose / Fortschritt

**10. Schwache-Themen-Analyse**
- `/progress`: Fehlerrate pro Tag (aus `tags`-Feld) gruppiert
- "Du machst 68% Fehler bei Prepositions → Gezieltes Training starten"

### 🟢 PHASE 4 — Nice-to-have

- Vokabular-Flashcard-Modus (Business English)
- Fragen-Bookmarking ("Nochmal üben")
- PDF-Export Lernfortschritt
- Offline-Modus (Service Worker)

---

## 7. Empfohlene Implementierungs-Reihenfolge

```
Session A: Audio/TTS + Self-Assessment Speaking/Writing
Session B: Session-Flow Audit + Onboarding
Session C: SRS-Algorithmus (SM-2)
Session D: Mock-Exam-Modus
Session E: Studienplan-Generator
Session F: Gamification + Mobile Bottom-Nav
```

---

## 8. Wichtige Code-Konventionen

- **Keine Kommentare** außer bei nicht-offensichtlichem Verhalten
- **maxWidth: 820px** auf allen App-Seiten (`style={{ maxWidth: 820, margin: '0 auto' }}`)
- **CSS Variables** für alle Farben: `var(--accent)`, `var(--card)`, `var(--muted)`, `var(--card-border)`
- **Server Components** für Datenfetch, **Client Components** (`'use client'`) nur wenn nötig
- **Prisma in Claude Code Env**: immer `.catch(() => null)` — DB-Ports blockiert
- **Anthropic API Model**: `claude-sonnet-4-6`
- **i18n**: `useLang()` Hook für Übersetzungen, Keys in `src/lib/i18n/`
