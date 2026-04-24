# Claude Code Learnings

## Problem: Änderungen nicht im Browser sichtbar (GitHub Codespaces)

### Was passiert ist
Claude Code bearbeitet Dateien in `/home/user/toeic-mvp`.
Der Dev-Server läuft aber im Codespace unter `/workspaces/toeic-mvp`.
Das sind zwei verschiedene Verzeichnisse — Änderungen kommen nicht automatisch an.

### Symptome
- Code-Änderungen sind auf GitHub gepusht ✅
- Im Browser aber nicht sichtbar ❌
- Hot-Reload funktioniert nicht ❌
- Cache leeren hilft nicht ❌

### Lösung
Der User muss im Codespace-Terminal einmalig ausführen:
```bash
git pull origin main
```

### Was ich früher hätte fragen sollen
"In welchem Verzeichnis läuft dein Dev-Server?"
```bash
pwd
```
im Codespace-Terminal hätte sofort gezeigt: `/workspaces/toeic-mvp` ≠ `/home/user/toeic-mvp`

### Regel für die Zukunft
Wenn Änderungen im Browser nicht sichtbar sind:
1. Zuerst fragen: "Läuft der Dev-Server im Codespace oder lokal?"
2. Dann: `git pull origin main` im Codespace-Terminal vorschlagen
3. NICHT: CSS-Werte immer größer machen oder Cache leeren
