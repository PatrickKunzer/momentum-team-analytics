<script lang="ts">
  import BaseChart from './BaseChart.svelte';
  import { colors, chartColors } from '$lib/utils/theme';
  import { formatNumber } from '$lib/utils/formatters';
  import type { EChartsOption } from 'echarts';

  export let data: { label: string; value: number; value2?: number }[];
  export let title: string = '';
  export let subtitle: string = '';
  export let height: string = '320px';
  export let horizontal: boolean = false;
  export let showLabels: boolean = true;
  export let series1Name: string = 'Wert';
  export let series2Name: string = '';
  export let stacked: boolean = false;

  $: chartOption = buildChartOption(data);

  function buildChartOption(chartData: typeof data): EChartsOption {
    const hasSecondSeries = chartData.some(d => d.value2 !== undefined);

    const baseSeries: any = {
      type: 'bar',
      data: chartData.map((d, i) => ({
        value: d.value,
        itemStyle: {
          color: {
            type: 'linear',
            x: horizontal ? 0 : 0,
            y: horizontal ? 0 : 1,
            x2: horizontal ? 1 : 0,
            y2: horizontal ? 0 : 0,
            colorStops: [
              { offset: 0, color: chartColors.primary[0] },
              { offset: 1, color: chartColors.primary[1] },
            ],
          },
          borderRadius: horizontal ? [0, 6, 6, 0] : [6, 6, 0, 0],
        },
      })),
      barWidth: horizontal ? 20 : '60%',
      name: series1Name,
      stack: stacked ? 'total' : undefined,
      label: showLabels ? {
        show: true,
        position: horizontal ? 'right' : 'top',
        formatter: (params: any) => formatNumber(params.value),
        fontSize: 11,
        color: colors.textSecondary,
      } : undefined,
    };

    const series = [baseSeries];

    if (hasSecondSeries) {
      series.push({
        type: 'bar',
        data: chartData.map((d) => ({
          value: d.value2 || 0,
          itemStyle: {
            color: chartColors.primary[2],
            borderRadius: horizontal ? [0, 6, 6, 0] : [6, 6, 0, 0],
          },
        })),
        barWidth: horizontal ? 20 : '60%',
        name: series2Name,
        stack: stacked ? 'total' : undefined,
        label: showLabels ? {
          show: true,
          position: horizontal ? 'right' : 'top',
          formatter: (params: any) => formatNumber(params.value),
          fontSize: 11,
          color: colors.textSecondary,
        } : undefined,
      });
    }

    return {
      title: title ? {
        text: title,
        subtext: subtitle,
        left: 0,
      } : undefined,
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      legend: hasSecondSeries ? {
        top: title ? 48 : 0,
        right: 0,
        icon: 'circle',
        itemWidth: 8,
        itemHeight: 8,
      } : undefined,
      grid: {
        left: 0,
        right: showLabels ? 48 : 16,
        top: title ? (hasSecondSeries ? 80 : 64) : (hasSecondSeries ? 40 : 16),
        bottom: 8,
        containLabel: true,
      },
      xAxis: horizontal ? {
        type: 'value',
        axisLabel: {
          formatter: (value: number) => formatNumber(value, 0),
        },
      } : {
        type: 'category',
        data: chartData.map(d => d.label),
      },
      yAxis: horizontal ? {
        type: 'category',
        data: chartData.map(d => d.label),
        inverse: true,
        axisLabel: {
          fontSize: 12,
          color: colors.textPrimary,
        },
      } : {
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
