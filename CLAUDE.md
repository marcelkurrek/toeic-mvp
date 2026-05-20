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

## Produkt-Prinzipien

- Der User soll nicht überlegen müssen was er tut — das System führt ihn guided
- Kein kognitiver Overhead: klare nächste Schritte, nicht zu viele Optionen
- Fokus auf Exam-Performance, nicht auf Wissensvermittlung
- Dashboard zeigt: wo stehe ich, wie aktiv bin ich, was ist als nächstes zu tun
