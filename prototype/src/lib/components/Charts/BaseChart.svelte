<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import type { ECharts, EChartsOption } from 'echarts';
  import { colors, chartColors, typography } from '$lib/utils/theme';

  export let option: EChartsOption;
  export let height: string = '400px';
  export let loading: boolean = false;
  export let theme: 'light' | 'dark' = 'light';

  let chartContainer: HTMLDivElement;
  let chartInstance: ECharts | null = null;
  const dispatch = createEventDispatcher();

  // Base theme configuration
  const baseTheme = {
    color: chartColors.primary,
    backgroundColor: 'transparent',
    textStyle: {
      fontFamily: typography.fontFamily.body,
      color: colors.textSecondary,
    },
    title: {
      textStyle: {
        fontFamily: typography.fontFamily.headlines,
        fontWeight: 600,
        color: colors.textPrimary,
        fontSize: 16,
      },
      subtextStyle: {
        fontFamily: typography.fontFamily.body,
        color: colors.textSecondary,
        fontSize: 12,
      },
    },
    legend: {
      textStyle: {
        fontFamily: typography.fontFamily.body,
        color: colors.textSecondary,
        fontSize: 12,
      },
    },
    tooltip: {
      backgroundColor: colors.white,
      borderColor: 'rgba(0, 27, 65, 0.1)',
      borderWidth: 1,
      textStyle: {
        fontFamily: typography.fontFamily.body,
        color: colors.textPrimary,
        fontSize: 13,
      },
      extraCssText: 'box-shadow: 0 4px 20px rgba(0, 27, 65, 0.12); border-radius: 8px;',
    },
    grid: {
      left: 16,
      right: 16,
      top: 48,
      bottom: 24,
      containLabel: true,
    },
    xAxis: {
      axisLine: {
        lineStyle: {
          color: 'rgba(0, 27, 65, 0.1)',
        },
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        fontFamily: typography.fontFamily.body,
        fontSize: 11,
        color: colors.textMuted,
      },
      splitLine: {
        show: false,
      },
    },
    yAxis: {
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        fontFamily: typography.fontFamily.body,
        fontSize: 11,
        color: colors.textMuted,
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(0, 27, 65, 0.06)',
          type: 'dashed',
        },
      },
    },
  };

  onMount(async () => {
    // Dynamic import for better code splitting
    const echarts = await import('echarts');

    chartInstance = echarts.init(chartContainer, null, {
      renderer: 'svg',
    });

    // Merge base theme with provided options
    const mergedOption = mergeDeep(baseTheme, option);
    chartInstance.setOption(mergedOption);

    // Handle resize
    const resizeObserver = new ResizeObserver(() => {
      chartInstance?.resize();
    });
    resizeObserver.observe(chartContainer);

    // Click events
    chartInstance.on('click', (params) => {
      dispatch('chartClick', params);
    });

    return () => {
      resizeObserver.disconnect();
      chartInstance?.dispose();
    };
  });

  onDestroy(() => {
    chartInstance?.dispose();
  });

  // Update chart when option changes
  $: if (chartInstance && option) {
    const mergedOption = mergeDeep(baseTheme, option);
    chartInstance.setOption(mergedOption, true);
  }

  // Handle loading state
  $: if (chartInstance) {
    if (loading) {
      chartInstance.showLoading({
        text: '',
        color: colors.primaryPurple,
        maskColor: 'rgba(255, 255, 255, 0.8)',
      });
    } else {
      chartInstance.hideLoading();
    }
  }

  // Deep merge utility
  function mergeDeep(target: any, source: any): any {
    const output = { ...target };
    if (isObject(target) && isObject(source)) {
      Object.keys(source).forEach((key) => {
        if (isObject(source[key])) {
          if (!(key in target)) {
            Object.assign(output, { [key]: source[key] });
          } else {
            output[key] = mergeDeep(target[key], source[key]);
          }
        } else {
          Object.assign(output, { [key]: source[key] });
        }
      });
    }
    return output;
  }

  function isObject(item: any): boolean {
    return item && typeof item === 'object' && !Array.isArray(item);
  }
</script>

<div
  class="chart-container"
  style="height: {height}"
  bind:this={chartContainer}
/>

<style>
  .chart-container {
    width: 100%;
    min-height: 200px;
  }
</style>
