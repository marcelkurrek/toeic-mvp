/**
 * Canonical TOEIC format reference.
 * Format: post-August 2021 update (current as of May 2026).
 * Sources: ETS official, IIBC-global, verified via web research.
 *
 * KEY CHANGE Aug 2021: "Propose a Solution" (old Q10) was removed.
 * Current Speaking: Q1-2 Read aloud | Q3-4 Describe picture |
 *   Q5-7 Respond (no text) | Q8-10 Respond using info | Q11 Express opinion
 */

export const TOEIC_VERSION = '2021-08'
export const TOEIC_LAST_CHECKED = '2026-05-12'

export const TOEIC_SOURCES = [
  'https://www.ets.org/toeic/about/listening-reading.html',
  'https://www.ets.org/toeic/about/speaking-writing.html',
  'https://estudyme.com/en/toeic-writing-and-speaking/',
  'https://www.iibc-global.org/english/toeic/test/sw/about/format.html',
]

// ── Scoring criteria (cumulative per Speaking task) ───────────────────────────
const CRITERIA_BASE = ['Pronunciation', 'Intonation & Stress']
const CRITERIA_LANG = ['Grammar', 'Vocabulary', 'Cohesion']
const CRITERIA_CONTENT = ['Relevance of content', 'Completeness of content']

// ── Business topic pool for generation ───────────────────────────────────────
export const BUSINESS_TOPICS = [
  'office administration', 'human resources', 'marketing & advertising',
  'finance & accounting', 'logistics & shipping', 'customer service',
  'business travel', 'IT & technology', 'real estate & facilities',
  'retail & sales', 'healthcare services', 'hospitality & catering',
  'manufacturing', 'education & training', 'media & communications',
]

export const DIFFICULTY_LABELS: Record<number, string> = {
  1: 'A1 (beginner) — very simple vocabulary, basic grammar',
  2: 'A2 (elementary) — common workplace vocabulary, simple structures',
  3: 'B1 (intermediate) — standard TOEIC difficulty, typical exam vocabulary',
  4: 'B2 (upper-intermediate) — complex sentences, sophisticated vocabulary',
  5: 'C1 (advanced) — nuanced vocabulary, complex grammar, inference required',
}

// ── Complete TOEIC format definition ─────────────────────────────────────────
export const TOEIC_FORMAT = {
  version: TOEIC_VERSION,
  lastChecked: TOEIC_LAST_CHECKED,

  listening: {
    durationMins: 45,
    totalQuestions: 100,
    parts: [
      {
        part: 1,
        type: 'PHOTOGRAPH' as const,
        name: 'Photographs',
        questions: 6,
        format: 'Look at a photograph; choose 1 of 4 spoken statements that best describes it',
        topics: ['office', 'outdoor', 'store', 'construction', 'restaurant', 'airport', 'market'],
      },
      {
        part: 2,
        type: 'QUESTION_RESPONSE' as const,
        name: 'Question-Response',
        questions: 25,
        format: 'Hear a question/statement + 3 spoken responses; choose the best',
        questionTypes: ['WH-question', 'Yes/No question', 'Statement', 'Suggestion', 'Request'],
        traps: ['Similar sound', 'Wrong WH-category', 'Time/place confusion', 'Partial word repetition'],
      },
      {
        part: 3,
        type: 'CONVERSATION' as const,
        name: 'Conversations',
        questions: 39,
        conversations: 13,
        questionsPerConversation: 3,
        format: '2-3 person workplace dialogue (150-250 words) + 3 MC questions; some with visual graphic',
        questionTypes: ['Topic/Problem', 'Detail', 'Suggestion/Offer', 'Next action', 'Graphic-based'],
      },
      {
        part: 4,
        type: 'TALK' as const,
        name: 'Short Talks',
        questions: 30,
        talks: 10,
        questionsPerTalk: 3,
        format: 'Monologue (100-150 words) + 3 MC questions; some with visual graphic',
        talkTypes: ['Announcement', 'Voicemail', 'Advertisement', 'Tour guide', 'News report', 'Instructions'],
      },
    ],
  },

  reading: {
    durationMins: 75,
    totalQuestions: 100,
    parts: [
      {
        part: 5,
        type: 'INCOMPLETE_SENTENCE' as const,
        name: 'Incomplete Sentences',
        questions: 30,
        format: 'One sentence with one blank (-------); choose best of 4 options',
        grammarCategories: [
          'Verb form (tense, voice, mood)',
          'Word form (noun/adj/adv/verb)',
          'Preposition',
          'Conjunction / connector',
          'Pronoun / relative pronoun',
          'Vocabulary (contextual meaning)',
        ],
      },
      {
        part: 6,
        type: 'TEXT_COMPLETION' as const,
        name: 'Text Completion',
        questions: 16,
        passages: 4,
        questionsPerPassage: 4,
        format: '4 texts × 4 blanks; blank 4 = sentence-insertion question',
        textTypes: ['Email/Memo', 'Notice/Announcement', 'Advertisement', 'Article/Report', 'Letter'],
      },
      {
        part: 7,
        type: 'READING_COMPREHENSION' as const,
        name: 'Reading Comprehension',
        questions: 54,
        breakdown: {
          single: { passages: 10, questionsPerPassage: '2-4', totalQuestions: 29 },
          double: { sets: 2, questionsPerSet: 5, totalQuestions: 10 },
          triple: { sets: 3, questionsPerSet: 5, totalQuestions: 15 },
        },
        passageTypes: [
          'Email', 'Advertisement', 'Notice', 'Article',
          'Text message chain', 'Form/Invoice', 'Online review', 'Schedule',
        ],
        questionTypes: [
          'Main idea', 'Specific detail', 'Inference/Implication',
          'NOT mentioned', 'Vocabulary in context', 'Graphic-based',
        ],
      },
    ],
  },

  speaking: {
    totalQuestions: 11,
    durationMins: 20,
    scoreScale: '0-200',
    tasks: [
      {
        questions: [1, 2],
        type: 'READ_ALOUD' as const,
        name: 'Read a text aloud',
        prepSecs: 45,
        speakSecs: 45,
        scoreScale: '0-3',
        criteria: [...CRITERIA_BASE],
        textLength: '70-100 words',
        textTypes: ['Advertisement', 'Announcement', 'Introduction', 'Informational text'],
        tips: [
          'Mark numbers and dates before starting',
          'Comma = short pause, period = clear pause',
          'Do not drop voice at sentence end',
          'Pronounce endings clearly (-ed, -s)',
        ],
      },
      {
        questions: [3, 4],
        type: 'DESCRIBE_PICTURE' as const,
        name: 'Describe a picture',
        prepSecs: 30,
        speakSecs: 45,
        scoreScale: '0-3',
        criteria: [...CRITERIA_BASE, ...CRITERIA_LANG],
        structure: [
          'The picture shows ... in what appears to be ...',
          'In the foreground ...',
          'In the background ...',
          'He/She seems to be ... / They appear to be ...',
          'It looks like ... / They might be ...',
        ],
        rules: [
          'Use "We can see" — not "I can see"',
          'Describe COMPLETE scene: foreground + background',
          'Do NOT invent details not visible in image',
          'Speak continuously — no long pauses',
        ],
      },
      {
        questions: [5, 6, 7],
        type: 'RESPOND_FREE' as const,
        name: 'Respond to questions',
        readSecs: 30,
        prepSecsPerQ: 3,
        speakSecs: { q5: 15, q6: 15, q7: 30 },
        scoreScale: '0-3',
        criteria: [...CRITERIA_BASE, ...CRITERIA_LANG, ...CRITERIA_CONTENT],
        topics: ['Workplace', 'Lifestyle & habits', 'Shopping', 'Travel', 'Technology & media'],
        tips: [
          'Answer directly and completely — no preparation time',
          'Use connectors: such as, which, moreover',
          'Do not give unnecessary extra information',
        ],
      },
      {
        questions: [8, 9, 10],
        type: 'RESPOND_INFO' as const,
        name: 'Respond to questions using information provided',
        readSecs: 45,
        prepSecsPerQ: 3,
        speakSecs: { q8: 15, q9: 15, q10: 30 },
        scoreScale: '0-3',
        criteria: [...CRITERIA_BASE, ...CRITERIA_LANG, ...CRITERIA_CONTENT],
        documentTypes: ['Schedule/Program', 'Price list', 'Event agenda', 'Timetable', 'Menu', 'Catalog'],
        tips: [
          'Read the document carefully during the 45s',
          'Q10 may require combining info from multiple rows',
          'Refer to the document explicitly in your answers',
        ],
      },
      {
        questions: [11],
        type: 'EXPRESS_OPINION' as const,
        name: 'Express an opinion',
        prepSecs: 45,
        speakSecs: 60,
        scoreScale: '0-5',
        criteria: [...CRITERIA_BASE, ...CRITERIA_LANG, ...CRITERIA_CONTENT],
        structure: [
          'I personally believe that ... for several reasons.',
          'Firstly, I think ...',
          'Secondly, ...',
          'Moreover, ...',
          'In conclusion, ...',
        ],
        rules: [
          'Give exactly 2-3 reasons with examples',
          'Clear structure: opinion → reasons → conclusion',
          'Stay on topic — do not deviate',
        ],
      },
    ],
    removedTasks: [
      {
        type: 'PROPOSE_SOLUTION',
        name: 'Propose a solution',
        removedDate: '2021-08',
        description: 'Was Q10 before Aug 2021. Listen to voicemail describing a problem → propose solution (30s prep, 60s speak, scored 0-5).',
        structure: [
          'Acknowledge problem: "I am sorry to hear that ..."',
          'Explain course of action',
          'Propose a clear solution',
        ],
      },
    ],
  },

  writing: {
    totalQuestions: 8,
    durationMins: 60,
    scoreScale: '0-200',
    tasks: [
      {
        questions: [1, 2, 3, 4, 5],
        type: 'WRITE_SENTENCE' as const,
        name: 'Write a sentence based on a picture',
        totalTimeMins: 8,
        scoreScale: '0-3',
        criteria: ['Grammar', 'Relevance of sentence to picture'],
        instructions: 'Write ONE sentence using BOTH given keywords. You may change word forms.',
        tips: [
          'Describe the scene — do not write a random sentence',
          'Both keywords must appear — wrong form = 0 points',
          'Aim for 12-20 words',
        ],
      },
      {
        questions: [6, 7],
        type: 'RESPOND_EMAIL' as const,
        name: 'Respond to a written request',
        timeMinsEach: 10,
        scoreScale: '0-4',
        criteria: ['Quality and variety of sentences', 'Vocabulary', 'Organization'],
        instructions: 'Respond to the email. Address ALL requests/points mentioned.',
        modelPhrases: [
          'Dear Mr./Ms. [Name],',
          'Many thanks for your email / Thank you for your email dated ...',
          'Regarding / Concerning ...',
          'I am afraid that ... / I regret to inform you that ...',
          'I am pleased to inform you that ...',
          'Would it be possible ... / Could you please ... / I would appreciate it if you could ...',
          'If you have any questions, please do not hesitate to contact me.',
          'I look forward to hearing from you.',
          'Best regards,',
        ],
      },
      {
        questions: [8],
        type: 'OPINION_ESSAY' as const,
        name: 'Write an opinion essay',
        timeMins: 30,
        minWords: 300,
        scoreScale: '0-5',
        criteria: ['Opinion supported with reasons/examples', 'Grammar', 'Vocabulary', 'Organization'],
        structure: [
          'Introduction: "There are a number of advantages and disadvantages to ..." + state opinion',
          'Reason 1: "First of all, I believe ..." + "This would obviously be ..." + "Moreover ..."',
          'Reason 2: "Another advantage is that ..." + "Also ..."',
          'Optional Reason 3: "Another point is that ..." + "Whereas ..." / "On the other hand ..."',
          'Conclusion: "In conclusion, although ... not suit everyone, for me the benefits far outweigh the drawbacks ..."',
        ],
      },
    ],
  },
}

// ── Generation prompts per question type ──────────────────────────────────────

export function getGenerationPrompt(
  type: string,
  count: number,
  difficulty: number,
): { system: string; user: string } {
  const diff = DIFFICULTY_LABELS[difficulty] ?? DIFFICULTY_LABELS[3]
  const topics = [...BUSINESS_TOPICS].sort(() => Math.random() - 0.5).slice(0, 4).join(', ')

  const system = `You are an expert TOEIC test writer with 20 years of ETS experience.
You create authentic, exam-quality questions that exactly match the official TOEIC format (post-August 2021).
Respond with valid JSON ONLY — no markdown fences, no explanation text, just the raw JSON object.
Difficulty target: ${diff}
Business topics to draw from (vary them): ${topics}`

  const prompts: Record<string, string> = {

    INCOMPLETE_SENTENCE: `Generate ${count} TOEIC Part 5 "Incomplete Sentences" questions.

RULES:
- Real business English context
- One blank marked as "-------" per sentence
- Exactly 4 options: A, B, C, D (one correct, three plausible distractors)
- Each question tests ONE grammar point: verb form | word form | preposition | conjunction | pronoun | vocabulary
- Vary the grammar category across questions — no repeats
- Distractors wrong for a SPECIFIC grammatical reason

Output JSON:
{
  "questions": [
    {
      "content": { "question": "The manager asked all staff to ------- their timesheets by Friday." },
      "options": ["submit", "submits", "submitted", "submitting"],
      "answer": "A",
      "explanation": "After 'asked someone to', the bare infinitive is required.",
      "tags": ["verb-form", "infinitive"]
    }
  ]
}`,

    TEXT_COMPLETION: `Generate ${Math.ceil(count / 4)} TOEIC Part 6 "Text Completion" passages (4 blanks each).

RULES:
- Text types: email, memo, notice, advertisement, or letter
- Mark blanks as [Q1] [Q2] [Q3] [Q4] inside the text
- Q1–Q3: grammar/vocabulary (word form, preposition, conjunction, vocabulary)
- Q4: ALWAYS a sentence-insertion question (4 full sentences as options)
- All distractors plausible but clearly wrong in context

Output JSON:
{
  "passages": [
    {
      "text": "To: All Staff\\nFrom: HR Department\\n\\nWe are pleased to announce [Q1] new employee recognition program. This initiative [Q2] introduced last year to reward outstanding performance. Employees who meet the criteria [Q3] receive a $200 gift card and a certificate. [Q4]",
      "questions": [
        { "blank": "Q1", "options": ["a", "an", "the", "some"], "answer": "C", "explanation": "Definite article 'the' is used because the specific program is being introduced.", "tags": ["article"] },
        { "blank": "Q2", "options": ["is", "was", "has been", "will be"], "answer": "B", "explanation": "Simple past 'was' fits the time reference 'last year'.", "tags": ["tense", "passive"] },
        { "blank": "Q3", "options": ["will", "would", "shall", "should"], "answer": "A", "explanation": "'Will receive' is used for future certainty based on a condition.", "tags": ["modal", "future"] },
        { "blank": "Q4", "options": ["Please submit your nomination by the end of the month.", "The program was cancelled due to budget constraints.", "Our main office is located in the city center.", "Employees must wear identification badges at all times."], "answer": "A", "explanation": "The email introduces a recognition program, so a call to action for nominations is the logical conclusion.", "tags": ["sentence-insertion", "cohesion"] }
      ]
    }
  ]
}`,

    SINGLE_PASSAGE: `Generate ${count} TOEIC Part 7 "Single Passage" sets (1 passage + 2-4 questions each).

RULES:
- Passage types (vary): email, advertisement, notice, article, text message chain, online review, form
- 2-4 comprehension questions per passage
- Question types (vary): main idea, specific detail, inference, NOT mentioned, vocabulary in context
- Wrong answers partially true or misleading — not obviously wrong
- Business English context throughout

Output JSON:
{
  "sets": [
    {
      "passage": "From: Sarah Chen\\nTo: David Park\\nSubject: Quarterly Report\\n\\nHi David,\\nDo you have the final version of the quarterly report? The director needs it by noon today.\\n\\nSarah",
      "passageType": "email",
      "questions": [
        {
          "question": "What is the purpose of Sarah's email?",
          "options": ["To request a document", "To confirm a meeting time", "To report a technical issue", "To introduce a new employee"],
          "answer": "A",
          "explanation": "Sarah asks whether David has the final version of the report — she is requesting a document.",
          "tags": ["purpose", "email"]
        }
      ]
    }
  ]
}`,

    DOUBLE_PASSAGE: `Generate 1 TOEIC Part 7 "Double Passage" set.

RULES:
- 2 related passages (e.g., job ad + cover letter; email + reply; notice + application)
- EXACTLY 5 questions
- At least 1 question MUST require reading BOTH passages
- Question types: detail, inference, NOT mentioned, vocabulary, cross-reference

Output JSON:
{
  "passages": [
    { "title": "Job Advertisement", "text": "MARKETING COORDINATOR\\nThornfield Communications, Boston, MA\\n\\nWe are seeking an energetic Marketing Coordinator with at least two years of experience in digital marketing.\\n\\nRequirements:\\n• Bachelor's degree in Marketing or related field\\n• Proficiency in marketing analytics tools\\n• Excellent written and verbal communication skills\\n\\nApply to careers@thornfieldcomms.com by April 30." },
    { "title": "Email", "text": "From: Priya Anand\\nTo: careers@thornfieldcomms.com\\nSubject: Application – Marketing Coordinator\\nDate: April 22\\n\\nDear Hiring Team,\\nI am writing to apply for the Marketing Coordinator position. With over three years in digital marketing and proven social media management experience, I believe I am an excellent fit.\\n\\nBest regards,\\nPriya Anand" }
  ],
  "questions": [
    { "question": "What type of company is Thornfield Communications?", "options": ["A digital agency", "A public relations firm", "A recruitment company", "A media publisher"], "answer": "B", "explanation": "...", "tags": ["detail", "single-source"] },
    { "question": "What is suggested about Priya Anand?", "options": ["She meets the minimum experience requirement exactly.", "She exceeds the minimum experience requirement.", "She lacks the required communication skills.", "She has not yet completed her degree."], "answer": "B", "explanation": "The ad requires 2 years minimum; Priya states she has over three years.", "tags": ["inference", "cross-reference"] }
  ]
}`,

    TRIPLE_PASSAGE: `Generate 1 TOEIC Part 7 "Triple Passage" set.

RULES:
- 3 related passages (e.g., notice + application + response email)
- EXACTLY 5 questions
- At least 2 questions MUST require reading multiple passages
- Same format as double passage but with 3 passage objects`,

    QUESTION_RESPONSE: `Generate ${count} TOEIC Part 2 "Question-Response" items.

RULES:
- 1 question or statement + exactly 3 responses (A, B, C)
- Vary types: WH-question, Yes/No question, statement, suggestion, offer/request
- Wrong responses use TOEIC traps: similar sound, wrong WH-category, time/place confusion, partial repetition
- Workplace situations only

Output JSON:
{
  "questions": [
    {
      "content": {
        "question": "When does the new product line go on sale?",
        "responses": ["Starting next Monday.", "At the downtown location.", "For about twenty dollars."]
      },
      "options": ["A", "B", "C"],
      "answer": "A",
      "explanation": "'When' asks for time. A gives time. B gives location (wrong WH). C gives price (wrong WH).",
      "tags": ["when", "time", "WH-question"]
    }
  ]
}`,

    CONVERSATION: `Generate ${Math.ceil(count / 3)} TOEIC Part 3 "Conversation" sets (3 questions per set).

RULES:
- 2-3 speakers, natural workplace dialogue, 150-250 words
- Topics: meetings, ordering, scheduling, customer service, office problems
- EXACTLY 3 MC questions: (1) topic/problem, (2) specific detail, (3) next action/suggestion
- 4 options each — wrong answers plausible
- Every other conversation: include a graphic (table/list/schedule as JSON object)

Output JSON:
{
  "conversations": [
    {
      "transcript": "Woman: Hello, I'm calling about a coffee machine I purchased from your website...\\nMan: I'm sorry to hear that. Our warranty covers products for up to a year...\\nWoman: I've had it for just over a year, so the warranty has expired.\\nMan: Since you're a valued customer, I can offer you a 40% discount on your next purchase.",
      "graphic": null,
      "questions": [
        { "question": "Why is the woman calling?", "options": ["To cancel an order", "To complain about a product", "To redeem a gift card", "To renew a warranty"], "answer": "B", "explanation": "The woman calls because her coffee machine stopped working.", "tags": ["reason"] },
        { "question": "What does the man confirm about the warranty?", "options": ["It covers the product for two years.", "It has already expired.", "It can be extended for a fee.", "It requires proof of purchase."], "answer": "B", "explanation": "The man says the warranty covers up to a year and the woman has had it for over a year.", "tags": ["detail"] },
        { "question": "What does the man offer the woman?", "options": ["A free replacement", "A full refund", "A discount on her next purchase", "A warranty extension"], "answer": "C", "explanation": "The man offers a coupon for 40% off her next purchase.", "tags": ["offer"] }
      ]
    }
  ]
}`,

    TALK: `Generate ${Math.ceil(count / 3)} TOEIC Part 4 "Short Talk" sets (3 questions per set).

RULES:
- Monologue types (vary): announcement, voicemail, advertisement, tour guide, news report, instructions
- 100-150 words (approximately 60-90 seconds when read aloud)
- EXACTLY 3 MC questions: (1) main purpose, (2) specific detail, (3) next action/implication
- Every other talk: include a graphic (schedule/table as JSON)

Output JSON:
{
  "talks": [
    {
      "transcript": "Hello Mr. Lee, this is Thomas from BKS Auto Shop. I know we said next week, but we received the part early and your car is now ready. We close in a few minutes, but you can pick it up anytime tomorrow. If you need a ride to the shop, just let me know and I can arrange one.",
      "graphic": null,
      "questions": [
        { "question": "What is the purpose of the message?", "options": ["To explain a delay", "To confirm a repair is complete", "To request payment", "To schedule an appointment"], "answer": "B", "explanation": "Thomas says the repair is done and the car is ready.", "tags": ["purpose"] },
        { "question": "When can the listener pick up the car?", "options": ["Today", "Tomorrow", "Next week", "In two days"], "answer": "B", "explanation": "Thomas says 'you can come get your car anytime tomorrow'.", "tags": ["detail", "time"] },
        { "question": "What does Thomas offer to arrange?", "options": ["A loaner car", "A ride to the shop", "A payment plan", "A follow-up inspection"], "answer": "B", "explanation": "Thomas says 'if you need a ride to the shop, I can arrange one'.", "tags": ["offer"] }
      ]
    }
  ]
}`,

    READ_ALOUD: `Generate ${count} TOEIC Speaking Q1-2 "Read Aloud" passages.

RULES:
- 70-100 words per passage
- Types (vary): advertisement, announcement, introduction, informational text
- Must include numbers/dates, comma-separated lists, at least one complex sentence
- Business English register

Output JSON:
{
  "passages": [
    {
      "content": {
        "text": "If you are looking for a reliable logistics partner, contact Global Freight Solutions today. Founded in 1998, we operate in over 40 countries and deliver more than 2 million packages each year. Our services include express shipping, customs clearance, and temperature-controlled transport. Visit our website or call us at 1-800-555-0199 to request a free quote.",
        "prepSeconds": 45,
        "speakSeconds": 45
      },
      "tags": ["advertisement", "logistics"]
    }
  ]
}`,

    DESCRIBE_PICTURE: `Generate ${count} TOEIC Speaking Q3-4 "Describe a Picture" prompts with model answer structure.

RULES:
- Use verified Unsplash image IDs (pick DIFFERENT ones for each question):
  Office checkout: 1556742049-0cfed4f6a45d
  Construction workers: 1504307651254-35680f356dfd
  People at restaurant: 1517248135467-4c7edcad34c4
  Airport terminal: 1436491865332-7a61a109cc05
  Market vendors: 1488459716781-31db52582fe9
  Office meeting: 1600880292203-757bb62be5f9
  Hospital/healthcare: 1576091160399-112ba8d25d1d
  Warehouse workers: 1553413077-190dd305871c
- Model answer must follow structure: opening → foreground → background → extras
- Prep: 30s | Speak: 45s (current format since Aug 2021)

Output JSON:
{
  "questions": [
    {
      "content": {
        "imageUrl": "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=900&q=80&auto=format&fit=crop",
        "prompt": "Describe the picture in as much detail as you can.",
        "prepSeconds": 30,
        "speakSeconds": 45,
        "hints": ["foreground", "background", "actions", "setting"],
        "modelAnswer": {
          "opening": "The picture shows a customer and a cashier in what appears to be a retail store.",
          "foreground": "In the foreground, a woman seems to be paying at a checkout counter.",
          "background": "In the background, shelves are stocked with various products.",
          "extra": "The store appears to be well-lit and the staff member looks professional."
        }
      },
      "tags": ["retail", "store", "customer-service"]
    }
  ]
}`,

    RESPOND_FREE: `Generate ${count} TOEIC Speaking Q5-7 "Respond to Questions" sets.

RULES:
- One scenario (survey/interview about everyday topic) + 3 questions
- Q5 + Q6: simple direct questions (15 seconds each)
- Q7: more detailed question (30 seconds)
- Topics (vary): TV habits, work-life balance, travel, shopping, technology, restaurants

Output JSON:
{
  "sets": [
    {
      "content": {
        "scenario": "Imagine that a Canadian marketing firm is conducting research in your country. You have agreed to participate in a telephone interview about shopping habits.",
        "questions": [
          { "id": "q5", "text": "How often do you go shopping for clothing?", "prepSeconds": 3, "speakSeconds": 15 },
          { "id": "q6", "text": "Do you prefer shopping online or in physical stores?", "prepSeconds": 3, "speakSeconds": 15 },
          { "id": "q7", "text": "Describe a recent shopping experience you had and what you bought.", "prepSeconds": 3, "speakSeconds": 30 }
        ]
      },
      "tags": ["shopping", "lifestyle", "survey"]
    }
  ]
}`,

    RESPOND_INFO: `Generate ${count} TOEIC Speaking Q8-10 "Respond to Questions Using Information Provided" sets.

RULES:
- One workplace document (schedule, price list, event agenda, timetable, menu) + 3 questions
- Q8 + Q9: straightforward detail questions (15 seconds each)
- Q10: requires synthesizing or comparing info from multiple rows (30 seconds)
- Document must be realistic with 4-6 rows of data

Output JSON:
{
  "sets": [
    {
      "content": {
        "document": {
          "title": "Spring Conference Schedule",
          "type": "schedule",
          "headers": ["Time", "Session", "Room"],
          "rows": [
            ["9:00 AM", "Opening Keynote: Future of Work", "Main Hall"],
            ["10:30 AM", "Workshop A: Digital Marketing", "Room 101"],
            ["10:30 AM", "Workshop B: Data Analytics", "Room 102"],
            ["12:00 PM", "Lunch Break", "Cafeteria"],
            ["2:00 PM", "Panel Discussion: Q&A with Experts", "Main Hall"]
          ]
        },
        "questions": [
          { "id": "q8", "text": "What time does the conference begin?", "prepSeconds": 3, "speakSeconds": 15 },
          { "id": "q9", "text": "Where is the lunch break held?", "prepSeconds": 3, "speakSeconds": 15 },
          { "id": "q10", "text": "Two workshops are offered at the same time. Describe both options available at 10:30 AM.", "prepSeconds": 3, "speakSeconds": 30 }
        ]
      },
      "tags": ["conference", "schedule", "workplace"]
    }
  ]
}`,

    EXPRESS_OPINION: `Generate ${count} TOEIC Speaking Q11 "Express an Opinion" prompts.

RULES:
- Topic must have two clear sides (prefer A or B; agree/disagree; advantage/disadvantage)
- Answerable with 2-3 reasons + examples in 60 seconds
- No specialized knowledge required
- Topics (vary): remote work, open-plan offices, technology at work, teamwork vs individual work, flexible hours

Output JSON:
{
  "questions": [
    {
      "content": {
        "prompt": "Some companies require all employees to work in the office every day. Other companies allow employees to work from home. Which do you think is better for productivity, and why?",
        "prepSeconds": 45,
        "speakSeconds": 60,
        "structure": ["State opinion clearly", "Reason 1 + example", "Reason 2 + example", "Conclusion"]
      },
      "tags": ["remote-work", "productivity", "workplace"]
    }
  ]
}`,

    PROPOSE_SOLUTION: `Generate ${count} TOEIC Speaking "Propose a Solution" tasks (LEGACY — removed from test Aug 2021, kept for extra practice).

RULES:
- Test-taker hears a voicemail describing a problem, must propose a solution
- Structure: acknowledge problem → explain action → propose solution (30s prep, 60s speak)
- Business scenarios: customer complaint, delivery delay, booking error, service failure

Output JSON:
{
  "questions": [
    {
      "content": {
        "voicemail": "Hi, this is Karen from Westfield Solutions. I'm calling because we placed an order for 50 office chairs three weeks ago, and they still haven't arrived. We have a new team starting next Monday and we really need those chairs. Could someone please get back to me as soon as possible?",
        "prepSeconds": 30,
        "speakSeconds": 60,
        "structure": [
          "Acknowledge the problem: 'I am sorry to hear that ...'",
          "Explain your course of action",
          "Propose a clear solution with timeline"
        ]
      },
      "tags": ["propose-solution", "customer-service", "complaint"]
    }
  ]
}`,

    WRITE_SENTENCE: `Generate ${count} TOEIC Writing Q1-5 "Write a Sentence Based on a Picture" prompts.

RULES:
- 2 keywords per question (mix of nouns, verbs, prepositions — not both same POS)
- Keywords must be naturally usable in a sentence describing the scene
- Use verified Unsplash IDs (vary them):
  Airport terminal: 1436491865332-7a61a109cc05
  Office/retail: 1556742049-0cfed4f6a45d
  Construction: 1504307651254-35680f356dfd
  Park/outdoor: 1441974231531-c6227db76b6e
  Restaurant: 1517248135467-4c7edcad34c4
- Model answer: 12-20 words, uses both keywords correctly

Output JSON:
{
  "questions": [
    {
      "content": {
        "imageUrl": "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=900&q=80&auto=format&fit=crop",
        "keywords": ["airport terminal", "so"],
        "instructions": "Write ONE sentence using both words/phrases. You may change the word forms and use them in any order.",
        "timeLimitSec": 96,
        "modelAnswer": "The airport terminal was extremely busy, so many travelers had to wait in long lines before boarding."
      },
      "tags": ["airport", "travel", "write-sentence"]
    }
  ]
}`,

    RESPOND_EMAIL: `Generate ${count} TOEIC Writing Q6-7 "Respond to a Written Request" email prompts.

RULES:
- Email that implies 2-3 specific requests the test-taker must address
- Requests inferable from context (not always explicitly listed)
- Business contexts (vary): welcome email, job inquiry, customer complaint, service request, booking confirmation
- Include model phrases as hints

Output JSON:
{
  "questions": [
    {
      "content": {
        "email": {
          "from": "Dale City Welcome Committee",
          "to": "New Resident",
          "subject": "Welcome to Dale City!",
          "body": "Welcome to Dale City! We know moving to a new city can be challenging — from finding utilities to learning public transportation. We are here to help with anything you need as you settle in. Please don't hesitate to reach out."
        },
        "instructions": "Respond to this email as a new resident. Make at least TWO requests for specific information.",
        "timeLimitSec": 600,
        "hints": ["Ask about internet/electricity providers", "Ask about public transportation", "Ask about nearby facilities"],
        "modelPhrases": [
          "I would appreciate it if you could provide information about ...",
          "Could you please tell me ...",
          "Furthermore, I would be grateful if you could ..."
        ]
      },
      "tags": ["welcome-email", "requests", "community"]
    }
  ]
}`,

    OPINION_ESSAY: `Generate ${count} TOEIC Writing Q8 "Write an Opinion Essay" prompts.

RULES:
- Clear question asking test-taker to state, explain, and support an opinion
- Two clear sides (agree/disagree; prefer A or B; advantages/disadvantages)
- Accessible to B1-C1 level — no specialist knowledge required
- Topics (vary): job search methods, technology in workplace, work-life balance, teamwork, education

Output JSON:
{
  "questions": [
    {
      "content": {
        "prompt": "There are many ways to find a job: newspaper advertisements, Internet job search websites, and personal recommendations. What do you think is the best way to find a job? Give reasons or examples to support your opinion.",
        "timeLimitSec": 1800,
        "minWords": 300,
        "structure": [
          "Introduction + opinion statement",
          "Reason 1 + example/evidence",
          "Reason 2 + example/evidence",
          "Optional Reason 3",
          "Conclusion"
        ]
      },
      "tags": ["job-search", "opinion-essay", "career"]
    }
  ]
}`,
  }

  return {
    system,
    user: prompts[type] ?? `Generate ${count} TOEIC questions of type ${type}. Difficulty: ${diff}. Output valid JSON.`,
  }
}
