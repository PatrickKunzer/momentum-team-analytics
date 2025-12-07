<script lang="ts">
  import { formatTimestamp } from '$lib/utils/formatters';

  export let title: string = 'Analytics';
  export let subtitle: string = '';
  export let lastUpdated: Date | null = null;
</script>

<header class="dashboard-header">
  <div class="header-content">
    <div class="header-title-group">
      <h1 class="header-title">{title}</h1>
      {#if subtitle}
        <p class="header-subtitle">{subtitle}</p>
      {/if}
    </div>

    <div class="header-actions">
      {#if lastUpdated}
        <div class="last-updated">
          <svg class="clock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
          </svg>
          <span>Aktualisiert: {formatTimestamp(lastUpdated)}</span>
        </div>
      {/if}

      <slot name="actions" />
    </div>
  </div>
</header>

<style>
  .dashboard-header {
    padding: 24px 0;
    border-bottom: 1px solid rgba(0, 27, 65, 0.08);
    margin-bottom: 24px;
  }

  .header-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  @media (min-width: 768px) {
    .header-content {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
    }
  }

  .header-title-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .header-title {
    font-family: 'Overpass', sans-serif;
    font-size: 28px;
    font-weight: 600;
    color: var(--text-primary, #001B41);
    margin: 0;
    letter-spacing: -0.5px;
  }

  .header-subtitle {
    font-family: 'Open Sans', sans-serif;
    font-size: 14px;
    color: var(--text-secondary, #718095);
    margin: 0;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .last-updated {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: 'Open Sans', sans-serif;
    font-size: 13px;
    color: var(--text-muted, #97A3B4);
    padding: 8px 14px;
    background: rgba(0, 27, 65, 0.03);
    border-radius: 8px;
  }

  .clock-icon {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }
</style>
