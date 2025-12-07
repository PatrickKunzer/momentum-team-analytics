<script lang="ts">
  import { formatNumber, formatPercent, getTrendDirection, type TrendDirection } from '$lib/utils/formatters';

  export let title: string;
  export let value: number;
  export let change: number;
  export let previousPeriod: string = 'vs. Vorwoche';
  export let format: 'number' | 'percent' | 'duration' | 'raw' = 'number';
  export let target: string | null = null;
  export let sparklineData: number[] = [];
  export let invertTrend: boolean = false; // For metrics where down is good (e.g., error rate)

  $: formattedValue = formatValue(value, format);
  $: trend = getTrendDirection(change);
  $: isPositive = invertTrend ? trend === 'down' : trend === 'up';
  $: isNegative = invertTrend ? trend === 'up' : trend === 'down';

  function formatValue(val: number, fmt: string): string {
    switch (fmt) {
      case 'percent':
        return `${val.toFixed(1)}%`;
      case 'duration':
        return `${val.toFixed(1)} min`;
      case 'raw':
        return val.toLocaleString('de-DE');
      default:
        return formatNumber(val);
    }
  }

  // Generate sparkline path
  $: sparklinePath = generateSparkline(sparklineData);

  function generateSparkline(data: number[]): string {
    if (data.length < 2) return '';

    const width = 80;
    const height = 32;
    const padding = 2;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const points = data.map((val, i) => {
      const x = padding + (i / (data.length - 1)) * (width - padding * 2);
      const y = height - padding - ((val - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    });

    return `M${points.join(' L')}`;
  }
</script>

<div class="kpi-card" class:has-sparkline={sparklineData.length > 0}>
  <div class="kpi-header">
    <span class="kpi-title">{title}</span>
    {#if target}
      <span class="kpi-target">Ziel: {target}</span>
    {/if}
  </div>

  <div class="kpi-body">
    <div class="kpi-main">
      <span class="kpi-value">{formattedValue}</span>
      <div
        class="kpi-change"
        class:positive={isPositive}
        class:negative={isNegative}
        class:neutral={trend === 'neutral'}
      >
        {#if trend === 'up'}
          <svg class="trend-icon" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 4l4 4H9v4H7V8H4l4-4z"/>
          </svg>
        {:else if trend === 'down'}
          <svg class="trend-icon" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 12l-4-4h3V4h2v4h3l-4 4z"/>
          </svg>
        {/if}
        <span>{formatPercent(change)}</span>
      </div>
    </div>

    {#if sparklineData.length > 0}
      <div class="kpi-sparkline">
        <svg viewBox="0 0 80 32" preserveAspectRatio="none">
          <path
            d={sparklinePath}
            fill="none"
            stroke={isPositive ? '#10B981' : isNegative ? '#EF4444' : '#718095'}
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
    {/if}
  </div>

  <span class="kpi-period">{previousPeriod}</span>
</div>

<style>
  .kpi-card {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 20px 24px;
    background: var(--white, #FFFFFF);
    border: 1px solid rgba(0, 27, 65, 0.06);
    border-radius: 16px;
    transition: all 0.2s ease;
    min-width: 200px;
  }

  .kpi-card:hover {
    border-color: rgba(86, 14, 138, 0.15);
    box-shadow: 0 4px 20px rgba(0, 27, 65, 0.08);
  }

  .kpi-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .kpi-title {
    font-family: 'Open Sans', sans-serif;
    font-size: 13px;
    font-weight: 500;
    color: var(--text-secondary, #718095);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .kpi-target {
    font-size: 10px;
    font-weight: 500;
    color: var(--text-muted, #97A3B4);
    padding: 2px 8px;
    background: rgba(0, 27, 65, 0.04);
    border-radius: 4px;
  }

  .kpi-body {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;
  }

  .kpi-main {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .kpi-value {
    font-family: 'Overpass', sans-serif;
    font-size: 36px;
    font-weight: 600;
    line-height: 1;
    color: var(--text-primary, #001B41);
    letter-spacing: -0.5px;
  }

  .kpi-change {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-family: 'Open Sans', sans-serif;
    font-size: 13px;
    font-weight: 600;
    padding: 4px 8px;
    border-radius: 6px;
    width: fit-content;
  }

  .kpi-change.positive {
    color: #059669;
    background: rgba(16, 185, 129, 0.1);
  }

  .kpi-change.negative {
    color: #DC2626;
    background: rgba(239, 68, 68, 0.1);
  }

  .kpi-change.neutral {
    color: var(--text-secondary, #718095);
    background: rgba(0, 27, 65, 0.05);
  }

  .trend-icon {
    width: 14px;
    height: 14px;
  }

  .kpi-sparkline {
    width: 80px;
    height: 32px;
    flex-shrink: 0;
  }

  .kpi-sparkline svg {
    width: 100%;
    height: 100%;
  }

  .kpi-period {
    font-family: 'Open Sans', sans-serif;
    font-size: 11px;
    color: var(--text-muted, #97A3B4);
  }

  /* Responsive */
  @media (max-width: 640px) {
    .kpi-card {
      padding: 16px 20px;
    }

    .kpi-value {
      font-size: 28px;
    }

    .kpi-sparkline {
      display: none;
    }
  }
</style>
