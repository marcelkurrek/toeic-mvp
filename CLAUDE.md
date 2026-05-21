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

### Part 3 — Alle 9 Fragetypen (vollständig)

**Skill 1 — Questions About People (WHO):**
- Fragephrasen: Who are the speakers? Who is the man? Who will do X? Who delivered Y? Who is the party for? Whose office is it?
- Antwort-Typen: Proper names (Mr./Mrs./Dr.), By activity (a tourist, a driver), By group (business people, college students), By relationship (his boss, her colleague)

**Skill 2 — Questions About Occupations (JOB):**
- Tip: Zuerst Antwortoptionen lesen → welche Berufe stehen zur Auswahl? → dann im Audio nach Clues suchen
- Fragephrasen: What kind of job does X have? What is X's present position? What type of work does Y do? Who can benefit from this memo? Who would most likely use the conference hall?
- Typische Berufe im TOEIC: director, lawyer, accountant, office manager, receptionist, dentist, travel agent, hotel clerk, pilot, flight attendant, waiter/server, chef, computer programmer, personnel director

**Skill 3 — Questions About Place (WHERE):**
- Tip: Hör auf Präpositionen: in, on, at
- Fragephrasen: Where did the conversation take place? Where is the man/woman? Where are they going? Where has the man been? Where should he call?
- Antworten ohne Präp: The train station, The store, The office, The house
- Antworten mit Präp: In the closet, Under the desk, At the office, Next to the bank, On the bus, At the dentist's, By the door, In the dining room

**Skill 4 — Questions About Time (WHEN/HOW LONG/HOW OFTEN):**
- WHEN: When did X happen? When is the meeting? When was the vacation?
- HOW LONG: How long will they be in X? How long did the meeting last? How long to arrive?
- HOW OFTEN: How often do buses leave? How often are employees paid?
- Antworten Zeitpunkte: 11:00 a.m., Noon, Midnight, At 6:00, Before 5:30, Tomorrow, In the morning, Next year, On January 3rd
- Dauer: 45 minutes, An hour, Two days, A week, About a month, Less than a year
- Frequenz: Every hour, Every day, Every other day, Once a month, Twice a year, Three times a week

**Skill 5 — Questions About Activities (WHAT WILL/DID):**
- Fragephrasen mit "to do": What will the man do? What did the woman do? What are they planning to do? What is X supposed to do? What are they doing?
- Ereignis-Fragen: What happened? What occurred? What took place? What will happen next?
- HOW-Fragen: How can the package be sent? How will the room be changed?
- Typische Antworten: Mail a package, Wait on the corner, Take a course, Attend a lecture, Take a day off, Leave soon, Move furniture, Go to the store, See a movie, Play golf, Plan a workshop, Make photocopies

**Skill 6 — Questions About Opinions (WHAT + THINK/FEEL):**
- Immer eingeleitet durch WHAT: What did the man think about X? What did the woman say about Y? What is the woman's opinion of Z? What was the matter with X?
- Antworten: It's boring / He's highly qualified / The room is too dark / It was too expensive / She was very helpful / It wasn't long enough

**Skill 7 — Graphic (LOOK AT THE GRAPHIC):**
- Immer eingeleitet durch "Look at the graphic"
- Grafik-Typen: Tabelle (Stundenplan, Preisliste), Liniendiagramm, Agenda, Einkaufszentrum-Karte
- Tip: Grafik VORHER schnell scannen → Schlüsselwörter merken → im Dialog nach diesen Wörtern hören
- Beispiel: Reception Desk Schedule (Name pro Tag), Printer Model + Price table, Sales graph, Staff Meeting agenda, Shopping Mall map

**Skill 8 — Meaning in Context (WHAT DOES X MEAN):**
- Frage: "What does the man mean when he says, '[Zitat]'?"
- Wörter/Phrasen können mehrere Bedeutungen haben — Kontext entscheidet
- Typische umgangssprachliche Beispiele: "I got it" = I understand / "Could you?" = Will you do it? / "Gotta work" = I have to work
- Tip: Verstehe wie das Wort/die Phrase im Kontext des Gesprächs verwendet wird

**Skill 9 — Incomplete Sentences (FRAGMENTED SPEECH):**
- In normaler Konversation werden Sätze oft verkürzt (Speaker lässt Subject+Verb weg)
- Typ: Kurze Antworten verstehen: "Maybe later" = "Maybe later I will come" / "Gotta work" = "I've got to work"
- Typische Fragmente: Right. / Got it. / Fine with me. / Sure. / Of course.
- Tip: Kontext nutzen um die vollständige Bedeutung zu verstehen

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
