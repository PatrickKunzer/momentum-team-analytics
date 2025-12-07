/**
 * Mock Data for Chat & AI Metrics Dashboard
 */

// Primary KPIs
export const chatKPIs = {
  messagesPerDay: {
    value: 78500,
    change: 15.2,
    sparkline: [58000, 61000, 63500, 65000, 67200, 69000, 71500, 73000, 75000, 76200, 77800, 78500],
    target: '>50K',
  },
  avgResponseTime: {
    value: 1.8,
    change: -12.5,
    sparkline: [2.4, 2.3, 2.2, 2.1, 2.0, 1.95, 1.9, 1.85, 1.82, 1.8, 1.79, 1.8],
    target: '<2s',
  },
  generationStopRate: {
    value: 3.2,
    change: -0.8,
    sparkline: [4.5, 4.2, 4.0, 3.8, 3.6, 3.5, 3.4, 3.3, 3.25, 3.22, 3.2, 3.2],
    target: '<5%',
  },
  feedbackScore: {
    value: 4.2,
    change: 0.3,
    sparkline: [3.8, 3.85, 3.9, 3.95, 4.0, 4.05, 4.1, 4.12, 4.15, 4.18, 4.2, 4.2],
    target: '>4.0',
  },
};

// Messages per hour (24h)
export const messagesPerHourData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i.toString().padStart(2, '0')}:00`,
  messages: Math.round(
    1500 + Math.sin((i - 6) * Math.PI / 12) * 1200 + Math.random() * 300
  ),
}));

// Agent usage distribution
export const agentUsageData = [
  { name: 'Greta', value: 42, color: '#003D8F' },
  { name: 'Leo', value: 18, color: '#560E8A' },
  { name: 'Sarah', value: 15, color: '#D746F5' },
  { name: 'Ben', value: 12, color: '#00D4FF' },
  { name: 'Anna', value: 8, color: '#10B981' },
  { name: 'Andere', value: 5, color: '#F59E0B' },
];

// Tool usage breakdown
export const toolUsageData = [
  { tool: 'Web-Suche', usage: 34, trend: 5.2 },
  { tool: 'Code-Ausführung', usage: 28, trend: 12.8 },
  { tool: 'Bildgenerierung', usage: 18, trend: 8.4 },
  { tool: 'Dokument-Analyse', usage: 12, trend: -2.1 },
  { tool: 'Kalender', usage: 5, trend: 15.3 },
  { tool: 'E-Mail', usage: 3, trend: 22.1 },
];

// Response time distribution (P50, P95, P99)
export const responseTimeData = [
  { percentile: 'P50', time: 1.2, label: 'Median' },
  { percentile: 'P75', time: 1.6, label: '75%' },
  { percentile: 'P90', time: 2.1, label: '90%' },
  { percentile: 'P95', time: 2.8, label: '95%' },
  { percentile: 'P99', time: 4.5, label: '99%' },
];

// Message feedback ratio
export const feedbackData = {
  positive: 68,
  negative: 8,
  noFeedback: 24,
};

// Messages over time (7 days)
export const messagesOverTimeData = [
  { day: 'Mo', messages: 72500, chats: 12400 },
  { day: 'Di', messages: 78200, chats: 13100 },
  { day: 'Mi', messages: 81000, chats: 13800 },
  { day: 'Do', messages: 79500, chats: 13200 },
  { day: 'Fr', messages: 76800, chats: 12900 },
  { day: 'Sa', messages: 45200, chats: 8200 },
  { day: 'So', messages: 38500, chats: 7100 },
];

// Feature usage in messages
export const featureUsageInMessages = [
  { feature: 'Text only', percentage: 72 },
  { feature: 'Mit Bildern', percentage: 15 },
  { feature: 'Mit Dokumenten', percentage: 8 },
  { feature: 'Mit Code', percentage: 4 },
  { feature: 'Voice Input', percentage: 1 },
];
