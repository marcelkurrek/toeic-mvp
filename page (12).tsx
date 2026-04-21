@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #0a0a0f;
  --foreground: #f0f0f5;
  --card: #13131a;
  --card-border: #1e1e2e;
  --accent: #6366f1;
  --accent-hover: #4f46e5;
  --accent-subtle: #6366f120;
  --success: #22c55e;
  --error: #ef4444;
  --warning: #f59e0b;
  --muted: #64648a;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  background: var(--background);
  color: var(--foreground);
  font-family: 'Inter', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}

.card {
  background: var(--card);
  border: 1px solid var(--card-border);
  border-radius: 12px;
}
