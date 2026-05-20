export interface VocabWord {
  id: string
  word: string
  translation: string
  example: string
  category: 'business' | 'office' | 'finance' | 'travel' | 'personnel' | 'legal' | 'marketing'
  difficulty: 1 | 2 | 3
}

export const VOCAB_WORDS: VocabWord[] = [
  // ── Business & Management ─────────────────────────────────────────────────
  { id: 'b01', word: 'agenda', translation: 'Tagesordnung', example: 'Please review the meeting agenda before Friday.', category: 'business', difficulty: 1 },
  { id: 'b02', word: 'implement', translation: 'umsetzen / implementieren', example: 'The company will implement new procedures next month.', category: 'business', difficulty: 2 },
  { id: 'b03', word: 'streamline', translation: 'rationalisieren / vereinfachen', example: 'We need to streamline our workflow.', category: 'business', difficulty: 3 },
  { id: 'b04', word: 'collaborate', translation: 'zusammenarbeiten', example: 'Both departments will collaborate on this project.', category: 'business', difficulty: 2 },
  { id: 'b05', word: 'delegate', translation: 'delegieren', example: 'Managers should delegate tasks effectively.', category: 'business', difficulty: 2 },
  { id: 'b06', word: 'initiative', translation: 'Initiative', example: 'She took the initiative to solve the problem.', category: 'business', difficulty: 2 },
  { id: 'b07', word: 'objective', translation: 'Ziel / Zielobjektiv', example: 'Our main objective is to increase revenue.', category: 'business', difficulty: 1 },
  { id: 'b08', word: 'strategy', translation: 'Strategie', example: 'We need a new marketing strategy.', category: 'business', difficulty: 1 },
  { id: 'b09', word: 'benchmark', translation: 'Maßstab / Vergleichswert', example: 'Set a benchmark for quarterly performance.', category: 'business', difficulty: 3 },
  { id: 'b10', word: 'leverage', translation: 'nutzen / Hebel', example: 'We should leverage our existing network.', category: 'business', difficulty: 3 },
  { id: 'b11', word: 'feasible', translation: 'machbar / durchführbar', example: 'The proposal seems feasible within the budget.', category: 'business', difficulty: 3 },
  { id: 'b12', word: 'provisional', translation: 'vorläufig', example: 'This is a provisional schedule pending approval.', category: 'business', difficulty: 3 },

  // ── Office & Administration ───────────────────────────────────────────────
  { id: 'o01', word: 'correspondence', translation: 'Korrespondenz', example: 'Please handle all client correspondence promptly.', category: 'office', difficulty: 2 },
  { id: 'o02', word: 'premises', translation: 'Räumlichkeiten / Gebäude', example: 'Visitors must sign in at the premises.', category: 'office', difficulty: 2 },
  { id: 'o03', word: 'subsequent', translation: 'nachfolgend / darauffolgend', example: 'Subsequent meetings will be held weekly.', category: 'office', difficulty: 3 },
  { id: 'o04', word: 'submit', translation: 'einreichen / abgeben', example: 'Please submit your report by 5 p.m.', category: 'office', difficulty: 1 },
  { id: 'o05', word: 'acknowledge', translation: 'bestätigen / anerkennen', example: 'Please acknowledge receipt of this email.', category: 'office', difficulty: 2 },
  { id: 'o06', word: 'duration', translation: 'Dauer', example: 'The duration of the project is six months.', category: 'office', difficulty: 1 },
  { id: 'o07', word: 'mandatory', translation: 'obligatorisch / Pflicht', example: 'Attendance at the training is mandatory.', category: 'office', difficulty: 2 },
  { id: 'o08', word: 'authorize', translation: 'genehmigen / autorisieren', example: 'Only the manager can authorize expenses.', category: 'office', difficulty: 2 },
  { id: 'o09', word: 'tentative', translation: 'vorläufig / unverbindlich', example: 'The meeting is tentatively scheduled for Monday.', category: 'office', difficulty: 3 },
  { id: 'o10', word: 'retrieve', translation: 'abrufen / wiederherstellen', example: 'You can retrieve the file from the server.', category: 'office', difficulty: 2 },

  // ── Finance & Accounting ──────────────────────────────────────────────────
  { id: 'f01', word: 'revenue', translation: 'Umsatz / Einnahmen', example: 'Revenue increased by 15% last quarter.', category: 'finance', difficulty: 1 },
  { id: 'f02', word: 'invoice', translation: 'Rechnung', example: 'Please send the invoice by end of day.', category: 'finance', difficulty: 1 },
  { id: 'f03', word: 'expenditure', translation: 'Ausgaben', example: 'Total expenditure exceeded the budget.', category: 'finance', difficulty: 2 },
  { id: 'f04', word: 'reimbursement', translation: 'Erstattung / Rückerstattung', example: 'Submit your receipts for reimbursement.', category: 'finance', difficulty: 2 },
  { id: 'f05', word: 'fiscal', translation: 'fiskalisch / Geschäftsjahr-', example: 'Our fiscal year ends in December.', category: 'finance', difficulty: 2 },
  { id: 'f06', word: 'deficit', translation: 'Defizit', example: 'The company reported a budget deficit.', category: 'finance', difficulty: 2 },
  { id: 'f07', word: 'liability', translation: 'Verbindlichkeit / Haftung', example: 'The contract limits our financial liability.', category: 'finance', difficulty: 3 },
  { id: 'f08', word: 'amortize', translation: 'amortisieren / tilgen', example: 'The loan will be amortized over 10 years.', category: 'finance', difficulty: 3 },
  { id: 'f09', word: 'equity', translation: 'Eigenkapital', example: 'Investors own 30% equity in the company.', category: 'finance', difficulty: 2 },
  { id: 'f10', word: 'dividend', translation: 'Dividende', example: 'Shareholders received a quarterly dividend.', category: 'finance', difficulty: 2 },

  // ── Travel & Logistics ────────────────────────────────────────────────────
  { id: 't01', word: 'itinerary', translation: 'Reiseplan / Reiseroute', example: 'Please confirm your travel itinerary.', category: 'travel', difficulty: 2 },
  { id: 't02', word: 'accommodate', translation: 'unterbringen / beherbergen', example: 'The hotel can accommodate 200 guests.', category: 'travel', difficulty: 2 },
  { id: 't03', word: 'reservation', translation: 'Reservierung', example: 'I made a reservation for three nights.', category: 'travel', difficulty: 1 },
  { id: 't04', word: 'departure', translation: 'Abfahrt / Abflug', example: 'The departure time is 9:30 a.m.', category: 'travel', difficulty: 1 },
  { id: 't05', word: 'complimentary', translation: 'kostenlos / kostenfrei', example: 'Breakfast is complimentary for all guests.', category: 'travel', difficulty: 2 },
  { id: 't06', word: 'transit', translation: 'Transit / Durchreise', example: 'Passengers in transit need not clear customs.', category: 'travel', difficulty: 2 },
  { id: 't07', word: 'layover', translation: 'Zwischenstopp', example: 'There is a 3-hour layover in Frankfurt.', category: 'travel', difficulty: 2 },
  { id: 't08', word: 'vicinity', translation: 'Umgebung / Nähe', example: 'Several restaurants are in the vicinity.', category: 'travel', difficulty: 3 },

  // ── Personnel & HR ────────────────────────────────────────────────────────
  { id: 'p01', word: 'recruit', translation: 'rekrutieren / einstellen', example: 'We are recruiting for a senior developer.', category: 'personnel', difficulty: 1 },
  { id: 'p02', word: 'probationary', translation: 'Probe- / auf Probe', example: 'She is still in her probationary period.', category: 'personnel', difficulty: 3 },
  { id: 'p03', word: 'appraisal', translation: 'Beurteilung / Leistungsbeurteilung', example: 'Annual appraisals are held every December.', category: 'personnel', difficulty: 3 },
  { id: 'p04', word: 'resignation', translation: 'Kündigung / Rücktritt', example: 'He submitted his resignation last Friday.', category: 'personnel', difficulty: 2 },
  { id: 'p05', word: 'eligible', translation: 'berechtigt / qualifiziert', example: 'You are eligible for the bonus after one year.', category: 'personnel', difficulty: 2 },
  { id: 'p06', word: 'compensation', translation: 'Vergütung / Entschädigung', example: 'Total compensation includes salary and benefits.', category: 'personnel', difficulty: 2 },
  { id: 'p07', word: 'credentials', translation: 'Qualifikationen / Referenzen', example: 'Please provide your credentials for verification.', category: 'personnel', difficulty: 3 },
  { id: 'p08', word: 'incentive', translation: 'Anreiz / Ansporn', example: 'The bonus is an incentive for high performers.', category: 'personnel', difficulty: 2 },

  // ── Legal & Contracts ─────────────────────────────────────────────────────
  { id: 'l01', word: 'comply', translation: 'einhalten / befolgen', example: 'All employees must comply with the regulations.', category: 'legal', difficulty: 2 },
  { id: 'l02', word: 'clause', translation: 'Klausel', example: 'Read the termination clause carefully.', category: 'legal', difficulty: 2 },
  { id: 'l03', word: 'enforceable', translation: 'durchsetzbar / einklagbar', example: 'The agreement must be legally enforceable.', category: 'legal', difficulty: 3 },
  { id: 'l04', word: 'negotiate', translation: 'verhandeln', example: 'We need to negotiate the contract terms.', category: 'legal', difficulty: 1 },
  { id: 'l05', word: 'confidential', translation: 'vertraulich', example: 'This information is strictly confidential.', category: 'legal', difficulty: 1 },
  { id: 'l06', word: 'patent', translation: 'Patent', example: 'The invention is protected by a patent.', category: 'legal', difficulty: 2 },
  { id: 'l07', word: 'arbitration', translation: 'Schiedsverfahren', example: 'Disputes will be resolved through arbitration.', category: 'legal', difficulty: 3 },

  // ── Marketing & Sales ─────────────────────────────────────────────────────
  { id: 'm01', word: 'campaign', translation: 'Kampagne', example: 'The ad campaign launches next week.', category: 'marketing', difficulty: 1 },
  { id: 'm02', word: 'demographic', translation: 'Zielgruppe / demografisch', example: 'This product targets the 25–40 demographic.', category: 'marketing', difficulty: 2 },
  { id: 'm03', word: 'endorse', translation: 'befürworten / empfehlen', example: 'A celebrity endorsed the new product.', category: 'marketing', difficulty: 2 },
  { id: 'm04', word: 'prospective', translation: 'potenziell / zukünftig', example: 'We met with several prospective clients.', category: 'marketing', difficulty: 3 },
  { id: 'm05', word: 'quota', translation: 'Quote / Kontingent', example: 'The sales team exceeded its monthly quota.', category: 'marketing', difficulty: 2 },
  { id: 'm06', word: 'promotion', translation: 'Sonderangebot / Beförderung', example: 'Buy two and get a free promotion item.', category: 'marketing', difficulty: 1 },
  { id: 'm07', word: 'testimonial', translation: 'Erfahrungsbericht / Empfehlung', example: 'Customer testimonials build brand trust.', category: 'marketing', difficulty: 2 },
  { id: 'm08', word: 'saturate', translation: 'sättigen / überschwemmen', example: 'The market is already saturated with similar products.', category: 'marketing', difficulty: 3 },
]

export const CATEGORY_META: Record<VocabWord['category'], { label: string; color: string; icon: string }> = {
  business:  { label: 'Business',    color: '#22d3ee', icon: '💼' },
  office:    { label: 'Büro',        color: '#4ade80', icon: '🏢' },
  finance:   { label: 'Finanzen',    color: '#fbbf24', icon: '💰' },
  travel:    { label: 'Reise',       color: '#fb923c', icon: '✈️' },
  personnel: { label: 'Personal',   color: '#f472b6', icon: '👥' },
  legal:     { label: 'Recht',       color: '#a78bfa', icon: '⚖️' },
  marketing: { label: 'Marketing',  color: '#34d399', icon: '📣' },
}
