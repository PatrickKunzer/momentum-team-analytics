<script lang="ts">
  import BaseChart from './BaseChart.svelte';
  import { colors } from '$lib/utils/theme';
  import type { EChartsOption } from 'echarts';

  export let data: { cohort: string; [key: string]: any }[];
  export let columns: string[] = ['d1', 'd3', 'd7', 'd14', 'd30'];
  export let columnLabels: string[] = ['Tag 1', 'Tag 3', 'Tag 7', 'Tag 14', 'Tag 30'];
  export let title: string = '';
  export let subtitle: string = '';
  export let height: string = '320px';
  export let valueLabel: string = '%';

  $: chartOption = buildChartOption(data);

  function buildChartOption(chartData: typeof data): EChartsOption {
    const cohorts = chartData.map(d => d.cohort);

    // Build heatmap data [x, y, value]
    const heatmapData: [number, number, number | null][] = [];
    chartData.forEach((row, rowIndex) => {
      columns.forEach((col, colIndex) => {
        heatmapData.push([colIndex, rowIndex, row[col] ?? null]);
      });
    });

    // Find min/max for color scale
    const values = heatmapData.map(d => d[2]).filter(v => v !== null) as number[];
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);

    return {
      title: title ? {
        text: title,
        subtext: subtitle,
        left: 0,
      } : undefined,
      tooltip: {
        position: 'top',
        formatter: (params: any) => {
          if (params.value[2] === null) return 'Keine Daten';
          return `
            <div style="font-weight: 600; margin-bottom: 4px;">
              ${cohorts[params.value[1]]} - ${columnLabels[params.value[0]]}
            </div>
            <div>Retention: <strong>${params.value[2]}${valueLabel}</strong></div>
          `;
        },
      },
      grid: {
        left: 0,
        right: 0,
        top: title ? 64 : 16,
        bottom: 32,
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: columnLabels,
        splitArea: {
          show: true,
        },
        axisLabel: {
          fontSize: 11,
        },
      },
      yAxis: {
        type: 'category',
        data: cohorts,
        splitArea: {
          show: true,
        },
        axisLabel: {
          fontSize: 11,
        },
      },
      visualMap: {
        min: minVal,
        max: maxVal,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: 0,
        itemWidth: 12,
        itemHeight: 120,
        textStyle: {
          fontSize: 10,
          color: colors.textMuted,
        },
        inRange: {
          color: ['#F4F7FA', '#D746F5', '#560E8A', '#003D8F'],
        },
      },
      series: [
        {
          type: 'heatmap',
          data: heatmapData,
          label: {
            show: true,
            fontSize: 11,
            fontWeight: 500,
            formatter: (params: any) => {
              if (params.value[2] === null) return '-';
              return `${params.value[2]}%`;
            },
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.2)',
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
