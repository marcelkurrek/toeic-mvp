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

---

## Reading Section (Parts 5–7) — Barron's Premium 10th Edition

### Überblick Reading

- **Part 5 — Incomplete Sentences:** 30 Fragen, 13 Skill-Kategorien (Grammar + Vocabulary)
- **Part 6 — Text Completion:** 16 Fragen, 4 Textpassagen à 4 Lücken — Kontext der ganzen Passage entscheidet
- **Part 7 — Reading Comprehension:** 54 Fragen — 29 Single Passages + 25 Multiple Passages (2–3 Texte gleichzeitig)

---

### Part 5 — Incomplete Sentences (30 Fragen, 13 Skills)

#### Skill 1 — Word Families
Gleiche Wurzel, verschiedene Wortklassen: Nomen / Verb / Adjektiv / Adverb
- Wortbau durch Suffixe: `-tion/-sion` (Nomen) | `-ment` (Nomen) | `-ful/-ous/-al/-ic/-ive/-able` (Adjektiv) | `-ly` (Adverb) | `-ize/-ify/-en` (Verb)
- Strategie: Welche Wortklasse passt grammatisch in die Lücke? → Nur diese Option kann richtig sein
- Beispiel: "The ___ of the project was delayed" → Nomen gefragt → "completion" nicht "complete"

#### Skill 2 — Similar Meanings (Confusables)
Wörter die ähnlich klingen oder bedeuten, aber unterschiedlich verwendet werden:
- **commute** (pendeln/täglich reisen) vs. **travel** (reisen allgemein)
- **borrow** (borgen/nehmen) vs. **lend** (verleihen/geben)
- **raise** (transitiv: etwas anheben) vs. **rise** (intransitiv: von selbst steigen)
- **lay** (transitiv: legen) vs. **lie** (intransitiv: liegen)
- Strategie: transitive vs. intransitive Verben prüfen; Kontext wer handelt

#### Skill 3 — Similar Forms
Wörter die ähnlich aussehen/klingen, aber unterschiedliche Bedeutung haben:
- Gruppe 1: reduce/produce/deduce/induce — alle auf `-duce`, aber verschiedene Bedeutungen
- Gruppe 2: omit/permit/emit/admit — alle auf `-mit`
- Gruppe 3: piece/pierce — ähnliches Schriftbild
- Strategie: Kontext exakt lesen; Bedeutung nicht aus Wortähnlichkeit ableiten

#### Skill 4 — Subject-Verb Agreement with Prepositional Phrases
Beim S-V-Agreement gilt das HAUPTSUBJEKT, nicht das nächste Nomen:
- "The list of items **is** ready" — `list` (singular) ist Subjekt, nicht `items`
- "Members of the committee **are** present" — `members` (plural) ist Subjekt
- Falle: Zwischen Subjekt und Verb steht eine Präpositionalphrase die das Subjekt verschleiert

#### Skill 5 — Singular and Plural (Tricky Rules)
Besondere Singular/Plural-Regeln:
- **Geld:** money / information / advice / news = IMMER SINGULAR
- **Firmenname:** Always Industries / The company = SINGULAR auch wenn Pluralform
- **Indefinitpronomen:** everybody / nobody / everyone / someone / nothing = SINGULAR
- **Collective nouns:** committee / team / staff = meist SINGULAR (amerikanisches Englisch)
- **Neither/Either allein:** SINGULAR — "Neither of the reports **is** complete"
- **Both:** PLURAL — "Both reports **are** complete"

#### Skill 6 — Verb Tenses
Zeitsignal-Wörter erkennen und passendes Tempus wählen:
- **Simple Present:** every day, usually, often, always, sometimes, never, on Mondays
- **Present Continuous:** now, right now, at the moment, currently
- **Present Perfect:** already, just, yet, recently, since, for (+ Zeitraum)
- **Simple Past:** yesterday, last week, last year, ago, in 2020, when (+ abgeschlossene Zeit)
- **Simple Future:** tomorrow, next week, soon, in the future, will, be going to
- **Past Perfect:** before + Simple Past; after + Past Perfect (Reihenfolge in Vergangenheit)

#### Skill 7 — Comparisons
Drei Steigerungsgrade: Positiv / Komparativ / Superlativ

**Ein- und zweisilbige Adjektive & Adverbien** (Endung `-er`/`-est`):
- pretty → prettier → the prettiest
- narrow → narrower → the narrowest
- far → farther → the farthest
- soon → sooner → the soonest

**Mehrsilbige Adjektive & Adverbien** (`more`/`most` davor):
- popular → more popular → the most popular
- competent → more competent → the most competent
- efficiently → more efficiently → the most efficiently
- quickly → more quickly → the most quickly

**Unregelmäßige Formen:**
- good → better → the best
- bad → worse → the worst
- well → better → the best
- little → less → the least

TIP: Superlative werden IMMER von `the` begleitet.
TIP: Zweier-Vergleich → Komparativ + `than`; Dreier+ → Superlativ + `the`

#### Skill 8 — Pronouns
Pronomen stimmt in Person und Numerus mit seinem Antezedens überein:

| Subject | Object | Possessive Adj | Possessive Pronoun | Reflexive |
|---------|--------|---------------|-------------------|-----------|
| I | me | my | mine | myself |
| you | you | your | yours | yourself |
| he/she/it | him/her/it | his/her/its | his/hers/its | himself/herself/itself |
| we | us | our | ours | ourselves |
| you | you | your | yours | yourselves |
| they | them | their | theirs | themselves |

TIP: Antezedens identifizieren → Person und Numerus bestimmen → passendes Pronomen wählen

#### Skill 9 — Subject Relative Pronouns

**Restrictive Clauses** (notwendig zur Identifikation — keine Kommas):
| Antecedent | Relative Pronoun |
|------------|-----------------|
| People | who / that |
| Things | which / that |
| Possession | whose |

Beispiele:
- "The woman **who** shares this office is very good with computers."
- "The packages **that** arrived this morning are on your desk."
- "The man **whose** office is next door wants to meet you."

**Nonrestrictive Clauses** (Zusatzinfo — MIT Kommas):
- People: who, whose
- Things: which, whose
- Keine Verwendung von `that` in nonrestrictive clauses
- "Mr. Maurice, **who** has worked here for a long time, will retire soon."
- "My car, **which** is constantly breaking down, is at the mechanic's."

TIP: Der Adjektivsatz folgt DIREKT dem Antezedens.

#### Skill 10 — Object Relative Pronouns

**Restrictive Clauses** — wenn Relativpronomen das Objekt des Relativsatzes ist:
| Antecedent | Relative Pronoun |
|------------|-----------------|
| People | whom / who / that / nothing (omittierbar) |
| Things | which / that / nothing (omittierbar) |
| Possession | whose |

Beispiele:
- "The accountant **whom** we hired last month used to work for Ibex International."
- "The office **that** we rented is very close to the subway station."

**Nonrestrictive Clauses** — MIT Kommas:
- People: whom / who
- Things: which
- Possession: whose
- "My neighbor, **whom** I have known for many years, is moving away next month."
- "The City Museum, **which** I visit almost every day, has many interesting exhibits."

TIP: Wenn das Relativpronomen das Subjekt des Relativsatzes ist → Subject Relative Pronoun verwenden. Wenn es das Objekt ist → Object Relative Pronoun. Für `whose` immer Object Pronoun nutzen.

#### Skill 11 — Passive Voice
Passiv = Subjekt empfängt die Handlung (Agens unbekannt/unwichtig)
Bildung: **be** (in beliebigem Tempus) + **Past Participle**

| Tempus | Aktiv-Beispiel | Passiv-Bildung |
|--------|----------------|----------------|
| Simple Present | pays | is/are + paid |
| Simple Past | delivered | was/were + delivered |
| Present Perfect | has held | has been + held |
| Future | will distribute | will be + distributed |

Beispiele:
- "Employees **are paid** every Friday." (Simple Present Passive)
- "The mail **was delivered** at 10:00 this morning." (Simple Past Passive)
- "The annual conference **has been held** in this city every year since 2005." (Present Perfect Passive)
- "The report **will be distributed** at tomorrow's meeting." (Future Passive)

Wenn der Agens genannt wird → mit `by`: "The letter **was signed by** the accountant."

TIP: Prüfe ob Subjekt die Handlung AUSFÜHRT (aktiv) oder EMPFÄNGT (passiv).

#### Skill 12 — Word Meaning
Richtiges Vokabular aus Kontext erschließen:
- Nie nur die Lücke selbst betrachten — UMLIEGENDE Sätze geben die Bedeutung vor
- Beispiel: Workshop-Ankündigung → Leute die teilnehmen = **participants** (nicht consultants/customers/reviewers)
- Beispiel: Schwieriger Arzttermin → Person die einen Termin bekommt = **fortunate** (nicht wise/necessary/persistent)
- Strategie: Was beschreibt der ganze Kontext? Welches Wort passt zur Gesamtsituation?

#### Skill 13 — Sentence Choice
Beim Einfügen eines ganzen Satzes in eine Passage:
- TIP: Identifiziere BOTH the TOPIC and the PURPOSE of the passage
- Der einzufügende Satz muss THEMA UND ZWECK der Passage widerspiegeln
- Beispiel Thema=Gesundheitsversicherung, Zweck=Meeting ankündigen → Satz muss über das Meeting informieren, nicht über Krankenversicherung oder Vertragsdetails
- Falsche Antworten: Erwähnen den richtigen Kontext (z.B. Gesundheit) aber passen nicht zum Zweck (z.B. Vertragsfeedback statt Meeting-Info)

---

### Part 6 — Text Completion (16 Fragen, 4 Passagen)

**Grundprinzip:** Kurze Textpassagen (Memo, Email, Brief, Bekanntmachung) mit 4 Lücken. Anders als Part 5 reicht das isolierte Betrachten einer Lücke nicht — der Kontext der ganzen Passage entscheidet.

#### Skill 1 — Adverbs of Frequency
Häufigkeitsskala (abnehmend):
always → usually → frequently → often → sometimes → occasionally → seldom → rarely → never

Positionierung: Meist VOR dem Hauptverb, NACH `be`: "She **is always** late" / "He **rarely** attends"

#### Skill 2 — Gerunds and Infinitives after Main Verbs

**Gerund (Verb + -ing) nach diesen Verben:**
appreciate / avoid / consider / delay / discuss / enjoy / finish / mind / miss / postpone / quit / risk / suggest

**Infinitiv (to + base form) nach diesen Verben:**
agree / attempt / claim / decide / demand / fail / hesitate / hope / intend / learn / need / offer / plan / prepare / refuse / seem / want

#### Skill 3 — Gerunds and Infinitives after Prepositions
Nach Präpositionen IMMER Gerund (nicht Infinitiv):
- "She is interested **in attending** the conference."
- "He is responsible **for completing** the report."
- "They succeeded **in getting** the contract."
- Wichtige Phrasen: in addition to / instead of / prior to / after / before (wenn Präp, nicht Konj)

#### Skill 4 — Causative Verbs

**Causative + Basisform (ohne to):**
- **have** someone do: "She **had** her assistant **schedule** the meeting."
- **let** someone do: "The manager **let** employees **leave** early."
- **make** someone do: "The boss **made** everyone **work** overtime."

**Causative + Infinitiv (mit to):**
- allow / cause / force / get / order / permit / require + someone + **to** + base form
- "The policy **requires** employees **to** submit reports weekly."
- "The director **ordered** the team **to** revise the proposal."

---

### Part 7 — Reading Comprehension (54 Fragen, 13 Dokument-Typen)

**Aufbau:** 29 Single Passage + 25 Multiple Passage (2–3 Texte gleichzeitig)
Jeder Passagen-Set hat 2–5 Fragen.

#### PSRA Strategy (vollständig)

**P — Predict:**
- Lies die Einführungszeile VOR dem Text (z.B. "Questions 1-3 refer to the following memo")
- Diese Zeile verrät was für ein Dokumenttyp es ist und hilft Vorhersagen zu treffen
- Schau auf den Look des Textes (fax / phone message / graph / memo) für Hinweise

**S — Scan:**
- Schau die FRAGEN an BEVOR du den Text liest
- Finde die Key Words in den Fragen UND in den Antwortoptionen
- Beim Lesen des Textes: suche nach diesen Key Words und Synonymen
- Key Words in Fragen: equipment / multiple uses; im Text: "answering machines" / "tablet computers"

**R — Read:**
- Lies den Text schnell — du weißt schon was du suchst
- Bestätige deine Predictions durch Lesen
- Beantworte zuerst alle einfachen Fragen, fang dann mit dem Rest an
- Markiere NICHT auf dem Antwortbogen bis du alle Fragen zur Passage bearbeitet hast

**A — Answer:**
- Jetzt markieren auf dem Antwortbogen
- Für jede Frage: Key Words suchen, ähnliche Bedeutungen suchen
- Wenn du keine Antwort weißt: RATE (kein Abzug im TOEIC)
- Antwortoptionen folgen der Sequenz des Textes — erste Frage meist aus erstem Textabschnitt

#### Part 7 — Fragetypen

1. **Main Idea** — "What is the purpose of this ...?" / "Who is this written for?" → Auf Zweck, nicht Details achten
2. **Detail** — "What is indicated about X?" → Im Text direkt oder als Paraphrase
3. **Vocabulary** — "The word '...' is closest in meaning to ..." → Kontext entscheidet, nicht Wörterbuchdefinition
4. **Sentence Insertion** — "[1][2][3][4]" Positionen → Prüfe ob Satz thematisch zum Absatz passt UND zum Zweck der Passage
5. **Meaning in Context** — "What does X mean when he/she writes '...'?" → Bedeutung im Kontext des gesamten Gesprächs/Texts

**Für NOT/EXCEPT-Fragen:** Drei Antworten sind im Text richtig, EINE ist es nicht — diese ist die Antwort.

#### Part 7 — 13 Dokument-Typen (alle Skills)

**Skill 1 — Advertisements** (Anzeigen)
In Zeitungen, Magazinen, Internet; über Produkte, Dienstleistungen, Immobilien, Jobs
- Werbeanzeige = oft kurz, prägnant, mit Kontaktinfo
- Beispiel: "ATTENTION MANUFACTURERS! We introduce and distribute your products to 125,000 distributors in 155 countries, FREE!"

**Skill 2 — Forms** (Formulare)
Template für Einzelpersonen: subscription forms, purchase orders, reservation forms, invoices, application forms
- Enthält strukturierte Felder: Name, Company, Payment, Total etc.
- Beispiel: Journal subscription form mit Name/Email/Company/Payment/Total

**Skill 3 — Letters** (Briefe)
Wichtige Info steht im BODY des Briefes. Struktur: Greeting (Dear Mr./Ms. ...) → Body → Closing (Sincerely yours / Sincerely)
- Formaler Ton; klare Angabe des Zwecks im ersten Absatz
- Beispiel: X-Cellent Corporation letter about property appraisal

**Skill 4 — Memos** (Memoranda)
Interne Kommunikation innerhalb einer Firma; heute oft als Email gesendet
- Struktur: To / From / Date / Subject → dann Body-Text
- Computer-generated language oft verwendet
- Beispiel: Personnel Officer → All Employees re: Company Travel Policy

**Skill 5 — Tables and Charts** (Tabellen und Diagramme)
Daten zur schnellen Übersicht; fast jedes Thema möglich
- Welttemperaturen-Tabelle: Stadt + Hi/Lo Temperatur (C/F) + Wetterkode (s=sunny, c=cloudy, sh=showers, pc=partly cloudy, r=rain, t=thunderstorms)

**Skill 6 — Graphs** (Grafiken)
Zeigen Beziehungen zwischen Variablen; Typen: Liniendiagramm, Balkendiagramm, Tortendiagramm
- Beispiel: Hotel Chain Market Share Pie Chart: Stillon 55%, Lowit 25%, Torte 15%, Other 5%

**Skill 7 — Announcements** (Bekanntmachungen)
Formale Statements über Neuigkeiten: Personalveränderungen, neue Produkte, besondere Events
- Erster Satz/Absatz enthält die Kernaussage
- Beispiel: City Chamber of Commerce Job Fair-Ankündigung (City Convention Center, pre-registration required)

**Skill 8 — Notices** (Hinweise/Aushänge)
Info für Öffentlichkeit oder spezifische Produktnutzer; oft an Wänden/Gebäuden oder in Produktliteratur
- Themen: Regeländerungen, Richtlinienänderungen, wichtige Hinweise
- Beispiel: Corporate Policy Change — Moving Expenses (nur wenn neue Heimat ≥ 50 Meilen entfernt)

**Skill 9 — Articles** (Artikel)
Texte für Zeitungen, Magazine, Newsletter; allgemeines oder spezifisches Interesse; Ton und Länge hängt von Publikation ab
- Struktur: Einleitung (Hauptaussage) → Entwicklung → Schluss
- Beispiel: Restaurant-Artikel über Kochkurse als Marketingmaßnahme

**Skill 10 — Schedules** (Zeitpläne)
Listen von Zeiten/Daten für Events/Aufgaben: Bahn-/Busfahrpläne, Zahlungspläne, Kurspläne, Projektpläne
- Wichtig: Fußnoten und Legende lesen (T=Tunnel, W=Bus, Fettdruck=Peak Fares)
- Beispiel: Bus Route Schedule (7th & Market / East Rise P&R / Tunnel / 122nd East & 16th)

**Skill 11 — Emails** (E-Mails)
Elektronische Post; kann jede Art Korrespondenz sein; enthält Heading (From/To/Subject)
- Charakteristisch: informellerer Ton als formelle Briefe; schnelle Kommunikation
- Beispiel: Melinda Ligos an Misha Polentesky re: Meeting in Orlando

**Skill 12 — Webpages** (Webseiten)
Viele verschiedene Webseiten im TOEIC; Layout und Terminologie vertraut machen (HOME/ABOUT/FAQ/PRICING/REVIEWS)
- Enthalten Navigation-Menü, Hauptinhalt, oft Links zu weiteren Infos
- Beispiel: Domestic Designs — Interior Decorating Company webpage

**Skill 13 — Text Messages and Online Chats** (Textnachrichten und Online-Chats)
Häufige Kommunikationsformen; IMMER eine "Meaning in Context"-Frage dabei
- Format: Zeitstempel + Name + Nachricht (chronologisch)
- Gängige Phrasen: "Got it." / "Right." / "I'm sorry?" / "Sounds good."
- Beispiel: Lin Lee / Jim Hart chat (traffic/bus late, work agreement signing)

### Part 7 — Authentische Dokumentbeispiele (aus Barron's-Übungen)

- **Advertisement:** "ATTENTION MANUFACTURERS! We introduce and distribute your products to 125,000 distributors in 155 countries, FREE! Tel: (310) 553-4434, Ext. 105; Fax: (310) 553-5555; GRAND TECHNOLOGIES LIMITED" — Zielgruppe: Manufacturers, nicht Distributors
- **Form:** Journal of Business News Monthly subscription form (Anne Kwok, Pharmaceutical Supply Company, Xtra Card, 1 year = $199.99, 2 years = $349.99) — Fragen: Wie oft erscheint das Journal? (yearly), Wie bekommt sie es? (online + paper), Wie viel kostet ein Jahr?
- **Letter:** X-Cellent Corporation property appraisal letter (Mark Wilson an George Hendries; first payment = 50% of total report price before work begins; report delivered by end of next month)
- **Memo:** Simon Gonzales (Personnel Officer) → All Employees, Company Travel Policy: Business Class erlaubt wenn Flug >5 Stunden; kein First Class; effective June 1
- **Table/Chart:** World Temperatures January 5 (Amsterdam/Athens/Bangkok/Beijing/Brussels/Budapest/Frankfurt/Jakarta/Kuala Lampur/Madrid/Manila/Seoul/Taipei/Tokyo; Hi/Lo in C and F; Weather codes)
- **Graph:** Hotel Chain Market Share (Stillon 55%, Lowit 25%, Torte 15%, Other 5%) — Zielgruppe: Competing hotels
- **Announcement:** City Job Fair at City Convention Center March 11; workshops on résumé writing, interview skills; no charge but pre-registration required; open to public; Sentence Insertion positions [1][2][3][4]
- **Notice:** Corporate Policy Change — Moving Expenses: reimbursed only if new home ≥ 50 miles from former home; household goods and personal effects covered; meals/pre-move househunting/temporary quarters NOT reimbursed
- **Article:** Restaurant cooking classes article (cooking classes als Werbemittel; attract more business; low costs, high return)
- **Schedule:** Bus route (7th & Market / East Rise P&R / Tunnel / 122nd East & 16th); T=Tunnel (opens 8am, departs 5min prior to time stop at 12th & Meridian); W=Bus; Bold=peak fares
- **Email:** Melinda Ligos → Misha Polentesky re: Meeting in Orlando (client loved proposal, no changes, paperwork by end of week, dinner at Sparazza's, back at home office Thursday)
- **Webpage:** Domestic Designs (HOME/ABOUT/FAQ/PRICING/REVIEWS; 20 years experience; free first consultation; portfolio link)
- **Text Messages:** Lin Lee/Jim Hart (traffic heavy/bus slow, client arriving, will be there shortly, you have the papers?, work agreement to sign) — Meaning in Context: "I'm sorry?" = wants Jim to repeat

### Summary of Tips — Reading Section (Barron's p.180)

**Part 5: Incomplete Sentences und Part 6: Text Completion**
- Unterscheide Wörter mit ähnlichen aber verschiedenen Bedeutungen oder Formen
- Bestimme das richtige Wort, den richtigen Ausdruck oder Satz für den Kontext
- Erkenne verschiedene Verbformen
- Erkenne Singular- und Pluralnomen
- Erkenne verschiedene Klausel-Typen
- Verstehe verschiedene Verwendungen von Präpositionen

**Part 7: Reading Comprehension**
- Kenne die verschiedenen Textpassagen-Typen im TOEIC (alle 13 Skill-Typen)
- Kenne die verschiedenen Fragetypen im TOEIC (Main Idea / Detail / Vocabulary / Sentence Insertion / Meaning in Context)
- Nutze die PSRA-Strategie: Predict → Scan → Read → Answer

## Produkt-Prinzipien

- Der User soll nicht überlegen müssen was er tut — das System führt ihn guided
- Kein kognitiver Overhead: klare nächste Schritte, nicht zu viele Optionen
- Fokus auf Exam-Performance, nicht auf Wissensvermittlung
- Dashboard zeigt: wo stehe ich, wie aktiv bin ich, was ist als nächstes zu tun
