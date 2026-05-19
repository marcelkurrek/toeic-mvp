# CLAUDE.md — Project Context & Learnings

## Project
TOEIC MVP — Next.js 14 app with Prisma/Supabase, listening/reading/speaking/writing practice for TOEIC exam prep.

## Key Conventions
- Components live in `src/components/`
- API routes in `src/app/api/`
- Zustand store in `src/store/exam.ts`
- i18n translations in `src/lib/i18n/translations.ts`
- TTS audio via `/api/tts` (ElevenLabs) — POST `{ text }` → audio/mpeg

## Learnings

### File corruption via accidental shell redirect
**What happened:** `src/components/ListeningShell.tsx` got corrupted — it contained only `✓ Part 1-4 Pages erstelltcat` instead of valid TypeScript, causing a Next.js syntax error on all `/practice/part*` routes.

**Root cause:** A shell command's stdout was accidentally redirected into a source file (e.g. `some-command > src/components/File.tsx`). The `>` operator truncates the file before the command runs, so even a failed command leaves the file empty or with garbage content.

**Prevention:**
- A pre-commit hook (`.git/hooks/pre-commit`) now checks all staged `.ts/.tsx` files with `npx tsc --noEmit` and blocks commits if syntax errors are found.
- Never use bare `>` redirects into source files. Use a temp file first, verify, then move.
- If a source file looks wrong (`git diff` shows unexpected content), run `git restore <file>` immediately before staging.
