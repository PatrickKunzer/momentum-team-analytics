<script lang="ts">
  import BaseChart from './BaseChart.svelte';
  import { colors, chartColors } from '$lib/utils/theme';
  import { formatNumber, formatConversionRate } from '$lib/utils/formatters';
  import type { EChartsOption } from 'echarts';

  export let data: { stage: string; value: number; label: string }[];
  export let height: string = '320px';

  $: chartOption = buildChartOption(data);

  function buildChartOption(chartData: typeof data): EChartsOption {
    // Calculate conversion rates between stages
    const withRates = chartData.map((item, index) => ({
      ...item,
      conversionRate: index > 0 ? (item.value / chartData[index - 1].value) * 100 : 100,
    }));

    return {
      title: {
        text: 'Signup Funnel',
        subtext: 'Letzte 30 Tage',
        left: 0,
      },
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const data = params.data;
          const index = chartData.findIndex(d => d.stage === data.name);
          const convRate = index > 0
            ? formatConversionRate(chartData[index].value, chartData[index - 1].value)
            : '100%';

          return `
            <div style="font-weight: 600; margin-bottom: 8px;">${data.name}</div>
            <div style="display:flex;justify-content:space-between;gap:24px;">
              <span>Nutzer</span>
              <strong>${formatNumber(data.value)}</strong>
            </div>
            ${index > 0 ? `
            <div style="display:flex;justify-content:space-between;gap:24px;margin-top:4px;color:${colors.textMuted};">
              <span>Conversion</span>
              <strong>${convRate}</strong>
            </div>
            ` : ''}
          `;
        },
      },
      grid: {
        left: 0,
        right: 0,
        top: 72,
        bottom: 0,
        containLabel: true,
      },
      series: [
        {
          type: 'funnel',
          left: '10%',
          width: '80%',
          top: 72,
          bottom: 24,
          minSize: '20%',
          maxSize: '100%',
          sort: 'descending',
          gap: 4,
          label: {
            show: true,
            position: 'inside',
            formatter: (params: any) => {
              return `{name|${params.name}}\n{value|${formatNumber(params.value)}}`;
            },
            rich: {
              name: {
                fontSize: 13,
                fontWeight: 500,
                color: '#FFFFFF',
                lineHeight: 20,
              },
              value: {
                fontSize: 18,
                fontWeight: 600,
                color: '#FFFFFF',
                lineHeight: 24,
              },
            },
          },
          labelLine: {
            show: false,
          },
          itemStyle: {
            borderWidth: 0,
            borderRadius: 4,
          },
          emphasis: {
            label: {
              fontSize: 14,
            },
          },
          data: chartData.map((item, index) => ({
            name: item.label,
            value: item.value,
            itemStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 1,
                y2: 0,
                colorStops: [
                  { offset: 0, color: chartColors.primary[index % chartColors.primary.length] },
                  { offset: 1, color: adjustColor(chartColors.primary[index % chartColors.primary.length], 20) },
                ],
              },
            },
          })),
        },
      ],
    };
  }

  // Helper to lighten color
  function adjustColor(hex: string, percent: number): string {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, ((num >> 8) & 0x00ff) + amt);
    const B = Math.min(255, (num & 0x0000ff) + amt);
    return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
  }
</script>

<div class="chart-card">
  <BaseChart option={chartOption} {height} />

  <!-- Conversion Rate Indicators -->
  <div class="conversion-indicators">
    {#each data as item, index}
      {#if index > 0}
        <div class="conversion-step">
          <div class="conversion-arrow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12l7 7 7-7"/>
            </svg>
          </div>
          <span class="conversion-rate">{formatConversionRate(item.value, data[index - 1].value)}</span>
        </div>
      {/if}
    {/each}
  </div>
</div>

<style>
  .chart-card {
    background: var(--white, #FFFFFF);
    border: 1px solid rgba(0, 27, 65, 0.06);
    border-radius: 16px;
    padding: 24px;
    transition: all 0.2s ease;
    position: relative;
  }

  .chart-card:hover {
    border-color: rgba(86, 14, 138, 0.12);
    box-shadow: 0 4px 20px rgba(0, 27, 65, 0.06);
  }

  .conversion-indicators {
    position: absolute;
    right: 32px;
    top: 100px;
    display: flex;
    flex-direction: column;
    gap: 36px;
  }

  .conversion-step {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .conversion-arrow {
    width: 16px;
    height: 16px;
    color: var(--text-muted, #97A3B4);
  }

  .conversion-arrow svg {
    width: 100%;
    height: 100%;
  }

  .conversion-rate {
    font-family: 'Open Sans', sans-serif;
    font-size: 12px;
    font-weight: 600;
    color: var(--text-secondary, #718095);
    background: rgba(0, 27, 65, 0.04);
    padding: 4px 8px;
    border-radius: 4px;
  }

  @media (max-width: 768px) {
    .conversion-indicators {
      display: none;
    }
  }
</style>
