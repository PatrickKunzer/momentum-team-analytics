/**
 * Mock Data for Performance & Errors Dashboard
 */

// Primary KPIs
export const performanceKPIs = {
  errorRate: {
    value: 0.42,
    change: -15.2,
    sparkline: [0.65, 0.62, 0.58, 0.55, 0.52, 0.50, 0.48, 0.46, 0.44, 0.43, 0.42, 0.42],
    target: '<0.5%',
  },
  apiP95Latency: {
    value: 245,
    change: -8.5,
    sparkline: [320, 305, 295, 285, 275, 268, 262, 258, 252, 248, 246, 245],
    target: '<300ms',
  },
  webSocketUptime: {
    value: 99.97,
    change: 0.02,
    sparkline: [99.92, 99.93, 99.94, 99.94, 99.95, 99.95, 99.96, 99.96, 99.97, 99.97, 99.97, 99.97],
    target: '>99.9%',
  },
  slowRequestsPercent: {
    value: 2.8,
    change: -22.2,
    sparkline: [5.2, 4.8, 4.5, 4.2, 3.9, 3.7, 3.4, 3.2, 3.0, 2.9, 2.8, 2.8],
    target: '<3%',
  },
};

// Error rate over time (24h)
export const errorRateOverTime = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i.toString().padStart(2, '0')}:00`,
  errorRate: Math.max(0.1, 0.35 + Math.sin(i * Math.PI / 12) * 0.15 + Math.random() * 0.1),
  requests: Math.round(8000 + Math.sin((i - 6) * Math.PI / 12) * 5000 + Math.random() * 1000),
}));

// Top errors table
export const topErrorsData = [
  { code: 'RATE_LIMIT_EXCEEDED', count: 1245, percentage: 28, trend: -12, severity: 'medium' },
  { code: 'TOKEN_EXPIRED', count: 892, percentage: 20, trend: -8, severity: 'low' },
  { code: 'INVALID_REQUEST', count: 668, percentage: 15, trend: 5, severity: 'low' },
  { code: 'PROVIDER_TIMEOUT', count: 534, percentage: 12, trend: -22, severity: 'high' },
  { code: 'CONTEXT_TOO_LONG', count: 445, percentage: 10, trend: 15, severity: 'medium' },
  { code: 'WEBSOCKET_DISCONNECT', count: 312, percentage: 7, trend: -5, severity: 'medium' },
  { code: 'FILE_TOO_LARGE', count: 178, percentage: 4, trend: 2, severity: 'low' },
  { code: 'UNKNOWN_ERROR', count: 178, percentage: 4, trend: -3, severity: 'high' },
];

// API latency by endpoint
export const apiLatencyByEndpoint = [
  { endpoint: '/api/chat/send', p50: 180, p95: 320, p99: 580 },
  { endpoint: '/api/chat/stream', p50: 45, p95: 120, p99: 280 },
  { endpoint: '/api/knowledge/query', p50: 220, p95: 450, p99: 820 },
  { endpoint: '/api/files/upload', p50: 350, p95: 850, p99: 1500 },
  { endpoint: '/api/integrations/sync', p50: 280, p95: 520, p99: 950 },
  { endpoint: '/api/auth/refresh', p50: 25, p95: 65, p99: 120 },
];

// WebSocket health metrics
export const webSocketMetrics = {
  activeConnections: 42350,
  messagesPerSecond: 1250,
  avgReconnectTime: 1.2,
  disconnectsPerHour: 85,
};

// Client errors breakdown
export const clientErrorsData = [
  { type: 'JavaScript Error', count: 2450, percentage: 45 },
  { type: 'Network Timeout', count: 1630, percentage: 30 },
  { type: 'API Error', count: 815, percentage: 15 },
  { type: 'Rendering Error', count: 325, percentage: 6 },
  { type: 'Other', count: 218, percentage: 4 },
];

// Slow requests analysis
export const slowRequestsData = [
  { endpoint: '/api/knowledge/query', avgTime: 1850, count: 245, cause: 'Large context' },
  { endpoint: '/api/files/upload', avgTime: 2200, count: 189, cause: 'File size' },
  { endpoint: '/api/chat/send', avgTime: 1650, count: 156, cause: 'Model latency' },
  { endpoint: '/api/integrations/sync', avgTime: 1450, count: 98, cause: 'External API' },
];

// Performance trends (7 days)
export const performanceTrendsData = [
  { day: 'Mo', p50: 165, p95: 285, p99: 520, errorRate: 0.45 },
  { day: 'Di', p50: 172, p95: 295, p99: 545, errorRate: 0.48 },
  { day: 'Mi', p50: 168, p95: 288, p99: 530, errorRate: 0.42 },
  { day: 'Do', p50: 175, p95: 302, p99: 565, errorRate: 0.44 },
  { day: 'Fr', p50: 182, p95: 315, p99: 590, errorRate: 0.46 },
  { day: 'Sa', p50: 145, p95: 245, p99: 450, errorRate: 0.35 },
  { day: 'So', p50: 138, p95: 235, p99: 425, errorRate: 0.32 },
];

// System health overview
export const systemHealthData = {
  api: { status: 'healthy', latency: 245, uptime: 99.98 },
  database: { status: 'healthy', latency: 12, uptime: 99.99 },
  redis: { status: 'healthy', latency: 2, uptime: 99.99 },
  websocket: { status: 'healthy', latency: 8, uptime: 99.97 },
  aiProvider: { status: 'healthy', latency: 180, uptime: 99.95 },
  storage: { status: 'healthy', latency: 45, uptime: 99.98 },
};
