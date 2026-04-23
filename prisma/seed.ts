import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding questions...')

  // ─── READING: Part 5 – Incomplete Sentences ───────────────────────────────
  const part5 = [
    {
      id: 'p5-adjective-0',
      content: { question: 'Customer reviews indicate that many modern mobile devices are often unnecessarily -------.', },
      options: ['complication', 'complicates', 'complicate', 'complicated'],
      answer: 'D',
      explanation: '"Unnecessarily" is an adverb modifying an adjective. The correct form here is the adjective "complicated".',
      tags: ['adjective', 'word-form'],
      isDiagnostic: true,
    },
    {
      id: 'p5-conjunction-1',
      content: { question: 'Jamal Nawzad has received top performance reviews ------- he joined the sales department two years ago.' },
      options: ['despite', 'except', 'since', 'during'],
      answer: 'C',
      explanation: '"Since" is used with present perfect to indicate a point in time from which something has been true.',
      tags: ['conjunction', 'tense'],
      isDiagnostic: true,
    },
    {
      id: 'p5-verb-form-2',
      content: { question: 'The manager asked the team to ------- their reports by Friday afternoon.' },
      options: ['submit', 'submits', 'submitted', 'submitting'],
      answer: 'A',
      explanation: 'After "asked someone to", the infinitive form is needed: "to submit".',
      tags: ['verb-form', 'infinitive'],
    },
    {
      id: 'p5-adjective-3',
      content: { question: 'The new policy will be ------- to all employees starting next month.' },
      options: ['applying', 'applied', 'applicable', 'apply'],
      answer: 'C',
      explanation: '"Applicable" is the adjective meaning "relevant" or "able to be applied". It follows the linking verb "will be".',
      tags: ['adjective', 'word-form'],
    },
    {
      id: 'p5-pronoun-4',
      content: { question: '------- recognized at the company awards ceremony were senior analyst Natalie Obi and sales associate Peter Comeau.' },
      options: ['Who', 'Whose', 'They', 'Those'],
      answer: 'D',
      explanation: '"Those" is a pronoun used to refer to people in a group. "Those recognized" means "the people who were recognized".',
      tags: ['pronoun', 'relative-clause'],
    },
    {
      id: 'p5-vocabulary-5',
      content: { question: 'All clothing sold in Develyn\'s Boutique is made from natural materials and contains no ------- dyes.' },
      options: ['immediate', 'synthetic', 'reasonable', 'assumed'],
      answer: 'B',
      explanation: '"Synthetic" means artificially made, not natural. It correctly describes man-made dyes in contrast to natural materials.',
      tags: ['vocabulary', 'adjective'],
    },
    {
      id: 'p5-adverb-6',
      content: { question: 'Gyeon Corporation\'s continuing education policy states that ------- learning new skills enhances creativity and focus.' },
      options: ['regular', 'regularity', 'regulate', 'regularly'],
      answer: 'D',
      explanation: '"Regularly" is an adverb modifying the gerund phrase "learning new skills".',
      tags: ['adverb', 'word-form'],
    },
    {
      id: 'p5-preposition-7',
      content: { question: 'The conference will be held ------- the main office building on Baker Street.' },
      options: ['at', 'by', 'from', 'into'],
      answer: 'A',
      explanation: '"At" is the correct preposition for locations when referring to specific buildings or addresses.',
      tags: ['preposition', 'location'],
    },
    {
      id: 'p5-tense-8',
      content: { question: 'Mr. Kim ------- the quarterly report before the board meeting tomorrow.' },
      options: ['will finish', 'finishes', 'finished', 'had finished'],
      answer: 'A',
      explanation: 'The time marker "before the board meeting tomorrow" indicates a future action. "Will finish" is correct.',
      tags: ['tense', 'future'],
    },
    {
      id: 'p5-noun-9',
      content: { question: 'The ------- of the new product line has been postponed until further notice.' },
      options: ['launch', 'launching', 'launched', 'launches'],
      answer: 'A',
      explanation: '"Launch" as a noun is the subject of the sentence. "The launch of..." is the correct noun phrase.',
      tags: ['noun', 'word-form'],
    },
  ]

  for (const q of part5) {
    await prisma.question.upsert({
      where: { id: q.id },
      update: {},
      create: { ...q, section: 'READING', part: 5, type: 'INCOMPLETE_SENTENCE', difficulty: 3 },
    })
  }

  // ─── READING: Part 6 – Text Completion ────────────────────────────────────
  const emailText = `To: Project Leads\nFrom: James Pak\nSubject: Training Courses\n\nIn the coming weeks, we will be organizing several training sessions for [131] employees. At Pak Designs, we believe that with the proper help from senior project leaders, less experienced staff can quickly [132] a deep understanding of the design process. [133], they can improve their ability to communicate effectively across divisions. For that reason, we are urging experienced project leaders to attend each one of the interactive seminars that will be held throughout the coming month. [134].`

  const part6 = [
    {
      id: 'p6-email1-131',
      content: { passage: emailText, question: 'Choose the best word for blank [131]: "...training sessions for ------- employees."' },
      options: ['interest', 'interests', 'interested', 'interesting'],
      answer: 'C',
      explanation: '"Interested" is an adjective meaning "having an interest in something". Here it describes the employees.',
      isDiagnostic: true,
    },
    {
      id: 'p6-email1-132',
      content: { passage: emailText, question: 'Choose the best word for blank [132]: "...staff can quickly ------- a deep understanding..."' },
      options: ['develop', 'raise', 'open', 'complete'],
      answer: 'A',
      explanation: '"Develop an understanding" is the natural collocation. You develop knowledge, skills, or understanding over time.',
    },
    {
      id: 'p6-email1-133',
      content: { passage: emailText, question: 'Choose the best connector for blank [133].' },
      options: ['After all', 'For', 'Even so', 'At the same time'],
      answer: 'D',
      explanation: '"At the same time" connects two benefits happening concurrently.',
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
      explanation: 'The email is urging leaders to attend. Ending with an encouragement to join is the most logical conclusion.',
    },
  ]

  for (const q of part6) {
    await prisma.question.upsert({
      where: { id: q.id },
      update: {},
      create: { ...q, section: 'READING', part: 6, type: 'TEXT_COMPLETION', difficulty: 3, tags: ['email', 'text-completion'] },
    })
  }

  // ─── READING: Part 7 – Reading Comprehension ──────────────────────────────
  const adText = `Used Car For Sale. Six-year-old Carlisle Custom. Only one owner. Low mileage. Car used to commute short distances to town. Brakes and tires replaced six months ago. Struts replaced two weeks ago. Air conditioning works well, but heater takes a while to warm up. Brand new spare tire included. Priced to sell. Owner going overseas at the end of this month and must sell the car. Call Firoozeh Ghorbani at (848) 555-0132.`

  const articleText = `On Monday, Salinas Products, a large food distributor based in Mexico City, announced its plans to acquire the Pablo's restaurant chain. Pablo Benavidez, the chain's owner, had been considering holding an auction for ownership of the chain. He ultimately made the decision to sell to Salinas without seeking other offers. According to inside sources, Salinas has agreed to keep the restaurant's name as part of the deal. Mr. Benavidez started the business 40 years ago right after finishing school. He opened a small food stand in his hometown of Cancún. Following that, he opened restaurants in Puerto Vallarta and Veracruz, and there are now over 50 Pablo's restaurants nationwide.`

  const part7 = [
    {
      id: 'p7-ad1-147',
      content: { passage: adText, question: 'What is suggested about the car?' },
      options: ['It was recently repaired.', 'It has had more than one owner.', 'It is very fuel efficient.', 'It has been on sale for six months.'],
      answer: 'A',
      explanation: 'The ad mentions struts replaced two weeks ago and brakes/tires replaced six months ago – indicating recent repairs.',
      tags: ['advertisement', 'reading'],
      isDiagnostic: true,
    },
    {
      id: 'p7-ad1-148',
      content: { passage: adText, question: 'According to the advertisement, why is Ms. Ghorbani selling her car?' },
      options: ['She cannot repair the car\'s temperature control.', 'She finds it difficult to maintain.', 'She would like to have a newer model.', 'She is leaving for another country.'],
      answer: 'D',
      explanation: 'The ad states "Owner going overseas at the end of this month and must sell the car."',
      tags: ['advertisement', 'reading'],
    },
    {
      id: 'p7-article1-149',
      content: { passage: articleText, question: 'What is suggested about Mr. Benavidez?' },
      options: [
        'He has hired Salinas Products to distribute his products.',
        'He has agreed to sell his business to Salinas Products.',
        'He has recently been hired as an employee of a school.',
        'He has been chosen to be the new president of Salinas Products.',
      ],
      answer: 'B',
      explanation: 'The article states he made the decision to sell to Salinas.',
      tags: ['article', 'inference'],
      isDiagnostic: true,
    },
    {
      id: 'p7-article1-150',
      content: { passage: articleText, question: 'According to the article, where is Mr. Benavidez from?' },
      options: ['Cancún', 'Veracruz', 'Mexico City', 'Puerto Vallarta'],
      answer: 'A',
      explanation: 'The article says he "opened a small food stand in his hometown of Cancún."',
      tags: ['article', 'detail'],
    },
    {
      id: 'p7-article1-151',
      content: { passage: articleText, question: 'What is indicated about the Pablo\'s restaurant chain?' },
      options: [
        'It was recently sold in an auction.',
        'It will soon change its name.',
        'It was founded 40 years ago.',
        'It operates in several countries.',
      ],
      answer: 'C',
      explanation: 'Mr. Benavidez started the business 40 years ago.',
      tags: ['article', 'detail'],
    },
  ]

  for (const q of part7) {
    await prisma.question.upsert({
      where: { id: q.id },
      update: {},
      create: { ...q, section: 'READING', part: 7, type: 'SINGLE_PASSAGE', difficulty: 3 },
    })
  }

  // ─── LISTENING: Part 1 – Photographs ──────────────────────────────────────
  // All images verified: person(s) clearly visible, scene matches correct transcript statement.
  const part1 = [
    {
      id: 'p1-outdoor-1',
      content: {
        imageUrl: 'https://images.pexels.com/photos/8926955/pexels-photo-8926955.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        transcript: ['He\'s shoveling some soil.', 'He\'s moving a wheelbarrow.', 'He\'s cutting some grass.', 'He\'s planting a tree.'],
      },
      options: ['A', 'B', 'C', 'D'],
      answer: 'A',
      explanation: 'The person is shoveling a pile of dark soil outdoors. Options B, C, and D describe actions not visible in the photo.',
      tags: ['outdoor', 'action'],
      isDiagnostic: true,
    },
    {
      id: 'p1-office-2',
      content: {
        imageUrl: 'https://images.pexels.com/photos/5685872/pexels-photo-5685872.jpeg?auto=compress&cs=tinysrgb&w=1200',
        transcript: ['They\'re moving some furniture.', 'They\'re entering a meeting room.', 'They\'re sitting at a table.', 'They\'re cleaning the carpet.'],
      },
      options: ['A', 'B', 'C', 'D'],
      answer: 'C',
      explanation: 'Two people are clearly sitting across from each other at a table in an office setting. Options A, B, and D do not match the scene.',
      tags: ['office', 'people'],
      isDiagnostic: true,
    },
    {
      id: 'p1-desk-3',
      content: {
        imageUrl: 'https://images.pexels.com/photos/5237979/pexels-photo-5237979.jpeg?auto=compress&cs=tinysrgb&w=1200',
        transcript: ['She\'s typing on a laptop computer.', 'She\'s talking on the telephone.', 'She\'s filing some documents.', 'She\'s looking out the window.'],
      },
      options: ['A', 'B', 'C', 'D'],
      answer: 'A',
      explanation: 'The woman is working on a laptop computer at her desk.',
      tags: ['office', 'desk', 'laptop'],
      isDiagnostic: false,
    },
    {
      id: 'p1-cafe-4',
      content: {
        imageUrl: 'https://images.pexels.com/photos/8067924/pexels-photo-8067924.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        transcript: ['The waiter is taking orders.', 'The cafe has no customers.', 'People are sitting at tables in a cafe.', 'The tables are being cleared.'],
      },
      options: ['A', 'B', 'C', 'D'],
      answer: 'C',
      explanation: 'The photo shows customers seated at tables inside a cafe.',
      tags: ['cafe', 'restaurant', 'customers'],
      isDiagnostic: false,
    },
    {
      id: 'p1-construction-5',
      content: {
        imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=900&q=80&auto=format&fit=crop',
        transcript: ['Workers are painting a building.', 'Workers are wearing safety helmets on a construction site.', 'The construction site is empty.', 'Equipment is being loaded onto a truck.'],
      },
      options: ['A', 'B', 'C', 'D'],
      answer: 'B',
      explanation: 'The photograph shows construction workers wearing safety helmets at a work site.',
      tags: ['construction', 'workers', 'outdoor'],
      isDiagnostic: false,
    },
    {
      id: 'p1-store-6',
      content: {
        imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=900&q=80&auto=format&fit=crop',
        transcript: ['The shelves are being restocked.', 'The store is under renovation.', 'A customer is at the checkout counter.', 'Products are being removed from display.'],
      },
      options: ['A', 'B', 'C', 'D'],
      answer: 'C',
      explanation: 'The image shows a customer at a retail checkout counter.',
      tags: ['store', 'retail', 'checkout'],
      isDiagnostic: false,
    },
    {
      id: 'p1-colleagues-7',
      content: {
        imageUrl: 'https://images.pexels.com/photos/7651557/pexels-photo-7651557.jpeg?auto=compress&cs=tinysrgb&w=1200',
        transcript: ['Two colleagues are reviewing a document together.', 'They are eating lunch at a table.', 'One person is giving a presentation.', 'They are working on separate computers.'],
      },
      options: ['A', 'B', 'C', 'D'],
      answer: 'A',
      explanation: 'Two colleagues are looking at a document together in a professional setting.',
      tags: ['office', 'colleagues', 'document'],
      isDiagnostic: false,
    },
    {
      id: 'p1-airport-8',
      content: {
        imageUrl: 'https://images.pexels.com/photos/23848598/pexels-photo-23848598.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        transcript: ['An aircraft is being repaired.', 'Passengers are waiting in an airport terminal.', 'Luggage is being loaded onto a plane.', 'The runway is being inspected.'],
      },
      options: ['A', 'B', 'C', 'D'],
      answer: 'B',
      explanation: 'The photo shows passengers in an airport terminal waiting area.',
      tags: ['airport', 'terminal', 'travel'],
      isDiagnostic: false,
    },
    {
      id: 'p1-restaurant-9',
      content: {
        imageUrl: 'https://images.pexels.com/photos/11186008/pexels-photo-11186008.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        transcript: ['Diners are seated at restaurant tables.', 'The restaurant is being set up for service.', 'Kitchen staff are preparing food.', 'Chairs are stacked on the tables.'],
      },
      options: ['A', 'B', 'C', 'D'],
      answer: 'A',
      explanation: 'The photo shows guests seated at tables in a restaurant.',
      tags: ['restaurant', 'dining', 'indoor'],
      isDiagnostic: false,
    },
    {
      id: 'p1-phone-10',
      content: {
        imageUrl: 'https://images.pexels.com/photos/7156237/pexels-photo-7156237.jpeg?auto=compress&cs=tinysrgb&w=1200',
        transcript: ['The man is typing on a keyboard.', 'He is attending a video conference.', 'He is speaking on the telephone.', 'He is reading a report.'],
      },
      options: ['A', 'B', 'C', 'D'],
      answer: 'C',
      explanation: 'The businessman is holding a phone and speaking into it.',
      tags: ['office', 'phone', 'business'],
      isDiagnostic: false,
    },
    {
      id: 'p1-market-11',
      content: {
        imageUrl: 'https://images.pexels.com/photos/33105198/pexels-photo-33105198.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        transcript: ['Vendors are displaying goods at market stalls.', 'Items are being packed into boxes.', 'The market is being cleaned.', 'A stall is being dismantled.'],
      },
      options: ['A', 'B', 'C', 'D'],
      answer: 'A',
      explanation: 'The photo shows vendors and their stalls at an outdoor market.',
      tags: ['market', 'vendors', 'outdoor'],
      isDiagnostic: false,
    },
    {
      id: 'p1-office-space-12',
      content: {
        imageUrl: 'https://images.pexels.com/photos/7534215/pexels-photo-7534215.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        transcript: ['The office is completely empty.', 'Chairs are arranged around a large table.', 'Workers are leaving the building.', 'Computers are being installed.'],
      },
      options: ['A', 'B', 'C', 'D'],
      answer: 'B',
      explanation: 'The photo shows a modern office with chairs arranged around a conference table.',
      tags: ['office', 'interior', 'furniture'],
      isDiagnostic: false,
    },
  ]

  for (const q of part1) {
    await prisma.question.upsert({
      where: { id: q.id },
      update: { content: q.content, explanation: q.explanation },
      create: { ...q, section: 'LISTENING', part: 1, type: 'PHOTOGRAPH', difficulty: 2 },
    })
  }

  // ─── LISTENING: Part 2 – Question-Response ────────────────────────────────
  const part2 = [
    {
      id: 'p2-location-7',
      content: {
        question: 'Where\'s the new fax machine?',
        responses: ['Next to the water fountain.', 'I\'ll send a fax tomorrow.', 'By Wednesday.'],
      },
      options: ['A', 'B', 'C'],
      answer: 'A',
      explanation: 'The question asks about location ("where"), so the location answer "Next to the water fountain" is correct.',
      tags: ['location', 'question-response'],
      isDiagnostic: true,
    },
    {
      id: 'p2-ability-8',
      content: {
        question: 'How well does Thomas play the violin?',
        responses: ['Sure, I really like it.', 'Oh, he\'s a professional.', 'I\'ll turn down the volume.'],
      },
      options: ['A', 'B', 'C'],
      answer: 'B',
      explanation: '"Oh, he\'s a professional" directly answers how well Thomas plays.',
      tags: ['ability', 'question-response'],
    },
    {
      id: 'p2-offer-9',
      content: {
        question: 'Martin, are you driving to the client meeting?',
        responses: ['Oh, would you like a ride?', 'Nice to meet you, too.', 'I thought it went well!'],
      },
      options: ['A', 'B', 'C'],
      answer: 'A',
      explanation: 'Confirming and offering a ride is the natural, relevant response.',
      tags: ['offer', 'question-response'],
      isDiagnostic: true,
    },
  ]

  for (const q of part2) {
    await prisma.question.upsert({
      where: { id: q.id },
      update: {},
      create: { ...q, section: 'LISTENING', part: 2, type: 'QUESTION_RESPONSE', difficulty: 2 },
    })
  }

  // ─── LISTENING: Part 3 – Conversation ─────────────────────────────────────
  const conv1 = `Woman: Hello. I'm calling about a coffee machine I purchased from your Web site. It stopped working even though I haven't had it for very long.\nMan: Oh, I'm sorry to hear that. Our warranty covers products for up to a year. Do you know when you bought it?\nWoman: I've had it for a little over a year, so the warranty has probably just expired. This is so disappointing.\nMan: Well, I'll tell you what we can do. Although we can't replace it, since you're a valued customer I can offer you a coupon for forty percent off your next purchase.`

  const part3 = [
    {
      id: 'p3-conv1-32',
      content: { transcript: conv1, question: 'Why is the woman calling?' },
      options: ['To cancel an order', 'To complain about a product', 'To redeem a gift card', 'To renew a warranty'],
      answer: 'B',
      explanation: 'The woman calls because her coffee machine stopped working – she is complaining about a product.',
      tags: ['conversation', 'reason'],
      isDiagnostic: true,
    },
    {
      id: 'p3-conv1-33',
      content: { transcript: conv1, question: 'What does the man ask the woman about?' },
      options: ['A model name', 'A brand of coffee', 'A catalog number', 'A date of purchase'],
      answer: 'D',
      explanation: 'The man asks "Do you know when you bought it?" – a date of purchase question.',
      tags: ['conversation', 'detail'],
    },
    {
      id: 'p3-conv1-34',
      content: { transcript: conv1, question: 'What does the man offer to do?' },
      options: ['Provide a discount', 'Send a free sample', 'Extend a warranty', 'Issue a refund'],
      answer: 'A',
      explanation: 'The man offers a coupon for 40% off the next purchase – a discount.',
      tags: ['conversation', 'offer'],
      isDiagnostic: true,
    },
  ]

  for (const q of part3) {
    await prisma.question.upsert({
      where: { id: q.id },
      update: {},
      create: { ...q, section: 'LISTENING', part: 3, type: 'CONVERSATION', difficulty: 3 },
    })
  }

  // ─── LISTENING: Part 4 – Talks ────────────────────────────────────────────
  const talk1 = `Hello Mr. Lee, this is Thomas from BKS Auto Shop calling with some information about your car repair. I know we told you that it would take until next week to get the part we ordered, but we got the part early, and I was able to finish the repair. We're going to be closing for the day in a few minutes, but you're welcome to come get your car anytime tomorrow. If you need a ride to the shop tomorrow, let me know, and I can arrange one for you.`

  const part4 = [
    {
      id: 'p4-talk1-71',
      content: { transcript: talk1, question: 'What does the speaker say about the repair?' },
      options: ['It is not required.', 'It has been finished early.', 'It will be inexpensive.', 'It is covered by a warranty.'],
      answer: 'B',
      explanation: 'The speaker says they got the part early and finished the repair ahead of schedule.',
      tags: ['talk', 'announcement'],
      isDiagnostic: true,
    },
    {
      id: 'p4-talk1-72',
      content: { transcript: talk1, question: 'When can the listener pick up his car?' },
      options: ['Today', 'Tomorrow', 'Next week', 'In two weeks'],
      answer: 'B',
      explanation: '"You\'re welcome to come get your car anytime tomorrow."',
      tags: ['talk', 'time'],
    },
    {
      id: 'p4-talk1-73',
      content: { transcript: talk1, question: 'What does the speaker offer to do?' },
      options: ['Look for a used part', 'Refund the cost of a charge', 'Send an invoice', 'Arrange a ride'],
      answer: 'D',
      explanation: '"If you need a ride to the shop tomorrow, let me know, and I can arrange one for you."',
      tags: ['talk', 'offer'],
      isDiagnostic: true,
    },
  ]

  for (const q of part4) {
    await prisma.question.upsert({
      where: { id: q.id },
      update: {},
      create: { ...q, section: 'LISTENING', part: 4, type: 'TALK', difficulty: 3 },
    })
  }

  // ─── SPEAKING: Diagnostic Tasks ───────────────────────────────────────────
  const speakingDiagnostic = [
    {
      id: 'sp-read-aloud-1',
      content: {
        text: 'If you\'re shopping, sightseeing and running around every minute, your vacation can seem like hard work. To avoid vacation stress, come to the Blue Valley Inn on beautiful Lake Mead. While staying at our inn, you\'ll breathe clean country air as you view spectacular sights. With its spacious rooms, swimming pool and many outdoor activities, the inn is the perfect place for a vacation you won\'t forget.',
        prepSeconds: 45,
        speakSeconds: 45,
      },
      options: null,
      answer: '',
      explanation: 'Focus on clear pronunciation, natural intonation, correct stress on key words, and appropriate pace. Do not rush.',
      tags: ['read-aloud', 'pronunciation'],
      isDiagnostic: true,
    },
    {
      id: 'sp-describe-picture-1',
      content: {
        // Busy covered market alleyway with vendors and shoppers (Unsplash free license)
        imageUrl: 'https://images.unsplash.com/photo-1741940847190-796e0bbd3105?fm=jpg&q=60&w=1200&auto=format&fit=crop',
        prompt: 'Describe the picture in as much detail as you can.',
        prepSeconds: 45,
        speakSeconds: 30,
        hints: ['foreground', 'background', 'actions', 'setting'],
      },
      options: null,
      answer: '',
      explanation: 'Describe foreground first, then background. Use "In the foreground...", "In the background...", "He/She seems to be...". Do not invent details.',
      tags: ['describe-picture', 'vocabulary'],
      isDiagnostic: true,
    },
    {
      id: 'sp-respond-free-1',
      content: {
        scenario: 'Imagine that a Canadian marketing firm is doing research in your country. You have agreed to participate in a telephone interview about television viewing.',
        questions: [
          { id: 'q5', text: 'How often do you watch television?', prepSeconds: 3, speakSeconds: 15 },
          { id: 'q6', text: 'What kinds of programs do you usually watch?', prepSeconds: 3, speakSeconds: 15 },
          { id: 'q7', text: 'Describe your favorite television program.', prepSeconds: 3, speakSeconds: 30 },
        ],
      },
      options: null,
      answer: '',
      explanation: 'Answer each question directly and completely. For Q7, use more detail: describe the show, why you like it, when you watch it.',
      tags: ['respond-questions', 'fluency'],
      isDiagnostic: true,
    },
    {
      id: 'sp-express-opinion-1',
      content: {
        prompt: 'Some people prefer to take a job that does not pay well but does provide a lot of time off from work. What is your opinion about taking a job with a low salary that has a lot of vacation time? Give reasons for your opinion.',
        prepSeconds: 45,
        speakSeconds: 60,
        structure: ['State opinion', 'Reason 1 + example', 'Reason 2 + example', 'Conclusion'],
      },
      options: null,
      answer: '',
      explanation: 'Use: "I personally believe that... for several reasons. Firstly... Secondly... In conclusion..." Give 2 clear reasons with examples.',
      tags: ['express-opinion', 'structure'],
      isDiagnostic: true,
    },
  ]

  for (const q of speakingDiagnostic) {
    await prisma.question.upsert({
      where: { id: q.id },
      update: { content: q.content },
      create: {
        ...q,
        section: 'SPEAKING',
        part: q.id.includes('read-aloud') ? 1 : q.id.includes('describe') ? 2 : q.id.includes('free') ? 3 : 5,
        type: q.id.includes('read-aloud') ? 'READ_ALOUD' : q.id.includes('describe') ? 'DESCRIBE_PICTURE' : q.id.includes('free') ? 'RESPOND_FREE' : 'EXPRESS_OPINION',
        difficulty: 3,
      },
    })
  }

  // ─── WRITING: Diagnostic Tasks ────────────────────────────────────────────
  const writingDiagnostic = [
    {
      id: 'wr-sentence-1',
      content: {
        // Modern airport terminal with passengers and luggage (Unsplash free license)
        imageUrl: 'https://images.unsplash.com/photo-1579324437489-dfcc701ca4cf?fm=jpg&q=60&w=1200&auto=format&fit=crop',
        keywords: ['airport terminal', 'so'],
        instructions: 'Write ONE sentence using both words/phrases. You may change the word forms and use them in any order.',
        timeLimitSec: 96, // 8 min / 5 questions = ~96s per question
      },
      options: null,
      answer: '',
      explanation: 'Example: "The cars are lined up outside the airport terminal, so travelers can quickly load their luggage." Use both keywords correctly in one grammatically complete sentence.',
      tags: ['write-sentence', 'grammar'],
      isDiagnostic: true,
    },
    {
      id: 'wr-email-1',
      content: {
        email: {
          from: 'Dale City Welcome Committee',
          to: 'New Dale City Resident',
          subject: 'Welcome to your new home!',
          body: 'Welcome! We would like to be the first to welcome you to Dale City. We know that there are many things to do when you move, from finding your way around town to setting up your utilities. Please contact us if you need any help at all.',
        },
        instructions: 'Respond to the e-mail as if you have recently moved to a new city. Make at least TWO requests for information.',
        timeLimitSec: 600, // 10 minutes
      },
      options: null,
      answer: '',
      explanation: 'Start with: "Dear [Committee]," — make 2+ clear requests using "Could you please tell me..." or "I would appreciate information about..." — end with "Best regards,"',
      tags: ['respond-email', 'organization'],
      isDiagnostic: true,
    },
    {
      id: 'wr-essay-1',
      content: {
        prompt: 'There are many ways to find a job: newspaper advertisements, Internet job search websites, and personal recommendations. What do you think is the best way to find a job? Give reasons or examples to support your opinion.',
        timeLimitSec: 1800, // 30 minutes
        minWords: 300,
        structure: ['Introduction + opinion', 'Reason 1 + example', 'Reason 2 + example', 'Optional Reason 3', 'Conclusion'],
      },
      options: null,
      answer: '',
      explanation: 'Structure: Intro (state opinion) → 2-3 body paragraphs with reasons/examples → Conclusion. Min 300 words. Use connectors: Firstly, Secondly, Moreover, In conclusion.',
      tags: ['opinion-essay', 'organization'],
      isDiagnostic: true,
    },
  ]

  for (const q of writingDiagnostic) {
    await prisma.question.upsert({
      where: { id: q.id },
      update: { content: q.content },
      create: {
        ...q,
        section: 'WRITING',
        part: q.id.includes('sentence') ? 1 : q.id.includes('email') ? 2 : 3,
        type: q.id.includes('sentence') ? 'WRITE_SENTENCE' : q.id.includes('email') ? 'RESPOND_EMAIL' : 'OPINION_ESSAY',
        difficulty: 3,
      },
    })
  }

  // ─── LISTENING: Part 2 – Additional Question-Response (3 options each) ───────
  const part2Extra = [
    {
      id: 'p2-statement-10',
      content: {
        question: 'The conference room needs to be set up for the afternoon presentation.',
        responses: ["I'll take care of it right away.", 'The presentation was excellent.', 'Yes, the room is on the third floor.'],
      },
      options: ['A', 'B', 'C'],
      answer: 'A',
      explanation: 'A declarative statement implying a task. Offering to handle it immediately is the most natural and appropriate response.',
      tags: ['statement-response', 'offer'],
    },
    {
      id: 'p2-time-11',
      content: {
        question: 'When does the new product line go on sale?',
        responses: ['Starting next Monday.', 'At the downtown location.', 'For about twenty dollars.'],
      },
      options: ['A', 'B', 'C'],
      answer: 'A',
      explanation: '"When" asks for a time, and "Starting next Monday" directly answers the question.',
      tags: ['time', 'question-response'],
    },
    {
      id: 'p2-who-12',
      content: {
        question: 'Who is responsible for approving the budget requests?',
        responses: ['The forms are on my desk.', 'Ms. Park in the finance department.', 'It was approved last week.'],
      },
      options: ['A', 'B', 'C'],
      answer: 'B',
      explanation: '"Who" asks for a person. "Ms. Park in the finance department" names the responsible person.',
      tags: ['person', 'question-response'],
    },
    {
      id: 'p2-yn-13',
      content: {
        question: 'Has the shipment from the overseas supplier arrived yet?',
        responses: ["Not yet — I'm expecting it by Thursday.", 'The supplier is based in Tokyo.', 'We ordered extra units last month.'],
      },
      options: ['A', 'B', 'C'],
      answer: 'A',
      explanation: 'A yes/no question about whether something has happened. "Not yet" directly answers it and adds useful information.',
      tags: ['yes-no', 'question-response'],
    },
    {
      id: 'p2-suggestion-14',
      content: {
        question: "Why don't we ask the design team to review the brochure before printing?",
        responses: ["That's a great idea.", 'The brochure was printed yesterday.', 'The design office is on the second floor.'],
      },
      options: ['A', 'B', 'C'],
      answer: 'A',
      explanation: 'A suggestion in the form of "Why don\'t we...". Agreeing it is a good idea is the most fitting response.',
      tags: ['suggestion', 'question-response'],
    },
  ]

  for (const q of part2Extra) {
    await prisma.question.upsert({
      where: { id: q.id },
      update: {},
      create: { ...q, section: 'LISTENING', part: 2, type: 'QUESTION_RESPONSE', difficulty: 2 },
    })
  }

  // ─── LISTENING: Part 3 – Additional Conversations ─────────────────────────
  const conv2 = `Woman: James, do you know if next Thursday's project update meeting is still on schedule? I heard there might be a conflict.
Man: Yes, actually. The director has a client visit that afternoon, so she's asked us to move it to Friday morning instead.
Woman: Friday morning works for me. Should I send an updated calendar invite to everyone on the team?
Man: That would be great. Let's say nine o'clock if that works for you.`

  const conv3WithGraphic = `Man: Hello, I'd like to register for one of the IT training courses, but I'm not sure which module is the right fit. I work mainly with the company's email systems.
Woman: Sure, I can help you with that. Each module covers a different area of IT. Since your role involves email, I'd recommend Module C — it goes into email systems and communication protocols in detail.
Man: That sounds perfect. Is it available on Wednesday mornings?
Woman: Module C runs on Tuesday and Thursday afternoons, but we can arrange a one-on-one session if those times don't work for you.`

  const part3Extra = [
    {
      id: 'p3-conv2-35',
      content: { transcript: conv2, question: 'What problem do the speakers discuss?' },
      options: ['A client cancelled an appointment.', 'A meeting room is unavailable.', 'A meeting has a scheduling conflict.', 'A project deadline was moved.'],
      answer: 'C',
      explanation: 'The woman asks if the meeting is still on, and the man explains the director has a conflict that afternoon.',
      tags: ['conversation', 'problem'],
    },
    {
      id: 'p3-conv2-36',
      content: { transcript: conv2, question: 'When will the meeting now take place?' },
      options: ['Thursday afternoon', 'Friday morning', 'Monday at nine', 'Next week sometime'],
      answer: 'B',
      explanation: 'The man says the director asked to move the meeting to Friday morning.',
      tags: ['conversation', 'time'],
      isDiagnostic: false,
    },
    {
      id: 'p3-conv2-37',
      content: { transcript: conv2, question: 'What does the woman offer to do?' },
      options: ['Contact the director directly', 'Book a new meeting room', 'Send an updated calendar invite', 'Prepare the meeting agenda'],
      answer: 'C',
      explanation: 'The woman asks "Should I send an updated calendar invite to everyone on the team?"',
      tags: ['conversation', 'offer'],
    },
    {
      id: 'p3-conv3-38',
      content: {
        transcript: conv3WithGraphic,
        question: 'Why is the man calling?',
        graphic: {
          type: 'list',
          title: 'IT Training Modules',
          headers: ['Module', 'Topic'],
          rows: [['Module A', 'Data Security Basics'], ['Module B', 'Cloud Storage Management'], ['Module C', 'Email Systems & Protocols'], ['Module D', 'Network Troubleshooting']],
        },
      },
      options: ['To report a technical problem', 'To register for a training course', 'To schedule a one-on-one session', 'To ask about IT department hours'],
      answer: 'B',
      explanation: 'The man says he would like to register for one of the IT training courses.',
      tags: ['conversation', 'reason'],
      isDiagnostic: true,
    },
    {
      id: 'p3-conv3-39',
      content: {
        transcript: conv3WithGraphic,
        question: 'What does the woman suggest the man do?',
        graphic: {
          type: 'list',
          title: 'IT Training Modules',
          headers: ['Module', 'Topic'],
          rows: [['Module A', 'Data Security Basics'], ['Module B', 'Cloud Storage Management'], ['Module C', 'Email Systems & Protocols'], ['Module D', 'Network Troubleshooting']],
        },
      },
      options: ['Sign up for all four modules', 'Speak with his supervisor first', 'Register for Module C', 'Attend a Thursday afternoon session'],
      answer: 'C',
      explanation: 'The woman recommends "Module C — it goes into email systems and communication protocols in detail."',
      tags: ['conversation', 'suggestion'],
    },
    {
      id: 'p3-conv3-40',
      content: {
        transcript: conv3WithGraphic,
        question: 'Look at the graphic. What is the topic of the module the woman recommends?',
        graphic: {
          type: 'list',
          title: 'IT Training Modules',
          headers: ['Module', 'Topic'],
          rows: [['Module A', 'Data Security Basics'], ['Module B', 'Cloud Storage Management'], ['Module C', 'Email Systems & Protocols'], ['Module D', 'Network Troubleshooting']],
        },
      },
      options: ['Data Security Basics', 'Cloud Storage Management', 'Email Systems & Protocols', 'Network Troubleshooting'],
      answer: 'C',
      explanation: 'The woman recommends Module C. According to the graphic, Module C covers "Email Systems & Protocols".',
      tags: ['conversation', 'graphic'],
      isDiagnostic: true,
    },
  ]

  for (const q of part3Extra) {
    await prisma.question.upsert({
      where: { id: q.id },
      update: {},
      create: { ...q, section: 'LISTENING', part: 3, type: 'CONVERSATION', difficulty: 3 },
    })
  }

  // ─── LISTENING: Part 4 – Additional Talks ─────────────────────────────────
  const talk2 = `Good morning, everyone. I'd like to take a moment to share an important update to our company's parking policy. Starting Monday of next week, all spaces in the east lot will be reserved exclusively for visitors and clients. All employees will be required to use the parking garage on Grant Street, one block north of our building. To access the garage, please collect a key card from the security desk on the ground floor. Cards will be available starting tomorrow. Please make sure to pick yours up before the weekend so there are no issues with your commute next week. If you have any questions, speak with someone from the facilities team. Thank you for your cooperation.`

  const talk3WithGraphic = `Welcome back from lunch, everyone, and thank you for joining us for the afternoon sessions. We have a wonderful lineup ahead. Our first speaker, Dr. Hartmann, will present her research on digital marketing trends — an area that continues to shape the industry. Following that, Ms. Yamamoto will share strategies for improving customer engagement. We'll then hear from Mr. Okafor, whose work in international e-commerce has received global recognition. The day will close with a panel discussion giving all attendees the chance to put your questions directly to our experts. Before we begin, please silence your mobile devices. You're welcome to write down questions throughout the afternoon for the final session. Let's have a productive afternoon.`

  const part4Extra = [
    {
      id: 'p4-talk2-74',
      content: { transcript: talk2, question: 'What is the main subject of the announcement?' },
      options: ['A change to employee working hours', 'A new office building location', 'An update to the parking policy', 'A renovation of the east wing'],
      answer: 'C',
      explanation: 'The speaker says "I\'d like to share an important update to our company\'s parking policy."',
      tags: ['talk', 'announcement'],
    },
    {
      id: 'p4-talk2-75',
      content: { transcript: talk2, question: 'Where must employees park starting next week?' },
      options: ['In the east lot', 'Behind the main building', 'At the Grant Street garage', 'At a nearby public car park'],
      answer: 'C',
      explanation: 'The speaker says employees must use "the parking garage on Grant Street, one block north of our building."',
      tags: ['talk', 'location'],
      isDiagnostic: true,
    },
    {
      id: 'p4-talk2-76',
      content: { transcript: talk2, question: 'What are employees asked to do before the weekend?' },
      options: ['Update their commuter pass', 'Register their vehicle online', 'Collect a key card', 'Speak with the facilities team'],
      answer: 'C',
      explanation: '"Please make sure to pick yours [the key card] up before the weekend."',
      tags: ['talk', 'action'],
    },
    {
      id: 'p4-talk3-77',
      content: {
        transcript: talk3WithGraphic,
        question: 'What is the purpose of the announcement?',
        graphic: {
          type: 'schedule',
          title: 'Afternoon Conference Sessions',
          headers: ['Time', 'Speaker', 'Topic'],
          rows: [['1:00 PM', 'Dr. Hartmann', 'Digital Marketing Trends'], ['2:15 PM', 'Ms. Yamamoto', 'Customer Engagement Strategies'], ['3:30 PM', 'Mr. Okafor', 'E-commerce & Global Markets'], ['4:45 PM', 'Panel', 'Q&A: The Future of Business']],
        },
      },
      options: ['To introduce the morning speakers', 'To present the afternoon schedule', 'To announce a change of venue', 'To welcome new conference attendees'],
      answer: 'B',
      explanation: 'The speaker introduces the afternoon lineup of presenters and sessions.',
      tags: ['talk', 'purpose'],
      isDiagnostic: true,
    },
    {
      id: 'p4-talk3-78',
      content: {
        transcript: talk3WithGraphic,
        question: 'What does the speaker say attendees can do during the final session?',
        graphic: {
          type: 'schedule',
          title: 'Afternoon Conference Sessions',
          headers: ['Time', 'Speaker', 'Topic'],
          rows: [['1:00 PM', 'Dr. Hartmann', 'Digital Marketing Trends'], ['2:15 PM', 'Ms. Yamamoto', 'Customer Engagement Strategies'], ['3:30 PM', 'Mr. Okafor', 'E-commerce & Global Markets'], ['4:45 PM', 'Panel', 'Q&A: The Future of Business']],
        },
      },
      options: ['Purchase conference materials', 'Network with other participants', 'Ask questions to the experts', 'View a product demonstration'],
      answer: 'C',
      explanation: '"The day will close with a panel discussion giving all attendees the chance to put your questions directly to our experts."',
      tags: ['talk', 'detail'],
    },
    {
      id: 'p4-talk3-79',
      content: {
        transcript: talk3WithGraphic,
        question: 'Look at the graphic. What is the topic of the second afternoon presentation?',
        graphic: {
          type: 'schedule',
          title: 'Afternoon Conference Sessions',
          headers: ['Time', 'Speaker', 'Topic'],
          rows: [['1:00 PM', 'Dr. Hartmann', 'Digital Marketing Trends'], ['2:15 PM', 'Ms. Yamamoto', 'Customer Engagement Strategies'], ['3:30 PM', 'Mr. Okafor', 'E-commerce & Global Markets'], ['4:45 PM', 'Panel', 'Q&A: The Future of Business']],
        },
      },
      options: ['Digital Marketing Trends', 'Customer Engagement Strategies', 'E-commerce & Global Markets', 'Q&A: The Future of Business'],
      answer: 'B',
      explanation: 'The second row of the schedule shows Ms. Yamamoto presenting "Customer Engagement Strategies" at 2:15 PM.',
      tags: ['talk', 'graphic'],
      isDiagnostic: true,
    },
  ]

  for (const q of part4Extra) {
    await prisma.question.upsert({
      where: { id: q.id },
      update: {},
      create: { ...q, section: 'LISTENING', part: 4, type: 'TALK', difficulty: 3 },
    })
  }

  // ─── READING: Part 7 – Text Message Chain ─────────────────────────────────
  const messages152_153 = [
    { sender: 'Sarah Chen', time: '10:14 AM', text: "Hi David, do you have the final version of the quarterly report ready? The director wants it by noon." },
    { sender: 'David Park', time: '10:17 AM', text: "Almost done! I'm just adding the charts for Section 3. Give me about 20 minutes." },
    { sender: 'Sarah Chen', time: '10:18 AM', text: "No problem. Should you send it directly to her, or should I forward it once you send it to me?" },
    { sender: 'David Park', time: '10:20 AM', text: "Please forward it once I send it to you — I don't have her updated email address." },
    { sender: 'Sarah Chen', time: '10:21 AM', text: "Got it. I'll take care of it." },
  ]

  const part7Messages = [
    {
      id: 'p7-messages-152',
      content: { messages: messages152_153, question: 'What does Sarah ask David about?' },
      options: ['Whether he has a new email address', 'Whether the quarterly report is finished', 'Whether the director is available at noon', 'Whether Section 3 needs any changes'],
      answer: 'B',
      explanation: 'Sarah\'s first message is: "do you have the final version of the quarterly report ready?"',
      tags: ['messages', 'detail'],
      isDiagnostic: true,
    },
    {
      id: 'p7-messages-153',
      content: { messages: messages152_153, question: 'Why does David ask Sarah to forward the document?' },
      options: ["He has not finished writing it yet.", "He does not have the director's updated email address.", 'He wants Sarah to review it first.', 'He will be away from his desk at noon.'],
      answer: 'B',
      explanation: 'David says: "I don\'t have her updated email address" — so he cannot send it directly.',
      tags: ['messages', 'reason'],
    },
  ]

  for (const q of part7Messages) {
    await prisma.question.upsert({
      where: { id: q.id },
      update: {},
      create: { ...q, section: 'READING', part: 7, type: 'SINGLE_PASSAGE', difficulty: 3 },
    })
  }

  // ─── READING: Part 7 – Double Passage ─────────────────────────────────────
  const dpPassages = [
    {
      title: 'Job Advertisement',
      text: `MARKETING COORDINATOR
Thornfield Communications — Boston, MA

Thornfield Communications, a leading public relations firm, is seeking an energetic Marketing Coordinator to join our growing team. The ideal candidate will have at least two years of experience in digital marketing and a strong understanding of social media platforms.

Key Responsibilities:
• Develop and manage content across social media channels
• Coordinate with the design team to produce marketing materials
• Analyze campaign performance and prepare monthly reports
• Assist with organizing client events and promotional activities

Requirements:
• Bachelor's degree in Marketing, Communications, or a related field
• Proficiency in Microsoft Office and marketing analytics tools
• Excellent written and verbal communication skills
• Ability to work effectively in a fast-paced team environment

To apply, send your résumé and a cover letter to careers@thornfieldcomms.com by April 30.`,
    },
    {
      title: 'E-mail',
      text: `From: Priya Anand
To: careers@thornfieldcomms.com
Subject: Application – Marketing Coordinator Position
Date: April 22

Dear Hiring Team,

I am writing to express my strong interest in the Marketing Coordinator position advertised on your company website. With over three years of experience in digital marketing and a proven track record in social media management, I believe I would be an excellent fit for your team.

In my current role at Greenway Media, I manage five social media accounts with a combined following of over 200,000 subscribers and regularly produce performance reports for senior leadership. I also helped coordinate our annual marketing conference last year, which was attended by more than 500 industry professionals.

I have attached my résumé and a cover letter for your consideration. I look forward to the opportunity to discuss how my skills can contribute to Thornfield Communications.

Best regards,
Priya Anand`,
    },
  ]

  const part7Double = [
    {
      id: 'p7-double-176',
      content: { passages: dpPassages, question: 'What type of company is Thornfield Communications?' },
      options: ['A marketing analytics firm', 'A public relations firm', 'A social media agency', 'A recruiting company'],
      answer: 'B',
      explanation: 'The advertisement states: "Thornfield Communications, a leading public relations firm."',
      tags: ['double-passage', 'detail'],
      isDiagnostic: true,
    },
    {
      id: 'p7-double-177',
      content: { passages: dpPassages, question: 'What is NOT listed as a requirement for the position?' },
      options: ['Proficiency in a foreign language', 'A degree in a related field', 'Written communication skills', 'Knowledge of marketing analytics tools'],
      answer: 'A',
      explanation: 'The ad lists degree, Microsoft Office/analytics proficiency, and communication skills — but foreign language ability is not mentioned.',
      tags: ['double-passage', 'not-mentioned'],
    },
    {
      id: 'p7-double-178',
      content: { passages: dpPassages, question: 'Why is Priya Anand writing the e-mail?' },
      options: ['To request more information about the company', 'To apply for the Marketing Coordinator position', 'To follow up on a previous application', 'To recommend a colleague for the role'],
      answer: 'B',
      explanation: 'Priya states: "I am writing to express my strong interest in the Marketing Coordinator position."',
      tags: ['double-passage', 'purpose'],
    },
    {
      id: 'p7-double-179',
      content: { passages: dpPassages, question: 'What is suggested about Priya Anand?' },
      options: ['She currently works at Thornfield Communications.', 'She has less experience than the position requires.', 'She exceeds the minimum experience requirement.', 'She did not include a cover letter with her application.'],
      answer: 'C',
      explanation: 'The position requires at least two years of experience. Priya states she has "over three years" — exceeding the requirement.',
      tags: ['double-passage', 'inference'],
    },
    {
      id: 'p7-double-180',
      content: { passages: dpPassages, question: 'According to the e-mail, what did Priya help coordinate last year?' },
      options: ['A product launch campaign', 'A company-wide training seminar', 'An annual marketing conference', 'A social media advertising campaign'],
      answer: 'C',
      explanation: '"I also helped coordinate our annual marketing conference last year, which was attended by more than 500 industry professionals."',
      tags: ['double-passage', 'detail'],
    },
  ]

  for (const q of part7Double) {
    await prisma.question.upsert({
      where: { id: q.id },
      update: {},
      create: { ...q, section: 'READING', part: 7, type: 'DOUBLE_PASSAGE', difficulty: 4 },
    })
  }

  // ─── READING: Part 7 – Triple Passage ─────────────────────────────────────
  const tpPassages = [
    {
      title: 'Notice',
      text: `Elmwood Business District
Community Improvement Grant Program

The Elmwood Business District is pleased to announce its annual Community Improvement Grant Program. Local businesses and organizations are invited to apply for grants of up to $5,000 to fund projects that benefit the community, such as storefront renovations, local events, or environmental initiatives.

Applications must be submitted online by May 15. All funded projects must be completed within six months of approval. Applicants will be notified of results by June 1.

For more information, visit www.elmwoodbiz.org/grants or call (617) 555-0190.`,
    },
    {
      title: 'Grant Application',
      text: `Applicant Name: Rosa Delgado
Business Name: Bloom & Grow Garden Center
Project Title: Community Rooftop Garden
Requested Amount: $4,500
Project Description: We plan to convert our unused rooftop space into a community garden where local residents can grow vegetables and flowers. The project will include installation of raised garden beds, an irrigation system, and a seating area for visitors.
Estimated Completion Date: October 31`,
    },
    {
      title: 'E-mail',
      text: `From: Elmwood Business District Grant Committee
To: Rosa Delgado
Subject: Grant Application — Decision
Date: June 1

Dear Ms. Delgado,

We are pleased to inform you that your application for the Community Improvement Grant has been approved. Bloom & Grow Garden Center has been awarded $4,000 toward your Community Rooftop Garden project.

Please note that the awarded amount is slightly less than requested due to budget constraints this cycle. Funds will be deposited into your business account within five business days.

To confirm your acceptance, please reply to this e-mail by June 10. You will also need to submit a progress report at the project's halfway point and a final report upon completion.

Congratulations, and we look forward to seeing this project come to life.

Best regards,
Elmwood Business District Grant Committee`,
    },
  ]

  const part7Triple = [
    {
      id: 'p7-triple-196',
      content: { passages: tpPassages, question: 'What is the maximum grant amount available through the program?' },
      options: ['$3,000', '$4,000', '$4,500', '$5,000'],
      answer: 'D',
      explanation: 'The notice states grants of "up to $5,000" are available.',
      tags: ['triple-passage', 'detail'],
      isDiagnostic: true,
    },
    {
      id: 'p7-triple-197',
      content: { passages: tpPassages, question: 'By what date must applications be submitted?' },
      options: ['April 30', 'May 15', 'June 1', 'June 10'],
      answer: 'B',
      explanation: 'The notice states: "Applications must be submitted online by May 15."',
      tags: ['triple-passage', 'detail'],
    },
    {
      id: 'p7-triple-198',
      content: { passages: tpPassages, question: 'What is the purpose of Rosa Delgado\'s project?' },
      options: ['To renovate the exterior of her shop', 'To host a local community event', 'To create a garden space for residents', 'To install an irrigation system for sale'],
      answer: 'C',
      explanation: 'The application describes converting rooftop space "into a community garden where local residents can grow vegetables and flowers."',
      tags: ['triple-passage', 'purpose'],
    },
    {
      id: 'p7-triple-199',
      content: { passages: tpPassages, question: 'What is indicated about the amount Rosa was awarded?' },
      options: ['It matches the amount she requested.', 'It is more than she requested.', 'It is less than she requested.', 'It has not yet been determined.'],
      answer: 'C',
      explanation: 'Rosa requested $4,500 but was awarded $4,000. The email notes the difference is "due to budget constraints this cycle."',
      tags: ['triple-passage', 'inference'],
    },
    {
      id: 'p7-triple-200',
      content: { passages: tpPassages, question: 'What must Rosa do to accept the grant?' },
      options: ['Call the grant committee by June 1', 'Reply to the e-mail by June 10', 'Submit a project plan by May 15', 'Attend an in-person meeting at the district office'],
      answer: 'B',
      explanation: 'The e-mail states: "To confirm your acceptance, please reply to this e-mail by June 10."',
      tags: ['triple-passage', 'action'],
    },
  ]

  for (const q of part7Triple) {
    await prisma.question.upsert({
      where: { id: q.id },
      update: {},
      create: { ...q, section: 'READING', part: 7, type: 'TRIPLE_PASSAGE', difficulty: 5 },
    })
  }

  const counts = {
    reading: part5.length + part6.length + part7.length + part7Messages.length + part7Double.length + part7Triple.length,
    listening: part1.length + part2.length + part2Extra.length + part3.length + part3Extra.length + part4.length + part4Extra.length,
    speaking: speakingDiagnostic.length,
    writing: writingDiagnostic.length,
  }

  console.log(`✅ Seeded:`)
  console.log(`   Reading:   ${counts.reading} questions (Parts 5-7)`)
  console.log(`   Listening: ${counts.listening} questions (Parts 1-4)`)
  console.log(`   Speaking:  ${counts.speaking} diagnostic tasks`)
  console.log(`   Writing:   ${counts.writing} diagnostic tasks`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
