<script lang="ts">
  import BaseChart from './BaseChart.svelte';
  import { colors, chartColors } from '$lib/utils/theme';
  import { formatNumber } from '$lib/utils/formatters';
  import type { EChartsOption } from 'echarts';

  export let data: { week: string; dau: number; wau: number; mau: number }[];
  export let height: string = '360px';

  $: chartOption = buildChartOption(data);

  function buildChartOption(chartData: typeof data): EChartsOption {
    return {
      title: {
        text: 'Aktive Nutzer',
        subtext: 'Letzte 12 Wochen',
        left: 0,
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          crossStyle: {
            color: colors.textMuted,
          },
        },
        formatter: (params: any) => {
          if (!Array.isArray(params)) return '';
          let result = `<div style="font-weight: 600; margin-bottom: 8px;">${params[0].axisValue}</div>`;
          params.forEach((item: any) => {
            const marker = `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${item.color};margin-right:8px;"></span>`;
            result += `<div style="display:flex;justify-content:space-between;gap:24px;margin:4px 0;">
              <span>${marker}${item.seriesName}</span>
              <strong>${formatNumber(item.value)}</strong>
            </div>`;
          });
          return result;
        },
      },
      legend: {
        data: ['DAU', 'WAU', 'MAU'],
        top: 0,
        right: 0,
        icon: 'circle',
        itemWidth: 8,
        itemHeight: 8,
        itemGap: 20,
      },
      grid: {
        left: 0,
        right: 0,
        top: 72,
        bottom: 8,
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: chartData.map((d) => d.week),
        boundaryGap: false,
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: (value: number) => formatNumber(value, 0),
        },
      },
      series: [
        {
          name: 'MAU',
          type: 'line',
          data: chartData.map((d) => d.mau),
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          showSymbol: false,
          lineStyle: {
            width: 3,
            color: chartColors.primary[0],
          },
          itemStyle: {
            color: chartColors.primary[0],
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(0, 61, 143, 0.15)' },
                { offset: 1, color: 'rgba(0, 61, 143, 0.02)' },
              ],
            },
          },
        },
        {
          name: 'WAU',
          type: 'line',
          data: chartData.map((d) => d.wau),
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          showSymbol: false,
          lineStyle: {
            width: 3,
            color: chartColors.primary[1],
          },
          itemStyle: {
            color: chartColors.primary[1],
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(86, 14, 138, 0.12)' },
                { offset: 1, color: 'rgba(86, 14, 138, 0.02)' },
              ],
            },
          },
        },
        {
          name: 'DAU',
          type: 'line',
          data: chartData.map((d) => d.dau),
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          showSymbol: false,
          lineStyle: {
            width: 3,
            color: chartColors.primary[2],
          },
          itemStyle: {
            color: chartColors.primary[2],
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(215, 70, 245, 0.1)' },
                { offset: 1, color: 'rgba(215, 70, 245, 0.01)' },
              ],
            },
          },
        },
      ],
    };
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
