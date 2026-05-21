import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('Seeding extra questions...')

  // ── READING: Part 5 – 40 additional grammar questions ──────────────────────
  const part5Extra = [
    // Verb tense
    { id: 'p5-tense-e1', content: { question: 'By the time the manager arrived, the team ___ the project proposal.' }, options: ['completes','completing','had completed','will complete'], answer: 'C', explanation: '"By the time" with past tense requires past perfect (had + past participle).', tags: ['tense','past-perfect'] },
    { id: 'p5-tense-e2', content: { question: 'The new branch office ___ for three months when it received its first major contract.' }, options: ['had been operating','has operated','was operate','operated'], answer: 'A', explanation: 'Past perfect continuous shows an action ongoing before another past event.', tags: ['tense','past-perfect-continuous'] },
    { id: 'p5-tense-e3', content: { question: 'The annual report ___ by the board of directors next Tuesday.' }, options: ['is reviewed','will be reviewed','had reviewed','reviews'], answer: 'B', explanation: '"Next Tuesday" signals future tense; passive voice needed because the subject receives the action.', tags: ['tense','passive','future'] },
    { id: 'p5-tense-e4', content: { question: 'Sales figures for this quarter ___ last year\'s record by 15 percent.' }, options: ['exceed','exceeds','exceeded','exceeding'], answer: 'C', explanation: '"For this quarter" refers to completed results; simple past is appropriate.', tags: ['tense','simple-past'] },
    { id: 'p5-tense-e5', content: { question: 'The facility has ___ closed since the renovation began two weeks ago.' }, options: ['been','be','being','to be'], answer: 'A', explanation: '"Has been closed" = present perfect passive, showing a state that started in the past and continues.', tags: ['tense','present-perfect'] },

    // Word form
    { id: 'p5-wf-e1', content: { question: 'The company is seeking ___ candidates for the marketing director position.' }, options: ['qualify','qualified','qualification','qualifying'], answer: 'B', explanation: '"Qualified" (adjective) modifies "candidates." Word form questions often appear before nouns.', tags: ['word-form','adjective'] },
    { id: 'p5-wf-e2', content: { question: 'The ___ of the new software update was delayed due to compatibility issues.' }, options: ['install','installing','installation','installed'], answer: 'C', explanation: '"Installation" (noun) follows the article "The" and serves as the subject.', tags: ['word-form','noun'] },
    { id: 'p5-wf-e3', content: { question: 'Employees are encouraged to ___ any concerns directly to the HR department.' }, options: ['address','addressed','addressing','addressable'], answer: 'A', explanation: '"To address" — infinitive form follows "encouraged to."', tags: ['word-form','verb','infinitive'] },
    { id: 'p5-wf-e4', content: { question: 'The report was written ___ to ensure all facts were accurately presented.' }, options: ['care','careful','carefully','carefulness'], answer: 'C', explanation: '"Carefully" (adverb) modifies the verb "written."', tags: ['word-form','adverb'] },
    { id: 'p5-wf-e5', content: { question: 'The CEO expressed her ___ for the team\'s outstanding performance.' }, options: ['appreciate','appreciating','appreciation','appreciative'], answer: 'C', explanation: '"Appreciation" (noun) is the object of "expressed."', tags: ['word-form','noun'] },
    { id: 'p5-wf-e6', content: { question: 'The budget committee made a ___ decision to postpone the expansion project.' }, options: ['unanimous','unanimously','unanimity','unanimousness'], answer: 'A', explanation: '"Unanimous" (adjective) modifies "decision."', tags: ['word-form','adjective'] },
    { id: 'p5-wf-e7', content: { question: 'The new policy will ___ all employees to submit expense reports online.' }, options: ['require','requirement','requiring','required'], answer: 'A', explanation: '"Will require" — modal + base form. The subject is "policy" and the verb is transitive.', tags: ['word-form','verb','modal'] },
    { id: 'p5-wf-e8', content: { question: 'The merger was ___ approved by the shareholders at the annual meeting.' }, options: ['formal','formality','formally','formalize'], answer: 'C', explanation: '"Formally" (adverb) modifies the past participle "approved."', tags: ['word-form','adverb'] },

    // Prepositions
    { id: 'p5-prep-e1', content: { question: 'The assistant is responsible ___ scheduling all board meetings.' }, options: ['of','for','to','with'], answer: 'B', explanation: '"Responsible for" is a fixed collocation in business English.', tags: ['preposition','collocation'] },
    { id: 'p5-prep-e2', content: { question: 'The contract is valid ___ a period of two years from the signing date.' }, options: ['during','within','for','since'], answer: 'C', explanation: '"Valid for" indicates a duration. "For + period of time" is the standard construction.', tags: ['preposition','duration'] },
    { id: 'p5-prep-e3', content: { question: 'The company operates ___ accordance with international safety standards.' }, options: ['by','to','in','on'], answer: 'C', explanation: '"In accordance with" is a fixed phrase meaning "following" or "as required by."', tags: ['preposition','fixed-phrase'] },
    { id: 'p5-prep-e4', content: { question: 'Applications submitted ___ the deadline will not be considered.' }, options: ['after','within','before','beyond'], answer: 'A', explanation: '"Submitted after the deadline" — applications received too late. Context: "will not be considered."', tags: ['preposition','time'] },
    { id: 'p5-prep-e5', content: { question: 'Please be aware ___ the changes to the office parking policy.' }, options: ['about','of','to','with'], answer: 'B', explanation: '"Aware of" is a fixed adjective + preposition collocation.', tags: ['preposition','collocation','aware'] },
    { id: 'p5-prep-e6', content: { question: 'The project was completed ___ schedule, two days ahead of the deadline.' }, options: ['on','before','under','ahead'], answer: 'A', explanation: '"On schedule" means exactly as planned; "two days ahead" clarifies the timing.', tags: ['preposition','time','idiom'] },

    // Connectors / conjunctions
    { id: 'p5-conj-e1', content: { question: '___ the weather was unfavorable, the outdoor event proceeded as planned.' }, options: ['Although','Because','So','Unless'], answer: 'A', explanation: '"Although" introduces a contrast clause. Despite bad weather, the event continued.', tags: ['conjunction','contrast','although'] },
    { id: 'p5-conj-e2', content: { question: 'The shipment will be delayed ___ the supplier resolves the inventory issue.' }, options: ['after','when','until','whereas'], answer: 'C', explanation: '"Until" shows the delay continues up to the point when the issue is resolved.', tags: ['conjunction','time','until'] },
    { id: 'p5-conj-e3', content: { question: 'The store will remain open on weekends ___ customer demand is high during that period.' }, options: ['however','because','unless','despite'], answer: 'B', explanation: '"Because" gives the reason — high demand justifies weekend hours.', tags: ['conjunction','reason'] },
    { id: 'p5-conj-e4', content: { question: 'The training session is mandatory ___ all new employees attend it within their first month.' }, options: ['so','however','yet','and'], answer: 'A', explanation: '"So" here functions as "so that," expressing purpose or consequence.', tags: ['conjunction','result'] },
    { id: 'p5-conj-e5', content: { question: '___ Mr. Kim managed the finance department, profits increased significantly.' }, options: ['While','Unless','Despite','Until'], answer: 'A', explanation: '"While" introduces a time clause showing simultaneous events.', tags: ['conjunction','time','while'] },

    // Pronouns / relative clauses
    { id: 'p5-pron-e1', content: { question: 'Employees ___ work more than 40 hours per week are eligible for overtime pay.' }, options: ['whom','which','who','whose'], answer: 'C', explanation: '"Who" is used for people as subject of the relative clause "work more than 40 hours."', tags: ['pronoun','relative-clause','who'] },
    { id: 'p5-pron-e2', content: { question: 'The consultant ___ advice the board sought has extensive experience in restructuring.' }, options: ['who','whom','whose','which'], answer: 'C', explanation: '"Whose" shows possession — the board sought the consultant\'s advice.', tags: ['pronoun','relative-clause','whose'] },
    { id: 'p5-pron-e3', content: { question: 'The conference center, ___ is located downtown, can accommodate 500 guests.' }, options: ['who','that','which','where'], answer: 'C', explanation: '"Which" introduces a non-restrictive relative clause for places/things. Comma signals non-restrictive.', tags: ['pronoun','relative-clause','which'] },

    // Passive voice
    { id: 'p5-pass-e1', content: { question: 'All new employees ___ to complete safety training before beginning work.' }, options: ['require','requires','are required','requiring'], answer: 'C', explanation: '"Are required to" — passive construction. The employees receive the requirement.', tags: ['passive','modal'] },
    { id: 'p5-pass-e2', content: { question: 'The product recall notice ___ to all registered customers last Friday.' }, options: ['sent','sends','was sent','has send'], answer: 'C', explanation: '"Was sent" — simple past passive. The notice was the recipient of the sending action.', tags: ['passive','simple-past'] },
    { id: 'p5-pass-e3', content: { question: 'The quarterly financial statements have ___ reviewed by the audit committee.' }, options: ['be','being','been','to be'], answer: 'C', explanation: '"Have been reviewed" — present perfect passive showing completed review.', tags: ['passive','present-perfect'] },

    // Comparatives
    { id: 'p5-comp-e1', content: { question: 'The new production facility is ___ efficient than the previous one.' }, options: ['much more','more most','most','very more'], answer: 'A', explanation: '"Much more efficient" — "much" intensifies a comparative adjective. "Very" does not modify comparatives.', tags: ['comparative','adjective'] },
    { id: 'p5-comp-e2', content: { question: 'Of all the candidates, Ms. Park was ___ qualified for the position.' }, options: ['more','most','the most','the more'], answer: 'C', explanation: '"The most" — superlative form when comparing more than two items.', tags: ['superlative'] },

    // Articles
    { id: 'p5-art-e1', content: { question: '___ information provided in the manual is subject to change without notice.' }, options: ['A','An','The','Some'], answer: 'C', explanation: '"The information" — specific information already identified (in the manual). Definite article required.', tags: ['article','definite'] },
    { id: 'p5-art-e2', content: { question: 'We need to hire ___ experienced project manager to oversee the expansion.' }, options: ['the','a','an','—'], answer: 'C', explanation: '"An experienced" — indefinite article before vowel sound. Not a specific person yet.', tags: ['article','indefinite'] },

    // Parallel structure
    { id: 'p5-par-e1', content: { question: 'The new manager is known for being organized, dedicated, and ___.' }, options: ['efficiency','efficiently','to be efficient','efficient'], answer: 'D', explanation: 'Parallel structure: "organized, dedicated, and efficient" — all adjectives.', tags: ['parallel-structure'] },
    { id: 'p5-par-e2', content: { question: 'The training program helps employees identify problems, develop solutions, and ___ results.' }, options: ['measuring','to measure','measure','measurement'], answer: 'C', explanation: 'Parallel structure: "identify, develop, and measure" — all base verb forms.', tags: ['parallel-structure','verb'] },

    // Conditionals
    { id: 'p5-cond-e1', content: { question: '___ the deadline is extended, the team will be able to submit a complete report.' }, options: ['Unless','If','Although','Despite'], answer: 'B', explanation: '"If + present → will" is the standard first conditional structure.', tags: ['conditional'] },
    { id: 'p5-cond-e2', content: { question: 'Customers would receive a full refund ___ they notify us within 30 days of purchase.' }, options: ['as long as','despite','however','without'], answer: 'A', explanation: '"As long as" means "provided that" — sets the condition for the refund.', tags: ['conditional','as-long-as'] },

    // Quantifiers
    { id: 'p5-quant-e1', content: { question: '___ the feedback we received was positive, which exceeded our expectations.' }, options: ['Most of','The most','Almost','Many'], answer: 'A', explanation: '"Most of the feedback" — most of + definite article + noun. "Almost" modifies adjectives/adverbs, not nouns directly.', tags: ['quantifier','most-of'] },
    { id: 'p5-quant-e2', content: { question: 'There is ___ information available about the new regulations at this time.' }, options: ['few','little','a few','many'], answer: 'B', explanation: '"Little" modifies uncountable nouns like "information." "Few" is for countable nouns.', tags: ['quantifier','countable-uncountable'] },
  ]

  for (const q of part5Extra) {
    await prisma.question.upsert({
      where: { id: q.id },
      update: {},
      create: { ...q, section: 'READING', part: 5, type: 'INCOMPLETE_SENTENCE', difficulty: 3, isDiagnostic: false },
    })
  }
  console.log(`✅ Part 5 extra: ${part5Extra.length} questions`)

  // ── READING: Part 6 – additional text completion questions ───────────────
  const memoText = 'MEMORANDUM\nTo: All Staff\nFrom: Human Resources\nRe: Updated Leave Policy\n\nEffective January 1, all employees must submit leave requests at least two weeks [141]. This change has been [142] to ensure adequate staffing during peak periods. Requests submitted without sufficient notice may be [143] at the discretion of your department manager. We appreciate your [144] in helping us maintain smooth operations throughout the year.'

  const cateringText = 'Dear Ms. Thornton,\n\nThank you for your inquiry about our corporate catering services. We are pleased to [145] that we offer full-service catering for events of all sizes. Our team will work closely with you to create a menu that [146] your guests\' dietary needs and preferences.\n\nFor events of 50 or more people, we require a deposit of 30 percent of the total cost at the time of booking. [147]. The remaining balance is due one week before the event date.\n\nPlease do not hesitate to contact us if you have any questions. We look forward to [148] your upcoming event a memorable one.'

  const part6Extra = [
    // Memo passage
    { id: 'p6-memo-141', content: { passage: memoText, question: 'Choose the best word for blank [141]: "...at least two weeks [141]."' }, options: ['in advance', 'on advance', 'in advanced', 'with advance'], answer: 'A', explanation: '"In advance" is the correct preposition phrase meaning "ahead of time." The other forms are incorrect.', tags: ['preposition', 'fixed-phrase'], isDiagnostic: false },
    { id: 'p6-memo-142', content: { passage: memoText, question: 'Choose the best word for blank [142]: "This change has been [142] to ensure..."' }, options: ['implementing', 'implementation', 'implemented', 'implement'], answer: 'C', explanation: '"Has been implemented" — present perfect passive. The policy received the action of implementation.', tags: ['passive', 'present-perfect'], isDiagnostic: false },
    { id: 'p6-memo-143', content: { passage: memoText, question: 'Choose the best word for blank [143]: "...requests...may be [143] at the discretion..."' }, options: ['denied', 'denying', 'denial', 'denies'], answer: 'A', explanation: '"May be denied" — passive modal. The subject (requests) receives the action of denial.', tags: ['passive', 'modal'], isDiagnostic: false },
    { id: 'p6-memo-144', content: { passage: memoText, question: 'Choose the best word for blank [144]: "We appreciate your [144]..."' }, options: ['understand', 'understanding', 'understood', 'understandable'], answer: 'B', explanation: '"Your understanding" — gerund/noun following the possessive "your." This is a fixed polite expression.', tags: ['word-form', 'noun'], isDiagnostic: false },
    // Catering email passage
    { id: 'p6-catering-145', content: { passage: cateringText, question: 'Choose the best word for blank [145]: "We are pleased to [145] that..."' }, options: ['inform', 'advise', 'say', 'tell'], answer: 'B', explanation: '"Pleased to advise" is formal business English. "Tell" needs an indirect object; "say" and "inform" fit less naturally in this phrase.', tags: ['vocabulary', 'business-english'], isDiagnostic: false },
    { id: 'p6-catering-146', content: { passage: cateringText, question: 'Choose the best word for blank [146]: "...a menu that [146] your guests\' dietary needs..."' }, options: ['accommodate', 'accommodates', 'accommodating', 'accommodated'], answer: 'B', explanation: '"A menu that accommodates" — the relative clause verb must agree with "menu" (singular, third person).', tags: ['subject-verb-agreement', 'relative-clause'], isDiagnostic: false },
    { id: 'p6-catering-147', content: { passage: cateringText, question: 'Choose the best sentence for blank [147] (after the deposit mention).' }, options: ['This amount is non-refundable in case of cancellation.', 'We do not accept credit card payments.', 'The deposit ensures priority booking for your date.', 'A deposit is sometimes required for small events.'], answer: 'A', explanation: 'A sentence about the deposit being non-refundable on cancellation logically follows the deposit requirement and gives important policy information.', tags: ['sentence-insertion', 'coherence'], isDiagnostic: false },
    { id: 'p6-catering-148', content: { passage: cateringText, question: 'Choose the best word for blank [148]: "We look forward to [148] your upcoming event a memorable one."' }, options: ['make', 'making', 'made', 'makes'], answer: 'B', explanation: '"Look forward to making" — "to" here is a preposition (not part of the infinitive), so the gerund (-ing) is required.', tags: ['gerund', 'preposition'], isDiagnostic: false },
  ]

  for (const q of part6Extra) {
    await prisma.question.upsert({
      where: { id: q.id },
      update: {},
      create: { ...q, section: 'READING', part: 6, type: 'TEXT_COMPLETION', difficulty: 3, isDiagnostic: false },
    })
  }
  console.log(`✅ Part 6 extra: ${part6Extra.length} questions (2 passages)`)

  // ── READING: Part 7 – Additional single passages ──────────────────────────
  const part7ExtraSingle = [
    {
      id: 'p7-notice-e1',
      content: {
        passage: `BUILDING NOTICE

Attention: All tenants of Meridian Office Tower

Scheduled Maintenance: Elevator Modernization Project

The building management at Meridian Office Tower wishes to inform all tenants that the elevator modernization project will begin on Monday, March 6, and is expected to be completed by Friday, March 17.

During this period, elevators A and B (main lobby elevators) will be out of service. Elevator C (service elevator, east wing) will remain operational for all tenants. Stairwells on all floors will also remain accessible.

Tenants requiring assistance with heavy deliveries or equipment should contact building management at ext. 305 to schedule use of the service elevator during off-peak hours (before 9:00 A.M. or after 5:00 P.M.).

We apologize for any inconvenience this may cause and appreciate your patience and cooperation during this improvement project.

Building Management
Meridian Office Tower`,
        questions: [
          { stem: 'What is the purpose of this notice?', options: ['To announce new building management', 'To inform tenants of upcoming elevator work', 'To introduce a new service elevator policy', 'To remind tenants about stairwell regulations'], answer: 'B', explanation: 'The notice explicitly states it is informing tenants about the "elevator modernization project."' },
          { stem: 'How long will the project last?', options: ['One week', 'Ten business days', 'About two weeks', 'One month'], answer: 'C', explanation: 'March 6 to March 17 is approximately two weeks (12 days including weekends).' },
          { stem: 'What should tenants do if they need to move heavy equipment?', options: ['Use stairwells during business hours', 'Contact building management in advance', 'Wait until the project is completed', 'Use elevators A or B after hours'], answer: 'B', explanation: 'Tenants should "contact building management at ext. 305 to schedule use of the service elevator."' },
        ],
      },
      options: null,
      answer: 'BCB',
      explanation: 'Building notice about elevator maintenance at Meridian Office Tower.',
      tags: ['notice', 'maintenance', 'building'],
      isDiagnostic: false,
    },
    {
      id: 'p7-ad-e1',
      content: {
        passage: `STELLENANZEIGE

POSITION: Senior Marketing Analyst
COMPANY: Hartfield Consumer Goods
LOCATION: Chicago, IL (Hybrid — 3 days in office, 2 days remote)
SALARY: $72,000–$88,000 depending on experience

About Hartfield Consumer Goods:
Hartfield is a leading manufacturer of household and personal care products distributed across North America. With over 60 years in the industry, we pride ourselves on innovation, quality, and a people-first culture.

Responsibilities:
• Analyze market trends and consumer behavior data
• Develop and present quarterly performance reports to senior leadership
• Collaborate with the product development team on new launches
• Manage agency relationships and oversee campaign execution

Qualifications:
• Bachelor's degree in Marketing, Business, or a related field
• Minimum 4 years of experience in a marketing or analytics role
• Proficiency in data visualization tools (Tableau, Power BI preferred)
• Excellent written and verbal communication skills

How to Apply:
Send your résumé and a cover letter to careers@hartfield.com by April 15. Only candidates selected for interviews will be contacted.`,
        questions: [
          { stem: 'What type of company is Hartfield Consumer Goods?', options: ['A marketing agency', 'A technology firm', 'A household products manufacturer', 'A retail chain'], answer: 'C', explanation: 'The ad states Hartfield is "a leading manufacturer of household and personal care products."' },
          { stem: 'What is NOT listed as a required qualification?', options: ['A relevant degree', 'At least four years of experience', 'Fluency in a second language', 'Strong communication skills'], answer: 'C', explanation: 'Second language fluency is not mentioned. The other three are explicitly listed under Qualifications.' },
          { stem: 'What should interested applicants include with their application?', options: ['A portfolio of past campaigns', 'A résumé and cover letter', 'Three professional references', 'A data visualization sample'], answer: 'B', explanation: 'The ad states: "Send your résumé and a cover letter to careers@hartfield.com."' },
        ],
      },
      options: null,
      answer: 'CCB',
      explanation: 'Job advertisement for Senior Marketing Analyst position at Hartfield Consumer Goods.',
      tags: ['job-ad', 'marketing', 'HR'],
      isDiagnostic: false,
    },
  ]

  for (const q of part7ExtraSingle) {
    await prisma.question.upsert({
      where: { id: q.id },
      update: {},
      create: { ...q, section: 'READING', part: 7, type: 'SINGLE_PASSAGE', difficulty: 3, isDiagnostic: false },
    })
  }
  console.log(`✅ Part 7 extra single passages: ${part7ExtraSingle.length}`)

  // ── LISTENING: Part 2 – 10 additional Q&A pairs ───────────────────────────
  const part2Extra2 = [
    {
      id: 'p2-extra-e1',
      content: { question: 'Have you spoken with the new marketing director yet?', responses: ['No, I haven\'t had the chance.', 'She\'s been working here for five years.', 'Yes, the marketing budget was approved.'] },
      options: ['A', 'B', 'C'], answer: 'A',
      explanation: 'A direct response to a yes/no question. B and C are tangentially related but don\'t answer whether the speaker has spoken with the director.',
      tags: ['yes-no', 'introductions'], isDiagnostic: false,
    },
    {
      id: 'p2-extra-e2',
      content: { question: 'When does the conference registration close?', responses: ['In the main conference hall.', 'At midnight on Friday.', 'About two hundred attendees.'] },
      options: ['A', 'B', 'C'], answer: 'B',
      explanation: '"When" questions require a time answer. B gives a specific deadline. A answers "where" and C answers "how many."',
      tags: ['when-question', 'conference'], isDiagnostic: false,
    },
    {
      id: 'p2-extra-e3',
      content: { question: 'Shouldn\'t we inform the client about the delivery delay?', responses: ['I\'ve already sent them an email.', 'The client meeting went well.', 'Delivery takes three business days.'] },
      options: ['A', 'B', 'C'], answer: 'A',
      explanation: 'A directly addresses the suggestion by confirming the action was already taken. B and C don\'t address whether the client was informed.',
      tags: ['negative-question', 'client-communication'], isDiagnostic: false,
    },
    {
      id: 'p2-extra-e4',
      content: { question: 'Who is handling the financial audit this year?', responses: ['It\'s scheduled for next month.', 'The external accounting firm we hired.', 'I audited the files this morning.'] },
      options: ['A', 'B', 'C'], answer: 'B',
      explanation: '"Who" requires a person/group as answer. B identifies the external firm. A answers "when" and C provides an unrelated action.',
      tags: ['who-question', 'finance'], isDiagnostic: false,
    },
    {
      id: 'p2-extra-e5',
      content: { question: 'Could you proofread the proposal before I send it?', responses: ['Sure, email it to me now.', 'Yes, the proposal was accepted.', 'I sent the email yesterday.'] },
      options: ['A', 'B', 'C'], answer: 'A',
      explanation: 'A agrees to the request and gives a practical next step. B confuses "proposal accepted" with proofreading. C is irrelevant.',
      tags: ['request', 'proofreading'], isDiagnostic: false,
    },
    {
      id: 'p2-extra-e6',
      content: { question: 'Where should I park during the renovation?', responses: ['On the third floor of the parking garage.', 'The renovation starts next Monday.', 'You should park your car carefully.'] },
      options: ['A', 'B', 'C'], answer: 'A',
      explanation: '"Where" asks for a location. A provides a specific location. B answers "when" and C gives unhelpful general advice.',
      tags: ['where-question', 'parking'], isDiagnostic: false,
    },
    {
      id: 'p2-extra-e7',
      content: { question: 'Why was the product launch postponed?', responses: ['It\'ll be launched in the spring.', 'Due to supply chain issues.', 'The product launch was very successful.'], },
      options: ['A', 'B', 'C'], answer: 'B',
      explanation: '"Why" asks for a reason. B gives a cause (supply chain issues). A answers "when" and C describes an outcome inconsistent with postponement.',
      tags: ['why-question', 'product-launch'], isDiagnostic: false,
    },
    {
      id: 'p2-extra-e8',
      content: { question: 'How many people attended the workshop?', responses: ['It was held in the conference room.', 'Around thirty employees.', 'The workshop was very informative.'] },
      options: ['A', 'B', 'C'], answer: 'B',
      explanation: '"How many" asks for a quantity. B gives a number. A answers "where" and C provides a quality evaluation.',
      tags: ['how-many-question', 'workshop'], isDiagnostic: false,
    },
    {
      id: 'p2-extra-e9',
      content: { question: 'Is the printer on the second floor working?', responses: ['No, it\'s been out of order since Monday.', 'The second floor has a new layout.', 'I printed twenty copies this morning.'] },
      options: ['A', 'B', 'C'], answer: 'A',
      explanation: 'A directly answers the yes/no question and adds useful information (out of order since Monday). B and C are tangentially related.',
      tags: ['yes-no', 'office-equipment'], isDiagnostic: false,
    },
    {
      id: 'p2-extra-e10',
      content: { question: 'Which report should I submit first — the monthly summary or the budget forecast?', responses: ['Submit the budget forecast — it\'s due today.', 'I submitted my report last week.', 'Monthly reports are very important.'] },
      options: ['A', 'B', 'C'], answer: 'A',
      explanation: 'An alternative question offers a choice between two options. A answers by choosing one and giving a reason. B and C don\'t address the choice.',
      tags: ['alternative-question', 'reports'], isDiagnostic: false,
    },
  ]

  for (const q of part2Extra2) {
    await prisma.question.upsert({
      where: { id: q.id },
      update: {},
      create: { ...q, section: 'LISTENING', part: 2, type: 'QUESTION_RESPONSE', difficulty: 2, isDiagnostic: false },
    })
  }
  console.log(`✅ Part 2 extra: ${part2Extra2.length} questions`)

  // ── LISTENING: Part 3 – 2 additional conversations ───────────────────────
  const part3Extra2 = [
    {
      id: 'p3-extra-e1',
      content: {
        dialogue: [
          { speaker: 'Woman', line: 'I heard the software update is being rolled out to all departments this week.' },
          { speaker: 'Man', line: 'Actually, IT pushed it back to next Monday. They found a compatibility issue with our accounting software.' },
          { speaker: 'Woman', line: 'Oh, that\'s frustrating. Does that mean our team still can\'t access the new reporting features?' },
          { speaker: 'Man', line: 'That\'s right. But once the issue is resolved, the IT team will send out step-by-step instructions for the update.' },
        ],
        questions: [
          { stem: 'What are the speakers mainly discussing?', options: ['A new accounting policy', 'A delay in a software update', 'The IT department\'s schedule', 'A compatibility test result'], answer: 'B', explanation: 'The conversation centers on the delayed software update and its cause.' },
          { stem: 'Why was the update postponed?', options: ['The software was too expensive.', 'There was a compatibility problem.', 'Not enough staff were trained.', 'The vendor requested more time.'], answer: 'B', explanation: 'The man says "They found a compatibility issue with our accounting software."' },
          { stem: 'What will IT do after fixing the issue?', options: ['Schedule a training session', 'Send update instructions to staff', 'Replace the accounting software', 'Test the system for one week'], answer: 'B', explanation: '"The IT team will send out step-by-step instructions for the update."' },
        ],
      },
      options: null, answer: 'BBB',
      explanation: 'Office conversation about a delayed IT software update.',
      tags: ['conversation', 'IT', 'software'], isDiagnostic: false,
    },
    {
      id: 'p3-extra-e2',
      content: {
        dialogue: [
          { speaker: 'Man', line: 'Excuse me, I\'m looking for the registration desk for the Greenfield Business Conference.' },
          { speaker: 'Woman', line: 'It\'s on the second floor — just take the escalator near the main entrance. But registration closes in about fifteen minutes.' },
          { speaker: 'Man', line: 'Oh no, I got caught in traffic. Is there any way to check in late?' },
          { speaker: 'Woman', line: 'You can speak with the conference coordinator, Ms. Park. She\'s usually very flexible about late arrivals.' },
        ],
        questions: [
          { stem: 'Where is this conversation most likely taking place?', options: ['At a hotel lobby', 'In an office building', 'At a conference venue', 'At a transportation center'], answer: 'C', explanation: 'The mention of a business conference and registration desk suggests a conference venue.' },
          { stem: 'What problem does the man mention?', options: ['He cannot find his badge.', 'He arrived late due to traffic.', 'He forgot his registration form.', 'The conference is already full.'], answer: 'B', explanation: '"I got caught in traffic" explains why he is nearly late for registration.' },
          { stem: 'What does the woman suggest the man do?', options: ['Register online immediately', 'Take the next available session', 'Talk to the conference coordinator', 'Come back tomorrow morning'], answer: 'C', explanation: '"You can speak with the conference coordinator, Ms. Park."' },
        ],
      },
      options: null, answer: 'CBC',
      explanation: 'Conversation at a conference venue between an attendee and a staff member.',
      tags: ['conversation', 'conference', 'travel'], isDiagnostic: false,
    },
  ]

  for (const q of part3Extra2) {
    await prisma.question.upsert({
      where: { id: q.id },
      update: {},
      create: { ...q, section: 'LISTENING', part: 3, type: 'CONVERSATION', difficulty: 3, isDiagnostic: false },
    })
  }
  console.log(`✅ Part 3 extra: ${part3Extra2.length} conversations`)

  // ── LISTENING: Part 4 – 2 additional talks ───────────────────────────────
  const part4Extra2 = [
    {
      id: 'p4-extra-e1',
      content: {
        transcript: `Good afternoon and welcome to Westbrook Shopping Center. We have a few announcements for our shoppers today. First, our parking validation service has moved to Level B2. Shoppers spending over fifty dollars receive two hours of complimentary parking. Please bring your receipt to the customer service desk on the ground floor. Second, our food court on Level 3 will close at eight o'clock this evening for a private event, one hour earlier than usual. All other stores will maintain their regular hours. We appreciate your understanding and hope you enjoy your visit to Westbrook Shopping Center.`,
        questions: [
          { stem: 'Where is this announcement being made?', options: ['At an airport', 'In a shopping mall', 'At a hotel', 'In an office building'], answer: 'B', explanation: 'The announcement mentions shopping, parking validation, a food court, and stores — characteristic of a shopping mall.' },
          { stem: 'How can shoppers get complimentary parking?', options: ['By spending over fifty dollars', 'By showing a membership card', 'By arriving before noon', 'By visiting three or more stores'], answer: 'A', explanation: '"Shoppers spending over fifty dollars receive two hours of complimentary parking."' },
          { stem: 'What change is mentioned about the food court?', options: ['It will be closed all day.', 'It is moving to a new floor.', 'It will close earlier than usual tonight.', 'It is open for a special sale today.'], answer: 'C', explanation: '"The food court will close at eight o\'clock... one hour earlier than usual."' },
        ],
      },
      options: null, answer: 'BAC',
      explanation: 'Shopping center PA announcement about parking and food court hours.',
      tags: ['talk', 'announcement', 'shopping'], isDiagnostic: false,
    },
    {
      id: 'p4-extra-e2',
      content: {
        transcript: `Thank you for calling Pinnacle Financial Services. My name is David, and I'm calling to inform you about an important update to your account. Starting next month, Pinnacle Financial will be upgrading all client accounts to our new online banking platform, Pinnacle Connect. You will receive a welcome email with instructions on how to complete the transition. Your existing login credentials will remain the same, but you will be prompted to set up two-factor authentication for additional security. If you have any questions, please call our support line at 1-800-555-0174, available Monday through Friday from eight A.M. to six P.M. eastern time. We appreciate your continued trust in Pinnacle Financial Services.`,
        questions: [
          { stem: 'What is the purpose of this message?', options: ['To report a security breach', 'To notify a client of a system upgrade', 'To confirm a recent transaction', 'To introduce a new financial product'], answer: 'B', explanation: 'The caller explains that Pinnacle is upgrading all client accounts to a new platform, Pinnacle Connect.' },
          { stem: 'What will account holders need to set up on the new platform?', options: ['A new username and password', 'Two-factor authentication', 'A digital signature', 'A new savings account'], answer: 'B', explanation: '"You will be prompted to set up two-factor authentication for additional security."' },
          { stem: 'When can customers call for support?', options: ['Seven days a week', 'Weekdays only', 'Weekends only', 'Only by email'], answer: 'B', explanation: '"Available Monday through Friday" — weekdays only, from 8 A.M. to 6 P.M.', },
        ],
      },
      options: null, answer: 'BBB',
      explanation: 'Phone message from a financial services company about a system upgrade.',
      tags: ['talk', 'phone-message', 'banking'], isDiagnostic: false,
    },
  ]

  for (const q of part4Extra2) {
    await prisma.question.upsert({
      where: { id: q.id },
      update: {},
      create: { ...q, section: 'LISTENING', part: 4, type: 'TALK', difficulty: 3, isDiagnostic: false },
    })
  }
  console.log(`✅ Part 4 extra: ${part4Extra2.length} talks`)

  // ── LISTENING: Part 3 – Additional conversations (3 more) ────────────────
  const part3Extra3 = [
    {
      id: 'p3-extra-e3',
      content: {
        dialogue: [
          { speaker: 'Woman', line: 'Hi, I\'d like to return this jacket. I bought it last week, but the zipper broke after just one use.' },
          { speaker: 'Man', line: 'I\'m sorry to hear that. Do you have your receipt?' },
          { speaker: 'Woman', line: 'Yes, here it is. Can I exchange it for a different one, or would I get a refund?' },
          { speaker: 'Man', line: 'Both options are available. Since it\'s a product defect, we can also offer you store credit with an extra 10% bonus.' },
        ],
        questions: [
          { stem: 'Why is the woman returning the jacket?', options: ['It was the wrong size.', 'It was too expensive.', 'The zipper broke.', 'She changed her mind.'], answer: 'C', explanation: '"The zipper broke after just one use" — a product defect.' },
          { stem: 'What does the man ask the woman to provide?', options: ['Her credit card', 'Her receipt', 'Her membership ID', 'Her phone number'], answer: 'B', explanation: '"Do you have your receipt?" — the man needs the receipt to process the return.' },
          { stem: 'What additional option does the man offer?', options: ['Free shipping on next order', 'A discount on a similar item', 'Store credit with an extra 10% bonus', 'A free gift with the exchange'], answer: 'C', explanation: '"We can also offer store credit with an extra 10% bonus."' },
        ],
      },
      options: null, answer: 'CBC',
      explanation: 'Customer service conversation about returning a defective jacket.',
      tags: ['conversation', 'retail', 'customer-service'], isDiagnostic: false,
    },
    {
      id: 'p3-extra-e4',
      content: {
        dialogue: [
          { speaker: 'Man', line: 'I just got the results of the customer satisfaction survey. Overall, clients rated our service at 4.2 out of 5.' },
          { speaker: 'Woman', line: 'That\'s pretty good. Were there any specific areas where we scored lower?' },
          { speaker: 'Man', line: 'Yes — response time to client inquiries was the main issue. About 40% of respondents rated it as slow.' },
          { speaker: 'Woman', line: 'We should address that at the next team meeting and come up with an action plan.' },
        ],
        questions: [
          { stem: 'What are the speakers discussing?', options: ['A new client proposal', 'Results of a satisfaction survey', 'A team performance review', 'A marketing campaign'], answer: 'B', explanation: '"I just got the results of the customer satisfaction survey."' },
          { stem: 'What issue did the survey highlight?', options: ['Poor product quality', 'High prices', 'Slow response to inquiries', 'Insufficient staff training'], answer: 'C', explanation: '"Response time to client inquiries was the main issue."' },
          { stem: 'What does the woman suggest?', options: ['Sending a follow-up survey', 'Hiring more customer service agents', 'Discussing the issue at a team meeting', 'Calling each dissatisfied client'], answer: 'C', explanation: '"We should address that at the next team meeting and come up with an action plan."' },
        ],
      },
      options: null, answer: 'BCC',
      explanation: 'Office conversation about customer satisfaction survey results.',
      tags: ['conversation', 'customer-satisfaction', 'data'], isDiagnostic: false,
    },
    {
      id: 'p3-extra-e5',
      content: {
        dialogue: [
          { speaker: 'Woman', line: 'Are you going to the product launch event on Thursday evening?' },
          { speaker: 'Man', line: 'I planned to, but I just found out my flight to Chicago is that same night.' },
          { speaker: 'Woman', line: 'Oh no. Will you be able to watch the live stream instead?' },
          { speaker: 'Man', line: 'Yes, I\'ll catch it online. Could you save me a copy of the product brochure from the event?' },
        ],
        questions: [
          { stem: 'Why can\'t the man attend the event?', options: ['He has a family commitment.', 'He is traveling that night.', 'He is working overtime.', 'He was not invited.'], answer: 'B', explanation: '"My flight to Chicago is that same night" — the man has a travel conflict.' },
          { stem: 'What does the man plan to do instead?', options: ['Attend a different event', 'Watch the live stream online', 'Reschedule his flight', 'Send a representative'], answer: 'B', explanation: '"I\'ll catch it online" — he will watch the product launch via live stream.' },
          { stem: 'What does the man ask the woman to do?', options: ['Email him the event recording', 'Register him for the event', 'Save him a product brochure', 'Share the event schedule'], answer: 'C', explanation: '"Could you save me a copy of the product brochure from the event?"' },
        ],
      },
      options: null, answer: 'BBC',
      explanation: 'Workplace conversation about a product launch event and a scheduling conflict.',
      tags: ['conversation', 'product-launch', 'scheduling'], isDiagnostic: false,
    },
  ]

  for (const q of part3Extra3) {
    await prisma.question.upsert({
      where: { id: q.id },
      update: {},
      create: { ...q, section: 'LISTENING', part: 3, type: 'CONVERSATION', difficulty: 3, isDiagnostic: false },
    })
  }
  console.log(`✅ Part 3 extra 3: ${part3Extra3.length} conversations`)

  // ── LISTENING: Part 4 – Additional talks (2 more) ─────────────────────────
  const part4Extra3 = [
    {
      id: 'p4-extra-e3',
      content: {
        transcript: `Good morning, listeners. Before we get into today's program, I'd like to share some exciting news about our city's new public transit expansion. Starting next month, the Blue Line subway will extend three additional stops, connecting the downtown area to the Northgate district for the first time. Commuters traveling from Northgate to the city center can expect a journey of approximately twenty-two minutes. Monthly passes will be available for the new extension at the same price as existing passes, with no additional fee. City officials have encouraged residents to leave their cars at home and try the new service for free during the first two weeks after the launch. For more information, visit the city transit website or call our hotline.`,
        questions: [
          { stem: 'What is the main topic of this announcement?', options: ['A new highway construction project', 'An extension of the subway system', 'New bus routes for the city', 'Road closure due to repairs'], answer: 'B', explanation: 'The announcement is about the Blue Line subway expanding with three additional stops.' },
          { stem: 'How long will the commute from Northgate to downtown take?', options: ['About 12 minutes', 'About 22 minutes', 'About 30 minutes', 'About 45 minutes'], answer: 'B', explanation: '"A journey of approximately twenty-two minutes."' },
          { stem: 'What incentive is offered during the first two weeks?', options: ['Reduced monthly pass rates', 'Free parking near stations', 'Free rides for all commuters', 'Complimentary transit cards'], answer: 'C', explanation: '"Try the new service for free during the first two weeks after the launch."' },
        ],
      },
      options: null, answer: 'BBC',
      explanation: 'Radio announcement about a new subway extension.',
      tags: ['talk', 'public-transit', 'radio'], isDiagnostic: false,
    },
    {
      id: 'p4-extra-e4',
      content: {
        transcript: `Welcome to the Hartwell Professional Development Series. I'm thrilled to introduce today's speaker, Dr. Maria Sousa, whose research on workplace communication has been published in over thirty peer-reviewed journals. Dr. Sousa earned her doctorate from the University of Amsterdam and has worked as a consultant for Fortune 500 companies across three continents. Today, she'll be speaking about effective strategies for cross-cultural communication in international business settings. After her presentation, there will be a thirty-minute question and answer session, followed by a networking reception in the adjoining room. Refreshments will be served. Please silence your mobile devices and feel free to take notes. Dr. Sousa, the floor is yours.`,
        questions: [
          { stem: 'Who is Dr. Maria Sousa?', options: ['A university president', 'A corporate executive', 'A researcher and consultant', 'A government official'], answer: 'C', explanation: 'She is described as a researcher whose work is published in journals, and a consultant for Fortune 500 companies.' },
          { stem: 'What will Dr. Sousa speak about?', options: ['Financial strategies for global companies', 'Cross-cultural communication in business', 'Leadership development programs', 'Academic publishing techniques'], answer: 'B', explanation: '"Effective strategies for cross-cultural communication in international business settings."' },
          { stem: 'What will happen immediately after the presentation?', options: ['A networking reception', 'A 30-minute Q&A session', 'A panel discussion', 'A break for refreshments'], answer: 'B', explanation: '"After her presentation, there will be a thirty-minute question and answer session."' },
        ],
      },
      options: null, answer: 'CBB',
      explanation: 'Introduction speech at a professional development seminar.',
      tags: ['talk', 'introduction', 'seminar'], isDiagnostic: false,
    },
  ]

  for (const q of part4Extra3) {
    await prisma.question.upsert({
      where: { id: q.id },
      update: {},
      create: { ...q, section: 'LISTENING', part: 4, type: 'TALK', difficulty: 3, isDiagnostic: false },
    })
  }
  console.log(`✅ Part 4 extra 3: ${part4Extra3.length} talks`)

  // ── READING: Part 7 – Additional single passages (3 more) ────────────────
  const part7ExtraSingle2 = [
    {
      id: 'p7-email-e1',
      content: {
        passage: `From: Natalie Obi <n.obi@crystalweb.com>
To: customer.support@techsupply.com
Subject: Order #48291 — Missing Item
Date: May 14

Dear Customer Support Team,

I am writing to report that my recent order (#48291) arrived incomplete. I ordered a set of five wireless keyboard-and-mouse combos for our office, but only four sets were included in the shipment. The delivery was made on May 12.

I would appreciate it if you could either ship the missing unit at your earliest convenience or arrange for a partial refund for the missing item. I have attached a copy of my invoice and a photo of the delivery box as received.

Please let me know how you would like to proceed.

Kind regards,
Natalie Obi
Office Manager, Crystal Web Solutions`,
        question: 'Why is Natalie Obi writing this email?',
      },
      options: ['To request a return for all five items', 'To report a missing item from her order', 'To inquire about a shipping delay', 'To update her delivery address'],
      answer: 'B',
      explanation: 'She explicitly states: "I am writing to report that my recent order arrived incomplete... only four sets were included."',
      tags: ['single-passage', 'email', 'complaint'], isDiagnostic: false,
    },
    {
      id: 'p7-email-e2',
      content: {
        passage: `From: Natalie Obi <n.obi@crystalweb.com>
To: customer.support@techsupply.com
Subject: Order #48291 — Missing Item
Date: May 14

Dear Customer Support Team,

I am writing to report that my recent order (#48291) arrived incomplete. I ordered a set of five wireless keyboard-and-mouse combos for our office, but only four sets were included in the shipment. The delivery was made on May 12.

I would appreciate it if you could either ship the missing unit at your earliest convenience or arrange for a partial refund for the missing item. I have attached a copy of my invoice and a photo of the delivery box as received.

Please let me know how you would like to proceed.

Kind regards,
Natalie Obi
Office Manager, Crystal Web Solutions`,
        question: 'What does Ms. Obi request as a resolution?',
      },
      options: ['A full refund', 'A replacement for all five items', 'The missing unit or a partial refund', 'A discount on her next order'],
      answer: 'C',
      explanation: '"Ship the missing unit at your earliest convenience or arrange for a partial refund for the missing item."',
      tags: ['single-passage', 'email', 'request'], isDiagnostic: false,
    },
    {
      id: 'p7-article-e1',
      content: {
        passage: `PRESS RELEASE

FOR IMMEDIATE RELEASE

Luminos Energy Announces Opening of New Solar Panel Manufacturing Facility

AUSTIN, TX — Luminos Energy, a leader in renewable energy solutions, announced today the opening of its newest manufacturing facility in Austin, Texas. The 80,000-square-foot plant is expected to produce over 2 million solar panels annually and will create approximately 350 full-time jobs in the region.

"This facility represents our commitment to expanding clean energy production in the United States," said CEO Daniel Park. "We are proud to be part of Austin's growing green technology sector."

The new plant uses automated assembly technology that reduces production costs by an estimated 18 percent compared to the company's previous facilities. Luminos Energy plans to begin deliveries to commercial clients in Q3 of this year.

The company currently operates facilities in California, Nevada, and Ohio.`,
        question: 'What is the purpose of this press release?',
      },
      options: ['To announce a merger between two energy companies', 'To report on a new solar panel facility opening', 'To introduce a new solar panel product line', 'To advertise job openings at Luminos Energy'],
      answer: 'B',
      explanation: 'The press release announces the opening of a new manufacturing facility for solar panels.',
      tags: ['single-passage', 'press-release', 'business'], isDiagnostic: false,
    },
    {
      id: 'p7-article-e2',
      content: {
        passage: `PRESS RELEASE

FOR IMMEDIATE RELEASE

Luminos Energy Announces Opening of New Solar Panel Manufacturing Facility

AUSTIN, TX — Luminos Energy, a leader in renewable energy solutions, announced today the opening of its newest manufacturing facility in Austin, Texas. The 80,000-square-foot plant is expected to produce over 2 million solar panels annually and will create approximately 350 full-time jobs in the region.

"This facility represents our commitment to expanding clean energy production in the United States," said CEO Daniel Park. "We are proud to be part of Austin's growing green technology sector."

The new plant uses automated assembly technology that reduces production costs by an estimated 18 percent compared to the company's previous facilities. Luminos Energy plans to begin deliveries to commercial clients in Q3 of this year.

The company currently operates facilities in California, Nevada, and Ohio.`,
        question: 'According to the press release, what advantage does the new facility have?',
      },
      options: ['It is the largest facility in the world.', 'It reduces production costs by 18 percent.', 'It will create 500 permanent jobs.', 'It uses solar panels to power itself.'],
      answer: 'B',
      explanation: '"Automated assembly technology that reduces production costs by an estimated 18 percent compared to the company\'s previous facilities."',
      tags: ['single-passage', 'press-release', 'technology'], isDiagnostic: false,
    },
  ]

  for (const q of part7ExtraSingle2) {
    await prisma.question.upsert({
      where: { id: q.id },
      update: {},
      create: { ...q, section: 'READING', part: 7, type: 'SINGLE_PASSAGE', difficulty: 3, isDiagnostic: false },
    })
  }
  console.log(`✅ Part 7 extra single 2: ${part7ExtraSingle2.length} questions`)

  // ── WRITING: Additional tasks ──────────────────────────────────────────────
  const writingExtra = [
    {
      id: 'w-sentence-e1',
      content: {
        imageUrl: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800',
        keywords: ['team', 'meeting'],
        prompt: 'Write one sentence using both words.',
      },
      options: null,
      answer: 'The team is having a meeting around a large conference table.',
      explanation: 'Must use both "team" and "meeting." Sentence should describe what is visible in the image.',
      tags: ['write-sentence', 'office'], isDiagnostic: false,
    },
    {
      id: 'w-sentence-e2',
      content: {
        imageUrl: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800',
        keywords: ['displayed', 'shelf'],
        prompt: 'Write one sentence using both words.',
      },
      options: null,
      answer: 'Various products are displayed on the shelf in an organized manner.',
      explanation: 'Must use "displayed" and "shelf." Sentence should describe items shown on shelves in the image.',
      tags: ['write-sentence', 'retail'], isDiagnostic: false,
    },
    {
      id: 'w-email-e1',
      content: {
        from: 'Alex Morgan <a.morgan@techbridge.com>',
        subject: 'Request for Proposal — Cloud Storage Solution',
        body: `Dear Sir/Madam,

I am writing on behalf of TechBridge Solutions to request a proposal for enterprise cloud storage services. Our company currently employs 250 staff members across three office locations and requires a scalable solution capable of storing approximately 50 terabytes of data with 99.9% uptime.

Could you please provide pricing information, a description of security features, and your typical implementation timeline?

We would appreciate a response by next Friday.

Kind regards,
Alex Morgan
Operations Manager, TechBridge Solutions`,
        instructions: 'Reply to this email. Confirm you received the request, mention two specific features of your cloud service, and propose a time for a call to discuss details.',
      },
      options: null,
      answer: 'Dear Mr./Ms. Morgan,\n\nThank you for reaching out to us. We are delighted to receive your request for proposal and look forward to supporting TechBridge Solutions.\n\nOur enterprise cloud storage solution offers advanced AES-256 encryption for all data at rest and in transit, as well as automatic daily backups with a 30-day retention policy. These features ensure both the security and reliability your team requires.\n\nI would be happy to schedule a call to discuss your specific needs in more detail. Would Thursday at 2:00 P.M. work for you?\n\nBest regards,\n[Your Name]',
      explanation: 'Response should confirm receipt, mention two features (security, backup, uptime, scalability, etc.), and propose a meeting time.',
      tags: ['respond-email', 'cloud', 'B2B'], isDiagnostic: false,
    },
    {
      id: 'w-essay-e1',
      content: {
        prompt: 'Some people believe that employees are more productive when they work from home. Others argue that working in an office is better for productivity. Which view do you agree with, and why? Give reasons and specific examples to support your opinion.',
      },
      options: null,
      answer: '',
      explanation: 'Opinion essay: state a clear position, provide 2-3 supporting arguments with examples, write 300+ words with clear paragraph structure.',
      tags: ['opinion-essay', 'work', 'productivity'], isDiagnostic: false,
    },
    {
      id: 'w-essay-e2',
      content: {
        prompt: 'Many companies now require employees to participate in ongoing professional development programs. Do you think this is a good policy? Why or why not? Use specific reasons and examples to support your opinion.',
      },
      options: null,
      answer: '',
      explanation: 'Opinion essay: take a clear stance on mandatory professional development, support with specific reasoning and examples.',
      tags: ['opinion-essay', 'professional-development', 'HR'], isDiagnostic: false,
    },
  ]

  for (const q of writingExtra) {
    const type = q.id.startsWith('w-sentence') ? 'WRITE_SENTENCE' : q.id.startsWith('w-email') ? 'RESPOND_EMAIL' : 'OPINION_ESSAY'
    await prisma.question.upsert({
      where: { id: q.id },
      update: {},
      create: { ...q, section: 'WRITING', part: q.id.startsWith('w-sentence') ? 1 : q.id.startsWith('w-email') ? 2 : 3, type, difficulty: 3, isDiagnostic: false },
    })
  }
  console.log(`✅ Writing extra: ${writingExtra.length} tasks`)

  // ─── LISTENING: Part 1 – Additional Photographs ──────────────────────────
  const part1Extra = [
    {
      id: 'p1-lab-13',
      content: {
        imageUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?fm=jpg&q=60&w=1200&auto=format&fit=crop',
        transcript: [
          'Scientists are working in the laboratory.',
          'A person is examining samples under a microscope.',
          'The lab equipment is being cleaned.',
          'Researchers are leaving the building.',
        ],
      },
      options: ['A', 'B', 'C', 'D'], answer: 'B',
      explanation: 'The correct description is B: a person examining samples under a microscope, which is the most likely activity shown in a laboratory setting.',
      tags: ['photograph', 'laboratory', 'science'], isDiagnostic: false,
    },
    {
      id: 'p1-train-14',
      content: {
        imageUrl: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?fm=jpg&q=60&w=1200&auto=format&fit=crop',
        transcript: [
          'Passengers are boarding the train.',
          'The train is stopped at the platform.',
          'A conductor is checking tickets on the platform.',
          'Luggage is being loaded onto the train.',
        ],
      },
      options: ['A', 'B', 'C', 'D'], answer: 'B',
      explanation: 'B best describes the train at rest at a station platform, which is the central subject of the photograph.',
      tags: ['photograph', 'transportation', 'station'], isDiagnostic: false,
    },
    {
      id: 'p1-park-15',
      content: {
        imageUrl: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?fm=jpg&q=60&w=1200&auto=format&fit=crop',
        transcript: [
          'People are jogging through the park.',
          'Trees are being planted along a path.',
          'A park bench is placed beside a tree.',
          'Workers are trimming the grass.',
        ],
      },
      options: ['A', 'B', 'C', 'D'], answer: 'C',
      explanation: 'C correctly describes a bench positioned next to a tree in a park — the primary elements visible in the image.',
      tags: ['photograph', 'outdoor', 'park'], isDiagnostic: false,
    },
    {
      id: 'p1-shipping-16',
      content: {
        imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?fm=jpg&q=60&w=1200&auto=format&fit=crop',
        transcript: [
          'Workers are stacking boxes in a warehouse.',
          'A forklift is being repaired.',
          'Shelves are being assembled by employees.',
          'Packages are lined up on a conveyor belt.',
        ],
      },
      options: ['A', 'B', 'C', 'D'], answer: 'A',
      explanation: 'A correctly describes workers stacking or organizing boxes in a warehouse/storage environment.',
      tags: ['photograph', 'warehouse', 'logistics'], isDiagnostic: false,
    },
    {
      id: 'p1-hotel-17',
      content: {
        imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?fm=jpg&q=60&w=1200&auto=format&fit=crop',
        transcript: [
          'A receptionist is checking in a guest.',
          'Guests are gathered in the hotel lobby.',
          'Hotel staff are arranging chairs in the lobby.',
          'A suitcase is being carried to the elevator.',
        ],
      },
      options: ['A', 'B', 'C', 'D'], answer: 'A',
      explanation: 'A describes the most typical hotel lobby interaction — a receptionist checking in a guest at the front desk.',
      tags: ['photograph', 'hotel', 'service'], isDiagnostic: false,
    },
  ]

  for (const q of part1Extra) {
    await prisma.question.upsert({
      where: { id: q.id },
      update: {},
      create: { ...q, section: 'LISTENING', part: 1, type: 'PHOTOGRAPH', difficulty: 2, isDiagnostic: false },
    })
  }
  console.log(`✅ Part 1 extra: ${part1Extra.length} photographs`)

  // ─── LISTENING: Part 2 – Additional Q&A pairs ────────────────────────────
  const part2ExtraB = [
    {
      id: 'p2-extra-b1',
      content: { question: "What time does the board meeting start tomorrow?", responses: ["At two o'clock in the afternoon.", "Yes, the board approved it.", "In the large conference room."] },
      options: ['A', 'B', 'C'], answer: 'A',
      explanation: '"What time" asks for a specific time. A gives a direct time answer. B answers a yes/no, C answers "where."',
      tags: ['question-response', 'time'], isDiagnostic: false,
    },
    {
      id: 'p2-extra-b2',
      content: { question: "Have you seen the quarterly sales report?", responses: ["It was submitted last Friday.", "I haven't had a chance to look at it yet.", "Yes, the sales team did a great job."] },
      options: ['A', 'B', 'C'], answer: 'B',
      explanation: 'B directly answers "Have you seen...?" with "I haven\'t had a chance to look at it yet." — a natural negative response.',
      tags: ['question-response', 'present-perfect'], isDiagnostic: false,
    },
    {
      id: 'p2-extra-b3',
      content: { question: "Who is handling the Johnson account while Ms. Torres is on leave?", responses: ["The account was opened last year.", "Mr. Kim from the client services team.", "She'll be back on the 15th."] },
      options: ['A', 'B', 'C'], answer: 'B',
      explanation: '"Who is handling" asks for a person. B gives a person\'s name and their role. A and C do not answer who.',
      tags: ['question-response', 'who'], isDiagnostic: false,
    },
    {
      id: 'p2-extra-b4',
      content: { question: "Could you send me the updated project schedule?", responses: ["I'll email it to you right away.", "The project was completed on time.", "No, the schedule has not changed."] },
      options: ['A', 'B', 'C'], answer: 'A',
      explanation: '"Could you send me" is a polite request. A accepts and promises immediate action — the most natural response.',
      tags: ['question-response', 'request'], isDiagnostic: false,
    },
    {
      id: 'p2-extra-b5',
      content: { question: "The printer on the third floor isn't working again, is it?", responses: ["I'll call maintenance right now.", "It was installed two months ago.", "Yes, the third floor has a great view."] },
      options: ['A', 'B', 'C'], answer: 'A',
      explanation: 'This negative tag question implies a problem. A responds appropriately with a practical action.',
      tags: ['question-response', 'tag-question'], isDiagnostic: false,
    },
    {
      id: 'p2-extra-b6',
      content: { question: "Why was the client presentation rescheduled?", responses: ["Because the client requested more preparation time.", "It's in Room 204 on the second floor.", "The presentation was very well received."] },
      options: ['A', 'B', 'C'], answer: 'A',
      explanation: '"Why was it rescheduled?" asks for a reason. A gives a "because" clause — the only response that answers why.',
      tags: ['question-response', 'why', 'reason'], isDiagnostic: false,
    },
    {
      id: 'p2-extra-b7',
      content: { question: "Where should I submit the expense reimbursement forms?", responses: ["They need to be approved first.", "To the finance department on the second floor.", "The reimbursement takes about two weeks."] },
      options: ['A', 'B', 'C'], answer: 'B',
      explanation: '"Where should I submit" asks for a location. B gives a specific place — the finance department and its location.',
      tags: ['question-response', 'where'], isDiagnostic: false,
    },
    {
      id: 'p2-extra-b8',
      content: { question: "Isn't the new employee handbook available on the company intranet?", responses: ["Yes, it was uploaded yesterday.", "The handbook covers 50 pages.", "New employees start on Monday."] },
      options: ['A', 'B', 'C'], answer: 'A',
      explanation: 'Negative question expects confirmation or denial. A confirms it was uploaded — directly answering the yes/no question.',
      tags: ['question-response', 'negative-question'], isDiagnostic: false,
    },
  ]

  for (const q of part2ExtraB) {
    await prisma.question.upsert({
      where: { id: q.id },
      update: {},
      create: { ...q, section: 'LISTENING', part: 2, type: 'QUESTION_RESPONSE', difficulty: 3, isDiagnostic: false },
    })
  }
  console.log(`✅ Part 2 extra B: ${part2ExtraB.length} Q&A pairs`)

  // ─── SPEAKING: Respond using Document (Task 8–10) ────────────────────────
  const speakingRespondDoc = [
    {
      id: 'sp-respond-doc-1',
      content: {
        document: {
          type: 'table',
          title: 'Staff Training Schedule – Q2',
          rows: [
            { label: 'Training Topic', value: 'Customer Communication Skills' },
            { label: 'Date', value: 'Tuesday, April 15' },
            { label: 'Time', value: '9:00 AM – 12:00 PM' },
            { label: 'Location', value: 'Conference Room B, 3rd Floor' },
            { label: 'Instructor', value: 'Ms. Laura Vance (HR Department)' },
            { label: 'Materials', value: 'Workbook provided; bring your own pen' },
            { label: 'Capacity', value: '20 participants (registration required)' },
          ],
        },
        scenario: 'Imagine that you received this schedule from a colleague and are now answering questions from another team member who could not open the file.',
        questions: [
          { id: 'q8', text: 'What is the topic of the training?', prepSeconds: 3, speakSeconds: 15 },
          { id: 'q9', text: 'When and where does the training take place?', prepSeconds: 3, speakSeconds: 15 },
          { id: 'q10', text: 'Do you think mandatory customer communication training is a good idea for staff? Why or why not?', prepSeconds: 3, speakSeconds: 30 },
        ],
      },
      options: null, answer: '',
      explanation: 'For Q8–Q9, read the information directly from the document. For Q10, share your opinion with 1–2 clear reasons.',
      tags: ['respond-doc', 'workplace', 'schedule'], isDiagnostic: false,
    },
    {
      id: 'sp-respond-doc-2',
      content: {
        document: {
          type: 'table',
          title: 'Quarterly Department Meeting – Agenda',
          rows: [
            { label: 'Date', value: 'Friday, May 9' },
            { label: 'Time', value: '2:00 PM – 4:30 PM' },
            { label: 'Location', value: 'Main Hall, Headquarters Building' },
            { label: 'Presenter (2:00)', value: 'CFO – Financial Review Q1' },
            { label: 'Presenter (3:00)', value: 'Sales Director – Targets & Strategy' },
            { label: 'Presenter (3:45)', value: 'HR Director – Hiring Plan Update' },
            { label: 'Refreshments', value: 'Available from 1:30 PM onward' },
            { label: 'RSVP Deadline', value: 'Wednesday, May 7 by 5:00 PM' },
          ],
        },
        scenario: 'A colleague asks you about the meeting since she missed the email. Answer her questions based on the agenda above.',
        questions: [
          { id: 'q8b', text: 'What time does the meeting start and where is it held?', prepSeconds: 3, speakSeconds: 15 },
          { id: 'q9b', text: 'Who presents last and what is that session about?', prepSeconds: 3, speakSeconds: 15 },
          { id: 'q10b', text: 'I want to arrive early for refreshments. Is that possible, and when should I arrive?', prepSeconds: 3, speakSeconds: 15 },
        ],
      },
      options: null, answer: '',
      explanation: 'Extract accurate information from the agenda. Speak naturally — you can paraphrase rather than reading word for word.',
      tags: ['respond-doc', 'meeting', 'agenda'], isDiagnostic: false,
    },
    {
      id: 'sp-respond-doc-3',
      content: {
        document: {
          type: 'table',
          title: 'Job Advertisement – Marketing Coordinator',
          rows: [
            { label: 'Company', value: 'Horizon Digital Solutions' },
            { label: 'Position', value: 'Marketing Coordinator' },
            { label: 'Location', value: 'Austin, Texas (Hybrid — 3 days in office)' },
            { label: 'Salary', value: '$48,000 – $56,000 per year' },
            { label: 'Experience Required', value: '2+ years in marketing or communications' },
            { label: 'Degree Required', value: 'Bachelor\'s in Marketing, Business, or related field' },
            { label: 'Key Skills', value: 'Social media management, content creation, data analysis' },
            { label: 'Application Deadline', value: 'May 31' },
          ],
        },
        scenario: 'A friend asks you about this job listing you found and wants to know if it might suit them.',
        questions: [
          { id: 'q8c', text: 'What company is advertising the position, and where is it located?', prepSeconds: 3, speakSeconds: 15 },
          { id: 'q9c', text: 'What are the experience and education requirements for the job?', prepSeconds: 3, speakSeconds: 15 },
          { id: 'q10c', text: 'My friend has 3 years of marketing experience but no degree. Would you recommend she apply? Why?', prepSeconds: 3, speakSeconds: 30 },
        ],
      },
      options: null, answer: '',
      explanation: 'Q8–Q9: report facts from the ad. Q10: give a clear recommendation with reasoning — acknowledge the missing degree but balance with 3 years of experience.',
      tags: ['respond-doc', 'job', 'HR'], isDiagnostic: false,
    },
  ]

  for (const q of speakingRespondDoc) {
    await prisma.question.upsert({
      where: { id: q.id },
      update: {},
      create: { ...q, section: 'SPEAKING', part: 4, type: 'RESPOND_INFO', difficulty: 3, isDiagnostic: false },
    })
  }
  console.log(`✅ Speaking respond-doc extra: ${speakingRespondDoc.length} tasks`)

  // ─── SPEAKING: Express Opinion (Task 11) ─────────────────────────────────
  const speakingOpinion = [
    {
      id: 'sp-opinion-2',
      content: {
        prompt: 'Some people think that it is better to work for a large company because large companies can offer more benefits and job stability. Others believe that small companies are a better choice. What do you think? Give specific reasons and examples to support your opinion.',
        prepSeconds: 45, speakSeconds: 60,
        structure: ['State opinion', 'Reason 1 + example', 'Reason 2 + example', 'Conclusion'],
      },
      options: null, answer: '',
      explanation: 'Use a clear structure: state preference (large or small), give 2 specific reasons with examples (e.g., salary, culture, growth opportunities), conclude clearly.',
      tags: ['express-opinion', 'workplace', 'career'], isDiagnostic: false,
    },
    {
      id: 'sp-opinion-3',
      content: {
        prompt: 'Many people today use social media to get their news instead of reading traditional newspapers or watching television news. Do you think this is a positive or negative trend? Why? Use specific reasons and examples to support your opinion.',
        prepSeconds: 45, speakSeconds: 60,
        structure: ['Position: positive/negative', 'Reason 1', 'Reason 2', 'Closing statement'],
      },
      options: null, answer: '',
      explanation: 'Take a clear stance. Consider pros (accessibility, speed) and cons (misinformation, echo chambers). Support with a real or hypothetical example.',
      tags: ['express-opinion', 'media', 'technology'], isDiagnostic: false,
    },
    {
      id: 'sp-opinion-4',
      content: {
        prompt: 'Some companies now allow their employees to set their own working hours rather than following a fixed schedule. What is your opinion about flexible work hours? Give reasons and examples to support your answer.',
        prepSeconds: 45, speakSeconds: 60,
        structure: ['Your opinion', 'Benefit 1', 'Benefit 2 or counterpoint', 'Final statement'],
      },
      options: null, answer: '',
      explanation: 'Flexible hours: discuss benefits (work-life balance, productivity) and potential issues (coordination, fairness). Use professional language.',
      tags: ['express-opinion', 'workplace', 'management'], isDiagnostic: false,
    },
    {
      id: 'sp-opinion-5',
      content: {
        prompt: 'Some people believe that all university students should be required to take at least one business or economics course regardless of their major. Do you agree or disagree with this requirement? Why? Support your answer with specific reasons and examples.',
        prepSeconds: 45, speakSeconds: 60,
        structure: ['Agree/Disagree', 'Reason 1 + example', 'Reason 2 + example', 'Conclusion'],
      },
      options: null, answer: '',
      explanation: 'Argue agree (financial literacy, career readiness) or disagree (irrelevance to major, burden on students). Use clear reasoning.',
      tags: ['express-opinion', 'education', 'business'], isDiagnostic: false,
    },
  ]

  for (const q of speakingOpinion) {
    await prisma.question.upsert({
      where: { id: q.id },
      update: {},
      create: { ...q, section: 'SPEAKING', part: 5, type: 'EXPRESS_OPINION', difficulty: 3, isDiagnostic: false },
    })
  }
  console.log(`✅ Speaking opinion extra: ${speakingOpinion.length} tasks`)

  // ─── SPEAKING: Read Aloud extra (Task 1–2) ────────────────────────────────
  const speakingReadAloud = [
    {
      id: 'sp-read-aloud-2',
      content: {
        text: 'Good morning, and welcome to the annual Greenfield Technology Conference. Over the next three days, we will hear from industry leaders, participate in hands-on workshops, and explore the latest innovations shaping the future of business technology. Please collect your badge and conference materials at the registration desk on the ground floor before joining any sessions. We wish you a productive and inspiring conference.',
        prepSeconds: 45, speakSeconds: 45,
      },
      options: null, answer: '',
      explanation: 'Read at a clear, measured pace. Stress key words: "annual", "industry leaders", "innovations". Pause naturally at commas and periods.',
      tags: ['read-aloud', 'announcement'], isDiagnostic: false,
    },
    {
      id: 'sp-read-aloud-3',
      content: {
        text: 'Attention all passengers: Flight 247 to Singapore is now boarding at Gate 12B. Please have your boarding pass and identification ready for inspection. Passengers requiring special assistance should proceed to the gate immediately. All other passengers are asked to board in order of their seat row, starting with rows 30 through 50. Thank you for flying with Pacific International Airlines.',
        prepSeconds: 45, speakSeconds: 45,
      },
      options: null, answer: '',
      explanation: 'Airport announcements require clear, authoritative delivery. Stress numbers (247, 12B, 30–50) and action words (board, proceed, have ready).',
      tags: ['read-aloud', 'announcement', 'airport'], isDiagnostic: false,
    },
  ]

  for (const q of speakingReadAloud) {
    await prisma.question.upsert({
      where: { id: q.id },
      update: {},
      create: { ...q, section: 'SPEAKING', part: 1, type: 'READ_ALOUD', difficulty: 3, isDiagnostic: false },
    })
  }
  console.log(`✅ Speaking read-aloud extra: ${speakingReadAloud.length} tasks`)

  // ─── SPEAKING: Describe Picture extra (Task 3–4) ──────────────────────────
  const speakingDescribe = [
    {
      id: 'sp-describe-2',
      content: {
        imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?fm=jpg&q=60&w=1200&auto=format&fit=crop',
        prompt: 'Describe the picture in as much detail as you can.',
        prepSeconds: 45, speakSeconds: 30,
        hints: ['people', 'location', 'actions', 'furniture'],
      },
      options: null, answer: '',
      explanation: 'Describe a modern office meeting: number of people, what they are doing (discussing, writing, looking at screens), and the setting (conference table, whiteboards, etc.).',
      tags: ['describe-picture', 'office', 'meeting'], isDiagnostic: false,
    },
    {
      id: 'sp-describe-3',
      content: {
        imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?fm=jpg&q=60&w=1200&auto=format&fit=crop',
        prompt: 'Describe the picture in as much detail as you can.',
        prepSeconds: 45, speakSeconds: 30,
        hints: ['food', 'people', 'setting', 'activity'],
      },
      options: null, answer: '',
      explanation: 'Describe a restaurant scene: number of people, what they are eating or ordering, the atmosphere (casual/formal), table setup, and any staff visible.',
      tags: ['describe-picture', 'restaurant', 'food'], isDiagnostic: false,
    },
  ]

  for (const q of speakingDescribe) {
    await prisma.question.upsert({
      where: { id: q.id },
      update: {},
      create: { ...q, section: 'SPEAKING', part: 2, type: 'DESCRIBE_PICTURE', difficulty: 3, isDiagnostic: false },
    })
  }
  console.log(`✅ Speaking describe extra: ${speakingDescribe.length} tasks`)

  // ─── SPEAKING: Respond Free extra (Task 5–7) ─────────────────────────────
  const speakingRespondFree = [
    {
      id: 'sp-respond-free-2',
      content: {
        scenario: 'Imagine that a British research firm is conducting a survey about shopping habits in your country. You have agreed to participate in a telephone interview.',
        questions: [
          { id: 'q5b', text: 'How often do you go shopping for clothing?', prepSeconds: 3, speakSeconds: 15 },
          { id: 'q6b', text: 'Do you prefer shopping online or in person? Why?', prepSeconds: 3, speakSeconds: 15 },
          { id: 'q7b', text: 'Describe the last time you bought something online. What did you buy and how was the experience?', prepSeconds: 3, speakSeconds: 30 },
        ],
      },
      options: null, answer: '',
      explanation: 'Give direct, natural answers. For Q7, use past tense and describe the whole experience (browsing, ordering, delivery, satisfaction).',
      tags: ['respond-questions', 'shopping', 'lifestyle'], isDiagnostic: false,
    },
    {
      id: 'sp-respond-free-3',
      content: {
        scenario: 'An Australian university is studying international attitudes toward remote work. You have agreed to answer some questions.',
        questions: [
          { id: 'q5c', text: 'Do you currently work from home, or would you like to? Why?', prepSeconds: 3, speakSeconds: 15 },
          { id: 'q6c', text: 'What are some challenges of working from home?', prepSeconds: 3, speakSeconds: 15 },
          { id: 'q7c', text: 'How do you think remote work will change office culture in the future? Give specific examples.', prepSeconds: 3, speakSeconds: 30 },
        ],
      },
      options: null, answer: '',
      explanation: 'Answer from personal experience or hypothetically. Use specific vocabulary (collaboration, productivity, work-life balance, video conferencing).',
      tags: ['respond-questions', 'remote-work', 'workplace'], isDiagnostic: false,
    },
  ]

  for (const q of speakingRespondFree) {
    await prisma.question.upsert({
      where: { id: q.id },
      update: {},
      create: { ...q, section: 'SPEAKING', part: 3, type: 'RESPOND_FREE', difficulty: 3, isDiagnostic: false },
    })
  }
  console.log(`✅ Speaking respond-free extra: ${speakingRespondFree.length} tasks`)

  console.log('\n✅ All extra questions seeded successfully!')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
