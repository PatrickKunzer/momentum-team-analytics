<script lang="ts">
  import BaseChart from './BaseChart.svelte';
  import { colors } from '$lib/utils/theme';
  import type { EChartsOption } from 'echarts';

  export let data: { name: string; value: number; color?: string }[];
  export let title: string = '';
  export let height: string = '300px';
  export let showLegend: boolean = true;
  export let donut: boolean = true;

  $: chartOption = buildChartOption(data);

  function buildChartOption(chartData: typeof data): EChartsOption {
    return {
      title: title ? {
        text: title,
        left: 0,
      } : undefined,
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => `
          <div style="font-weight: 600; margin-bottom: 4px;">${params.name}</div>
          <div style="display:flex;justify-content:space-between;gap:16px;">
            <span>Anteil</span>
            <strong>${params.percent.toFixed(1)}%</strong>
          </div>
        `,
      },
      legend: showLegend ? {
        orient: 'vertical',
        right: 16,
        top: 'center',
        icon: 'circle',
        itemWidth: 8,
        itemHeight: 8,
        textStyle: {
          fontSize: 12,
        },
      } : undefined,
      series: [
        {
          type: 'pie',
          radius: donut ? ['45%', '70%'] : '70%',
          center: showLegend ? ['35%', '50%'] : ['50%', '50%'],
          avoidLabelOverlap: true,
          itemStyle: {
            borderRadius: 6,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: false,
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 600,
            },
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.2)',
            },
          },
          data: chartData.map((item, index) => ({
            name: item.name,
            value: item.value,
            itemStyle: item.color ? { color: item.color } : undefined,
          })),
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
