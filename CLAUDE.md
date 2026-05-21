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

### Part 1 — 6-Dimensions-Analyse-Framework
Jedes Foto mit diesen 6 Dimensionen analysieren (in dieser Reihenfolge):
1. **Number** — Wie viele Personen? Eine? Mehrere?
2. **Gender** — Männer, Frauen, gemischt?
3. **Location** — Wo befinden sie sich? (Büro, Straße, Restaurant, Fabrik...)
4. **Description** — Was tragen sie? Wie sehen sie aus?
5. **Activity** — Was tun sie gerade? (Hauptaktion)
6. **Occupation** — Welcher Beruf? (Arzt, Mechaniker, Kellner... oft aus Kontext erschließbar)

**Part 1 Skills (alle 6 Skill-Kategorien aus Barron's):**
- Skill 1: Assumptions — Was kann man aus dem Foto schlussfolgern?
- Skill 2: People — Personen nach obigem Framework analysieren
- Skill 3: Things — Objekte benennen (allgemeine Begriffe reichen, kein Spezialwissen nötig)
- Skill 4: Actions — Aktionen identifizieren; mehrere Personen → verschiedene Aktionen möglich
- Skill 5: General Locations — Kontext-Clues nutzen (Werkzeug → Werkstatt; Schreibtisch + PC → Büro)
- Skill 6: Specific Locations — Präpositionen sind der Schlüssel!

**Präpositionen für Part 1 (häufige Fallen):**
above, across, around, at, below, beneath, beside, between, by, close to, far from, in, in back of, in front of, inside, near, next to, on, on top of, outside, over, to the left of, to the right of, under, underneath

### Part 2 — Vollständige Skill-Kategorien
**Skill 1 — Similar Sounds:** Wörter mit ähnlichem Klang
- Andere Vokale: bass/base, car/core, boots/boats, court/cart, drug/drag
- Andere Anfangskonsonen: back/pack/rack, race/case/place, hair/fair/tear
- Andere Endkonsonen: little/litter, nab/nap, sent/center, let her/letter
- Klingt wie ein Wort: mark it/market, nation vs. imagination, mind vs. remind

**Skill 2 — Related Words (Themen-Familien):**
- Airline: ticket, seat belt, pilot, reservation, baggage claim, crew, check-in, turbulence
- Hotel: room, floor, bed, front desk, pool, check in/out, suite, lobby, fitness center, housekeeping
- Restaurant: table, dish, server, napkin, menu, tip, tray, waiter, bill/check, dessert
- Bank: cash, account, deposit, loan, withdrawal, teller, receipt, savings, officer
- Weather: sunny, freezing, rain, drizzle, cloudy, humid, blizzard, thunder, hurricane, lightning

**Skill 3 — Homonyms (gleiche Aussprache, andere Bedeutung):**
allowed/aloud, bare/bear, blew/blue, fare/fair, feat/feet, flew/flu, flour/flower, for/four, loan/lone, made/maid, male/mail, meat/meet, morning/mourning, one/won, pale/pail, plain/plane, right/rite/write, sail/sale, scene/seen, sight/site, steak/stake, steel/steal, tale/tail, threw/through, to/too/two, wait/weight, week/weak

**Skill 4 — Same Spelling, Different Meaning:**
call, class, court, date, band, bank, file, hard, note, seat, park, left, right — jeweils mehrere Bedeutungen, Kontext entscheidet

**Skill 5 — Suggestions (Erkennungsphrasen):**
Frage: Shall we / Why don't we / Perhaps we should / You could always / Let's / Why not / You may want to / Maybe we should / What if you / You should / If I were you, I'd / How about / What about / Have you ever thought of / Try
Antwort positiv: Yes, let's / That's a good idea / Why not? / Suits me
Antwort negativ: No, I haven't yet / OK / Good idea (indirekt)

**Skill 6 — Offers (Erkennungsphrasen):**
Frage: Let me / Allow me to / Can I / Shall I / Do you want me to / Would you like me to
Antwort annehmend: Thank you / That's very kind / I'd appreciate that
Antwort ablehnend: You're too kind / No, thanks. I can manage.

**Skill 7 — Requests (Erkennungsphrasen):**
Frage: Can you / May I / Would you / Could you / Do you think you could / How about / Would you mind
Antwort zustimmend: Of course / Is this OK? / No problem / Certainly / I'd be happy to
Antwort ablehnend: I'm sorry, I can't / Regretfully, no / Not at all, I'd be glad to

### Part 3 — Alle 9 Fragetypen
1. Questions About People — Wer spricht? Wer wird erwähnt?
2. Questions About Occupations — Welcher Beruf? (aus Dialog erschließen, nicht direkt genannt)
3. Questions About Place — Wo findet das Gespräch statt?
4. Questions About Time — Wann? Wie lange? (Zeitangaben im Dialog)
5. Questions About Activities — Was tun/planen die Sprecher?
6. Questions About Opinions — Wie denken die Sprecher darüber?
7. Graphic — Tabelle/Grafik + Dialog, Wert aus Grafik mit Audio-Info kombinieren
8. Meaning in Context — Was bedeutet ein bestimmtes Wort/Satz im Kontext?
9. Incomplete Sentences — Satz aus dem Dialog ergänzen

### Part 4 — Alle 8 Fragetypen
1. Questions About Events and Facts — Was ist passiert / wird passieren?
2. Questions About Reasons — Warum? Wozu?
3. Questions About Numbers — Welche Zahl/Datum/Betrag wurde genannt?
4. Questions About Main Topics — Worum geht es hauptsächlich?
5. Paraphrases — Was bedeutet dieser Satz aus dem Talk (in anderen Worten)?
6. Graphic — Tabelle/Grafik + Talk kombinieren
7. Implied Meaning — Was impliziert der Sprecher ohne es direkt zu sagen?
8. Multiple Accents — Sprecher mit verschiedenen Akzenten (britisch, australisch, etc.)

### Part-spezifische Strategien (Zusammenfassung)
**Part 1:** 6-Dimensions-Framework → Number/Gender/Location/Description/Activity/Occupation. Präpositionen genau prüfen. Keine Aussagen mit nicht sichtbaren Details.
**Part 2:** Fragewort/Typ sofort erkennen: Suggestion/Offer/Request/Similar Sounds/Homonym/Related Words. Kontext prüft immer welches Wort gemeint ist.
**Part 3/4:** Zuerst alle Fragen lesen → Fragetyp benennen → dann Audio. Antworten sind Paraphrasen.
**Part 5/6:** Wortform (Adj/Adv/Nomen/Verb), Verbformen, Präpositionen, Kollokationen.
**Part 7:** PRSA — Predict → Read → Scan → Answer. NOT/EXCEPT: 3 richtig, 1 falsch. Inference: nicht direkt im Text.

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
