generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model User {
  id          String     @id @default(cuid())
  supabaseId  String     @unique
  email       String     @unique
  name        String?
  targetScore Int?
  examDate    DateTime?
  sessions    Session[]
  progress    Progress[]
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}

model Question {
  id          String       @id @default(cuid())
  part        Int
  type        QuestionType
  content     Json
  options     Json?
  answer      String
  explanation String?
  difficulty  Int          @default(3)
  tags        String[]
  answers     Answer[]
  createdAt   DateTime     @default(now())
}

model Session {
  id             String      @id @default(cuid())
  userId         String
  user           User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  mode           SessionMode
  parts          Int[]
  totalQuestions Int
  score          Int?
  maxScore       Int?
  durationSec    Int?
  completedAt    DateTime?
  answers        Answer[]
  createdAt      DateTime    @default(now())
}

model Answer {
  id           String   @id @default(cuid())
  sessionId    String
  session      Session  @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  questionId   String
  question     Question @relation(fields: [questionId], references: [id])
  userAnswer   String
  isCorrect    Boolean
  aiFeedback   String?
  timeSpentSec Int?
  createdAt    DateTime @default(now())
}

model Progress {
  id         String   @id @default(cuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  part       Int
  accuracy   Float
  avgTime    Float
  sampleSize Int
  updatedAt  DateTime @updatedAt

  @@unique([userId, part])
}

enum SessionMode {
  FULL_EXAM
  PART_PRACTICE
  ADAPTIVE
}

enum QuestionType {
  INCOMPLETE_SENTENCE
  TEXT_COMPLETION
  SINGLE_PASSAGE
  DOUBLE_PASSAGE
  TRIPLE_PASSAGE
}
