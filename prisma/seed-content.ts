import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('Seeding additional content...')

  // ─── SPEAKING: Express Opinion (Task 11) ─────────────────────────────────
  const speakingOpinion = [
    {
      id: 'sp-opinion-2',
      content: {
        question: 'Some people think that companies should offer unlimited vacation time to employees. Do you agree or disagree? Give specific reasons and examples to support your opinion.',
        prepSeconds: 45, speakSeconds: 60,
        hints: ['productivity', 'trust', 'work-life balance', 'abuse', 'responsibility'],
      },
      options: null, answer: '',
      explanation: 'Structure: State position → Reason 1 with example → Reason 2 with example → Conclusion. Use phrases like "In my view", "For instance", "This means that".',
      tags: ['express-opinion', 'workplace', 'hr-policy'], isDiagnostic: false,
    },
    {
      id: 'sp-opinion-3',
      content: {
        question: 'Do you think it is better to work for a large corporation or a small startup? Give specific reasons and examples.',
        prepSeconds: 45, speakSeconds: 60,
        hints: ['stability', 'growth', 'resources', 'culture', 'career development'],
      },
      options: null, answer: '',
      explanation: 'Consider both sides briefly, then commit to one position. Large: stability, resources, brand. Small: impact, flexibility, fast learning.',
      tags: ['express-opinion', 'career', 'workplace'], isDiagnostic: false,
    },
    {
      id: 'sp-opinion-4',
      content: {
        question: 'Some people prefer to meet clients in person, while others think video calls are just as effective. Which do you prefer and why?',
        prepSeconds: 45, speakSeconds: 60,
        hints: ['connection', 'efficiency', 'travel cost', 'trust building', 'technology'],
      },
      options: null, answer: '',
      explanation: 'Use "I prefer X because..." to open. Give two concrete reasons (e.g., builds rapport, reads body language). Acknowledge the other side briefly.',
      tags: ['express-opinion', 'communication', 'business'], isDiagnostic: false,
    },
    {
      id: 'sp-opinion-5',
      content: {
        question: 'Many companies now use artificial intelligence to handle customer service. Is this a positive or negative development? Give your opinion with examples.',
        prepSeconds: 45, speakSeconds: 60,
        hints: ['efficiency', 'cost savings', 'human touch', '24/7 availability', 'job loss'],
      },
      options: null, answer: '',
      explanation: 'Balance tech benefits (24/7 service, consistency, cost) against human factors (empathy, complex problems). Take a clear side and defend it.',
      tags: ['express-opinion', 'technology', 'AI', 'customer-service'], isDiagnostic: false,
    },
    {
      id: 'sp-opinion-6',
      content: {
        question: 'Do you think employees should be required to participate in team-building activities outside of regular working hours? Support your view with reasons.',
        prepSeconds: 45, speakSeconds: 60,
        hints: ['morale', 'work-life balance', 'voluntary', 'team cohesion', 'mandatory vs. optional'],
      },
      options: null, answer: '',
      explanation: 'Typical view: optional is better (respects personal time). Or: required builds necessary culture. Support with workplace examples.',
      tags: ['express-opinion', 'workplace', 'team'], isDiagnostic: false,
    },
  ]

  for (const q of speakingOpinion) {
    await prisma.question.upsert({
      where: { id: q.id },
      update: {},
      create: { ...q, section: 'SPEAKING', part: 5, type: 'EXPRESS_OPINION', difficulty: 4, isDiagnostic: false },
    })
  }
  console.log(`✅ Speaking express-opinion: ${speakingOpinion.length} tasks`)

  // ─── WRITING: Respond Email (Task 6–7) ────────────────────────────────────
  const writingEmail = [
    {
      id: 'wt-email-2',
      content: {
        from: 'Sandra Hensley <s.hensley@meridiangroup.com>',
        subject: 'Project Update Request',
        body: `Hi,\n\nI hope you're doing well. I'm writing to get an update on the current status of the Henderson account project.\n\nSpecifically, I'd like to know:\n1. What has been completed so far?\n2. Are there any obstacles or delays we should be aware of?\n\nPlease respond by Friday.\n\nBest regards,\nSandra Hensley\nProject Director`,
        instructions: 'Write a professional response addressing both questions. Mention what has been completed and note any challenges. Your response should be at least 100 words.',
        minWords: 100,
        timeMinutes: 10,
      },
      options: null, answer: '',
      explanation: 'Good email: opens with context ("Thank you for reaching out"), answers Q1 (what is done), addresses Q2 (challenges if any), ends professionally ("Please let me know if you need further details").',
      tags: ['respond-email', 'project-update', 'business-writing'], isDiagnostic: false,
    },
    {
      id: 'wt-email-3',
      content: {
        from: 'Thomas Park <t.park@novabuildco.com>',
        subject: 'Request for Proposal — Office Renovation',
        body: `Dear Sir or Madam,\n\nOur company is planning to renovate our headquarters located at 450 Commerce Street. We are currently seeking proposals from qualified contractors.\n\nWe would like to know:\n1. What services does your company offer for commercial renovations?\n2. What is your typical timeline for a project of this scale?\n\nPlease provide a detailed response.\n\nSincerely,\nThomas Park\nFacilities Manager, NovaBuild Co.`,
        instructions: 'Reply professionally addressing both questions. Describe your renovation services and give a realistic timeline estimate. Minimum 100 words.',
        minWords: 100,
        timeMinutes: 10,
      },
      options: null, answer: '',
      explanation: 'Respond as if you work for a renovation company. Cover: services (design, demolition, construction, finishing), timeline (discuss factors like size, scope), and offer a consultation.',
      tags: ['respond-email', 'proposal', 'business-writing'], isDiagnostic: false,
    },
    {
      id: 'wt-email-4',
      content: {
        from: 'Michelle Okafor <m.okafor@starlightevents.com>',
        subject: 'Inquiry About Conference Room Rental',
        body: `Hello,\n\nI am planning a corporate conference for approximately 80 attendees and am looking for a suitable venue.\n\nCould you please let me know:\n1. Is your conference room available on March 15th? What is the capacity?\n2. What catering options do you offer for events of this size?\n\nI look forward to your response.\n\nBest,\nMichelle Okafor\nEvents Coordinator`,
        instructions: 'Write a professional reply addressing both questions. Include availability (or suggest alternatives), capacity details, and catering options. Minimum 100 words.',
        minWords: 100,
        timeMinutes: 10,
      },
      options: null, answer: '',
      explanation: 'Confirm availability, mention room capacity (e.g., 100 max), describe catering options (buffet, seated, coffee breaks), and offer to schedule a visit.',
      tags: ['respond-email', 'event-planning', 'hospitality'], isDiagnostic: false,
    },
  ]

  for (const q of writingEmail) {
    await prisma.question.upsert({
      where: { id: q.id },
      update: {},
      create: { ...q, section: 'WRITING', part: 2, type: 'RESPOND_EMAIL', difficulty: 4, isDiagnostic: false },
    })
  }
  console.log(`✅ Writing respond-email: ${writingEmail.length} tasks`)

  // ─── WRITING: Opinion Essay (Task 8) ─────────────────────────────────────
  const writingEssay = [
    {
      id: 'wt-essay-2',
      content: {
        prompt: 'Do you think that companies should offer flexible working hours to all employees? Use specific reasons and examples to support your opinion.',
        minWords: 300,
        timeMinutes: 30,
        outline: ['Introduction: State position', 'Reason 1: Work-life balance improves productivity', 'Reason 2: Attracts and retains talent', 'Counterargument + Rebuttal', 'Conclusion'],
      },
      options: null, answer: '',
      explanation: 'Strong essays: clear thesis, two well-developed paragraphs with examples (e.g., studies show flexible workers are 13% more productive), acknowledge counterargument (coordination challenges), firm conclusion.',
      tags: ['opinion-essay', 'workplace', 'hr'], isDiagnostic: false,
    },
    {
      id: 'wt-essay-3',
      content: {
        prompt: 'Some argue that social media has had a negative impact on workplace productivity. Do you agree or disagree? Give specific reasons and examples.',
        minWords: 300,
        timeMinutes: 30,
        outline: ['Introduction: Position', 'Argument 1: Distraction and time waste', 'Argument 2 OR counterpoint: Professional networking value', 'Conclusion'],
      },
      options: null, answer: '',
      explanation: 'Consider evidence-based arguments: studies on distraction (Facebook during work), but also LinkedIn for networking. Take a clear position and defend it consistently.',
      tags: ['opinion-essay', 'technology', 'productivity'], isDiagnostic: false,
    },
    {
      id: 'wt-essay-4',
      content: {
        prompt: 'Is it more important for a business leader to have strong technical skills or strong interpersonal skills? Give specific reasons and examples to support your view.',
        minWords: 300,
        timeMinutes: 30,
        outline: ['Introduction', 'Interpersonal skills argument (or technical)', 'Second supporting reason + example', 'Brief acknowledgment of opposing view', 'Conclusion'],
      },
      options: null, answer: '',
      explanation: 'Interpersonal: leaders must motivate, communicate, build culture. Technical: domain knowledge needed for credibility. Strong essays pick one and give concrete business examples.',
      tags: ['opinion-essay', 'leadership', 'business'], isDiagnostic: false,
    },
  ]

  for (const q of writingEssay) {
    await prisma.question.upsert({
      where: { id: q.id },
      update: {},
      create: { ...q, section: 'WRITING', part: 3, type: 'OPINION_ESSAY', difficulty: 5, isDiagnostic: false },
    })
  }
  console.log(`✅ Writing opinion-essay: ${writingEssay.length} tasks`)

  // ─── SPEAKING: Respond Info extra (Task 8–10) ────────────────────────────
  const speakingRespondInfo = [
    {
      id: 'sp-respond-info-2',
      content: {
        scenario: 'You are a hotel guest. You call the front desk with questions about hotel services.',
        document: {
          title: 'Sunrise Hotel — Guest Services Directory',
          content: `Breakfast: Served daily 6:30–10:00 AM, Restaurant (Floor 1)\nPool: Open 7:00 AM–10:00 PM, Rooftop (Floor 12)\nFitness Center: 24-hour access, Floor 2\nRoom Service: Available 6:00 AM–midnight\nLaundry Service: Same-day if submitted before 9:00 AM\nAirport Shuttle: Departs 6:00, 9:00, 12:00, 3:00, 6:00 PM\nCheck-out: 12:00 noon (late check-out available, surcharge applies)\nParking: Complimentary for hotel guests, access via Key Card`,
        },
        questions: [
          { id: 'q8a', text: 'What time does breakfast end, and where is it served?', prepSeconds: 3, speakSeconds: 15 },
          { id: 'q9a', text: 'I need to take an airport shuttle tomorrow at around 3 PM. Is there one available?', prepSeconds: 3, speakSeconds: 15 },
          { id: 'q10a', text: 'I have a lot of clothes that need to be washed. Can I get same-day laundry service if I submit them now at 8:30 AM? Also, what time is check-out?', prepSeconds: 3, speakSeconds: 30 },
        ],
      },
      options: null, answer: '',
      explanation: 'Answer directly from the document. Q8: 10:00 AM, Restaurant Floor 1. Q9: Yes, 3:00 PM shuttle available. Q10: Yes (before 9 AM), check-out is noon.',
      tags: ['respond-info', 'hotel', 'schedule'], isDiagnostic: false,
    },
    {
      id: 'sp-respond-info-3',
      content: {
        scenario: 'You work at a travel agency. A client calls with questions about a tour package.',
        document: {
          title: 'Eurostar Grand Tour — Package Details',
          content: `Destinations: Paris, Amsterdam, Berlin, Prague, Vienna (5 cities)\nDuration: 14 days / 13 nights\nDepartures: June 1, June 15, July 1, July 15 (all from London)\nPrice: £2,400 per person (twin share); Single supplement: £450\nIncludes: Coach transport, 3-star accommodation, daily breakfast, guided city tours\nNot included: Flights to London, travel insurance, lunches/dinners, personal expenses\nBooking deposit: £300 per person, due at booking\nFull payment: 60 days before departure\nCancellation: Full refund if cancelled 90+ days before; 50% refund 60–89 days; No refund under 60 days`,
        },
        questions: [
          { id: 'q8b', text: 'How many countries does this tour visit, and how long is the trip?', prepSeconds: 3, speakSeconds: 15 },
          { id: 'q9b', text: 'My wife and I want to travel on July 15th. What would be the total cost for both of us?', prepSeconds: 3, speakSeconds: 15 },
          { id: 'q10b', text: 'Does the package include all meals? And what happens if we need to cancel 70 days before departure?', prepSeconds: 3, speakSeconds: 30 },
        ],
      },
      options: null, answer: '',
      explanation: 'Q8: 5 cities (not countries), 14 days. Q9: £2,400 × 2 = £4,800 total (twin share). Q10: Only breakfast included; 50% refund for 60–89 day cancellation.',
      tags: ['respond-info', 'travel', 'tour'], isDiagnostic: false,
    },
  ]

  for (const q of speakingRespondInfo) {
    await prisma.question.upsert({
      where: { id: q.id },
      update: {},
      create: { ...q, section: 'SPEAKING', part: 4, type: 'RESPOND_INFO', difficulty: 4, isDiagnostic: false },
    })
  }
  console.log(`✅ Speaking respond-info: ${speakingRespondInfo.length} tasks`)

  console.log('\n✅ All additional content seeded successfully!')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
