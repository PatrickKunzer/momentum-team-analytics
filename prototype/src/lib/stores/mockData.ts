/**
 * Mock Data for Executive Overview Dashboard
 * Realistic data for Product Owner use case
 */

// Generate date labels for last 12 weeks
function generateWeekLabels(count: number): string[] {
  const labels: string[] = [];
  const now = new Date();

  for (let i = count - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i * 7);
    const weekNum = getWeekNumber(date);
    labels.push(`KW ${weekNum}`);
  }

  return labels;
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

// Primary KPIs - Core metrics for Product Owner
export const primaryKPIs = {
  dau: {
    value: 12450,
    change: 8.3,
    sparkline: [9800, 10200, 10800, 11100, 11400, 11200, 11800, 12100, 12000, 12300, 12200, 12450],
    target: 'Wachstum',
  },
  wau: {
    value: 45230,
    change: 5.2,
    sparkline: [38000, 39500, 40200, 41000, 42100, 42800, 43200, 43900, 44200, 44600, 45000, 45230],
    target: 'Wachstum',
  },
  mau: {
    value: 98500,
    change: 12.1,
    sparkline: [78000, 80500, 82000, 84500, 86000, 88200, 90100, 92000, 94000, 95800, 97200, 98500],
    target: 'Wachstum',
  },
};

// Secondary KPIs - Engagement & Retention
export const secondaryKPIs = {
  messagesPerDay: {
    value: 78500,
    change: 15.2,
    sparkline: [58000, 61000, 63500, 65000, 67200, 69000, 71500, 73000, 75000, 76200, 77800, 78500],
    target: '>5/User',
  },
  avgSessionDuration: {
    value: 12.5,
    change: 2.1,
    sparkline: [9.8, 10.1, 10.4, 10.8, 11.0, 11.2, 11.5, 11.8, 12.0, 12.2, 12.3, 12.5],
    target: '>10 min',
  },
  d7Retention: {
    value: 42.3,
    change: -1.2,
    sparkline: [44.5, 44.2, 43.8, 43.5, 43.2, 42.8, 42.5, 42.8, 42.6, 42.4, 42.5, 42.3],
    target: '>40%',
  },
};

// Active Users Chart Data (12 weeks)
export const activeUsersData = generateWeekLabels(12).map((week, index) => ({
  week,
  dau: primaryKPIs.dau.sparkline[index],
  wau: primaryKPIs.wau.sparkline[index],
  mau: primaryKPIs.mau.sparkline[index],
}));

// Signup Funnel Data
export const signupFunnelData = [
  { stage: 'visited', value: 10000, label: 'App besucht' },
  { stage: 'signup', value: 4500, label: 'Registriert' },
  { stage: 'firstChat', value: 3510, label: 'Erster Chat' },
  { stage: 'd7Active', value: 2282, label: 'Tag 7 aktiv' },
];

// Feature Adoption Data - Critical for Product Owner
export const featureAdoptionData = [
  { feature: 'Chat', adoption: 95, target: 90 },
  { feature: 'Mehrere Agenten', adoption: 68, target: 60 },
  { feature: 'Knowledge Base', adoption: 42, target: 50 },
  { feature: 'Integrationen', adoption: 28, target: 35 },
  { feature: 'Custom Prompts', adoption: 15, target: 20 },
  { feature: 'Bildgenerierung', adoption: 12, target: 15 },
];

// Alerts - Important changes requiring attention
export interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  message: string;
  metric: string;
  timestamp: Date;
}

export const alerts: Alert[] = [
  {
    id: '1',
    type: 'warning',
    title: 'D7 Retention unter Ziel',
    message: 'Die 7-Tage-Retention liegt bei 42.3% (Ziel: >40%). Trend ist leicht negativ.',
    metric: 'd7Retention',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: '2',
    type: 'success',
    title: 'MAU Wachstum stark',
    message: '+12.1% MAU Wachstum diese Woche. Stärkstes Wachstum seit 3 Monaten.',
    metric: 'mau',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
  },
  {
    id: '3',
    type: 'info',
    title: 'Knowledge Base Adoption',
    message: 'Knowledge Base Adoption bei 42% - 8% unter Ziel. Onboarding-Verbesserung empfohlen.',
    metric: 'knowledgeBase',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
  },
];

// Dashboard metadata
export const dashboardMeta = {
  title: 'Executive Overview',
  subtitle: 'Wichtigste KPIs auf einen Blick',
  lastUpdated: new Date(),
  dataRange: 'Letzte 30 Tage',
};
