<script lang="ts">
  import BaseChart from './BaseChart.svelte';
  import { colors, chartColors } from '$lib/utils/theme';
  import { formatNumber } from '$lib/utils/formatters';
  import type { EChartsOption } from 'echarts';

  export let data: Record<string, any>[];
  export let xKey: string = 'label';
  export let yKeys: string[] = ['value'];
  export let seriesNames: string[] = [];
  export let title: string = '';
  export let subtitle: string = '';
  export let height: string = '320px';
  export let showArea: boolean = true;
  export let smooth: boolean = true;

  $: chartOption = buildChartOption(data);

  function buildChartOption(chartData: typeof data): EChartsOption {
    const series = yKeys.map((key, index) => ({
      name: seriesNames[index] || key,
      type: 'line' as const,
      data: chartData.map(d => d[key]),
      smooth,
      symbol: 'circle',
      symbolSize: 6,
      showSymbol: false,
      lineStyle: {
        width: 3,
        color: chartColors.primary[index % chartColors.primary.length],
      },
      itemStyle: {
        color: chartColors.primary[index % chartColors.primary.length],
      },
      areaStyle: showArea ? {
        color: {
          type: 'linear' as const,
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: `${chartColors.primary[index % chartColors.primary.length]}20` },
            { offset: 1, color: `${chartColors.primary[index % chartColors.primary.length]}02` },
          ],
        },
      } : undefined,
    }));

    return {
      title: title ? {
        text: title,
        subtext: subtitle,
        left: 0,
      } : undefined,
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
        },
      },
      legend: yKeys.length > 1 ? {
        top: title ? 48 : 0,
        right: 0,
        icon: 'circle',
        itemWidth: 8,
        itemHeight: 8,
      } : undefined,
      grid: {
        left: 0,
        right: 16,
        top: title ? (yKeys.length > 1 ? 80 : 64) : (yKeys.length > 1 ? 40 : 16),
        bottom: 8,
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: chartData.map(d => d[xKey]),
        boundaryGap: false,
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: (value: number) => formatNumber(value, 0),
        },
      },
      series,
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
