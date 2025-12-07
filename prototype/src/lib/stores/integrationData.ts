/**
 * Mock Data for Integration Metrics Dashboard
 */

// Primary KPIs
export const integrationKPIs = {
  connectedUsers: {
    value: 27580,
    change: 12.4,
    sparkline: [22000, 23100, 24000, 24800, 25500, 26100, 26600, 27000, 27200, 27400, 27500, 27580],
    target: 'Wachstum',
  },
  oauthSuccessRate: {
    value: 94.5,
    change: 2.1,
    sparkline: [91, 91.5, 92, 92.5, 93, 93.3, 93.6, 94, 94.2, 94.3, 94.4, 94.5],
    target: '>95%',
  },
  usageInChat: {
    value: 28,
    change: 5.8,
    sparkline: [22, 23, 23.5, 24, 25, 25.5, 26, 26.5, 27, 27.5, 28, 28],
    target: '>35%',
  },
  disconnectRate: {
    value: 4.2,
    change: -1.5,
    sparkline: [6.5, 6.2, 5.9, 5.6, 5.3, 5.1, 4.9, 4.7, 4.5, 4.3, 4.2, 4.2],
    target: '<5%',
  },
};

// Integration funnel
export const integrationFunnelData = [
  { stage: 'viewed', value: 45000, label: 'Integration angesehen' },
  { stage: 'connectClicked', value: 32400, label: 'Verbinden geklickt' },
  { stage: 'oauthComplete', value: 30618, label: 'OAuth abgeschlossen' },
  { stage: 'usedInChat', value: 21200, label: 'Im Chat genutzt' },
];

// Connections by provider
export const connectionsByProvider = [
  { provider: 'Google', connections: 14340, percentage: 52, color: '#4285F4', icon: 'google' },
  { provider: 'Microsoft', connections: 8826, percentage: 32, color: '#00A4EF', icon: 'microsoft' },
  { provider: 'Meta', connections: 3310, percentage: 12, color: '#1877F2', icon: 'meta' },
  { provider: 'LinkedIn', connections: 1104, percentage: 4, color: '#0A66C2', icon: 'linkedin' },
];

// Service usage breakdown
export const serviceUsageData = [
  { service: 'Gmail', provider: 'Google', usage: 42, trend: 8.2 },
  { service: 'Google Calendar', provider: 'Google', usage: 28, trend: 15.4 },
  { service: 'Google Drive', provider: 'Google', usage: 18, trend: 12.1 },
  { service: 'Outlook', provider: 'Microsoft', usage: 22, trend: 6.8 },
  { service: 'OneDrive', provider: 'Microsoft', usage: 12, trend: 9.2 },
  { service: 'LinkedIn', provider: 'LinkedIn', usage: 8, trend: 22.5 },
  { service: 'Instagram', provider: 'Meta', usage: 6, trend: -3.2 },
  { service: 'Facebook', provider: 'Meta', usage: 4, trend: -5.1 },
];

// OAuth error breakdown
export const oauthErrorsData = [
  { error: 'User cancelled', count: 892, percentage: 48 },
  { error: 'Token expired', count: 445, percentage: 24 },
  { error: 'Permission denied', count: 296, percentage: 16 },
  { error: 'Network error', count: 148, percentage: 8 },
  { error: 'Other', count: 74, percentage: 4 },
];

// Connection trends (12 weeks)
export const connectionTrendsData = Array.from({ length: 12 }, (_, i) => ({
  week: `KW ${40 + i}`,
  newConnections: Math.round(1800 + i * 120 + Math.random() * 200),
  disconnections: Math.round(80 + Math.random() * 40),
  activeUsage: Math.round(1500 + i * 100 + Math.random() * 150),
}));

// Integration health status
export const integrationHealthData = [
  { provider: 'Google', status: 'healthy', uptime: 99.98, lastIncident: null },
  { provider: 'Microsoft', status: 'healthy', uptime: 99.95, lastIncident: '2024-12-01' },
  { provider: 'Meta', status: 'degraded', uptime: 99.12, lastIncident: '2024-12-05' },
  { provider: 'LinkedIn', status: 'healthy', uptime: 99.89, lastIncident: null },
];

// User segments by integration count
export const usersByIntegrationCount = [
  { count: '0 Integrationen', users: 70920, percentage: 72 },
  { count: '1 Integration', users: 14760, percentage: 15 },
  { count: '2 Integrationen', users: 7872, percentage: 8 },
  { count: '3+ Integrationen', users: 4948, percentage: 5 },
];
