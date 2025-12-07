<script lang="ts">
  import { formatNumber, formatPercent } from '$lib/utils/formatters';

  type Column = {
    key: string;
    label: string;
    type?: 'text' | 'number' | 'percent' | 'trend' | 'badge';
    align?: 'left' | 'center' | 'right';
    width?: string;
  };

  export let data: Record<string, any>[];
  export let columns: Column[];
  export let title: string = '';

  const badgeColors: Record<string, { bg: string; text: string }> = {
    high: { bg: 'rgba(239, 68, 68, 0.1)', text: '#DC2626' },
    medium: { bg: 'rgba(245, 158, 11, 0.1)', text: '#D97706' },
    low: { bg: 'rgba(16, 185, 129, 0.1)', text: '#059669' },
    healthy: { bg: 'rgba(16, 185, 129, 0.1)', text: '#059669' },
    degraded: { bg: 'rgba(245, 158, 11, 0.1)', text: '#D97706' },
    down: { bg: 'rgba(239, 68, 68, 0.1)', text: '#DC2626' },
  };

  function formatCell(value: any, type?: string): string {
    if (value === null || value === undefined) return '-';
    switch (type) {
      case 'number':
        return formatNumber(value);
      case 'percent':
        return `${value}%`;
      case 'trend':
        return formatPercent(value);
      default:
        return String(value);
    }
  }

  function getTrendClass(value: number): string {
    if (value > 0) return 'positive';
    if (value < 0) return 'negative';
    return 'neutral';
  }
</script>

<div class="table-card">
  {#if title}
    <h3 class="table-title">{title}</h3>
  {/if}

  <div class="table-wrapper">
    <table>
      <thead>
        <tr>
          {#each columns as col}
            <th style={col.width ? `width: ${col.width}` : ''} class={col.align || 'left'}>
              {col.label}
            </th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each data as row}
          <tr>
            {#each columns as col}
              <td class={col.align || 'left'}>
                {#if col.type === 'trend'}
                  <span class="trend {getTrendClass(row[col.key])}">
                    {formatCell(row[col.key], col.type)}
                  </span>
                {:else if col.type === 'badge'}
                  <span
                    class="badge"
                    style="
                      background: {badgeColors[row[col.key]]?.bg || 'rgba(0, 27, 65, 0.05)'};
                      color: {badgeColors[row[col.key]]?.text || '#718095'};
                    "
                  >
                    {row[col.key]}
                  </span>
                {:else}
                  {formatCell(row[col.key], col.type)}
                {/if}
              </td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<style>
  .table-card {
    background: var(--white, #FFFFFF);
    border: 1px solid rgba(0, 27, 65, 0.06);
    border-radius: 16px;
    padding: 24px;
    transition: all 0.2s ease;
  }

  .table-card:hover {
    border-color: rgba(86, 14, 138, 0.12);
    box-shadow: 0 4px 20px rgba(0, 27, 65, 0.06);
  }

  .table-title {
    font-family: 'Overpass', sans-serif;
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary, #001B41);
    margin: 0 0 16px 0;
  }

  .table-wrapper {
    overflow-x: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-family: 'Open Sans', sans-serif;
  }

  th {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--text-muted, #97A3B4);
    padding: 12px 16px;
    border-bottom: 1px solid rgba(0, 27, 65, 0.08);
  }

  td {
    font-size: 13px;
    color: var(--text-primary, #001B41);
    padding: 14px 16px;
    border-bottom: 1px solid rgba(0, 27, 65, 0.04);
  }

  tr:last-child td {
    border-bottom: none;
  }

  tr:hover td {
    background: rgba(0, 27, 65, 0.02);
  }

  .left { text-align: left; }
  .center { text-align: center; }
  .right { text-align: right; }

  .trend {
    font-weight: 600;
    font-size: 12px;
    padding: 4px 8px;
    border-radius: 4px;
  }

  .trend.positive {
    color: #059669;
    background: rgba(16, 185, 129, 0.1);
  }

  .trend.negative {
    color: #DC2626;
    background: rgba(239, 68, 68, 0.1);
  }

  .trend.neutral {
    color: var(--text-secondary, #718095);
    background: rgba(0, 27, 65, 0.05);
  }

  .badge {
    font-size: 11px;
    font-weight: 600;
    text-transform: capitalize;
    padding: 4px 10px;
    border-radius: 4px;
  }
</style>
