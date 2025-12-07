/**
 * Mock Data for Knowledge Hub Dashboard
 */

// Primary KPIs
export const knowledgeKPIs = {
  totalKnowledgeBases: {
    value: 2340,
    change: 18.5,
    sparkline: [1800, 1900, 1980, 2050, 2120, 2180, 2220, 2260, 2290, 2310, 2330, 2340],
    target: 'Wachstum',
  },
  totalFilesUploaded: {
    value: 45600,
    change: 22.3,
    sparkline: [32000, 34500, 36800, 38500, 40200, 41800, 43000, 44100, 44800, 45200, 45400, 45600],
    target: 'Wachstum',
  },
  usageInChat: {
    value: 42,
    change: 8.2,
    sparkline: [35, 36, 37, 38, 38.5, 39, 40, 40.5, 41, 41.5, 42, 42],
    target: '>50%',
  },
  processingSuccessRate: {
    value: 98.2,
    change: 0.5,
    sparkline: [96.5, 96.8, 97.0, 97.2, 97.5, 97.7, 97.9, 98.0, 98.1, 98.15, 98.18, 98.2],
    target: '>98%',
  },
};

// Content type distribution
export const contentTypeData = [
  { type: 'PDF', count: 23700, percentage: 52, color: '#003D8F' },
  { type: 'DOCX', count: 12800, percentage: 28, color: '#560E8A' },
  { type: 'Web URLs', count: 6400, percentage: 14, color: '#D746F5' },
  { type: 'Memories', count: 2280, percentage: 5, color: '#00D4FF' },
  { type: 'Cloud Storage', count: 420, percentage: 1, color: '#10B981' },
];

// Knowledge base lifecycle funnel
export const kbLifecycleFunnel = [
  { stage: 'created', value: 2340, label: 'KB erstellt' },
  { stage: 'filesAdded', value: 2106, label: 'Dateien hinzugefügt' },
  { stage: 'usedInChat', value: 1521, label: 'Im Chat genutzt' },
  { stage: 'regularUse', value: 982, label: 'Regelmäßig genutzt' },
];

// File size distribution
export const fileSizeDistribution = [
  { range: '< 1 MB', count: 28500, percentage: 62.5 },
  { range: '1-5 MB', count: 11400, percentage: 25.0 },
  { range: '5-10 MB', count: 3650, percentage: 8.0 },
  { range: '10-50 MB', count: 1820, percentage: 4.0 },
  { range: '> 50 MB', count: 230, percentage: 0.5 },
];

// Upload methods
export const uploadMethodsData = [
  { method: 'Drag & Drop', percentage: 45 },
  { method: 'File Picker', percentage: 32 },
  { method: 'URL Import', percentage: 14 },
  { method: 'Cloud Sync', percentage: 6 },
  { method: 'API', percentage: 3 },
];

// Processing performance
export const processingPerformanceData = [
  { day: 'Mo', avgTime: 2.3, successRate: 98.1 },
  { day: 'Di', avgTime: 2.1, successRate: 98.4 },
  { day: 'Mi', avgTime: 2.4, successRate: 97.9 },
  { day: 'Do', avgTime: 2.2, successRate: 98.2 },
  { day: 'Fr', avgTime: 2.0, successRate: 98.5 },
  { day: 'Sa', avgTime: 1.8, successRate: 98.8 },
  { day: 'So', avgTime: 1.7, successRate: 98.9 },
];

// Knowledge bases by size
export const kbBySizeData = [
  { size: '1-5 Dateien', count: 1240, percentage: 53 },
  { size: '6-20 Dateien', count: 702, percentage: 30 },
  { size: '21-50 Dateien', count: 281, percentage: 12 },
  { size: '> 50 Dateien', count: 117, percentage: 5 },
];

// Usage over time (12 weeks)
export const kbUsageOverTime = Array.from({ length: 12 }, (_, i) => ({
  week: `KW ${40 + i}`,
  created: Math.round(150 + i * 15 + Math.random() * 30),
  usedInChat: Math.round(120 + i * 12 + Math.random() * 25),
}));
