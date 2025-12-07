# Executive Overview Dashboard

> **Momentum Analytics** · Version 0.1.0 · Product Owner Dashboard

Professionelles Analytics Dashboard für Product Owner mit Fokus auf die wichtigsten KPIs und Veränderungen.

---

## Features

### KPI Cards mit Sparklines
- **DAU/WAU/MAU** - Aktive Nutzer im Zeitverlauf
- **Trend-Indikatoren** - Visuelle Änderungsanzeige mit +/- %
- **Sparklines** - Mini-Charts für schnellen Trend-Überblick
- **Ziele** - Target-Badges für jede Metrik

### Visualisierungen
- **Active Users Chart** - Interaktives Liniendiagramm (12 Wochen)
- **Signup Funnel** - Conversion-Funnel von Visit bis D7 Retention
- **Feature Adoption** - Horizontales Balkendiagramm nach Adoptionsrate

### Alerts Panel
- **Wichtige Hinweise** - Automatische Alerts bei KPI-Abweichungen
- **Farbkodierung** - Warning, Error, Info, Success
- **Zeitstempel** - Relative Zeitangaben

---

## Technologie

- **SvelteKit** - Frontend Framework
- **ECharts** - Professionelle Chart-Library
- **TypeScript** - Type Safety
- **IONOS Design System** - Konsistentes Branding

---

## Struktur

```
dashboard/
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   ├── KPICard/         # KPI-Karten mit Sparklines
│   │   │   ├── Charts/          # ECharts-Wrapper & Visualisierungen
│   │   │   └── Layout/          # Header, Alerts, etc.
│   │   ├── stores/
│   │   │   └── mockData.ts      # Realistische Demo-Daten
│   │   └── utils/
│   │       ├── theme.ts         # Design Tokens
│   │       └── formatters.ts    # Zahlen/Datum-Formatierung
│   └── routes/
│       └── overview/            # Executive Overview Page
├── package.json
├── svelte.config.js
└── vite.config.ts
```

---

## Installation

```bash
cd momentum-team-analytics-repo/dashboard
npm install
npm run dev
```

Das Dashboard ist dann unter `http://localhost:5173/overview` erreichbar.

---

## Design Tokens

Das Dashboard verwendet das IONOS Design System:

```typescript
colors: {
  primaryDark: '#001B41',
  primaryBlue: '#003D8F',
  primaryPurple: '#560E8A',
  accentMagenta: '#D746F5',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
}
```

---

## Komponenten-Übersicht

### KPICard
```svelte
<KPICard
  title="DAU"
  value={12450}
  change={8.3}
  target="Wachstum"
  sparklineData={[...]}
  previousPeriod="vs. Vorwoche"
/>
```

### ActiveUsersChart
```svelte
<ActiveUsersChart
  data={[{ week: 'KW 45', dau: 12000, wau: 45000, mau: 98000 }, ...]}
  height="380px"
/>
```

### SignupFunnelChart
```svelte
<SignupFunnelChart
  data={[
    { stage: 'visited', value: 10000, label: 'App besucht' },
    { stage: 'signup', value: 4500, label: 'Registriert' },
    ...
  ]}
/>
```

### FeatureAdoptionChart
```svelte
<FeatureAdoptionChart
  data={[
    { feature: 'Chat', adoption: 95, target: 90 },
    { feature: 'Knowledge Base', adoption: 42, target: 50 },
    ...
  ]}
/>
```

---

## Nächste Schritte

Nach dem Executive Overview Dashboard werden folgende Dashboards implementiert:

1. **Chat & AI Metrics** - Messages, Response Times, Agent Usage
2. **Knowledge Hub Metrics** - File Uploads, Usage in Chat
3. **Integration Metrics** - OAuth Funnels, Provider Usage
4. **Performance & Errors** - API Latency, Error Rates
5. **User Journey** - Retention Cohorts, Onboarding Funnel

---

## Lizenz

Internes IONOS Projekt - Alle Rechte vorbehalten.
