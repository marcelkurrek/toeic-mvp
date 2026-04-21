import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding questions...')

  // Part 5 – Incomplete Sentences (10 sample questions)
  const part5 = [
    {
      content: { question: 'Customer reviews indicate that many modern mobile devices are often unnecessarily -------.', },
      options: ['complication', 'complicates', 'complicate', 'complicated'],
      answer: 'D',
      explanation: '"Unnecessarily" is an adverb modifying an adjective. The correct form here is the adjective "complicated".',
      tags: ['adjective', 'word-form'],
    },
    {
      content: { question: 'Jamal Nawzad has received top performance reviews ------- he joined the sales department two years ago.' },
      options: ['despite', 'except', 'since', 'during'],
      answer: 'C',
      explanation: '"Since" is used with present perfect to indicate a point in time from which something has been true.',
      tags: ['conjunction', 'tense'],
    },
    {
      content: { question: 'The manager asked the team to ------- their reports by Friday afternoon.' },
      options: ['submit', 'submits', 'submitted', 'submitting'],
      answer: 'A',
      explanation: 'After "asked someone to", the base form (infinitive without "to" is already included) is needed: "to submit".',
      tags: ['verb-form', 'infinitive'],
    },
    {
      content: { question: 'The new policy will be ------- to all employees starting next month.' },
      options: ['applying', 'applied', 'applicable', 'apply'],
      answer: 'C',
      explanation: '"Applicable" is the adjective meaning "relevant" or "able to be applied". It follows the linking verb "will be".',
      tags: ['adjective', 'word-form'],
    },
    {
      content: { question: '------- recognized at the company awards ceremony were senior analyst Natalie Obi and sales associate Peter Comeau.' },
      options: ['Who', 'Whose', 'They', 'Those'],
      answer: 'D',
      explanation: '"Those" is a pronoun used to refer to people in a group. "Those recognized" means "the people who were recognized".',
      tags: ['pronoun', 'relative-clause'],
    },
    {
      content: { question: 'All clothing sold in Develyn\'s Boutique is made from natural materials and contains no ------- dyes.' },
      options: ['immediate', 'synthetic', 'reasonable', 'assumed'],
      answer: 'B',
      explanation: '"Synthetic" means artificially made, not natural. It correctly describes man-made dyes in contrast to natural materials.',
      tags: ['vocabulary', 'adjective'],
    },
    {
      content: { question: 'Gyeon Corporation\'s continuing education policy states that ------- learning new skills enhances creativity and focus.' },
      options: ['regular', 'regularity', 'regulate', 'regularly'],
      answer: 'D',
      explanation: '"Regularly" is an adverb modifying the gerund phrase "learning new skills". Adverbs modify verbs and verb phrases.',
      tags: ['adverb', 'word-form'],
    },
    {
      content: { question: 'The conference will be held ------- the main office building on Baker Street.' },
      options: ['at', 'by', 'from', 'into'],
      answer: 'A',
      explanation: '"At" is the correct preposition for locations when referring to specific buildings or addresses.',
      tags: ['preposition', 'location'],
    },
    {
      content: { question: 'Mr. Kim ------- the quarterly report before the board meeting tomorrow.' },
      options: ['will finish', 'finishes', 'finished', 'had finished'],
      answer: 'A',
      explanation: 'The time marker "before the board meeting tomorrow" indicates a future action. "Will finish" is correct.',
      tags: ['tense', 'future'],
    },
    {
      content: { question: 'The ------- of the new product line has been postponed until further notice.' },
      options: ['launch', 'launching', 'launched', 'launches'],
      answer: 'A',
      explanation: '"Launch" as a noun is the subject of the sentence. "The launch of..." is the correct noun phrase.',
      tags: ['noun', 'word-form'],
    },
  ]

  for (const q of part5) {
    await prisma.question.upsert({
      where: { id: `p5-${q.tags[0]}-${part5.indexOf(q)}` },
      update: {},
      create: {
        id: `p5-${q.tags[0]}-${part5.indexOf(q)}`,
        part: 5,
        type: 'INCOMPLETE_SENTENCE',
        content: q.content,
        options: q.options,
        answer: q.answer,
        explanation: q.explanation,
        difficulty: 3,
        tags: q.tags,
      }
    })
  }

  // Part 6 – Text Completion (1 full email = 4 questions)
  const emailText = `To: Project Leads\nFrom: James Pak\nSubject: Training Courses\n\nIn the coming weeks, we will be organizing several training sessions for [131] employees. At Pak Designs, we believe that with the proper help from senior project leaders, less experienced staff can quickly [132] a deep understanding of the design process. [133], they can improve their ability to communicate effectively across divisions. For that reason, we are urging experienced project leaders to attend each one of the interactive seminars that will be held throughout the coming month. [134].`

  const part6 = [
    {
      id: 'p6-email1-131',
      content: { passage: emailText, question: 'Choose the best word for blank [131]: "...training sessions for ------- employees."' },
      options: ['interest', 'interests', 'interested', 'interesting'],
      answer: 'C',
      explanation: '"Interested" is an adjective meaning "having an interest in something". Here it describes the employees.',
    },
    {
      id: 'p6-email1-132',
      content: { passage: emailText, question: 'Choose the best word for blank [132]: "...staff can quickly ------- a deep understanding..."' },
      options: ['develop', 'raise', 'open', 'complete'],
      answer: 'A',
      explanation: '"Develop an understanding" is the natural colocation. You develop knowledge, skills, or understanding over time.',
    },
    {
      id: 'p6-email1-133',
      content: { passage: emailText, question: 'Choose the best connector for blank [133].' },
      options: ['After all', 'For', 'Even so', 'At the same time'],
      answer: 'D',
      explanation: '"At the same time" connects two benefits happening concurrently. The employees develop understanding AND improve communication.',
    },
    {
      id: 'p6-email1-134',
      content: { passage: emailText, question: 'Choose the best sentence for blank [134] at the end of the email.' },
      options: [
        'Let me explain our plans for on-site staff training.',
        'We hope that you will strongly consider joining us.',
        'Today\'s training session will be postponed until Monday.',
        'This is the first in a series of such lectures.',
      ],
      answer: 'B',
      explanation: 'The email is urging leaders to attend. Ending with an encouragement to join ("We hope you will consider joining us") is the most logical conclusion.',
    },
  ]

  for (const q of part6) {
    await prisma.question.upsert({
      where: { id: q.id },
      update: {},
      create: {
        id: q.id,
        part: 6,
        type: 'TEXT_COMPLETION',
        content: q.content,
        options: q.options,
        answer: q.answer,
        explanation: q.explanation,
        difficulty: 3,
        tags: ['email', 'text-completion'],
      }
    })
  }

  // Part 7 – Reading Comprehension (1 passage + 2 questions)
  const adText = `Used Car For Sale. Six-year-old Carlisle Custom. Only one owner. Low mileage. Car used to commute short distances to town. Brakes and tires replaced six months ago. Struts replaced two weeks ago. Air conditioning works well, but heater takes a while to warm up. Brand new spare tire included. Priced to sell. Owner going overseas at the end of this month and must sell the car. Call Firoozeh Ghorbani at (848) 555-0132.`

  const part7 = [
    {
      id: 'p7-ad1-147',
      content: { passage: adText, question: 'What is suggested about the car?' },
      options: [
        'It was recently repaired.',
        'It has had more than one owner.',
        'It is very fuel efficient.',
        'It has been on sale for six months.',
      ],
      answer: 'A',
      explanation: 'The ad mentions struts replaced two weeks ago and brakes/tires replaced six months ago – indicating recent repairs.',
    },
    {
      id: 'p7-ad1-148',
      content: { passage: adText, question: 'According to the advertisement, why is Ms. Ghorbani selling her car?' },
      options: [
        'She cannot repair the car\'s temperature control.',
        'She finds it difficult to maintain.',
        'She would like to have a newer model.',
        'She is leaving for another country.',
      ],
      answer: 'D',
      explanation: 'The ad states "Owner going overseas at the end of this month and must sell the car." – she is leaving the country.',
    },
  ]

  for (const q of part7) {
    await prisma.question.upsert({
      where: { id: q.id },
      update: {},
      create: {
        id: q.id,
        part: 7,
        type: 'SINGLE_PASSAGE',
        content: q.content,
        options: q.options,
        answer: q.answer,
        explanation: q.explanation,
        difficulty: 3,
        tags: ['advertisement', 'reading'],
      }
    })
  }

  console.log(`✅ Seeded: ${part5.length} Part 5, ${part6.length} Part 6, ${part7.length} Part 7 questions`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
