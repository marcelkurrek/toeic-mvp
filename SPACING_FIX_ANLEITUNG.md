# Anleitung: Abstände in der Sidebar hinzufügen

## Problem
Die Sidebar-Navigation hat zu kleine Abstände zwischen Items und Sektionen.

## Lösung - 3 Optionen

### **Option 1: Direkt in Sidebar.tsx (EMPFOHLEN)**

1. Öffne die Datei: `src/components/Sidebar.tsx`

2. **Finde Zeile ~10** (SectionLabel Funktion):
```tsx
function SectionLabel({ label }: { label: string }) {
  return (
    <p className="text-xs font-semibold px-3"
      style={{
        color: 'var(--muted)',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        fontSize: 10,
        paddingTop: '48px',      // ← VERGRÖSSERN (von 32px)
        paddingBottom: '16px',   // ← VERGRÖSSERN (von 12px)
        marginTop: '24px'        // ← VERGRÖSSERN (von 16px)
      }}>
      {label}
    </p>
  )
}
```

**Ersetze die Werte mit:**
```tsx
paddingTop: '60px',      // Noch größer
paddingBottom: '20px',
marginTop: '30px'
```

3. **Finde Zeile ~38** (NavItem Funktion):
```tsx
return (
  <Link
    href={href}
    className="flex items-center gap-3 px-3 rounded-lg transition-all"
    style={{
      paddingTop: '16px',        // ← VERGRÖSSERN
      paddingBottom: '16px',     // ← VERGRÖSSERN
      marginBottom: '12px',      // ← VERGRÖSSERN
      background: active ? 'var(--accent-subtle)' : 'transparent',
      color: active ? 'var(--accent)' : 'var(--muted)',
      textDecoration: 'none',
    }}
```

**Ersetze mit:**
```tsx
paddingTop: '20px',
paddingBottom: '20px',
marginBottom: '16px',
```

4. **Speichern** (`Ctrl+S`)
5. Dev-Server kompiliert automatisch neu
6. **Browser refresh** (`F5`)

---

### **Option 2: Über globals.css (Alternative)**

1. Öffne: `src/app/globals.css`

2. Am Ende der Datei hinzufügen:
```css
/* Sidebar Spacing Overrides */
aside a {
  padding-top: 20px !important;
  padding-bottom: 20px !important;
  margin-bottom: 16px !important;
}

aside > nav > p,
aside > nav > div > p {
  padding-top: 60px !important;
  padding-bottom: 20px !important;
  margin-top: 30px !important;
}
```

3. Speichern und Browser refresh

---

### **Option 3: Mit Tailwind Classes**

In `src/components/Sidebar.tsx` ändern:

```tsx
// Von:
className="flex items-center gap-3 px-3 py-2 mb-1 rounded-lg transition-all"

// Zu:
className="flex items-center gap-3 px-3 py-5 mb-4 rounded-lg transition-all"
```

---

## Debugging Checklist

- [ ] Dev-Server läuft? (`npm run dev`)
- [ ] Datei gespeichert?
- [ ] Browser gecacht gelöscht? (`Ctrl+Shift+Delete`)
- [ ] Hard Refresh? (`Ctrl+Shift+R`)
- [ ] Port korrekt? (3000, 3001, 3002, 3003, etc.)
- [ ] Dark Theme aktiv? (nicht Print-Version)

## Wenn immer noch nichts funktioniert

1. **Stoppe Dev-Server:** `Ctrl+C`
2. **Lösche Cache:** `rm -rf .next`
3. **Starte neu:** `npm run dev`
4. Browser: **Incognito-Modus** öffnen
5. URL eingeben und testen

---

## Erwartetes Ergebnis

Nach den Änderungen sollte die Sidebar so aussehen:

```
T TOEIC Prep
📊 Dashboard

[GROSSER ABSTAND]

ÜBEN
⚡ Einstufungstest
    Lernstand ermitteln

[MEDIUM ABSTAND]

⭐ Grammatik
    Reading · Part 5

[etc.]
```
