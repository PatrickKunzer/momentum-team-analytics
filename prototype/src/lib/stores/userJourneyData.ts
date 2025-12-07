/**
 * Mock Data for User Journey Dashboard
 */

// Primary KPIs
export const userJourneyKPIs = {
  signups30d: {
    value: 8450,
    change: 22.5,
    sparkline: [5200, 5600, 5900, 6300, 6700, 7100, 7400, 7700, 7950, 8150, 8300, 8450],
    target: 'Wachstum',
  },
  activationRate: {
    value: 78,
    change: 4.2,
    sparkline: [68, 70, 71, 72, 73, 74, 75, 76, 77, 77.5, 78, 78],
    target: '>70%',
  },
  d7Retention: {
    value: 42.3,
    change: -1.2,
    sparkline: [44.5, 44.2, 43.8, 43.5, 43.2, 42.8, 42.5, 42.8, 42.6, 42.4, 42.5, 42.3],
    target: '>40%',
  },
  d30Retention: {
    value: 28.5,
    change: 2.8,
    sparkline: [24, 24.5, 25, 25.5, 26, 26.5, 27, 27.3, 27.8, 28, 28.3, 28.5],
    target: '>25%',
  },
};

// Onboarding funnel
export const onboardingFunnelData = [
  { stage: 'visitApp', value: 45000, label: 'App besucht' },
  { stage: 'signup', value: 8450, label: 'Registriert' },
  { stage: 'firstChat', value: 6591, label: 'Erster Chat' },
  { stage: 'secondChat', value: 5436, label: 'Zweiter Chat' },
  { stage: 'd7Return', value: 3574, label: 'Tag 7 zurück' },
  { stage: 'd30Return', value: 2408, label: 'Tag 30 zurück' },
];

// Retention cohort data (weekly cohorts)
export const retentionCohortData = [
  { cohort: 'KW 45', users: 1850, d1: 82, d3: 65, d7: 48, d14: 38, d30: 28 },
  { cohort: 'KW 46', users: 1920, d1: 84, d3: 67, d7: 50, d14: 40, d30: 29 },
  { cohort: 'KW 47', users: 2050, d1: 83, d3: 66, d7: 49, d14: 39, d30: null },
  { cohort: 'KW 48', users: 2180, d1: 85, d3: 68, d7: 51, d14: null, d30: null },
  { cohort: 'KW 49', users: 2280, d1: 86, d3: 69, d7: null, d14: null, d30: null },
  { cohort: 'KW 50', users: 2420, d1: 84, d3: null, d7: null, d14: null, d30: null },
];

// First actions after signup
export const firstActionsData = [
  { action: 'Chat gestartet', percentage: 78, avgTime: '2.5 min' },
  { action: 'Profil angepasst', percentage: 45, avgTime: '5.2 min' },
  { action: 'Agent gewechselt', percentage: 32, avgTime: '8.1 min' },
  { action: 'Knowledge Base erstellt', percentage: 18, avgTime: '15.4 min' },
  { action: 'Integration verbunden', percentage: 12, avgTime: '12.8 min' },
];

// Churn indicators
export const churnIndicatorsData = [
  { indicator: 'Keine Aktivität 7+ Tage', riskLevel: 'high', users: 4520, percentage: 18 },
  { indicator: 'Nur 1 Chat Session', riskLevel: 'medium', users: 3200, percentage: 13 },
  { indicator: 'Negatives Feedback', riskLevel: 'medium', users: 1850, percentage: 7 },
  { indicator: 'Fehler bei Nutzung', riskLevel: 'low', users: 980, percentage: 4 },
  { indicator: 'Feature nicht gefunden', riskLevel: 'low', users: 650, percentage: 3 },
];

// Feature adoption timeline (days after signup)
export const featureAdoptionTimeline = [
  { feature: 'Chat', d1: 78, d7: 85, d14: 88, d30: 90 },
  { feature: 'Agent-Wechsel', d1: 15, d7: 45, d14: 58, d30: 68 },
  { feature: 'Knowledge Base', d1: 5, d7: 22, d14: 35, d30: 42 },
  { feature: 'Integrationen', d1: 3, d7: 15, d14: 22, d30: 28 },
  { feature: 'Custom Prompts', d1: 1, d7: 8, d14: 12, d30: 15 },
];

// User segments
export const userSegmentsData = [
  { segment: 'Power Users', users: 4925, percentage: 5, avgMessages: 45, retention: 85 },
  { segment: 'Regular Users', users: 24625, percentage: 25, avgMessages: 12, retention: 55 },
  { segment: 'Casual Users', users: 34475, percentage: 35, avgMessages: 4, retention: 32 },
  { segment: 'At Risk', users: 19700, percentage: 20, avgMessages: 1, retention: 15 },
  { segment: 'Churned', users: 14775, percentage: 15, avgMessages: 0, retention: 0 },
];

// Signup sources
export const signupSourcesData = [
  { source: 'Organic Search', signups: 3380, percentage: 40, conversion: 4.2 },
  { source: 'Direct', signups: 2112, percentage: 25, conversion: 8.5 },
  { source: 'Social Media', signups: 1268, percentage: 15, conversion: 2.8 },
  { source: 'Referral', signups: 845, percentage: 10, conversion: 12.4 },
  { source: 'Email Campaign', signups: 507, percentage: 6, conversion: 6.2 },
  { source: 'Paid Ads', signups: 338, percentage: 4, conversion: 1.8 },
];

// Daily signups trend
export const dailySignupsData = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  return {
    date: date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }),
    signups: Math.round(250 + Math.random() * 100 + (i * 5)),
    activations: Math.round(195 + Math.random() * 80 + (i * 4)),
  };
});
