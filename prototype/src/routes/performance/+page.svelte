<script lang="ts">
  import { DashboardHeader } from '$lib/components/Layout';
  import { KPICard, KPICardGrid } from '$lib/components/KPICard';
  import { LineChart, BarChart, PieChart, DataTable } from '$lib/components/Charts';
  import {
    performanceKPIs,
    errorRateOverTime,
    topErrorsData,
    apiLatencyByEndpoint,
    clientErrorsData,
    performanceTrendsData,
    systemHealthData,
  } from '$lib/stores/performanceData';

  const lastUpdated = new Date();

  // Prepare system health for display
  const systemHealthArray = Object.entries(systemHealthData).map(([name, data]) => ({
    system: name.charAt(0).toUpperCase() + name.slice(1),
    status: data.status,
    latency: `${data.latency}ms`,
    uptime: data.uptime,
  }));
</script>

<svelte:head>
  <title>Performance & Errors - Momentum Analytics</title>
</svelte:head>

<div class="dashboard-container">
  <DashboardHeader
    title="Performance & Errors"
    subtitle="API-Latenz, Fehlerraten und System-Health"
    {lastUpdated}
  />

  <!-- Primary KPIs -->
  <section class="dashboard-section">
    <div class="section-header">
      <h2 class="section-title">System Performance</h2>
      <span class="section-badge">Kernmetriken</span>
    </div>
    <KPICardGrid columns={4}>
      <KPICard
        title="Fehlerrate"
        value={performanceKPIs.errorRate.value}
        change={performanceKPIs.errorRate.change}
        format="percent"
        target={performanceKPIs.errorRate.target}
        sparklineData={performanceKPIs.errorRate.sparkline}
        invertTrend={true}
      />
      <KPICard
        title="API P95 Latenz"
        value={performanceKPIs.apiP95Latency.value}
        change={performanceKPIs.apiP95Latency.change}
        format="raw"
        target={performanceKPIs.apiP95Latency.target}
        sparklineData={performanceKPIs.apiP95Latency.sparkline}
        invertTrend={true}
        previousPeriod="ms vs. Vorwoche"
      />
      <KPICard
        title="WebSocket Uptime"
        value={performanceKPIs.webSocketUptime.value}
        change={performanceKPIs.webSocketUptime.change}
        format="percent"
        target={performanceKPIs.webSocketUptime.target}
        sparklineData={performanceKPIs.webSocketUptime.sparkline}
      />
      <KPICard
        title="Langsame Requests"
        value={performanceKPIs.slowRequestsPercent.value}
        change={performanceKPIs.slowRequestsPercent.change}
        format="percent"
        target={performanceKPIs.slowRequestsPercent.target}
        sparklineData={performanceKPIs.slowRequestsPercent.sparkline}
        invertTrend={true}
      />
    </KPICardGrid>
  </section>

  <!-- Charts Grid -->
  <section class="dashboard-section">
    <div class="charts-grid">
      <!-- Performance trends -->
      <div class="chart-full-width">
        <LineChart
          data={performanceTrendsData}
          xKey="day"
          yKeys={['p50', 'p95', 'p99']}
          seriesNames={['P50', 'P95', 'P99']}
          title="Latenz-Trends"
          subtitle="Letzte 7 Tage (ms)"
          height="320px"
          showArea={false}
        />
      </div>

      <!-- Error rate over time -->
      <div class="chart-half">
        <BarChart
          data={errorRateOverTime.map(d => ({
            label: d.hour,
            value: Math.round(d.errorRate * 100) / 100,
          }))}
          title="Fehlerrate pro Stunde"
          subtitle="Heute (%)"
          height="280px"
          showLabels={false}
        />
      </div>

      <!-- Client errors -->
      <div class="chart-half">
        <PieChart
          data={clientErrorsData.map(d => ({
            name: d.type,
            value: d.count,
          }))}
          title="Client-Fehler Verteilung"
          height="280px"
        />
      </div>

      <!-- Top errors table -->
      <div class="chart-half">
        <DataTable
          data={topErrorsData.slice(0, 6)}
          columns={[
            { key: 'code', label: 'Error Code', type: 'text' },
            { key: 'count', label: 'Anzahl', type: 'number', align: 'right' },
            { key: 'percentage', label: '%', type: 'percent', align: 'right' },
            { key: 'severity', label: 'Severity', type: 'badge', align: 'center' },
          ]}
          title="Top Fehler"
        />
      </div>

      <!-- System health -->
      <div class="chart-half">
        <DataTable
          data={systemHealthArray}
          columns={[
            { key: 'system', label: 'System', type: 'text' },
            { key: 'status', label: 'Status', type: 'badge' },
            { key: 'latency', label: 'Latenz', type: 'text', align: 'right' },
            { key: 'uptime', label: 'Uptime', type: 'percent', align: 'right' },
          ]}
          title="System Health"
        />
      </div>

      <!-- API latency by endpoint -->
      <div class="chart-full-width">
        <DataTable
          data={apiLatencyByEndpoint}
          columns={[
            { key: 'endpoint', label: 'Endpoint', type: 'text', width: '40%' },
            { key: 'p50', label: 'P50 (ms)', type: 'number', align: 'right' },
            { key: 'p95', label: 'P95 (ms)', type: 'number', align: 'right' },
            { key: 'p99', label: 'P99 (ms)', type: 'number', align: 'right' },
          ]}
          title="API Latenz nach Endpoint"
        />
      </div>
    </div>
  </section>
</div>

<style>
  .dashboard-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 24px 32px;
  }

  .dashboard-section {
    margin-bottom: 32px;
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
  }

  .section-title {
    font-family: 'Overpass', sans-serif;
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary, #001B41);
    margin: 0;
  }

  .section-badge {
    font-family: 'Open Sans', sans-serif;
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--primary-purple, #560E8A);
    background: linear-gradient(135deg, rgba(86, 14, 138, 0.08) 0%, rgba(215, 70, 245, 0.08) 100%);
    padding: 4px 10px;
    border-radius: 4px;
  }

  .charts-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }

  .chart-full-width {
    grid-column: 1 / -1;
  }

  .chart-half {
    min-width: 0;
  }

  @media (max-width: 1024px) {
    .charts-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
