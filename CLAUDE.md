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

### Part 4 — Alle 8 Fragetypen (vollständig)

**Skill 1 — Events and Facts (WHAT):**
- Fragephrasen: What is the talk mainly about? What event will take place next week? What are the tickets for? What will the speaker do after the meeting? What will happen after the program?
- Antwort-Typen: A parade, A job fair, A concert, The annual banquet, The budget, Plans for next year, She will sign books, He will answer questions, There will be a festival, Furniture will go on sale

**Skill 2 — Reasons (WHY):**
- Fragephrasen: Why will the bus be late? Why has the schedule been changed? Why does the speaker want to have a meeting? Why does the speaker need to change the appointment? Why is there a sale this week? Why did the speaker make the call? What was the cause of the delay?
- Antwort-Typen: The weather is bad, The director is away, Traffic is heavy, She wants to discuss the project, He has to go out of town, The store is closing, To ask for help

**Skill 3 — Numbers (HOW MANY / HOW MUCH / HOW LONG / WHAT TIME / WHEN):**
- Ähnlich klingende Zahlen (FALLE): 7/11, 13/30, 14/40, 15/50, 16/60, 17/70, 18/80, 19/90, 50/60
- Zahlen die wie andere Wörter klingen: 2=to/too, 3=free, 4=for/forget, 6=picks/sick, 8=ate/wait, 9=fine/time, 10=then/when, 20=plenty
- Nützliche Mengenphrasen: over 20=more than 20, under 20=fewer than 20, at least 20=20 or more, up to 20=no more than 20

**Skill 4 — Main Topics (AUDIENCE / PURPOSE / LOCATION):**
- Fragephrasen: What is this talk about? Who is this information for? Who would be interested in this announcement? What is the purpose of this message? Where would you hear this talk?
- Antwort: Rolle/Gruppe (a client, a ticket clerk, airline passengers, colleagues), Ortstyp (at a convention, at an airport, in an office), Thema (new machinery, environmental responsibility), Zweck (to change an appointment, to advertise, to introduce a speaker)

**Skill 5 — Paraphrases:**
- Antwort ist eine Umformulierung mit Synonymen, nie ein direktes Zitat
- Beispiele: "Temperatures will be high today" → "It will be a warm day" / "Please remain seated" → "Please stay in your seats" / "Mr. Johnson has written several books" → "Mr. Johnson is an author" / "Houses in this neighborhood don't cost a great deal" → "It isn't expensive to live in this area"
- Falsche Antworten nutzen ähnlich klingende Wörter (thirty/thirteen, later/ladder)

**Skill 6 — Graphic:**
- Grafik-Typen: Timetable (train schedule), Pie chart (budget percentages), Bar chart (units by region), Map/Floor plan (rooms/areas), Hotel directory (floors and departments), Price table (size + coverage/price)
- Strategie: Grafik VORHER scannen, Schlüsselwörter merken, im Talk nach diesen Wörtern hören

**Skill 7 — Implied Meaning:**
- Sprecher sagt etwas, meint aber mehr: "They were a bit disappointed by the turnout" → "They expected more people to be there"
- "I don't know if we're going on the right track" → speaker thinks things aren't going well
- "Let's get back to the basics" → current approach is wrong
- Tipp: Bedeutung ergibt sich aus dem KONTEXT des Talks, nicht nur aus dem Satz

**Skill 8 — Multiple Accents:**
- Akzente im echten TOEIC: American, British, Australian, South African, Canadian, Indian
- Du musst den Akzent NICHT erkennen
- Tipp: Hör Nachrichten aus USA, UK, Australien, Kanada, Neuseeland, Indien — gewöhne dich an natürliche Variationen

### Offizielle TIPs pro Part 4 Skill (direkt aus Buch — nur Prinzip, kein Originaltext)
- Skill 1 (Events/Facts): Antwortoptionen VOR dem Audio lesen → dann gezielt auf Event/Fact-Clues hören
- Skill 2 (Reasons): Antwortoptionen VOR dem Audio lesen → Antworten beginnen manchmal mit WHAT statt WHY
- Skill 3 (Numbers): Zahlen UND Wörter die wie Zahlen klingen gleichzeitig tracken
- Skill 4 (Main Topics): Nach dem übergeordneten ZWECK suchen, nicht nach Details
- Skill 5 (Paraphrases): Auf Synonyme und ähnliche Phrasen achten die denselben Sinn ausdrücken
- Skill 6 (Graphic): Grafik ZUERST scannen → dann Audio → man kann Frage NICHT allein durch die Grafik beantworten, Audio gibt den entscheidenden Clue
- Skill 7 (Implied Meaning): Bedeutung kommt aus dem KONTEXT des ganzen Talks
- Skill 8 (Multiple Accents): Nachrichten aus USA/UK/Australien/Kanada/Neuseeland/Indien hören

### Grafik-Übungstypen mit konkreten Beispieldaten (Part 4 Skill 6)
Alle 5 Grafiktypen die im Buch als Übungen vorkommen:
1. **Fahrplan-Tabelle**: Züge mit Abfahrt/Ankunft-Zeiten (4 Züge × 2 Städte)
2. **Tortendiagramm (Budget)**: Gehälter 45% / Werbung 25% / Materialien 20% / Overhead 10%
3. **Karte (Park/Natur)**: Nature Center, Rose Garden, Butterfly Garden, Pine Grove — Frage: Wo findet X statt?
4. **Balkendiagramm (Regionen)**: Units Sold — Northwest/Southwest/Northeast/Southeast — Southeast führt
5. **Catering-Tabelle**: Kim's Catering — Small:15 Personen / Medium:25 / Large:50 / Extra Large:75

### Part 4 Zahlen-Fallen (Skill 3) — vollständige Konfusionsmuster
Ähnlich klingende Zahlen: 7/11, 13/30, 14/40, 15/50, 16/60, 17/70, 18/80, 19/90, 50/60
Zahlen die wie Wörter klingen: 2=to/too, 2days=today/Tuesday, 3=free, 4=for/forget, 6=picks/sick, 8=ate/wait, 9=fine/time, 10=then/when, 20=plenty
Mengenphrasen: over 20 = more than 20, under 20 = fewer than 20, at least 20 = 20 or more, up to 20 = no more than 20

### Part 1 Skill 1 — Assumptions-Format (T/F/PT)
Das Buch trainiert Part 1 mit einem T/F/PT-System:
- **T** (True) = Aussage ist klar und vollständig korrekt
- **F** (False) = Aussage ist falsch
- **PT** (Partially True) = Aussage ist teilweise richtig, enthält aber ein falsches oder nicht sichtbares Detail
→ Produkt-Implikation: Training-Modus wo Nutzer für jede Aussage T/F/PT wählt

### Part 1 Skill 5 — Context Clues für General Locations
Methode: Objekte im Foto → schließe auf Ort
- Bänke + Gras + Bäume + Büsche + Fußweg + Zaun + Laternenpfahl → Park
- Tische + Teller + Gläser + Servietten + Gabeln → Restaurant/Cafeteria
- Regale + Bücher + Hängemappen → Büro/Bibliothek/Lager
- Werkzeug + Maschinen + Schutzkleidung → Fabrik/Werkstatt

### Part 3 Skill 9 — Incomplete Sentences (Kurzsatzphrasen mit Bedeutung)
Häufige TOEIC-Fragmente mit exakter Bedeutung:
- "Get it" / "Got it" = I understand / I understood
- "Right" = I agree / That's correct
- "Wish I could" = I want to but I can't
- "Fine with me" = I agree / That's acceptable to me
- "Sure" = Yes / Of course
- "Of course" = Certainly / That's expected

### Part 3 — Gemischte Skill-Typen in einer Konversation
Eine Part 3-Konversation testet IMMER mehrere Skill-Typen gleichzeitig — Beispiel:
- Frage 1: Fact/Activity (was hatte sie im Café?)
- Frage 2: Implied Meaning (was impliziert er über das Café?)
- Frage 3: Future Activity (was werden sie morgen tun?)
→ Implication: Beim Üben immer den Skill-Typ jeder Frage benennen bevor man antwortet

### Part 4 — Implizierte Bedeutung (Skill 7) konkrete Beispiele
- "This appointment has been rescheduled several times already" → implies Frustration / es passiert zum ersten Mal nicht
- "The stadium isn't big enough to hold the crowds" → implies event was more popular than expected
- "They were a bit disappointed by the turnout" → implies they expected more people
- "I don't know if we're going on the right track" → implies the speaker thinks things aren't working
- Ticket-Maschine: impliziert bestimmte Zahlungsart durch Kontext

### Offizielles Summary of Tips (Barron's Chapter 2 — Prinzipien, kein Originaltext)
**Part 1 Photographs:**
- Gesamtbedeutung des Satzes verstehen → bestes Match auswählen
- Foto analysieren: Anzahl/Geschlecht/Ort/Beruf/Handlung der Personen
- Kontext nutzen um Objekte und Ort zu identifizieren

**Part 2 Question-Response:**
- Bedeutung der Frage UND der Antwortoptionen verstehen
- Nicht durch ähnliche Klänge, verwandte Wörter, Homonyme täuschen lassen
- Suggestions, Offers, Requests erkennen

**Part 3 Conversations + Part 4 Talks:**
- Verschiedene Fragetypen erkennen: People, Occupations, Place, Time, etc.
- Bedeutung von Wörtern/Phrasen im Kontext verstehen
- Paraphrasen des Gesagten erkennen
- Implizierte Bedeutung verstehen
- Bei Grafik-Fragen: erst Grafik scannen, dann Audio → Grafik allein reicht nicht
- Verschiedene Akzente gewohnt sein

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

### Mini-Test Struktur (TOEIC-Format)
Der echte TOEIC läuft als kontinuierlicher Test — nicht Teil-für-Teil. Das Barron's-Buch verwendet Mini-Tests die alle 4 Listening-Parts kombinieren:
- Part 1: 4 Photos
- Part 2: 12 Question-Response
- Part 3: 9 Conversations (3 Gespräche × 3 Fragen)
- Part 4: 15 Talks (5 Talks × 3 Fragen)
→ **Produktimplikation:** Mini-Test-Modus in App implementieren (alle 4 Parts nacheinander, kein Unterbrechen)

### Grafik-Typen im echten Kontext (Part 3/4)
Aus den echten Mini-Test-Beispielen:
- **Floor Plan**: Room A/B/C/D + Ticket Office + Stairs — Frage: "Look at the graphic. Where is the gift shop?"
- **Hotel Directory**: Hildamire Hotel — Ground=Lobby/Restaurant/Pool, First=Conference/Banquet, Third=Administrative Offices, Fourth-Tenth=Guest Rooms — Frage: "Where is Ms. Jones's office?"
- **Price Table (Paint)**: Main Street Paints — Size vs. Coverage (1-liter/6sqm, 2-liter/12sqm, 5-liter/30sqm, 25-liter-bucket/150sqm) — Frage: "Which size will they buy?" (aus Konversation ableitbar)
- **Store Sale Table**: Springer's Office Store — 10% off paper/pens, 15% off electronics, 20% off furniture, 25% off coffeemakers — Frage: "How much discount?"

### Antwort-Erklärungs-Struktur (Distractor-Analyse)
Aus den Erklärungsseiten des Buchs — Struktur wie man falsche Antworten erklärt:
1. Richtige Antwort: direkte Zitat/Paraphrase nennen
2. Falsche Antwort A: warum falsch — Distractor-Typ benennen (Related Word / Similar Sound / Context Swap / Partial Truth)
3. Für jede Option: Erklärung WARUM es eine Falle ist
→ In App: Nach jeder Aufgabe diese Erklärungsstruktur zeigen

### Part 4 Talk-Typen (authentische Beispiele)
Echte Talk-Formate die im TOEIC vorkommen:
1. **Welcome/Introduction**: "Good evening and welcome to tonight's presentation..."
2. **Weather Forecast**: "Here is the weather outlook for the weekend. We will have cloudy skies all day Saturday. Expect rain to begin late Saturday evening..."
3. **Phone Menu**: "Thank you for calling [Company]. To check order status, press one. For shipping information, press two. To speak with a customer service representative, press three..."
4. **Store Announcement**: "Attention shoppers. We will be closing the store in ten minutes. If you are purchasing ten items or fewer, you may use the express checkout lane..."
5. **Tour/Event Announcement**: "The tour will begin in just a few minutes. Please line up by the main entrance. If you don't have a ticket, you can purchase one in the gift shop."

### TOEIC Prüfungs-Tipps (Barron's Premium 10th Edition — Lerngrundlage)

**Part 1:** Analysiere Personen (Anzahl, Geschlecht, Beruf, Aktion) + Objekte + Ort. Eliminiere Aussagen mit nicht sichtbaren Details.
**Part 2:** Sound-alikes, Synonyme, Homonyme sind Fallen. Erkenne Vorschläge/Angebote/Bitten. "Or"-Fragen: Antwort wählt eine Option oder sagt neither/both.
**Part 3/4:** Erkenne Fragentypen (Person, Beruf, Ort, Zeit, Handlung, Setting). Antworten sind oft Paraphrasen. Implizite Bedeutung wichtig. Grafik: erst scannen, dann hören.
**Part 5/6:** Unterscheide ähnliche Wortformen, Verbformen, Adjektiv/Adverb, Präpositionen.
**Part 7:** PRSA-Strategie: Predict → Read → Scan → Answer. Antworten sind Paraphrasen des Textes.

**Distractor-Qualität:** Falsche Antworten sollen Wörter aus dem Text/Dialog nutzen (Sound-alike-Trap), Zeit/Ort/Person verwechseln (Context-Swap) oder partiell wahr sein (Partial-Truth-Trap).

## Produkt-Prinzipien

- Der User soll nicht überlegen müssen was er tut — das System führt ihn guided
- Kein kognitiver Overhead: klare nächste Schritte, nicht zu viele Optionen
- Fokus auf Exam-Performance, nicht auf Wissensvermittlung
- Dashboard zeigt: wo stehe ich, wie aktiv bin ich, was ist als nächstes zu tun
