/**
 * Formatters for Analytics Dashboard
 * Provides consistent number, percentage, and date formatting
 */

/**
 * Format large numbers with K/M/B suffixes
 * @example formatNumber(12450) => "12.5K"
 * @example formatNumber(98500) => "98.5K"
 * @example formatNumber(1234567) => "1.2M"
 */
export function formatNumber(value: number, decimals = 1): string {
  if (value === 0) return '0';

  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (absValue >= 1_000_000_000) {
    return sign + (absValue / 1_000_000_000).toFixed(decimals).replace(/\.0$/, '') + 'B';
  }
  if (absValue >= 1_000_000) {
    return sign + (absValue / 1_000_000).toFixed(decimals).replace(/\.0$/, '') + 'M';
  }
  if (absValue >= 1_000) {
    return sign + (absValue / 1_000).toFixed(decimals).replace(/\.0$/, '') + 'K';
  }

  return sign + absValue.toLocaleString('de-DE');
}

/**
 * Format raw number with locale separators
 * @example formatRawNumber(12450) => "12.450"
 */
export function formatRawNumber(value: number): string {
  return value.toLocaleString('de-DE');
}

/**
 * Format percentage with + or - sign
 * @example formatPercent(8.3) => "+8.3%"
 * @example formatPercent(-1.2) => "-1.2%"
 */
export function formatPercent(value: number, decimals = 1): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}

/**
 * Format percentage without sign prefix
 * @example formatPercentSimple(42.3) => "42.3%"
 */
export function formatPercentSimple(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format duration in minutes
 * @example formatDuration(12.5) => "12.5 min"
 */
export function formatDuration(minutes: number): string {
  if (minutes < 1) {
    return `${Math.round(minutes * 60)}s`;
  }
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
  return `${minutes.toFixed(1)} min`;
}

/**
 * Format date relative to now (German)
 * @example formatRelativeDate(new Date()) => "Heute, 14:32"
 */
export function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  const timeStr = date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

  if (days === 0) {
    return `Heute, ${timeStr}`;
  }
  if (days === 1) {
    return `Gestern, ${timeStr}`;
  }
  if (days < 7) {
    return `Vor ${days} Tagen`;
  }

  return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/**
 * Format date for display
 * @example formatDate(new Date()) => "07.12.2025"
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

/**
 * Format timestamp for last updated display
 * @example formatTimestamp(new Date()) => "07.12.2025, 14:32"
 */
export function formatTimestamp(date: Date): string {
  return date.toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get trend direction
 */
export type TrendDirection = 'up' | 'down' | 'neutral';

export function getTrendDirection(value: number): TrendDirection {
  if (value > 0) return 'up';
  if (value < 0) return 'down';
  return 'neutral';
}

/**
 * Format conversion rate between funnel steps
 * @example formatConversionRate(4500, 10000) => "45%"
 */
export function formatConversionRate(current: number, previous: number): string {
  if (previous === 0) return '0%';
  const rate = (current / previous) * 100;
  return `${Math.round(rate)}%`;
}
