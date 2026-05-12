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

  // ─── LISTENING: Part 2 – Batch 3 (17 more questions) ──────────────────────
  const part2Batch3 = [
    {
      id: 'p2-how-15',
      content: { question: 'How did you hear about the conference?', responses: ['Through the company newsletter.', 'The conference is in Berlin.', 'It starts on Monday.'] },
      options: ['A', 'B', 'C'], answer: 'A',
      explanation: '"How did you hear" asks about the means. "Through the company newsletter" answers correctly.',
      tags: ['how', 'question-response'],
    },
    {
      id: 'p2-what-16',
      content: { question: 'What time does the budget workshop start?', responses: ['It covers accounting basics.', 'At half past nine.', 'On the third floor.'] },
      options: ['A', 'B', 'C'], answer: 'B',
      explanation: '"What time" asks for a time. "At half past nine" is the correct answer.',
      tags: ['time', 'question-response'],
    },
    {
      id: 'p2-indirect-17',
      content: { question: 'Do you know where I can find the project files?', responses: ['The project was very successful.', 'I finished them last week.', 'Check the shared drive in the main folder.'] },
      options: ['A', 'B', 'C'], answer: 'C',
      explanation: 'An indirect location question. Directing the person to the shared drive answers it.',
      tags: ['location', 'indirect'],
    },
    {
      id: 'p2-yn-18',
      content: { question: 'Is the finance director available for a meeting today?', responses: ["She's out of office until tomorrow.", 'The meeting lasted two hours.', 'Finance reports are due Friday.'] },
      options: ['A', 'B', 'C'], answer: 'A',
      explanation: 'A yes/no question about availability. "She\'s out of office until tomorrow" answers it directly.',
      tags: ['yes-no', 'availability'],
    },
    {
      id: 'p2-or-19',
      content: { question: 'Would you prefer to meet in the morning or the afternoon?', responses: ['The conference room is large.', 'Either works for me.', 'The meeting was very productive.'] },
      options: ['A', 'B', 'C'], answer: 'B',
      explanation: 'An either/or question about preference. "Either works for me" accepts both options.',
      tags: ['preference', 'or-question'],
    },
    {
      id: 'p2-why-20',
      content: { question: 'Why was the quarterly report delayed?', responses: ['It was delayed by a week.', 'By the end of the month.', "The data wasn't ready in time."] },
      options: ['A', 'B', 'C'], answer: 'C',
      explanation: '"Why" asks for a reason. "The data wasn\'t ready in time" provides the cause.',
      tags: ['why', 'reason'],
    },
    {
      id: 'p2-neg-21',
      content: { question: "Didn't you say the client wants the proposal by Thursday?", responses: ['Yes, Thursday at the latest.', 'The client seems satisfied.', "I'll check my schedule."] },
      options: ['A', 'B', 'C'], answer: 'A',
      explanation: 'Negative questions confirm expectations. "Yes, Thursday at the latest" confirms.',
      tags: ['negative', 'confirmation'],
    },
    {
      id: 'p2-how-long-22',
      content: { question: 'How long will the office renovation take?', responses: ['In the new wing.', 'About three months.', 'It costs a lot.'] },
      options: ['A', 'B', 'C'], answer: 'B',
      explanation: '"How long" asks for duration. "About three months" answers with a time period.',
      tags: ['duration', 'how-long'],
    },
    {
      id: 'p2-which-23',
      content: { question: 'Which department is handling the new account?', responses: ['The account was just opened.', 'Sales and marketing.', 'A large corporation.'] },
      options: ['A', 'B', 'C'], answer: 'B',
      explanation: '"Which department" asks for a department name. "Sales and marketing" identifies it.',
      tags: ['which', 'department'],
    },
    {
      id: 'p2-statement-24',
      content: { question: 'I need someone to cover my shift on Friday.', responses: ["I can do it if no one else can.", 'Friday is a busy day.', 'The shift was very long.'] },
      options: ['A', 'B', 'C'], answer: 'A',
      explanation: 'A request for coverage. Offering to help is the most natural and direct response.',
      tags: ['statement', 'offer'],
    },
    {
      id: 'p2-how-much-25',
      content: { question: 'How much does the premium membership cost?', responses: ['For new members only.', 'Eighty-five dollars per year.', 'The membership card arrived.'] },
      options: ['A', 'B', 'C'], answer: 'B',
      explanation: '"How much" asks for a price. "Eighty-five dollars per year" gives the cost.',
      tags: ['price', 'how-much'],
    },
    {
      id: 'p2-shouldnt-26',
      content: { question: "Shouldn't we book the venue well in advance?", responses: ['I already called them yesterday.', 'The venue was beautiful.', 'About thirty guests will attend.'] },
      options: ['A', 'B', 'C'], answer: 'A',
      explanation: 'A suggestion phrased as a negative question. Having already acted addresses the concern.',
      tags: ['suggestion', 'negative-question'],
    },
    {
      id: 'p2-who-27',
      content: { question: 'Who is in charge of the client onboarding process?', responses: ['The human resources team.', 'The client called this morning.', 'The process takes about a week.'] },
      options: ['A', 'B', 'C'], answer: 'A',
      explanation: '"Who is in charge" asks for a person or group. "The human resources team" answers it.',
      tags: ['who', 'responsibility'],
    },
    {
      id: 'p2-directions-28',
      content: { question: "What's the quickest way to get to the convention center?", responses: ['The event starts at nine.', "It's very close to downtown.", 'Take the express subway from Central Station.'] },
      options: ['A', 'B', 'C'], answer: 'C',
      explanation: '"What\'s the quickest way" asks for directions. "Take the express subway" gives specific directions.',
      tags: ['directions', 'how'],
    },
    {
      id: 'p2-statement-29',
      content: { question: 'The new employee handbook has some updates about overtime policy.', responses: ["I haven't read it yet.", 'Overtime is rarely necessary.', 'The handbook is on the shelf.'] },
      options: ['A', 'B', 'C'], answer: 'A',
      explanation: 'An informational statement. Acknowledging you haven\'t read it yet is the most natural response.',
      tags: ['statement', 'acknowledgement'],
    },
    {
      id: 'p2-yn-30',
      content: { question: 'Has the IT team fixed the network connection issue?', responses: ['The IT department is on level four.', "They're still working on it.", 'Network cables are on order.'] },
      options: ['A', 'B', 'C'], answer: 'B',
      explanation: 'A yes/no question about completion. "They\'re still working on it" gives a partial status update.',
      tags: ['yes-no', 'status'],
    },
    {
      id: 'p2-how-often-31',
      content: { question: 'How often does the team hold performance reviews?', responses: ["It's quite a long process.", 'Twice a year.', 'With the full management team.'] },
      options: ['A', 'B', 'C'], answer: 'B',
      explanation: '"How often" asks for frequency. "Twice a year" answers with the frequency.',
      tags: ['frequency', 'how-often'],
    },
  ]

  for (const q of part2Batch3) {
    await prisma.question.upsert({
      where: { id: q.id },
      update: {},
      create: { ...q, section: 'LISTENING', part: 2, type: 'QUESTION_RESPONSE', difficulty: 2 },
    })
  }

  // ─── LISTENING: Part 3 – Batch 3 (4 more conversations × 3 = 12 questions) ─
  const conv4 = `Woman: Good afternoon, Bayview Hotel, how can I help you?
Man: Yes, I made a reservation for next weekend under the name Harris. I'd like to upgrade to an ocean view room if possible.
Woman: Let me check availability… yes, we have one ocean view suite available on Saturday and Sunday. It would be an additional sixty dollars per night.
Man: That sounds perfect. Please go ahead and make that change. And could you also arrange an airport transfer for Saturday morning?
Woman: Of course. Just let me know your arrival time and flight number and we'll have a driver waiting for you.`

  const conv5 = `Man: Hi, I need to make a dinner reservation for six people this Friday evening.
Woman: Of course. What time were you thinking?
Man: Around seven thirty, if you have availability. It's for a client dinner, so we'd prefer a quieter table if possible.
Woman: We do have a table available at seven thirty near our private dining area. Could I get your name and a contact number?
Man: It's under Yamamoto — Y-A-M-A-M-O-T-O. My number is 555-0183.`

  const conv6 = `Woman: Excuse me, Mark. Do you know if we have any printer paper left in stock? The printer on our floor has run out.
Man: I think there are a few reams in the supply room on the third floor. If not, there's a supply request form on the intranet and we usually get next-day delivery if submitted before noon.
Woman: Thanks — I'll check up there first.
Man: Also, if you need more than two reams, you'll need your manager to approve the request. Just a heads-up.`

  const conv7 = `Man: Hi, I was hoping to sign up for the Excel training session next month. Is registration still open?
Woman: Yes, there are still a few spots available. The session is on March 14th from ten to one in Conference Room B. Would you like me to add you?
Man: Please. My employee ID is 7421. Is there anything I need to prepare in advance?
Woman: We'll send you a preparation guide about a week before the session. Just make sure to bring your laptop — the training involves hands-on exercises.`

  const part3Batch3 = [
    {
      id: 'p3-conv4-41',
      content: { transcript: conv4, question: 'What does the man want to do?' },
      options: ['Cancel his hotel reservation', 'Upgrade to a better room', 'Extend his stay at the hotel', 'Request a group discount'],
      answer: 'B',
      explanation: 'The man says "I\'d like to upgrade to an ocean view room if possible."',
      tags: ['conversation', 'purpose'], isDiagnostic: false,
    },
    {
      id: 'p3-conv4-42',
      content: { transcript: conv4, question: 'How much extra will the upgrade cost per night?' },
      options: ['Forty dollars', 'Fifty dollars', 'Sixty dollars', 'Eighty dollars'],
      answer: 'C',
      explanation: 'The woman says "It would be an additional sixty dollars per night."',
      tags: ['conversation', 'price'],
    },
    {
      id: 'p3-conv4-43',
      content: { transcript: conv4, question: 'What additional service does the man request?' },
      options: ['A late checkout', 'A room with breakfast included', 'An airport transfer', 'A restaurant reservation'],
      answer: 'C',
      explanation: 'The man asks "could you also arrange an airport transfer for Saturday morning?"',
      tags: ['conversation', 'request'], isDiagnostic: true,
    },
    {
      id: 'p3-conv5-44',
      content: { transcript: conv5, question: 'Why is the man making this reservation?' },
      options: ['For a birthday celebration', 'For a client dinner', 'For a team lunch', 'For a job interview'],
      answer: 'B',
      explanation: 'The man mentions "It\'s for a client dinner."',
      tags: ['conversation', 'purpose'],
    },
    {
      id: 'p3-conv5-45',
      content: { transcript: conv5, question: 'What time is the reservation?' },
      options: ['Seven o\'clock', 'Seven fifteen', 'Seven thirty', 'Eight o\'clock'],
      answer: 'C',
      explanation: 'The man asks for "around seven thirty" and the woman confirms availability at that time.',
      tags: ['conversation', 'time'],
    },
    {
      id: 'p3-conv5-46',
      content: { transcript: conv5, question: 'What special request does the man make?' },
      options: ['A specific menu option', 'A window seat', 'A quieter table', 'A private dining room'],
      answer: 'C',
      explanation: 'The man says "we\'d prefer a quieter table if possible."',
      tags: ['conversation', 'request'], isDiagnostic: true,
    },
    {
      id: 'p3-conv6-47',
      content: { transcript: conv6, question: 'What problem does the woman mention?' },
      options: ['Her computer has broken down.', 'The printer on her floor has run out of paper.', 'The supply room is locked.', 'An order was delivered incorrectly.'],
      answer: 'B',
      explanation: 'The woman says "the printer on our floor has run out" of paper.',
      tags: ['conversation', 'problem'],
    },
    {
      id: 'p3-conv6-48',
      content: { transcript: conv6, question: 'When must the supply request be submitted for next-day delivery?' },
      options: ['Before nine AM', 'Before ten AM', 'Before noon', 'Before three PM'],
      answer: 'C',
      explanation: 'The man says "we usually get next-day delivery if submitted before noon."',
      tags: ['conversation', 'deadline'],
    },
    {
      id: 'p3-conv6-49',
      content: { transcript: conv6, question: 'What does the man say about ordering more than two reams?' },
      options: ['There is no maximum order.', 'Extra stock is always available.', 'Manager approval is needed.', 'It takes two days to arrive.'],
      answer: 'C',
      explanation: '"If you need more than two reams, you\'ll need your manager to approve the request."',
      tags: ['conversation', 'policy'], isDiagnostic: true,
    },
    {
      id: 'p3-conv7-50',
      content: { transcript: conv7, question: 'What is the man trying to do?' },
      options: ['Register for a training session', 'Check on a previous registration', 'Schedule a one-on-one meeting', 'Request training materials'],
      answer: 'A',
      explanation: '"I was hoping to sign up for the Excel training session next month."',
      tags: ['conversation', 'purpose'],
    },
    {
      id: 'p3-conv7-51',
      content: { transcript: conv7, question: 'What information does the man provide?' },
      options: ['His department name', 'His employee ID number', 'His manager\'s name', 'His preferred training time'],
      answer: 'B',
      explanation: '"My employee ID is 7421." — he provides his employee ID.',
      tags: ['conversation', 'detail'],
    },
    {
      id: 'p3-conv7-52',
      content: { transcript: conv7, question: 'What does the woman say participants must bring?' },
      options: ['A printed workbook', 'A USB drive', 'A laptop computer', 'Their employee ID card'],
      answer: 'C',
      explanation: '"Just make sure to bring your laptop — the training involves hands-on exercises."',
      tags: ['conversation', 'requirement'], isDiagnostic: true,
    },
  ]

  for (const q of part3Batch3) {
    await prisma.question.upsert({
      where: { id: q.id },
      update: {},
      create: { ...q, section: 'LISTENING', part: 3, type: 'CONVERSATION', difficulty: 3 },
    })
  }

  // ─── LISTENING: Part 4 – Batch 3 (3 more talks × 3 = 9 questions) ──────────
  const talk4 = `And now a message from our sponsor. Are you looking for a new smartphone but put off by high retail prices? Visit TechMart this weekend for our biggest sale of the year. All smartphones are at least thirty percent off, and selected models are up to fifty percent off. Our expert staff will help you find the right device for your needs and budget. TechMart is located at two forty-five Central Avenue, and we are open Saturday and Sunday from nine AM to nine PM. Flexible financing options are also available. Don't miss this chance — these prices won't last!`

  const talk5 = `Good evening. In local business news, Greenfield Pharmaceuticals has announced plans to expand its downtown research facility. The company will add three new laboratories and hire approximately eighty additional researchers over the next two years. Company spokesperson Linda Chu stated that the expansion reflects growing demand for the company's allergy treatment line. Construction on the new wing is expected to begin this spring and be completed by the end of next year. The city council has expressed strong support for the project, noting its positive impact on local employment.`

  const talk6 = `Hello, this is Sandra Okonkwo from Premier Realty calling for Ms. Torres. I'm getting in touch about the property you inquired about on Maple Drive. I'm sorry to let you know the owners have already accepted another offer. However, a very similar property has just become available in the same neighborhood — it's slightly larger and priced very competitively. I'd love to arrange a viewing at your convenience. Please call me back at five-five-five, zero one four seven, or reply to the email I sent you earlier today. I look forward to hearing from you soon.`

  const part4Batch3 = [
    {
      id: 'p4-talk4-80',
      content: { transcript: talk4, question: 'What is being advertised?' },
      options: ['A laptop computer sale', 'A smartphone sale', 'A new store opening', 'A telecommunications service'],
      answer: 'B',
      explanation: 'The announcement is about a sale on smartphones at TechMart.',
      tags: ['talk', 'advertisement'],
    },
    {
      id: 'p4-talk4-81',
      content: { transcript: talk4, question: 'How much discount is available on all smartphones?' },
      options: ['At least ten percent off', 'At least twenty percent off', 'At least thirty percent off', 'At least fifty percent off'],
      answer: 'C',
      explanation: '"All smartphones are at least thirty percent off."',
      tags: ['talk', 'detail'], isDiagnostic: true,
    },
    {
      id: 'p4-talk4-82',
      content: { transcript: talk4, question: 'What additional option does TechMart offer customers?' },
      options: ['Free delivery', 'A trade-in program', 'Flexible financing', 'A one-year warranty'],
      answer: 'C',
      explanation: '"Flexible financing options are also available."',
      tags: ['talk', 'offer'],
    },
    {
      id: 'p4-talk5-83',
      content: { transcript: talk5, question: 'What is the news report mainly about?' },
      options: ['A pharmaceutical merger', 'Expansion of a research facility', 'New drug regulations', 'A city council meeting'],
      answer: 'B',
      explanation: 'The report describes Greenfield Pharmaceuticals\' plans to expand its research facility.',
      tags: ['talk', 'main-idea'],
    },
    {
      id: 'p4-talk5-84',
      content: { transcript: talk5, question: 'How many new researchers will be hired?' },
      options: ['About forty', 'About sixty', 'About eighty', 'About one hundred'],
      answer: 'C',
      explanation: '"The company will...hire approximately eighty additional researchers."',
      tags: ['talk', 'number'],
    },
    {
      id: 'p4-talk5-85',
      content: { transcript: talk5, question: 'According to Linda Chu, what has driven the expansion plans?' },
      options: ['A new government contract', 'Growing demand for the company\'s products', 'A recent merger with another company', 'Advances in laboratory technology'],
      answer: 'B',
      explanation: '"The expansion reflects growing demand for the company\'s allergy treatment line."',
      tags: ['talk', 'reason'], isDiagnostic: true,
    },
    {
      id: 'p4-talk6-86',
      content: { transcript: talk6, question: 'What is the purpose of this phone message?' },
      options: ['To confirm an upcoming viewing', 'To report on a property sale', 'To offer an alternative property', 'To request a callback about pricing'],
      answer: 'C',
      explanation: 'The agent calls to offer an alternative property since the original one was sold.',
      tags: ['talk', 'purpose'],
    },
    {
      id: 'p4-talk6-87',
      content: { transcript: talk6, question: 'What happened to the Maple Drive property?' },
      options: ['The price was reduced.', 'The owners withdrew the listing.', 'Another buyer made an offer.', 'It is undergoing renovation.'],
      answer: 'C',
      explanation: '"The owners have already accepted another offer."',
      tags: ['talk', 'detail'],
    },
    {
      id: 'p4-talk6-88',
      content: { transcript: talk6, question: 'How does the agent ask Ms. Torres to respond?' },
      options: ['By visiting the office in person', 'By calling back or replying to an email', 'By completing an online form', 'By sending a letter of interest'],
      answer: 'B',
      explanation: '"Please call me back... or reply to the email I sent you earlier today."',
      tags: ['talk', 'action'], isDiagnostic: true,
    },
  ]

  for (const q of part4Batch3) {
    await prisma.question.upsert({
      where: { id: q.id },
      update: {},
      create: { ...q, section: 'LISTENING', part: 4, type: 'TALK', difficulty: 3 },
    })
  }

  // ─── READING: Part 5 – Batch 2 (20 more questions) ────────────────────────
  const part5Batch2 = [
    {
      id: 'p5-conditional-10',
      content: { question: 'If the proposal ------- by Friday, the contract will be signed next week.' },
      options: ['is submitted', 'will be submitted', 'submits', 'submitting'],
      answer: 'A',
      explanation: 'First conditional: "If + simple present, will + base verb". "Is submitted" is the correct passive present.',
      tags: ['conditional', 'tense'],
    },
    {
      id: 'p5-comparative-11',
      content: { question: 'The new conference hall is far ------- than the original venue.' },
      options: ['more spacious', 'spacious', 'most spacious', 'the spacious'],
      answer: 'A',
      explanation: 'Comparative adjective: "more spacious than" (long adjectives use more/less).',
      tags: ['comparative', 'adjective'],
    },
    {
      id: 'p5-relative-12',
      content: { question: 'The consultant ------- was hired last month has already improved our customer service scores.' },
      options: ['who', 'whose', 'whom', 'which'],
      answer: 'A',
      explanation: '"Who" is the correct relative pronoun for a person in subject position.',
      tags: ['relative-pronoun', 'clause'],
    },
    {
      id: 'p5-passive-13',
      content: { question: 'All new employees are ------- to attend the orientation session next Monday.' },
      options: ['required', 'requiring', 'requirement', 'require'],
      answer: 'A',
      explanation: '"Be required to" is the passive modal construction meaning obligated.',
      tags: ['passive', 'adjective'], isDiagnostic: true,
    },
    {
      id: 'p5-preposition-14',
      content: { question: 'The board of directors will vote ------- the proposed merger at next month\'s meeting.' },
      options: ['on', 'at', 'to', 'for'],
      answer: 'A',
      explanation: '"Vote on" is the correct collocation when deciding about a proposal.',
      tags: ['preposition', 'collocation'],
    },
    {
      id: 'p5-article-15',
      content: { question: '------- annual performance review is scheduled to take place in December for all staff members.' },
      options: ['The', 'A', 'An', 'Each'],
      answer: 'C',
      explanation: '"An" is used before words starting with a vowel sound. "Annual" starts with the vowel sound /æ/.',
      tags: ['article', 'grammar'],
    },
    {
      id: 'p5-vocabulary-16',
      content: { question: "The marketing team's ------- approach to the campaign attracted attention from several industry publications." },
      options: ['reluctant', 'innovative', 'delayed', 'temporary'],
      answer: 'B',
      explanation: '"Innovative approach" means a creative, new way of doing something — fitting the context of attracting media attention.',
      tags: ['vocabulary', 'adjective'],
    },
    {
      id: 'p5-prepphrase-17',
      content: { question: 'The construction project was completed ------- schedule, thanks to the team\'s dedication.' },
      options: ['ahead of', 'in front of', 'forward of', 'prior at'],
      answer: 'A',
      explanation: '"Ahead of schedule" is the fixed phrase meaning earlier than planned.',
      tags: ['preposition', 'fixed-phrase'],
    },
    {
      id: 'p5-verb-form-18',
      content: { question: 'The supervisor instructed the staff ------- their uniforms properly at all times.' },
      options: ['wear', 'wearing', 'to wear', 'wore'],
      answer: 'C',
      explanation: '"Instruct someone to do" requires the infinitive: "instructed...to wear".',
      tags: ['verb-form', 'infinitive'],
    },
    {
      id: 'p5-noun-19',
      content: { question: 'All participants are asked to complete the ------- form before the event begins.' },
      options: ['registrant', 'registered', 'registering', 'registration'],
      answer: 'D',
      explanation: '"Registration form" — "registration" is the noun modifier for the form.',
      tags: ['noun', 'word-form'],
    },
    {
      id: 'p5-pronoun-20',
      content: { question: '------- who wish to participate in the survey can contact the research team directly.' },
      options: ['Those', 'Them', 'They', 'Their'],
      answer: 'A',
      explanation: '"Those who" means "the people who" — a pronoun + relative clause construction.',
      tags: ['pronoun', 'relative-clause'],
    },
    {
      id: 'p5-modal-21',
      content: { question: 'Employees ------- submit their expense reports no later than the fifth of each month.' },
      options: ['will', 'must', 'are', 'were'],
      answer: 'B',
      explanation: '"Must submit" expresses a strong obligation or requirement.',
      tags: ['modal', 'obligation'],
    },
    {
      id: 'p5-tense-22',
      content: { question: 'The annual shareholder meeting ------- next April at the Grand Meridian Hotel in Singapore.' },
      options: ['is being held', 'has been held', 'hold', 'had held'],
      answer: 'A',
      explanation: 'Present continuous ("is being held") is used for scheduled future events.',
      tags: ['tense', 'future-scheduled'],
    },
    {
      id: 'p5-noun-23',
      content: { question: 'Customer ------- is the top priority of all service representatives at our company.' },
      options: ['satisfy', 'satisfied', 'satisfactory', 'satisfaction'],
      answer: 'D',
      explanation: '"Customer satisfaction" — the noun form needed as the subject.',
      tags: ['noun', 'word-form'], isDiagnostic: true,
    },
    {
      id: 'p5-preposition-24',
      content: { question: 'The company was established ------- the purpose of providing affordable healthcare solutions.' },
      options: ['with', 'for', 'by', 'on'],
      answer: 'B',
      explanation: '"For the purpose of" is the fixed prepositional phrase meaning "with the aim of".',
      tags: ['preposition', 'fixed-phrase'],
    },
    {
      id: 'p5-vocabulary-25',
      content: { question: 'The new food safety regulations require all restaurants to ------- to the highest hygiene standards.' },
      options: ['adhere', 'apply', 'agree', 'achieve'],
      answer: 'A',
      explanation: '"Adhere to" means to follow or comply with rules or standards.',
      tags: ['vocabulary', 'collocation'],
    },
    {
      id: 'p5-word-form-26',
      content: { question: 'The ------- of the updated software was announced at the technology conference in Seoul.' },
      options: ['available', 'avail', 'availability', 'availably'],
      answer: 'C',
      explanation: '"Availability" is the noun form needed after the article "The".',
      tags: ['word-form', 'noun'],
    },
    {
      id: 'p5-conjunction-27',
      content: { question: 'Please review the attached document ------- sign the agreement by end of business today.' },
      options: ['and', 'but', 'so', 'yet'],
      answer: 'A',
      explanation: '"And" connects two parallel instructions: "review... and sign".',
      tags: ['conjunction', 'parallel-structure'],
    },
    {
      id: 'p5-superlative-28',
      content: { question: 'Of all the candidates, Ms. Johansson\'s qualifications are ------- suited to the position.' },
      options: ['best', 'better', 'good', 'well'],
      answer: 'A',
      explanation: '"Best suited" is the superlative form used when comparing among more than two.',
      tags: ['superlative', 'adjective'],
    },
    {
      id: 'p5-passive-29',
      content: { question: 'The updated financial report will be ------- to all shareholders by the end of the week.' },
      options: ['distribute', 'distributing', 'distributed', 'distribution'],
      answer: 'C',
      explanation: '"Will be distributed" — past participle in passive future construction.',
      tags: ['passive', 'verb-form'],
    },
  ]

  for (const q of part5Batch2) {
    await prisma.question.upsert({
      where: { id: q.id },
      update: {},
      create: { ...q, section: 'READING', part: 5, type: 'INCOMPLETE_SENTENCE', difficulty: 3 },
    })
  }

  // ─── READING: Part 6 – Passages 2–4 (3 passages × 4 questions = 12) ────────
  const noticeText = `To: All Staff\nFrom: Facilities Management\nSubject: Office Renovation – Floor 4\n\nPlease be [135] that the fourth floor will undergo renovation work beginning next Monday, March 6. Staff currently working on that floor will be [136] to temporary workstations on Floor 2 during this period.\n\nThe work is expected to take two weeks to complete. We apologize for any [137] this may cause. Please [138] all equipment, personal items, and files from your desk by Friday, March 3.\n\nFor more details, contact facilities@company.com.`

  const newsText = `Willow Creek Times — Business Spotlight\n\nLocal Manufacturer Wins National Award\n\nBrightfield Manufacturing has [139] the National Excellence in Innovation Award for the third consecutive year. Company CEO David Yoon accepted the award at a ceremony held in Chicago last Thursday.\n\nMr. Yoon [140] the achievement to the company's ongoing investment in research and development. "We believe that innovation is not an event but a culture," he stated.\n\nBrightfield, [141] in Willow Creek since 1989, employs over four hundred people in the region. The award is presented annually to manufacturers that [142] outstanding contributions to the industry.`

  const letterText = `Ms. Alana Patel\n237 Birchwood Avenue\nHartford, CT 06101\n\nDear Ms. Patel,\n\nThank you for purchasing your new kitchen appliances from Homeware Plus. We hope you are [143] with your recent purchase.\n\nOur records show that your two-year warranty on the Horizon Pro dishwasher will [144] on September 15. We would like to inform you of our extended warranty plans, which are [145] at a reduced rate to existing customers.\n\nTo learn more, please visit our website or call our customer care line at 1-800-555-0130. Our [146] representatives are available Monday to Friday between eight AM and six PM.\n\nBest regards,\nHomeware Plus Customer Relations`

  const part6Batch2 = [
    // Memo about renovation (135–138)
    {
      id: 'p6-memo1-135',
      content: { passage: noticeText, question: 'Choose the best phrase for blank [135]: "Please be ------- that the fourth floor will undergo renovation..."' },
      options: ['aware', 'awake', 'alert for', 'announced'],
      answer: 'A',
      explanation: '"Please be aware that" is a standard formal phrase meaning "please note that."',
      isDiagnostic: true,
    },
    {
      id: 'p6-memo1-136',
      content: { passage: noticeText, question: 'Choose the best word for blank [136]: "Staff...will be ------- to temporary workstations."' },
      options: ['moved', 'requested', 'placed', 'relocated'],
      answer: 'D',
      explanation: '"Relocated to" means moved to a new location — the most precise word for moving to a different area.',
    },
    {
      id: 'p6-memo1-137',
      content: { passage: noticeText, question: 'Choose the best word for blank [137]: "We apologize for any ------- this may cause."' },
      options: ['inconvenience', 'obstacle', 'delay', 'damage'],
      answer: 'A',
      explanation: '"Inconvenience" is the standard formal word used when apologizing for disruption.',
    },
    {
      id: 'p6-memo1-138',
      content: { passage: noticeText, question: 'Choose the best sentence to follow blank [138]: "Please ------- all equipment, personal items, and files from your desk by Friday, March 3."' },
      options: ['deliver', 'remove', 'arrange', 'distribute'],
      answer: 'B',
      explanation: '"Remove...from your desk" means to take items away from the desk in preparation for work.',
    },
    // News article (139–142)
    {
      id: 'p6-news1-139',
      content: { passage: newsText, question: 'Choose the best verb for blank [139]: "Brightfield Manufacturing has ------- the National Excellence in Innovation Award."' },
      options: ['received', 'deserved', 'accepted', 'created'],
      answer: 'A',
      explanation: '"Received an award" is the natural collocation. (Accept is close but "received" is more natural here.)',
      isDiagnostic: false,
    },
    {
      id: 'p6-news1-140',
      content: { passage: newsText, question: 'Choose the best word for blank [140]: "Mr. Yoon ------- the achievement to the company\'s investment in R&D."' },
      options: ['credited', 'applied', 'linked', 'directed'],
      answer: 'A',
      explanation: '"Attributed/credited the achievement to" means giving credit to something as the cause.',
    },
    {
      id: 'p6-news1-141',
      content: { passage: newsText, question: 'Choose the best phrase for blank [141]: "Brightfield, ------- in Willow Creek since 1989, employs over four hundred people."' },
      options: ['establishing', 'established', 'to be established', 'have established'],
      answer: 'B',
      explanation: '"Established in Willow Creek" is a reduced relative clause (which was established).',
    },
    {
      id: 'p6-news1-142',
      content: { passage: newsText, question: 'Choose the best sentence for blank [142]: "The award is presented annually to manufacturers that -------."' },
      options: [
        'have shown outstanding contributions to the industry',
        'are producing new goods this quarter',
        'submit applications before the annual deadline',
        'have expanded to international markets recently',
      ],
      answer: 'A',
      explanation: '"That have shown outstanding contributions" logically completes the sentence about an excellence award.',
    },
    // Customer letter (143–146)
    {
      id: 'p6-letter1-143',
      content: { passage: letterText, question: 'Choose the best word for blank [143]: "We hope you are ------- with your recent purchase."' },
      options: ['satisfied', 'satisfy', 'satisfaction', 'satisfying'],
      answer: 'A',
      explanation: '"Satisfied with" is an adjective phrase meaning pleased with.',
      isDiagnostic: true,
    },
    {
      id: 'p6-letter1-144',
      content: { passage: letterText, question: 'Choose the best word for blank [144]: "your two-year warranty...will ------- on September 15."' },
      options: ['expire', 'expiry', 'expiration', 'expired'],
      answer: 'A',
      explanation: '"Warranty will expire" — "expire" is the verb meaning to come to an end.',
    },
    {
      id: 'p6-letter1-145',
      content: { passage: letterText, question: 'Choose the best phrase for blank [145]: "extended warranty plans, which are ------- at a reduced rate to existing customers."' },
      options: ['available', 'availed', 'accessible to', 'opened'],
      answer: 'A',
      explanation: '"Are available at a reduced rate" — "available" describes something that can be accessed or bought.',
    },
    {
      id: 'p6-letter1-146',
      content: { passage: letterText, question: 'Choose the best word for blank [146]: "Our ------- representatives are available Monday to Friday."' },
      options: ['dedicated', 'obligated', 'assigned to', 'volunteered'],
      answer: 'A',
      explanation: '"Dedicated representatives" means committed, specialist staff — standard formal language in customer service letters.',
    },
  ]

  for (const q of part6Batch2) {
    await prisma.question.upsert({
      where: { id: q.id },
      update: {},
      create: { ...q, section: 'READING', part: 6, type: 'TEXT_COMPLETION', difficulty: 3, tags: ['text-completion'] },
    })
  }

  // ─── READING: Part 7 – Single Passages Batch 2 (5 passages) ─────────────────
  const memoText = `INTERNAL MEMO\nTo: All Staff\nFrom: Human Resources\nDate: October 3\nRe: New Remote Work Policy\n\nEffective November 1, the company will introduce a revised remote work policy allowing eligible employees to work from home up to three days per week.\n\nTo be eligible, employees must have completed at least six months of service and received a satisfactory performance review in the most recent cycle. Requests must be submitted to your line manager by October 20 for approval.\n\nAll remote employees are expected to be available during core hours (9 AM to 3 PM) and must use company-approved communication tools. Please note that remote work arrangements may be reviewed or adjusted based on business needs.\n\nFor questions, contact HR at hr@company.com.`

  const seminarText = `PROFESSIONAL DEVELOPMENT SEMINAR\n\nMastering Business Communication\nDate: Saturday, November 18\nVenue: Crown Business Center, Suite 400\nTime: 9:00 AM – 4:00 PM\n\nAre you looking to sharpen your communication skills in the workplace? Join us for a full-day interactive workshop led by Dr. Emma Collins, a leading expert in corporate communication.\n\nTopics covered:\n• Writing clear and professional emails\n• Delivering effective presentations\n• Managing difficult conversations\n• Cross-cultural communication skills\n\nRegistration fee: $120 per person (includes lunch and course materials)\nEarly bird discount: Register before November 1 for $95\n\nSpaces are limited to 30 participants. To register, visit www.crownbizcenter.com/seminars or call (617) 555-0233.`

  const complaintText = `From: Marcus Webb\nTo: support@greenleafhotel.com\nSubject: Complaint About Recent Stay\nDate: July 12\n\nDear Guest Services,\n\nI am writing regarding my stay at your hotel from July 8 to July 10. While the facility itself was impressive and the staff were friendly, I was disappointed by several maintenance issues.\n\nThe air conditioning unit in my room was extremely loud, making it difficult to sleep. Additionally, the shower pressure was very low throughout my stay, and one of the wardrobe doors could not be closed properly. I raised these issues with the front desk on my second morning, but unfortunately no action was taken before my checkout.\n\nI travel frequently for business and have recommended your property to colleagues in the past. I do hope these issues will be addressed, and I would appreciate some form of compensation for the inconvenience. Please let me know how you intend to resolve this matter.\n\nSincerely,\nMarcus Webb`

  const noticeClosureText = `NOTICE OF TEMPORARY ROAD CLOSURE\n\nPlease be advised that Bay Street, between Oak Avenue and Lakeview Drive, will be closed to all vehicle traffic from Monday, August 7 through Friday, August 11.\n\nThis closure is necessary to allow utility crews to repair underground water pipes. Pedestrian access will remain available throughout the closure period.\n\nDrivers are advised to use the following detour:\nNorthbound traffic: Use Pine Street via Oak Avenue\nSouthbound traffic: Use Cedar Road via Lakeview Drive\n\nWe apologize for any inconvenience and thank you for your patience. For enquiries, contact the City Public Works Department at (416) 555-0192 during business hours.`

  const scheduleText = `RIVERSIDE COMMUNITY CENTER\nSummer Fitness Schedule — July and August\n\nYoga (Room A):\nMonday, Wednesday, Friday — 7:00 AM and 6:00 PM\n\nSwimming (Outdoor Pool):\nTuesday, Thursday, Saturday — 8:00 AM to 12:00 PM\n\nCycling Class (Studio B):\nMonday, Wednesday — 12:00 PM and 5:30 PM\nSaturday — 10:00 AM\n\nPersonal Training:\nAvailable by appointment — contact the front desk to schedule\n\nNote: The outdoor pool will be CLOSED for maintenance July 15–16. All swimming classes will be moved to the indoor pool during this period.\n\nMembership required for all classes. Drop-in guests may attend at a fee of $10 per session. For more information, call (905) 555-0141.`

  const part7Batch2 = [
    // Memo (remote work)
    {
      id: 'p7-memo1-154',
      content: { passage: memoText, question: 'What is the main purpose of this memo?' },
      options: ['To announce changes to working hours', 'To introduce a new remote work policy', 'To remind staff of a performance review deadline', 'To request approval for a new IT system'],
      answer: 'B',
      explanation: 'The memo introduces a "revised remote work policy" effective November 1.',
      tags: ['memo', 'main-purpose'], isDiagnostic: true,
    },
    {
      id: 'p7-memo1-155',
      content: { passage: memoText, question: 'What must employees do by October 20?' },
      options: ['Complete a performance review', 'Contact the HR department', 'Submit a remote work request to their manager', 'Complete at least six months of service'],
      answer: 'C',
      explanation: '"Requests must be submitted to your line manager by October 20 for approval."',
      tags: ['memo', 'deadline'],
    },
    {
      id: 'p7-memo1-156',
      content: { passage: memoText, question: 'What is NOT mentioned as an eligibility requirement?' },
      options: ['Six months of service', 'A satisfactory performance review', 'Manager recommendation', 'Using approved communication tools'],
      answer: 'C',
      explanation: 'The memo lists service time and performance review, but manager recommendation is not an eligibility criterion.',
      tags: ['memo', 'not-stated'],
    },
    // Seminar advertisement
    {
      id: 'p7-seminar1-157',
      content: { passage: seminarText, question: 'What is the seminar about?' },
      options: ['Financial management', 'Business communication', 'Project management', 'Leadership development'],
      answer: 'B',
      explanation: 'The seminar is titled "Mastering Business Communication" and covers communication skills.',
      tags: ['advertisement', 'main-topic'],
    },
    {
      id: 'p7-seminar1-158',
      content: { passage: seminarText, question: 'What is included in the registration fee?' },
      options: ['Accommodation and breakfast', 'Lunch and course materials', 'A workbook and free parking', 'Coffee breaks and a certificate'],
      answer: 'B',
      explanation: '"Registration fee: $120 per person (includes lunch and course materials)"',
      tags: ['advertisement', 'detail'], isDiagnostic: true,
    },
    {
      id: 'p7-seminar1-159',
      content: { passage: seminarText, question: 'How much will a participant pay if they register on November 5?' },
      options: ['$95', '$100', '$110', '$120'],
      answer: 'D',
      explanation: 'The early bird discount ($95) is only for those who register before November 1. November 5 is after, so the full price of $120 applies.',
      tags: ['advertisement', 'inference'],
    },
    // Complaint email
    {
      id: 'p7-complaint1-160',
      content: { passage: complaintText, question: 'Why is Marcus Webb writing this email?' },
      options: ['To cancel a hotel reservation', 'To complain about his recent stay', 'To request a refund for a service', 'To inquire about hotel facilities'],
      answer: 'B',
      explanation: 'The subject line and opening clearly state this is a complaint about his recent stay.',
      tags: ['email', 'purpose'],
    },
    {
      id: 'p7-complaint1-161',
      content: { passage: complaintText, question: 'What does Marcus say about the hotel staff?' },
      options: ['They were unresponsive to his needs.', 'They were friendly.', 'They overcharged him.', 'They ignored his maintenance requests.'],
      answer: 'B',
      explanation: '"the staff were friendly" — Marcus explicitly compliments the staff.',
      tags: ['email', 'detail'], isDiagnostic: true,
    },
    // Road closure notice
    {
      id: 'p7-road1-162',
      content: { passage: noticeClosureText, question: 'Why is Bay Street being closed?' },
      options: ['For annual road resurfacing', 'To repair underground water pipes', 'For a planned public event', 'For construction of a new building'],
      answer: 'B',
      explanation: '"This closure is necessary to allow utility crews to repair underground water pipes."',
      tags: ['notice', 'reason'],
    },
    {
      id: 'p7-road1-163',
      content: { passage: noticeClosureText, question: 'What does the notice say about pedestrians?' },
      options: ['They must use the same detour as vehicles.', 'They will have access throughout the closure.', 'They should use Pine Street.', 'They will be affected starting August 11.'],
      answer: 'B',
      explanation: '"Pedestrian access will remain available throughout the closure period."',
      tags: ['notice', 'detail'],
    },
    // Fitness schedule
    {
      id: 'p7-schedule1-164',
      content: { passage: scheduleText, question: 'What is available by appointment only?' },
      options: ['Yoga classes', 'Swimming sessions', 'Personal training', 'Cycling classes'],
      answer: 'C',
      explanation: '"Personal Training: Available by appointment — contact the front desk to schedule"',
      tags: ['schedule', 'detail'],
    },
    {
      id: 'p7-schedule1-165',
      content: { passage: scheduleText, question: 'What will happen to swimming classes on July 15?' },
      options: ['They will be cancelled entirely.', 'They will be held at the indoor pool.', 'They will start one hour later than usual.', 'They will be available to drop-in guests only.'],
      answer: 'B',
      explanation: '"All swimming classes will be moved to the indoor pool" during the July 15–16 closure.',
      tags: ['schedule', 'inference'], isDiagnostic: true,
    },
    {
      id: 'p7-schedule1-166',
      content: { passage: scheduleText, question: 'How much does a non-member pay per session?' },
      options: ['$5', '$8', '$10', '$12'],
      answer: 'C',
      explanation: '"Drop-in guests may attend at a fee of $10 per session."',
      tags: ['schedule', 'detail'],
    },
  ]

  for (const q of part7Batch2) {
    await prisma.question.upsert({
      where: { id: q.id },
      update: {},
      create: { ...q, section: 'READING', part: 7, type: 'SINGLE_PASSAGE', difficulty: 3 },
    })
  }

  // ─── SPEAKING – Additional Tasks ──────────────────────────────────────────
  const speakingExtra = [
    {
      id: 'sp-read-aloud-2',
      content: {
        text: "Good morning, and thank you for calling Meridian Insurance. Our phone lines are currently experiencing higher than usual call volumes. Your estimated wait time is approximately eight minutes. If you prefer not to wait, you are welcome to visit our website at meridianinsurance.com, where you can access your policy, submit claims, and speak with a live chat representative. Thank you for your patience, and we appreciate your business.",
        prepSeconds: 45,
        speakSeconds: 45,
      },
      options: null, answer: '',
      explanation: 'Pay attention to numbers ("eight minutes") and the company URL — pronounce clearly. Maintain a professional, neutral tone.',
      tags: ['read-aloud', 'pronunciation'],
      isDiagnostic: false,
    },
    {
      id: 'sp-describe-picture-2',
      content: {
        imageUrl: 'https://images.pexels.com/photos/1267338/pexels-photo-1267338.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        prompt: 'Describe the picture in as much detail as you can.',
        prepSeconds: 45,
        speakSeconds: 30,
        hints: ['location', 'people', 'objects', 'actions'],
      },
      options: null, answer: '',
      explanation: 'Structure: location → what you see → actions. E.g., "This picture appears to be taken in a warehouse/factory. In the foreground, there are... Several workers are..."',
      tags: ['describe-picture', 'workplace'],
      isDiagnostic: false,
    },
    {
      id: 'sp-respond-free-2',
      content: {
        scenario: 'Imagine that a research institute is conducting a survey about daily commuting habits. You have agreed to participate in a telephone interview.',
        questions: [
          { id: 'q5', text: 'How do you usually get to work or school?', prepSeconds: 3, speakSeconds: 15 },
          { id: 'q6', text: 'How long does your commute typically take?', prepSeconds: 3, speakSeconds: 15 },
          { id: 'q7', text: 'What do you usually do during your commute?', prepSeconds: 3, speakSeconds: 30 },
        ],
      },
      options: null, answer: '',
      explanation: 'Q5: Name the transport. Q6: Give time (e.g., "about 40 minutes"). Q7: Expand — reading, listening to podcasts, planning the day.',
      tags: ['respond-questions', 'daily-life'],
      isDiagnostic: false,
    },
    {
      id: 'sp-respond-free-3',
      content: {
        scenario: 'A market research company is studying consumer dining habits. You have agreed to participate in a phone interview.',
        questions: [
          { id: 'q5', text: 'How often do you eat at restaurants?', prepSeconds: 3, speakSeconds: 15 },
          { id: 'q6', text: 'What type of cuisine do you prefer when eating out?', prepSeconds: 3, speakSeconds: 15 },
          { id: 'q7', text: 'What factors are most important to you when choosing a restaurant?', prepSeconds: 3, speakSeconds: 30 },
        ],
      },
      options: null, answer: '',
      explanation: 'Q5: Frequency (e.g., "once or twice a week"). Q6: Name the cuisine. Q7: Elaborate — food quality, price, location, atmosphere, service.',
      tags: ['respond-questions', 'lifestyle'],
      isDiagnostic: false,
    },
    {
      id: 'sp-respond-info-1',
      content: {
        scenario: 'You will use the schedule below to answer some questions. Imagine that your colleague is calling to ask about the upcoming staff training program.',
        document: {
          title: 'Staff Development Training Schedule — October',
          type: 'table',
          headers: ['Date', 'Topic', 'Trainer', 'Location', 'Duration'],
          rows: [
            ['October 7 (Mon)', 'Excel Advanced Functions', 'James Kwan', 'Room 3B', '3 hours'],
            ['October 12 (Sat)', 'Customer Service Excellence', 'Priya Mehta', 'Conference Hall A', 'Full day'],
            ['October 18 (Fri)', 'Data Privacy & Compliance', 'Legal Dept.', 'Online (Zoom)', '2 hours'],
            ['October 24 (Thu)', 'Effective Presentation Skills', 'Sandra Cole', 'Room 3B', '4 hours'],
          ],
        },
        questions: [
          { id: 'q8', text: 'What date is the Customer Service Excellence training scheduled?', prepSeconds: 3, speakSeconds: 15 },
          { id: 'q9', text: 'Where will the Data Privacy and Compliance session be held?', prepSeconds: 3, speakSeconds: 15 },
          { id: 'q10', text: "I'm interested in improving my presentation skills. Could you give me all the details about that session?", prepSeconds: 3, speakSeconds: 30 },
        ],
      },
      options: null, answer: '',
      explanation: 'Q8: October 12, Saturday. Q9: Online via Zoom. Q10: Give all details — October 24 (Thursday), Effective Presentation Skills, led by Sandra Cole, Room 3B, 4 hours.',
      tags: ['respond-info', 'schedule'],
      isDiagnostic: true,
    },
    {
      id: 'sp-respond-info-2',
      content: {
        scenario: 'Use the flight itinerary below to answer questions from a colleague who missed the briefing.',
        document: {
          title: 'Business Travel Itinerary — Sales Conference Tokyo',
          type: 'table',
          headers: ['Segment', 'Date', 'Details'],
          rows: [
            ['Outbound Flight', 'Nov 14 (Thu)', 'NY JFK → Tokyo NRT | Depart 11:15 AM | Arrive Nov 15, 2:40 PM | Flight NH110'],
            ['Hotel', 'Nov 15–18', 'Shinjuku Grand Hotel, Tokyo | Booking Ref: HTL-2294'],
            ['Conference', 'Nov 16–17 (Fri–Sat)', 'Asia Pacific Sales Summit | Venue: Tokyo International Forum | 9:00 AM – 5:00 PM'],
            ['Return Flight', 'Nov 18 (Sun)', 'Tokyo NRT → NY JFK | Depart 4:30 PM | Arrive Nov 18, 4:10 PM | Flight NH109'],
          ],
        },
        questions: [
          { id: 'q8', text: 'What is the hotel booking reference number?', prepSeconds: 3, speakSeconds: 15 },
          { id: 'q9', text: 'When does the conference take place?', prepSeconds: 3, speakSeconds: 15 },
          { id: 'q10', text: "I need to know everything about the return journey. Could you go over all the details?", prepSeconds: 3, speakSeconds: 30 },
        ],
      },
      options: null, answer: '',
      explanation: 'Q8: HTL-2294. Q9: November 16–17 (Friday and Saturday). Q10: Depart Tokyo NRT on November 18 (Sunday) at 4:30 PM, arrive New York JFK at 4:10 PM, flight NH109.',
      tags: ['respond-info', 'travel'],
      isDiagnostic: false,
    },
    {
      id: 'sp-express-opinion-2',
      content: {
        prompt: 'Some people prefer to work from home rather than going to an office. What is your opinion about working from home? Give reasons and examples to support your view.',
        prepSeconds: 45,
        speakSeconds: 60,
        structure: ['State opinion', 'Reason 1 + example', 'Reason 2 + example', 'Acknowledge counterpoint', 'Conclusion'],
      },
      options: null, answer: '',
      explanation: 'Model phrases: "I strongly believe that working from home offers significant advantages. Firstly... For example... Secondly... Although some argue that... In conclusion..."',
      tags: ['express-opinion', 'workplace'],
      isDiagnostic: false,
    },
    {
      id: 'sp-express-opinion-3',
      content: {
        prompt: 'Some people prefer to shop online rather than going to physical stores. Which do you prefer, and why? Give reasons and examples to support your opinion.',
        prepSeconds: 45,
        speakSeconds: 60,
        structure: ['State preference', 'Reason 1 + example', 'Reason 2 + example', 'Conclusion'],
      },
      options: null, answer: '',
      explanation: 'Pick one side clearly. Online: convenience, price comparison, 24/7 access. In-store: seeing products, immediate ownership, social experience.',
      tags: ['express-opinion', 'consumer'],
      isDiagnostic: false,
    },
    {
      id: 'sp-express-opinion-4',
      content: {
        prompt: 'What do you think is the most important quality of a good leader? Give reasons and examples to support your view.',
        prepSeconds: 45,
        speakSeconds: 60,
        structure: ['State the quality', 'Reason 1 + example', 'Reason 2 + example', 'Conclusion'],
      },
      options: null, answer: '',
      explanation: 'Common strong answers: communication, empathy, decisiveness, vision. Pick one and develop it with 2 strong reasons and real or hypothetical examples.',
      tags: ['express-opinion', 'leadership'],
      isDiagnostic: true,
    },
  ]

  for (const q of speakingExtra) {
    const typeMap: Record<string, string> = {
      'sp-read-aloud': 'READ_ALOUD',
      'sp-describe': 'DESCRIBE_PICTURE',
      'sp-respond-free': 'RESPOND_FREE',
      'sp-respond-info': 'RESPOND_INFO',
      'sp-express': 'EXPRESS_OPINION',
    }
    const prefix = Object.keys(typeMap).find(k => q.id.startsWith(k)) ?? 'sp-express'
    const type = typeMap[prefix]
    const partMap: Record<string, number> = {
      READ_ALOUD: 1, DESCRIBE_PICTURE: 2, RESPOND_FREE: 3, RESPOND_INFO: 4, EXPRESS_OPINION: 5,
    }
    await prisma.question.upsert({
      where: { id: q.id },
      update: { content: q.content },
      create: { ...q, section: 'SPEAKING', part: partMap[type], type: type as any, difficulty: 3 },
    })
  }

  // ─── WRITING – Additional Tasks ───────────────────────────────────────────
  const writingExtra = [
    {
      id: 'wr-sentence-2',
      content: {
        imageUrl: 'https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        keywords: ['colleague', 'discuss'],
        instructions: 'Write ONE sentence using both words/phrases. You may change word forms and use them in any order.',
        timeLimitSec: 96,
      },
      options: null, answer: '',
      explanation: 'Example: "Two colleagues are gathered around a laptop to discuss the latest project data." Both keywords used naturally.',
      tags: ['write-sentence', 'office'],
      isDiagnostic: false,
    },
    {
      id: 'wr-sentence-3',
      content: {
        imageUrl: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        keywords: ['presentation', 'although'],
        instructions: 'Write ONE sentence using both words/phrases. You may change word forms and use them in any order.',
        timeLimitSec: 96,
      },
      options: null, answer: '',
      explanation: 'Example: "Although the presenter looks nervous, his presentation is clearly well-prepared and engaging." Use "although" to connect contrasting ideas.',
      tags: ['write-sentence', 'meeting'],
      isDiagnostic: false,
    },
    {
      id: 'wr-sentence-4',
      content: {
        imageUrl: 'https://images.pexels.com/photos/1267338/pexels-photo-1267338.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        keywords: ['warehouse', 'store'],
        instructions: 'Write ONE sentence using both words/phrases. You may change word forms and use them in any order.',
        timeLimitSec: 96,
      },
      options: null, answer: '',
      explanation: 'Example: "Workers in the warehouse are storing large boxes on high shelves using a forklift." Use both keywords in a grammatically complete sentence.',
      tags: ['write-sentence', 'workplace'],
      isDiagnostic: false,
    },
    {
      id: 'wr-sentence-5',
      content: {
        imageUrl: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        keywords: ['sign', 'after'],
        instructions: 'Write ONE sentence using both words/phrases. You may change word forms and use them in any order.',
        timeLimitSec: 96,
      },
      options: null, answer: '',
      explanation: 'Example: "After reviewing the contract carefully, the manager signed the document at the conference table." Connect the two actions logically.',
      tags: ['write-sentence', 'business'],
      isDiagnostic: false,
    },
    {
      id: 'wr-email-2',
      content: {
        email: {
          from: 'HorizonTech Customer Support <support@horizontech.com>',
          to: 'You',
          subject: 'Follow-up: Your Recent Support Request #48291',
          body: "Thank you for contacting HorizonTech Support. We have reviewed your recent support request regarding connectivity issues with your HorizonPro laptop. Our technical team has identified a potential software conflict. We would like to schedule a remote diagnostic session at a time convenient for you. Please let us know your availability this week, and feel free to include any additional questions you may have.",
        },
        instructions: 'Respond to the email. Provide your availability and include at least TWO questions for the support team.',
        timeLimitSec: 600,
      },
      options: null, answer: '',
      explanation: 'Model response structure: 1) Thank them / reference the ticket. 2) State availability (e.g., Tuesday afternoon or Thursday morning). 3) Ask Q1 (e.g., how long the session takes). 4) Ask Q2 (e.g., if data will be affected). 5) Professional closing.',
      tags: ['respond-email', 'tech-support'],
      isDiagnostic: false,
    },
    {
      id: 'wr-email-3',
      content: {
        email: {
          from: 'Dr. Linda Park, Conference Organizer <lpark@bizsummit.org>',
          to: 'Industry Professional',
          subject: 'Invitation: Global Business Innovation Summit — Speaking Opportunity',
          body: "Dear Professional, I am writing on behalf of the Global Business Innovation Summit, to be held in Vancouver on March 22–23. We would be honored to have you participate as a speaker or panelist at this year's event. The summit attracts over 500 business leaders from across the industry. Please let us know if you are interested and whether you have any preferences regarding the session format or topic area.",
        },
        instructions: 'Respond to the invitation. Indicate your interest (or decline politely) and ask at least TWO questions about the event.',
        timeLimitSec: 600,
      },
      options: null, answer: '',
      explanation: 'If accepting: express enthusiasm, ask about session length and audience size. If declining: thank them politely and give a brief reason. Either is valid as long as 2+ questions are asked.',
      tags: ['respond-email', 'conference'],
      isDiagnostic: true,
    },
    {
      id: 'wr-essay-2',
      content: {
        prompt: 'Some companies require employees to wear uniforms or follow a strict dress code. Do you think companies should have a dress code policy? Give reasons and examples to support your opinion.',
        timeLimitSec: 1800,
        minWords: 300,
        structure: ['Introduction + clear opinion', 'Reason 1 + example', 'Reason 2 + example', 'Counterargument + rebuttal (optional)', 'Conclusion'],
      },
      options: null, answer: '',
      explanation: 'For: professional image, equality, sense of belonging. Against: limits individuality, costly for employees. Strong essays acknowledge both sides but defend one position clearly.',
      tags: ['opinion-essay', 'workplace-culture'],
      isDiagnostic: false,
    },
    {
      id: 'wr-essay-3',
      content: {
        prompt: 'Many people now use public transportation instead of private vehicles to travel within cities. What are the advantages of using public transportation? Give reasons and examples to support your opinion.',
        timeLimitSec: 1800,
        minWords: 300,
        structure: ['Introduction', 'Advantage 1 + example', 'Advantage 2 + example', 'Advantage 3 + example (optional)', 'Conclusion'],
      },
      options: null, answer: '',
      explanation: 'Key points: reduces congestion, lower carbon emissions, cost savings, more productive commute time. Use specific examples (e.g., cities with efficient subway systems).',
      tags: ['opinion-essay', 'environment'],
      isDiagnostic: false,
    },
  ]

  for (const q of writingExtra) {
    const typeMap: Record<string, string> = {
      'wr-sentence': 'WRITE_SENTENCE',
      'wr-email': 'RESPOND_EMAIL',
      'wr-essay': 'OPINION_ESSAY',
    }
    const prefix = Object.keys(typeMap).find(k => q.id.startsWith(k)) ?? 'wr-essay'
    const type = typeMap[prefix]
    const partMap: Record<string, number> = { WRITE_SENTENCE: 1, RESPOND_EMAIL: 2, OPINION_ESSAY: 3 }
    await prisma.question.upsert({
      where: { id: q.id },
      update: { content: q.content },
      create: { ...q, section: 'WRITING', part: partMap[type], type: type as any, difficulty: 3 },
    })
  }

  const counts = {
    reading: part5.length + part5Batch2.length + part6.length + part6Batch2.length + part7.length + part7Messages.length + part7Double.length + part7Triple.length + part7Batch2.length,
    listening: part1.length + part2.length + part2Extra.length + part2Batch3.length + part3.length + part3Extra.length + part3Batch3.length + part4.length + part4Extra.length + part4Batch3.length,
    speaking: speakingDiagnostic.length + speakingExtra.length,
    writing: writingDiagnostic.length + writingExtra.length,
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
