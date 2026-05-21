# TOEIC Prep — Claude Arbeitsregeln

## Deployment-Workflow (WICHTIG)

Der User arbeitet mit einem GitHub Codespace, das den Dev-Server auf Port 3000 ausführt.
Änderungen sind **nur sichtbar**, wenn sie auf `main` gepusht werden und der User `git pull` gemacht hat.

**Regeln:**
- Immer direkt auf `main` entwickeln und pushen — NIEMALS auf Feature-Branches bleiben
- Nach jeder Änderung sofort pushen: `git push origin main`
- Push immer mit PAT (aus Konversationshistorie abrufen, nie in Dateien speichern)
- Der User muss einmalig `git pull origin main` im Codespace ausführen — danach hot-reloaded Next.js automatisch

**Push-Pattern:**
```bash
PAT="<token>" && git remote set-url origin "https://${PAT}@github.com/marcelkurrek/toeic-mvp.git" && git push origin main && git remote set-url origin "https://github.com/marcelkurrek/toeic-mvp.git"
```

**Wenn Änderungen nicht sichtbar sind — Diagnose:**
1. Codespace ist auf falschem Branch → `git checkout main && rm -rf .next && git pull origin main && npm run dev`
2. `.next` Cache blockiert Pull → **IMMER** `rm -rf .next && git pull origin main` verwenden, nie nur `git pull`
3. `.env.local` fehlt nach Pull → neu anlegen (nie in git tracken)
4. Dev-Server läuft auf anderem Port → Port aus Terminal-Output nehmen (3001–3006)

## Projekt-Kontext

- **Stack:** Next.js 14 App Router, Prisma, Supabase Auth, TypeScript
- **Ziel:** TOEIC-Prüfungsvorbereitung — kein Vokabellernen, keine Grammatik-Erklärungen, fokussiert auf Exam-Training
- **Admin-Email:** `marcelkurrek@web.de` — Admin-Bereich unter `/admin`
- **Branch:** Entwicklung auf `main`, kein separater Feature-Branch nötig

## Copyright & Urheberrecht — STRENGE REGEL

**Niemals Inhalte aus TOEIC-Büchern (Barron's, ETS, Princeton Review, etc.) 1:1 kopieren.**

Das gilt für: Fragen, Antwortoptionen, Dialoge, Texte, Fotos, Aufgabenstellungen — alles.

**Erlaubt:** Aus Buchbeispielen lernen, Prinzipien und Muster verstehen, und dann **eigene originelle Inhalte** mit demselben Schwierigkeitsgrad und Stil erstellen.

**Vorgehen bei Buchmaterial:**
1. Analysiere das Beispiel: Welche Fragentyp? Welche Distractor-Technik? Welche Szene?
2. Extrahiere das **Prinzip** (z.B. "Sound-alike-Trap mit ähnlich klingendem Verb")
3. Erstelle **neue, eigenständige Fragen** die dasselbe Prinzip anwenden — andere Wörter, andere Szene, gleiche Qualität
4. Speichere das gelernte Prinzip in CLAUDE.md — nicht den Originaltext

**Gilt für alle Materialquellen:** Bücher, PDFs, Screenshots, Fotos von Buchseiten.

## TOEIC Learnings (Barron's Premium 10th Edition — nur Prinzipien, nie Originaltext)

### Prüfungsstruktur (Fakten, kein Urheberrecht)
- **Listening:** 100 Fragen, 45 Minuten — Parts 1–4
- **Reading:** 100 Fragen, 75 Minuten — Parts 5–7
- **Gesamt:** 200 Fragen, 2,5 Stunden, Score 10–990 (je Sektion 5–495)
- **Score-Berechnung:** Richtige Antworten → Rohpunkte → Conversion Table → Skala 5–495

### Die 5 Distractor-Techniken (TOEIC-spezifisch)
Alle unsere Fragen müssen mindestens 2 dieser Techniken pro Falschantwort verwenden:
1. **Similar sounds** — Wörter die ähnlich klingen aber andere Bedeutung haben (z.B. "hired" vs "tired")
2. **Homonyms** — Wörter mit gleicher Aussprache aber anderer Bedeutung (z.B. "hear" vs "here")
3. **Related words** — Semantisch verwandte Wörter aus demselben Themenfeld (z.B. "meeting" wenn Antwort "conference" wäre)
4. **Omit necessary word** — Teilweise richtig aber ein entscheidendes Wort fehlt oder ist falsch
5. **Alter word order** — Richtige Wörter, falsche Reihenfolge/Grammatik

### Part-spezifische Strategien
**Part 1:** Analysiere Personen (Anzahl, Geschlecht, Beruf, Aktion) + Objekte + Ort. Eliminiere nicht sichtbare Details. Zeitformen ("is being" vs "has been") sind häufige Fallen.
**Part 2:** Fragewort sofort identifizieren. Richtige Antwort passt oft indirekt. Sound-alikes, Homonyme, verwandte Wörter sind Fallen. "Or"-Fragen: Antwort wählt eine Option oder sagt neither/both.
**Part 3/4:** Zuerst alle Fragen lesen → Fragentyp erkennen (Person/Beruf/Ort/Zeit/Handlung/Setting) → dann Audio. Antworten sind Paraphrasen. Grafik: erst scannen, dann hören.
**Part 5/6:** Wortform-Unterschiede (Adjektiv/Adverb/Nomen/Verb), Verbformen, Präpositionen, Kollokationen.
**Part 7:** PRSA — Predict → Read → Scan → Answer. NOT/EXCEPT-Fragen: 3 richtig, 1 falsch. Inference: Antwort steht NICHT direkt im Text.

### 5W-Reflexion nach Part 3/4 (Lernprinzip)
Nach einem Gespräch/Talk als Reflexion: Who is talking? What are they talking about? Who are they talking about? Where are they talking? Why are they talking?
→ Dieses Prinzip im App als Post-Answer Reflexions-Hint implementieren.

### Foto-Analyse Prinzip (Part 1)
Nicht nur: "Was passiert gerade?" — sondern auch: "Was ist passiert BEVOR das Foto gemacht wurde?" und "Was wird als NÄCHSTES passieren?"
→ Tiefere Analyse trainiert implizites Denken für Part 1.

### Vokabular im Kontext > Auswendiglernen
Wörter die im Kontext (Satz/Dialog) gelernt werden bleiben besser haften als isolierte Listen.
→ Session-Vokabular soll immer mit dem Originalsatz gezeigt werden, in dem das Wort auftrat.

## Produkt-Prinzipien

- Der User soll nicht überlegen müssen was er tut — das System führt ihn guided
- Kein kognitiver Overhead: klare nächste Schritte, nicht zu viele Optionen
- Fokus auf Exam-Performance, nicht auf Wissensvermittlung
- Dashboard zeigt: wo stehe ich, wie aktiv bin ich, was ist als nächstes zu tun
