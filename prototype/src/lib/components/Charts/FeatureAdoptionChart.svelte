<script lang="ts">
  import BaseChart from './BaseChart.svelte';
  import { colors, chartColors } from '$lib/utils/theme';
  import type { EChartsOption } from 'echarts';

  export let data: { feature: string; adoption: number; target?: number }[];
  export let height: string = '320px';

  $: chartOption = buildChartOption(data);

  function buildChartOption(chartData: typeof data): EChartsOption {
    // Sort by adoption rate descending
    const sortedData = [...chartData].sort((a, b) => b.adoption - a.adoption);

    return {
      title: {
        text: 'Feature Adoption',
        subtext: 'Aktive Nutzer (30 Tage)',
        left: 0,
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: (params: any) => {
          const item = params[0];
          const dataItem = sortedData.find(d => d.feature === item.name);
          let result = `
            <div style="font-weight: 600; margin-bottom: 8px;">${item.name}</div>
            <div style="display:flex;justify-content:space-between;gap:24px;">
              <span>Adoption</span>
              <strong>${item.value}%</strong>
            </div>
          `;
          if (dataItem?.target) {
            const diff = item.value - dataItem.target;
            const diffColor = diff >= 0 ? '#10B981' : '#EF4444';
            result += `
              <div style="display:flex;justify-content:space-between;gap:24px;margin-top:4px;">
                <span>Ziel</span>
                <span>${dataItem.target}%</span>
              </div>
              <div style="display:flex;justify-content:space-between;gap:24px;margin-top:4px;color:${diffColor};">
                <span>Differenz</span>
                <strong>${diff >= 0 ? '+' : ''}${diff}%</strong>
              </div>
            `;
          }
          return result;
        },
      },
      grid: {
        left: 0,
        right: 24,
        top: 72,
        bottom: 8,
        containLabel: true,
      },
      xAxis: {
        type: 'value',
        max: 100,
        axisLabel: {
          formatter: '{value}%',
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(0, 27, 65, 0.06)',
            type: 'dashed',
          },
        },
      },
      yAxis: {
        type: 'category',
        data: sortedData.map((d) => d.feature),
        inverse: true,
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          fontSize: 12,
          fontWeight: 500,
          color: colors.textPrimary,
          margin: 16,
        },
      },
      series: [
        {
          type: 'bar',
          data: sortedData.map((d, index) => ({
            value: d.adoption,
            itemStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 1,
                y2: 0,
                colorStops: [
                  { offset: 0, color: chartColors.primary[index % chartColors.primary.length] },
                  { offset: 1, color: adjustColor(chartColors.primary[index % chartColors.primary.length], 30) },
                ],
              },
              borderRadius: [0, 6, 6, 0],
            },
          })),
          barWidth: 24,
          label: {
            show: true,
            position: 'right',
            formatter: '{c}%',
            fontSize: 12,
            fontWeight: 600,
            color: colors.textSecondary,
          },
          backgroundStyle: {
            color: 'rgba(0, 27, 65, 0.04)',
            borderRadius: [0, 6, 6, 0],
          },
          showBackground: true,
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
</div>

<style>
  .chart-card {
    background: var(--white, #FFFFFF);
    border: 1px solid rgba(0, 27, 65, 0.06);
    border-radius: 16px;
    padding: 24px;
    transition: all 0.2s ease;
  }

  .chart-card:hover {
    border-color: rgba(86, 14, 138, 0.12);
    box-shadow: 0 4px 20px rgba(0, 27, 65, 0.06);
  }
</style>
