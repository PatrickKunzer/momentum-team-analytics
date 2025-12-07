<script lang="ts">
  import { formatRelativeDate } from '$lib/utils/formatters';
  import type { Alert } from '$lib/stores/mockData';

  export let alerts: Alert[] = [];
  export let maxVisible: number = 3;

  $: visibleAlerts = alerts.slice(0, maxVisible);

  const iconMap = {
    warning: `<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>`,
    error: `<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>`,
    info: `<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>`,
    success: `<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>`,
  };

  const colorMap = {
    warning: { bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.3)', icon: '#F59E0B' },
    error: { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)', icon: '#EF4444' },
    info: { bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.3)', icon: '#3B82F6' },
    success: { bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.3)', icon: '#10B981' },
  };
</script>

<div class="alerts-panel">
  <div class="alerts-header">
    <h3 class="alerts-title">
      <svg class="bell-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
      Wichtige Hinweise
    </h3>
    {#if alerts.length > maxVisible}
      <span class="alerts-count">+{alerts.length - maxVisible} weitere</span>
    {/if}
  </div>

  <div class="alerts-list">
    {#each visibleAlerts as alert (alert.id)}
      <div
        class="alert-item"
        style="
          --alert-bg: {colorMap[alert.type].bg};
          --alert-border: {colorMap[alert.type].border};
          --alert-icon: {colorMap[alert.type].icon};
        "
      >
        <div class="alert-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            {@html iconMap[alert.type]}
          </svg>
        </div>
        <div class="alert-content">
          <div class="alert-title">{alert.title}</div>
          <div class="alert-message">{alert.message}</div>
          <div class="alert-time">{formatRelativeDate(alert.timestamp)}</div>
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .alerts-panel {
    background: var(--white, #FFFFFF);
    border: 1px solid rgba(0, 27, 65, 0.06);
    border-radius: 16px;
    padding: 20px;
  }

  .alerts-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .alerts-title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: 'Open Sans', sans-serif;
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary, #001B41);
    margin: 0;
  }

  .bell-icon {
    width: 18px;
    height: 18px;
    color: var(--text-secondary, #718095);
  }

  .alerts-count {
    font-family: 'Open Sans', sans-serif;
    font-size: 12px;
    color: var(--text-muted, #97A3B4);
    padding: 4px 10px;
    background: rgba(0, 27, 65, 0.04);
    border-radius: 12px;
  }

  .alerts-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .alert-item {
    display: flex;
    gap: 14px;
    padding: 14px 16px;
    background: var(--alert-bg);
    border: 1px solid var(--alert-border);
    border-radius: 12px;
    transition: all 0.2s ease;
  }

  .alert-item:hover {
    transform: translateX(4px);
  }

  .alert-icon {
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    color: var(--alert-icon);
  }

  .alert-icon svg {
    width: 100%;
    height: 100%;
  }

  .alert-content {
    flex: 1;
    min-width: 0;
  }

  .alert-title {
    font-family: 'Open Sans', sans-serif;
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary, #001B41);
    margin-bottom: 4px;
  }

  .alert-message {
    font-family: 'Open Sans', sans-serif;
    font-size: 12px;
    color: var(--text-secondary, #718095);
    line-height: 1.5;
    margin-bottom: 6px;
  }

  .alert-time {
    font-family: 'Open Sans', sans-serif;
    font-size: 11px;
    color: var(--text-muted, #97A3B4);
  }
</style>
