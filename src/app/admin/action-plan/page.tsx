import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isAdminEmail } from '@/lib/admin'
import { CheckCircle2, Circle, Zap, Lightbulb } from 'lucide-react'

type Status = 'done' | 'in-progress' | 'planned' | 'idea'
type Priority = 'hoch' | 'mittel' | 'niedrig'

interface Task {
  title: string
  desc: string
  status: Status
  priority: Priority
  category: string
}

const TASKS: Task[] = [
  // ── Core App ──────────────────────────────────────────────────────────────
  { title: 'Authentifizierung (Login / Register)', desc: 'Supabase Auth mit E-Mail & Passwort, Passwort-Reset', status: 'done', priority: 'hoch', category: 'Core' },
  { title: 'Onboarding', desc: 'Prüfungstyp & Datum wählen nach Registrierung', status: 'done', priority: 'hoch', category: 'Core' },
  { title: 'Einstufungstest (Diagnostic)', desc: 'CEFR-Niveau für alle 4 Skills ermitteln', status: 'done', priority: 'hoch', category: 'Core' },
  { title: 'Reading Practice Part 5', desc: 'Grammatik & Wortschatz — Multiple Choice', status: 'done', priority: 'hoch', category: 'Core' },
  { title: 'Reading Practice Part 6', desc: 'Textergänzung — Multiple Choice', status: 'done', priority: 'hoch', category: 'Core' },
  { title: 'Reading Practice Part 7', desc: 'Leseverständnis — Multiple Choice', status: 'done', priority: 'hoch', category: 'Core' },
  { title: 'Fortschritt-Seite', desc: 'Genauigkeit nach Part, Sitzungsverlauf', status: 'done', priority: 'hoch', category: 'Core' },
  { title: 'TOEIC Guide', desc: 'Testformat, FAQ, Vorbereitung, Scoring', status: 'done', priority: 'mittel', category: 'Core' },

  // ── Dashboard ─────────────────────────────────────────────────────────────
  { title: 'Dashboard Übersicht', desc: 'Stats, CEFR-Level, Empfehlung, letzte Aktivität', status: 'done', priority: 'hoch', category: 'Dashboard' },
  { title: 'Dashboard API', desc: 'GET /api/dashboard — aggregierter Endpunkt', status: 'done', priority: 'hoch', category: 'Dashboard' },
  { title: 'Streak-Tracking', desc: 'Aktuelle & längste Lernserie berechnen und anzeigen', status: 'done', priority: 'mittel', category: 'Dashboard' },
  { title: 'Wöchentliche Aktivitäts-Heatmap', desc: '7-Tage-Kalender mit täglicher Sitzungsanzahl', status: 'done', priority: 'mittel', category: 'Dashboard' },
  { title: 'Lernziel setzen', desc: 'Ziel-Score eingeben, Fortschritt zum Ziel anzeigen', status: 'done', priority: 'niedrig', category: 'Dashboard' },
  { title: 'Dashboard Quick-Actions', desc: '3 Schnellzugriff-Cards: Weiter üben, Schwache Parts, Mini-Prüfung', status: 'done', priority: 'mittel', category: 'Dashboard' },

  // ── Admin ─────────────────────────────────────────────────────────────────
  { title: 'Admin-Bereich', desc: 'Geschützter Bereich mit ADMIN_EMAILS Env-Variable', status: 'done', priority: 'hoch', category: 'Admin' },
  { title: 'Admin: Nutzer-Übersicht', desc: 'Alle Nutzer mit CEFR, Sitzungen, Prüfungstyp', status: 'done', priority: 'hoch', category: 'Admin' },
  { title: 'Admin: Fragen-Datenbank', desc: 'Aufschlüsselung nach Section und Part', status: 'done', priority: 'hoch', category: 'Admin' },
  { title: 'Admin: Sitzungen', desc: 'Letzte 20 abgeschlossene Sitzungen', status: 'done', priority: 'mittel', category: 'Admin' },
  { title: 'Admin: Action Plan (Kanban)', desc: 'Diese Seite — Roadmap als Kanban-Board mit Ideen-Spalte', status: 'done', priority: 'mittel', category: 'Admin' },
  { title: 'Admin: Nutzer-Detail', desc: 'Einzelansicht pro Nutzer mit vollständiger History', status: 'done', priority: 'mittel', category: 'Admin' },
  { title: 'Admin: Fragen-Editor', desc: 'Neue Fragen anlegen, bearbeiten, löschen', status: 'done', priority: 'hoch', category: 'Admin' },
  { title: 'Admin: Export (CSV)', desc: 'Nutzer- und Sitzungsdaten als CSV exportieren', status: 'done', priority: 'niedrig', category: 'Admin' },
  { title: 'Admin: CSV Fragen-Import', desc: 'Bulk-Upload von Fragen via CSV-Datei', status: 'done', priority: 'mittel', category: 'Admin' },

  // ── User Settings ─────────────────────────────────────────────────────────
  { title: 'Nutzer-Einstellungen', desc: 'Name, Prüfungstyp und Datum ändern', status: 'done', priority: 'mittel', category: 'Settings' },
  { title: 'Sprachumschalter', desc: 'Deutsch / Englisch wechseln', status: 'done', priority: 'mittel', category: 'Settings' },
  { title: 'Theme-Switcher', desc: 'Hell / Dunkel wechseln', status: 'done', priority: 'mittel', category: 'Settings' },
  { title: 'Account löschen', desc: 'Nutzer kann Konto und Daten dauerhaft löschen', status: 'done', priority: 'niedrig', category: 'Settings' },

  // ── AI Features ───────────────────────────────────────────────────────────
  { title: 'AI Writing-Feedback', desc: 'Anthropic Claude bewertet Essay und E-Mail', status: 'done', priority: 'hoch', category: 'AI' },
  { title: 'AI Speech-Feedback', desc: 'Transcript-Bewertung für Speaking-Aufgaben', status: 'done', priority: 'hoch', category: 'AI' },
  { title: 'Adaptive Fragen-Auswahl', desc: 'Schwierigkeitsgrad automatisch anpassen basierend auf Leistung', status: 'done', priority: 'hoch', category: 'AI' },
  { title: 'AI Study Plan', desc: 'Personalisierter Wochenplan basierend auf CEFR und Prüfungsdatum', status: 'done', priority: 'mittel', category: 'AI' },

  // ── Practice ──────────────────────────────────────────────────────────────
  { title: 'Mini-Exam (Timed Practice)', desc: 'Prüfungssimulation mit Timer — alle Reading Parts in Folge', status: 'done', priority: 'hoch', category: 'Practice' },
  { title: 'Achievements / Meilensteine', desc: 'Badges für Streak, Sitzungsanzahl, Genauigkeit', status: 'done', priority: 'mittel', category: 'Practice' },
  { title: 'Vocabulary Flashcards', desc: 'Wichtige TOEIC-Vokabeln wiederholen (Karteikarten)', status: 'done', priority: 'mittel', category: 'Practice' },
  { title: 'Schwache Parts Analyse', desc: '/practice/weak-parts — priorisiert Parts < 60% Genauigkeit', status: 'done', priority: 'mittel', category: 'Practice' },

  // ── Infrastructure ────────────────────────────────────────────────────────
  { title: 'Middleware Auth-Schutz', desc: 'Alle App-Routen erfordern Authentifizierung', status: 'done', priority: 'hoch', category: 'Infra' },
  { title: 'Prisma Schema & Migrations', desc: 'Vollständiges Datenmodell für alle Entitäten', status: 'done', priority: 'hoch', category: 'Infra' },
  { title: 'Seed-Daten', desc: 'Fragen-Datenbank initial befüllen', status: 'done', priority: 'hoch', category: 'Infra' },
  { title: 'Rate Limiting', desc: 'API-Endpunkte gegen Missbrauch schützen', status: 'done', priority: 'mittel', category: 'Infra' },
  { title: 'Loading Skeletons & Error Boundaries', desc: 'Ladezustände und Fehlerseiten für alle Routen', status: 'done', priority: 'mittel', category: 'Infra' },

  // ── Geplant ───────────────────────────────────────────────────────────────
  { title: 'Vercel Deployment', desc: 'Repo mit Vercel verbinden — jeder Push auf main löst automatisches Deployment aus, Änderungen sofort im Browser sichtbar ohne git pull oder Dev-Server', status: 'planned', priority: 'hoch', category: 'Infra' },
  { title: 'E-Mail-Benachrichtigungen', desc: 'Lern-Erinnerungen und Fortschritts-Reports via Resend', status: 'planned', priority: 'niedrig', category: 'Infra' },

  // ── In Arbeit ──────────────────────────────────────────────────────────────
  { title: 'Listening Shell (TTS-basiert)', desc: 'AudioPlayer-Komponente mit Web-Speech-API TTS, Single-Play-Enforcement, Transcript-Toggle nach Antwort', status: 'done', priority: 'hoch', category: 'Core' },
  { title: 'Listening Part 1 – Fotos', desc: '6 Fragen: Foto zeigen + 4 Aussagen per TTS abspielen → MCQ. Einmal abspielbar wie echte Prüfung', status: 'done', priority: 'hoch', category: 'Core' },
  { title: 'Listening Part 2 – Frage & Antwort', desc: '25 Fragen: Frage per TTS + 3 Antwortoptionen per TTS. Keine Optionen sichtbar während Audio läuft (wie echte Prüfung)', status: 'done', priority: 'hoch', category: 'Core' },
  { title: 'Listening Part 3 – Gespräche', desc: '13 Gespräche × 3 Fragen. Dialog per TTS → Fragen erscheinen erst NACH Audio (richtiger Prüfungsablauf)', status: 'done', priority: 'hoch', category: 'Core' },
  { title: 'Listening Part 4 – Monologe', desc: '10 Monologe × 3 Fragen. Ansage per TTS → Fragen erst nach Audio. Grafik-Support (Tabelle/Zeitplan)', status: 'done', priority: 'hoch', category: 'Core' },
  { title: 'Writing Shell', desc: 'Textarea mit Live-Wortzähler, Timer pro Aufgabe, Keyword-Anzeige (Task 1), AI-Feedback via Claude API', status: 'done', priority: 'hoch', category: 'Core' },
  { title: 'Seed-Daten Ausbauen', desc: 'Part 5: 10→60 Fragen (alle 15 Grammatikmuster), Part 6: 4→20 Texte, Part 7: +10 Passagen-Sets, Part 2: 25 originale Q&A-Paare', status: 'done', priority: 'hoch', category: 'Infra' },
  { title: 'Daily Mission / Guided Path', desc: 'Dashboard zeigt tägl. Lernmission (welche Parts, wie viele Fragen). Ein Klick startet automatisch. Kein manuelles Navigieren nötig', status: 'done', priority: 'hoch', category: 'Dashboard' },

  // ── Geplant ───────────────────────────────────────────────────────────────
  { title: 'Vercel Deployment', desc: 'Repo mit Vercel verbinden — jeder Push auf main löst automatisches Deployment aus, Änderungen sofort im Browser sichtbar ohne git pull oder Dev-Server', status: 'planned', priority: 'hoch', category: 'Infra' },
  { title: 'E-Mail-Benachrichtigungen', desc: 'Lern-Erinnerungen und Fortschritts-Reports via Resend', status: 'planned', priority: 'niedrig', category: 'Infra' },
  { title: 'Score-Modell L+R getrennt', desc: 'Listening-Score (5–495) und Reading-Score (5–495) separat berechnen und anzeigen statt Gesamt-Accuracy. Näherungskonversion basierend auf ETS-Tabellen', status: 'done', priority: 'hoch', category: 'Dashboard' },
  { title: 'Part 7 Multi-Passage Split-View', desc: 'Doppel- und Dreifach-Passagen nebeneinander anzeigen. Emails als Email formatiert, Tabellen als Tabelle. NOT-Fragen-Typ visuell markieren', status: 'done', priority: 'hoch', category: 'Core' },
  { title: 'Speaking Tasks 4–5', desc: 'Task 4: Fragen zu einem Dokument beantworten (requires Grafik-Rendering). Task 5: Meinung äußern (60 Sek, offene Aufgabe)', status: 'done', priority: 'hoch', category: 'Core' },
  { title: 'Speaking: 5 Bewertungsdimensionen', desc: 'Claude bewertet Aussprache, Intonation, Flüssigkeit, Grammatik/Vokabular, Aufgabenerfüllung separat statt eine Gesamtzahl', status: 'done', priority: 'mittel', category: 'AI' },
  { title: 'Onboarding Flow', desc: 'Nach Registrierung: Name → Prüfungstyp → Zieldatum → Ziel-Score → Kurzdiagnostik → Erster Tagesplan. Kein manuelles Navigieren', status: 'planned', priority: 'hoch', category: 'Core' },
  { title: 'Flow Logic: Automatischer Tagesplan', desc: 'Regelbasierte Engine: Wenn Part X < 60% → tägl. priorisieren. Wenn exam_date < 14d → Simulation fokus. Claude analysiert Fehlermuster nach Session', status: 'planned', priority: 'hoch', category: 'AI' },
  { title: 'Grammar Pattern Tagging', desc: 'Alle Part-5-Fragen mit Grammatikmuster-Tags (verb-form, preposition, connector, etc.). Fehleranalyse: "Du machst Präpositions-Fragen 3× häufiger falsch"', status: 'planned', priority: 'mittel', category: 'Core' },
  { title: 'Part 3/4 Grafik-Rendering', desc: 'Tabellen, Zeitpläne, Preislisten aus JSON als HTML-Tabelle neben Audio-Player anzeigen. Für Part 3 "look at the graphic" Fragen', status: 'done', priority: 'mittel', category: 'Core' },
  { title: 'Score-Verlaufs-Chart', desc: 'Liniendiagramm des geschätzten L+R Scores über die letzten 30 Tage. Motivierendste Visualisierung laut Nutzerforschung', status: 'done', priority: 'mittel', category: 'Dashboard' },
  { title: 'Part 6 Blank-Highlighting', desc: 'Aktiv zu füllendes Blank im Passagen-Text farbig hervorgehoben (brand color). Zeigt genau wo im Text die Lücke ist während MCQ-Antwort gegeben wird', status: 'done', priority: 'mittel', category: 'Core' },
  { title: 'Part 2 Ablauf korrigieren', desc: 'Part 2: Antwortoptionen erscheinen erst NACH dem Audio. Im echten TOEIC sind Optionen nie sichtbar (nur gesprochen). App zeigt sie nach Audio als Kompromiss für Lern-Kontext — korrekt implementiert.', status: 'done', priority: 'hoch', category: 'Core' },
  { title: 'Transcript-Toggle nach Listening', desc: 'Nach Beantwortung: Transkript anzeigen mit falsch/richtig markierten Aussagen. Wichtig für Lerneffekt', status: 'planned', priority: 'mittel', category: 'Core' },
  { title: 'Vollprüfungs-Simulation (200 Fragen)', desc: '120 Min echte Prüfung: 45 Min Listening automatisch (kein Skip), dann 75 Min Reading selbstgesteuert. Echter Prüfungsablauf 1:1', status: 'planned', priority: 'hoch', category: 'Practice' },
  { title: 'Mini-Exam: Listening einbinden', desc: 'Mini-Prüfung aktuell nur Reading. Listening-Fragen (Part 1-4 je 2) hinzufügen für gemischte 20-Min-Simulation', status: 'done', priority: 'mittel', category: 'Practice' },

  // ── Shell-Qualität & Learning Flow ────────────────────────────────────────
  // LISTENING
  { title: 'Listening: Transcript-Toggle pro Frage', desc: 'Nach Beantwortung jeder Listening-Frage: aufklappbares Transkript mit farbmarkierten Schlüsselwörtern. User sieht exakt was gesagt wurde und was er überhörte.', status: 'done', priority: 'hoch', category: 'Core' },
  { title: 'Listening: Part 3/4 Sub-Question Fortschrittsanzeige', desc: 'Bei Multi-Question-Sets (3 Fragen pro Gespräch) visuell anzeigen welche der 3 Sub-Fragen bereits beantwortet sind. Verhindert Orientierungsverlust.', status: 'done', priority: 'mittel', category: 'Core' },
  { title: 'Listening: Schlüssel-Phrase Highlighting', desc: 'Nach falscher Antwort: exakte Transkript-Zeile die die Antwort enthält farbig hervorgehoben. "by Wednesday" ≠ "on Wednesday" — User sieht exakt was er überhört hat.', status: 'done', priority: 'hoch', category: 'Core' },
  { title: 'Listening: Fehler-Typ Tagging', desc: 'Nach falscher Antwort automatisch kategorisieren: "Distractor-Falle" (klingt ähnlich), "Negationswort überhört", "Zeitangabe verwechselt". Lehrt den User seinen blinden Fleck zu erkennen.', status: 'done', priority: 'mittel', category: 'Core' },
  { title: 'Listening: Session-Vokabular', desc: '3–5 Business-Wörter aus den Transkripten der Session am Ende zeigen. Mit Kontext-Satz und DE-Bedeutung. Spaced-Repetition-tauglich weil kontextuell verknüpft.', status: 'done', priority: 'mittel', category: 'Core' },
  { title: 'Listening: 4 Akzent-Variationen', desc: 'Echte TOEIC nutzt American, British, Canadian, Australian English. TTS-Stimme per Frage taggen (lang-Attribut) und zufällig wechseln. Trainiert Akzent-Flexibilität.', status: 'planned', priority: 'mittel', category: 'Core' },
  { title: 'Single-Play Enforcement im Mini-Exam', desc: 'In der normalen Übung: Replay erlaubt (pädagogisch sinnvoll). Im Mini-Exam (Prüfungssimulation): Audio-Schaltfläche nach einmaligem Abspielen deaktivieren — entspricht echtem TOEIC-Ablauf.', status: 'planned', priority: 'mittel', category: 'Practice' },
  // SPEAKING
  { title: 'Speaking: Mikrofon-Permission Check', desc: 'Vor erster Aufnahme: getUserMedia testen und klare Anleitung zeigen wenn Permission verweigert. Verhindert stumme Sessions. Mit Browser-spezifischen Anweisungen.', status: 'done', priority: 'hoch', category: 'Core' },
  { title: 'Speaking: Musterantwort als Referenz', desc: 'Nach KI-Feedback: Task-spezifische Musterantwort-Struktur zeigen (Text) mit vollständigem Beispielsatz. User vergleicht seinen Ansatz: "ich sagte X, die Norm wäre Y". Konkretes Ziel statt abstraktem Score.', status: 'done', priority: 'hoch', category: 'Core' },
  { title: 'Speaking: Fortschritt über Zeit', desc: 'Speaking-Scores persistent in DB speichern und als Kurve auf Progress-Seite zeigen. "Deine Struktur wurde über 8 Sessions um 23% besser." Einzige Sektion ohne Fortschritts-Kontinuität.', status: 'planned', priority: 'mittel', category: 'Core' },
  { title: 'Speaking: Pronunciation Drill Modus', desc: 'Gezieltes Training schwieriger Laute (th, r/l, -ed endings, word stress). Wort wird vorgelesen → User wiederholt → direktes Feedback. 5 Min tägliches Drill.', status: 'planned', priority: 'mittel', category: 'Core' },
  { title: 'Speaking: Score in DB persistieren', desc: 'AI-Scores aus Speech-Feedback nach jeder Speaking-Session in der DB speichern (Session + Answer Records). Voraussetzung für Score-Trend-Chart und Fortschritts-Continuität.', status: 'done', priority: 'hoch', category: 'Core' },
  // WRITING
  { title: 'Writing: Draft-Autosave (localStorage)', desc: 'Text wird alle 10s automatisch in localStorage gespeichert. Beim Reload: "Entwurf gefunden — wiederherstellen?" Banner. Verhindert Datenverlust bei Seitenrefresh.', status: 'done', priority: 'hoch', category: 'Core' },
  { title: 'Writing: Phrase-Baukasten', desc: 'Klappbare Business-Phrasen-Bibliothek vor Email- und Essay-Tasks. Kategorisiert nach Funktion: Eröffnung, Bitte, Beschwerde, Abschluss (Email) / Einleitung, Argument, Beispiel, Schluss (Essay). 40% des TOEIC Writing Scores basiert auf Phrasen-Einsatz.', status: 'done', priority: 'hoch', category: 'Core' },
  { title: 'Writing: Iterativer Schreib-Prozess', desc: 'Nach Feedback: "Überarbeiten"-Button zeigt denselben Text im Editor mit Feedback sichtbar daneben. User schreibt nochmal, bekommt neues Feedback, sieht die Verbesserung. Echter Revision-Cycle.', status: 'done', priority: 'mittel', category: 'Core' },
  { title: 'Writing: Phrase-Feedback Annotation', desc: 'Nach Feedback: automatische Erkennung welche Phrasen aus dem Baukasten der User verwendet hat (grün = Pflicht-Phrasen erkannt, blau = Strukturwörter). User sieht was gut war statt abstrakter Punkte.', status: 'done', priority: 'mittel', category: 'Core' },
  { title: 'Writing: Essay-Template Guide', desc: '4-Absatz-Struktur mit Pflichtphrasen und Wortmengen-Zielen direkt in der Essay-Aufgabe. "Essay-Formel anzeigen" Button gibt Beispielsätze pro Absatz. Einmal lernen, dauerhaft anwenden.', status: 'done', priority: 'mittel', category: 'Core' },
  { title: 'Writing: Score in DB persistieren', desc: 'AI-Scores aus Writing-Feedback nach jeder Writing-Session in der DB speichern. Voraussetzung für Score-Trend-Chart. Aktuell gehen alle Writing-Scores nach Session-Ende verloren.', status: 'done', priority: 'hoch', category: 'Core' },
  { title: 'Writing: Side-by-Side Revision View', desc: 'Beim "Überarbeiten"-Klick: Split-View zeigt links das alte Feedback und rechts den neuen Editor. User schreibt nicht blind — er sieht genau was er verbessern soll.', status: 'done', priority: 'mittel', category: 'Core' },
  // READING
  { title: 'PracticeShell: Frage überspringen', desc: '"Überspringen" Button der die Frage ans Ende der Session schiebt. Am Ende: übersprungene Fragen werden nochmals gestellt. Reduziert Frustration bei schwierigen Fragen.', status: 'done', priority: 'mittel', category: 'Core' },
  { title: 'Reading: Part 7 Frage-Typ Strategie-Hints', desc: 'Pro Frage Typ-Erkennung (NOT/Detail/Inference/Synonym/Purpose) und passende Strategie-Box. "NOT-Frage: suche 3 Optionen die IM Text stehen." Schüler lernen die Technik direkt beim Üben.', status: 'done', priority: 'hoch', category: 'Core' },
  { title: 'Reading: Part 6 Dokumenttyp-Kontext', desc: 'Vor jeder Part-6-Passage: erkannten Dokumenttyp anzeigen (E-Mail/Memo/Bericht/Protokoll) + relevante Grammatik-Regel. "Das ist eine Geschäfts-E-Mail → Present Perfect für abgeschlossene Aktionen."', status: 'done', priority: 'mittel', category: 'Core' },
  { title: 'Reading: Part 5 Muster-Mastery Tracking', desc: 'Progress-Seite zeigt pro Grammatikmuster: X/Y Fragen richtig. "Verb-Form: 8/12 ✓ | Präpositionen: 4/12 — Fokus!" Strukturiertes Durcharbeiten aller 15 TOEIC-Muster wie in einem Lehrbuch.', status: 'done', priority: 'hoch', category: 'Dashboard' },
  // ÜBERGREIFEND
  { title: 'Grammar Pattern Fehleranalyse', desc: 'Auf der Progress-Seite: "Du machst verb-form Fragen 3× häufiger falsch als connector Fragen." Basiert auf question.tags + Answer-History. Gibt gezielte Übungsempfehlung.', status: 'done', priority: 'hoch', category: 'Dashboard' },
  { title: 'Post-Session Debrief Card', desc: 'Nach jeder Session: kleine Zusammenfassung — welche Grammatikmuster falsch, Durchschnittszeit pro Frage, Vergleich zur letzten Session, 1 konkreter Verbesserungstipp.', status: 'done', priority: 'hoch', category: 'Core' },
  { title: 'Abbruch-Bestätigung bei offener Session', desc: '"Möchtest du wirklich abbrechen? Dein Fortschritt wird nicht gespeichert." Dialog wenn User mitten in einer Session auf Zurück/Link klickt. Verhindert versehentlichen Abbruch.', status: 'done', priority: 'mittel', category: 'Core' },
  { title: 'Part-Strategie Hints vor Übung', desc: 'Vor jedem Part kurze TOEIC-Strategie-Box zeigen: "Part 3: Lies die Fragen BEVOR das Audio startet. Fokus: Wer, Was, Warum." Echtes Prüfungswissen direkt im Flow.', status: 'done', priority: 'hoch', category: 'Core' },
  { title: 'Business Vocabulary Hover-Definitionen', desc: 'In Part 5/6/7 Passagen: häufige TOEIC-Business-Wörter (reimburse, stipulate, pursuant to…) sind unterstreichbar. Hover zeigt DE-Übersetzung + Beispielsatz. Kein Wörterbuch-Abbruch.', status: 'planned', priority: 'mittel', category: 'Core' },
  { title: 'Progress: Grammatik-Muster Milestones', desc: '"Du hast alle 15 Part-5-Muster mindestens 5× geübt" Achievement. Markiert echte Lernmeilensteine die systematisches Durcharbeiten belohnen. Verknüpft mit Achievements-System.', status: 'done', priority: 'mittel', category: 'Dashboard' },
  { title: 'TOEIC Score-Conversion Tooltip', desc: 'Ausklappbare Tabelle im Score-Card: "70% Genauigkeit ≈ 550–600 Punkte". Macht abstrakten Score greifbar. Farb-kodiert nach Score-Range (grün/gelb/orange/rot).', status: 'done', priority: 'niedrig', category: 'Dashboard' },
  { title: 'Session-Progression Vergleich', desc: 'Dashboard zeigt "+7% vs. letzte Session" Banner über der Sitzungsliste. Vergleicht die letzten 2 Sessions — motivierendes Trend-Feedback direkt nach dem Üben.', status: 'done', priority: 'mittel', category: 'Dashboard' },
  { title: 'Listening: Part 3/4 Pre-Reading Scan-Chips', desc: 'Während der 30s Vorlese-Phase: farbige Chips zeigen was der User scannen soll: "Wer spricht? Was wollen sie? Problem/Lösung" (Part 3) / "Wer spricht? Zahlen & Daten" (Part 4).', status: 'done', priority: 'mittel', category: 'Core' },
  { title: 'Mini-Exam: Listening Parts 1-4 eingebunden', desc: '20 Min-Prüfung inkl. Listening: Parts 1-4 (je 2 Fragen) + Parts 5-7. Transkript/Dialog sichtbar mit Hinweis "Im echten TOEIC wird dieser Text vorgelesen". Prüfungsnahe Simulation.', status: 'done', priority: 'mittel', category: 'Practice' },
  { title: 'Session-Streaks per Part', desc: 'Nicht nur Gesamt-Streak — auch pro Part zeigen: "Part 5: 5 Tage in Folge geübt." Micro-Motivationen die gezieltes Training belohnen.', status: 'planned', priority: 'niedrig', category: 'Dashboard' },

  // ── Cross-Cutting / System ────────────────────────────────────────────────
  { title: 'Spaced Repetition für falsche Fragen', desc: 'Falsch beantwortete Fragen kommen in künftigen Sessions priorisiert zurück. wrong_questions Tracking + "Schwache Fragen üben" Modus. Größter Lernhebel: Kern-Prinzip von Anki/Duolingo.', status: 'planned', priority: 'hoch', category: 'Practice' },
  { title: 'Score-Trend-Chart alle 4 Bereiche', desc: 'Einheitlicher Fortschritts-Chart für Listening, Reading, Speaking, Writing über Zeit. Motivierendste Visualisierung: "du bist von 55% auf 71% gestiegen." Aktuell nur L+R tracked.', status: 'planned', priority: 'hoch', category: 'Dashboard' },
  { title: 'Zeitbewusstsein / Speed-Feedback', desc: 'Nach jeder Session: "Ø 90 Sek. pro Part-5-Frage — Ziel: 45 Sek." Grün wenn on-target, Warnung wenn zu langsam. Part 5: 45s, Part 6: 75s, Part 7: 90s Zielwerte.', status: 'done', priority: 'hoch', category: 'Core' },
  { title: 'Part 5 Drill-Modus für schwache Muster', desc: 'Progress-Seite: "Drill →" Button neben jedem Grammatikmuster. API-Tag-Filter + /practice/part5/drill?pattern=preposition Seite mit Ergebnis-Screen und avg-Zeit-Vergleich.', status: 'done', priority: 'hoch', category: 'Practice' },
  { title: 'Session Fehler-Review: Nochmal üben', desc: 'Am Ende jeder Session: "Falsche Fragen nochmal üben" Button startet sofort eine neue Session nur mit den falsch beantworteten Fragen. Direktes Wiederholungs-Lernen im Flow.', status: 'planned', priority: 'mittel', category: 'Practice' },
  { title: 'Mehr Content: Speaking + Writing Fragen', desc: 'Writing lädt nur 3 Fragen, Speaking ist begrenzt. Content erschöpft sich nach 2-3 Sessions — User sieht Wiederholungen. Seed-Daten massiv ausbauen für Speaking und Writing.', status: 'planned', priority: 'hoch', category: 'Infra' },

  // ── Neu aus Practice Test 1 Analyse ──────────────────────────────────────
  { title: 'Distractor-Typ Analyse nach Antwort', desc: 'Nach jeder Frage: für jede falsche Option den Distractor-Typ benennen: "Sound-alike Trap / Related-word Trap / Repeated-word Trap / Context Swap / Partial Truth". Barron\'s Erklärungsformat 1:1 implementieren — nachgewiesener Lerneffekt', status: 'planned', priority: 'hoch', category: 'Core' },
  { title: 'Triple-Passage Seed Data (Part 7)', desc: '3-Dokument-Sets mit authentischen Typ-Kombinationen: Ticket+Notice+Form | Itinerary+Email+Table | Notice+PriceList+Email. Cross-Reference-Fragen die NUR mit ≥2 Dokumenten beantwortbar sind. Barron\'s Practice Test 1 Struktur als Vorlage', status: 'planned', priority: 'mittel', category: 'Infra' },
  { title: 'Score Conversion Table (asymmetrisch)', desc: 'Barron\'s echte Conversion-Kurve: Reading bei <50 richtig deutlich schwächer als Listening. App soll NICHT linear umrechnen. Tabellenwerte: 25→L250/R60, 50→L250/R215, 75→L405/R365, 100→L495/R495. Macht Score-Feedback realistisch', status: 'planned', priority: 'hoch', category: 'Dashboard' },

  // ── Ideen (warten auf Validierung) ────────────────────────────────────────
  { title: 'Vokabel-System mit Spaced Repetition', desc: '1000+ TOEIC-Vokabeln kategorisiert nach Domäne (Finance, HR, Travel, Marketing, Office). SM-2 Algorithmus für Wiederholungsintervalle. Forschung zeigt direkten Score-Zusammenhang', status: 'idea', priority: 'hoch', category: 'Practice' },
  { title: 'Score-Prognose auf Prüfungstag', desc: 'Lineare Regression über Accuracy-Verlauf → "Bei aktueller Lernrate erreichst du voraussichtlich 720–760 am [Datum]". Warnung wenn Ziel nicht erreichbar', status: 'idea', priority: 'mittel', category: 'Dashboard' },
  { title: 'PWA / Offline-Modus', desc: 'Service Worker + PWA-Manifest für Home-Screen-Installation. Fragen offline cachen. Push Notifications für Streak-Schutz. Wichtig für mobile TOEIC-Märkte (Japan, Korea)', status: 'idea', priority: 'mittel', category: 'Infra' },
  { title: 'B2B: Team-Management', desc: 'Lehrer/HR-Manager erstellt Kurs, weist Studenten zu, sieht aggregierten Fortschritt. PDF-Reports pro Schüler. Größter Umsatzhebel laut ETS-Statistiken', status: 'idea', priority: 'mittel', category: 'Core' },
  { title: 'Speaking Full Practice', desc: 'Alle 5 Task-Typen (Read Aloud, Describe Picture, Respond, Express Opinion) mit AI-Bewertung', status: 'done', priority: 'hoch', category: 'Core' },
  { title: 'TOEIC Score-Schätzer', desc: 'Rechner der aus Übungs-Genauigkeit einen geschätzten TOEIC-Score (0–990) berechnet', status: 'idea', priority: 'mittel', category: 'Dashboard' },
  { title: 'Streak Freeze', desc: 'Nutzer kann 1× pro Woche einen verpassten Tag "einfrieren" ohne die Streak zu verlieren', status: 'idea', priority: 'niedrig', category: 'Practice' },
  { title: 'Fortschritts-Report PDF', desc: 'Detaillierter PDF-Export mit CEFR-Verlauf, Genauigkeit pro Part, Achievements', status: 'idea', priority: 'niedrig', category: 'Settings' },
  { title: 'Admin: KPI-Dashboard', desc: 'Tägl. aktive Nutzer, Retention-Kurve, beliebteste Parts — Übersicht für Produktentscheidungen', status: 'idea', priority: 'mittel', category: 'Admin' },
  { title: 'Onboarding-Tutorial', desc: 'Interaktiver Schritt-für-Schritt-Guide beim ersten Login — zeigt alle Features', status: 'idea', priority: 'niedrig', category: 'Core' },
  { title: 'Radar-Chart alle 7 Parts', desc: 'Spider-Chart zeigt Performance aller Parts gleichzeitig. Visuell sofort erkennbar wo die Lücken sind', status: 'done', priority: 'niedrig', category: 'Dashboard' },
  { title: '4 Akzente im Listening', desc: 'Echte TOEIC verwendet American, British, Canadian, Australian English. TTS-Stimmen pro Frage taggen und unterschiedlich konfigurieren', status: 'idea', priority: 'mittel', category: 'Core' },
  { title: 'SCORM / LMS Integration', desc: 'Corporate L&D Teams nutzen Moodle, SAP SuccessFactors. SCORM-Paket ermöglicht Verkauf in Enterprise-LMS ohne deren System zu ersetzen', status: 'idea', priority: 'niedrig', category: 'Infra' },
]

const STATUS_CONFIG = {
  idea:        { label: 'Idee',      icon: Lightbulb,     color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.3)' },
  planned:     { label: 'Geplant',   icon: Circle,        color: 'var(--muted)', bg: 'var(--card-border)', border: 'var(--card-border)' },
  'in-progress': { label: 'In Arbeit', icon: Zap,         color: '#fbbf24', bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.3)' },
  done:        { label: 'Fertig',    icon: CheckCircle2,  color: 'var(--success)', bg: 'rgba(74,222,128,0.12)', border: 'rgba(74,222,128,0.2)' },
}

const PRIORITY_COLORS = {
  hoch:    { color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  mittel:  { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
  niedrig: { color: 'var(--muted)', bg: 'var(--card-border)' },
}

const COLUMNS: { status: Status; label: string; hint?: string }[] = [
  { status: 'idea',        label: 'Ideen',     hint: 'Vorschläge zur Validierung' },
  { status: 'planned',     label: 'Geplant',   hint: 'Validiert, noch nicht gestartet' },
  { status: 'in-progress', label: 'In Arbeit', hint: 'Aktuell in Entwicklung' },
  { status: 'done',        label: 'Fertig',    hint: 'Implementiert & deployed' },
]

function TaskCard({ task }: { task: Task }) {
  const p = PRIORITY_COLORS[task.priority]
  const s = STATUS_CONFIG[task.status]
  return (
    <div style={{
      background: 'var(--card)',
      border: `1px solid ${s.border}`,
      borderRadius: 10,
      padding: '12px 14px',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
    }}>
      <p className="text-sm font-medium" style={{ lineHeight: 1.4 }}>{task.title}</p>
      <p className="text-xs" style={{ color: 'var(--muted)', lineHeight: 1.5 }}>{task.desc}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
        <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 99, background: p.bg, color: p.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {task.priority}
        </span>
        <span style={{ fontSize: 9, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {task.category}
        </span>
      </div>
    </div>
  )
}

export default async function AdminActionPlanPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdminEmail(user.email)) redirect('/dashboard')

  const done       = TASKS.filter(t => t.status === 'done').length
  const inProgress = TASKS.filter(t => t.status === 'in-progress').length
  const planned    = TASKS.filter(t => t.status === 'planned').length
  const ideas      = TASKS.filter(t => t.status === 'idea').length
  const total      = TASKS.filter(t => t.status !== 'idea').length
  const pct        = Math.round(done / total * 100)

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 className="text-3xl font-bold" style={{ marginBottom: 6 }}>Action Plan</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>Produktroadmap als Kanban-Board — Ideen validieren, um sie in die Implementierung zu übernehmen</p>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Ideen', value: ideas, color: '#a78bfa', bg: 'rgba(167,139,250,0.1)' },
          { label: 'Geplant', value: planned, color: 'var(--muted)', bg: 'var(--card-border)' },
          { label: 'In Arbeit', value: inProgress, color: '#fbbf24', bg: 'rgba(251,191,36,0.1)' },
          { label: 'Fertig', value: done, color: 'var(--success)', bg: 'rgba(74,222,128,0.1)' },
          { label: 'Fortschritt', value: `${pct}%`, color: 'var(--accent)', bg: 'var(--accent-subtle)' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className="card" style={{ padding: '14px 18px' }}>
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color, marginBottom: 6 }}>{label}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="card" style={{ padding: '14px 20px', marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <p className="text-sm font-semibold">Implementierungsfortschritt</p>
          <p className="font-bold" style={{ color: 'var(--success)' }}>{done} / {total} Features</p>
        </div>
        <div style={{ height: 8, borderRadius: 99, background: 'var(--card-border)', overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 99, background: 'var(--success)', width: `${pct}%` }} />
        </div>
      </div>

      {/* Kanban Board */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, alignItems: 'start' }}>
        {COLUMNS.map(col => {
          const tasks = TASKS.filter(t => t.status === col.status)
          const s = STATUS_CONFIG[col.status]
          const Icon = s.icon
          return (
            <div key={col.status}>
              {/* Column header */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
                padding: '10px 14px', borderRadius: 10,
                background: s.bg, border: `1px solid ${s.border}`,
              }}>
                <Icon size={14} style={{ color: s.color, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="text-sm font-semibold" style={{ color: s.color }}>{col.label}</p>
                  {col.hint && <p style={{ fontSize: 10, color: 'var(--muted)', marginTop: 1 }}>{col.hint}</p>}
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 700, minWidth: 22, height: 22,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: 99, background: s.bg, color: s.color,
                  border: `1px solid ${s.border}`,
                }}>
                  {tasks.length}
                </span>
              </div>

              {/* Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {tasks.length === 0 ? (
                  <div style={{ padding: '20px 14px', textAlign: 'center', borderRadius: 10, border: '1px dashed var(--card-border)' }}>
                    <p style={{ fontSize: 12, color: 'var(--muted)' }}>Leer</p>
                  </div>
                ) : (
                  tasks.map(task => <TaskCard key={task.title} task={task} />)
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Idea validation hint */}
      <div style={{ marginTop: 32, padding: '16px 20px', borderRadius: 12, background: 'rgba(167,139,250,0.07)', border: '1px solid rgba(167,139,250,0.25)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <Lightbulb size={15} style={{ color: '#a78bfa' }} />
          <p className="text-sm font-semibold" style={{ color: '#a78bfa' }}>Ideen validieren</p>
        </div>
        <p className="text-xs" style={{ color: 'var(--muted)', lineHeight: 1.7 }}>
          Ideen in der linken Spalte sind Vorschläge von Claude. Um eine Idee zu implementieren, sage einfach
          &ldquo;Implementiere <em>[Feature-Name]</em>&rdquo; — Claude plant und setzt es automatisch um.
          Um den Status einer Idee auf &ldquo;Geplant&rdquo; oder &ldquo;In Arbeit&rdquo; zu ändern, genügt eine kurze Nachricht.
        </p>
      </div>
    </div>
  )
}
