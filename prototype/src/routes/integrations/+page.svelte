<script lang="ts">
  import { DashboardHeader } from '$lib/components/Layout';
  import { KPICard, KPICardGrid } from '$lib/components/KPICard';
  import { PieChart, BarChart, LineChart, SignupFunnelChart, DataTable } from '$lib/components/Charts';
  import {
    integrationKPIs,
    integrationFunnelData,
    connectionsByProvider,
    serviceUsageData,
    connectionTrendsData,
    integrationHealthData,
  } from '$lib/stores/integrationData';

  const lastUpdated = new Date();
</script>

<svelte:head>
  <title>Integration Metrics - Momentum Analytics</title>
</svelte:head>

<div class="dashboard-container">
  <DashboardHeader
    title="Integration Metrics"
    subtitle="OAuth-Verbindungen und Service-Nutzung"
    {lastUpdated}
  />

  <!-- Primary KPIs -->
  <section class="dashboard-section">
    <div class="section-header">
      <h2 class="section-title">Integration Performance</h2>
      <span class="section-badge">Kernmetriken</span>
    </div>
    <KPICardGrid columns={4}>
      <KPICard
        title="Verbundene Nutzer"
        value={integrationKPIs.connectedUsers.value}
        change={integrationKPIs.connectedUsers.change}
        target={integrationKPIs.connectedUsers.target}
        sparklineData={integrationKPIs.connectedUsers.sparkline}
      />
      <KPICard
        title="OAuth Erfolgsrate"
        value={integrationKPIs.oauthSuccessRate.value}
        change={integrationKPIs.oauthSuccessRate.change}
        format="percent"
        target={integrationKPIs.oauthSuccessRate.target}
        sparklineData={integrationKPIs.oauthSuccessRate.sparkline}
      />
      <KPICard
        title="Nutzung im Chat"
        value={integrationKPIs.usageInChat.value}
        change={integrationKPIs.usageInChat.change}
        format="percent"
        target={integrationKPIs.usageInChat.target}
        sparklineData={integrationKPIs.usageInChat.sparkline}
      />
      <KPICard
        title="Disconnect-Rate"
        value={integrationKPIs.disconnectRate.value}
        change={integrationKPIs.disconnectRate.change}
        format="percent"
        target={integrationKPIs.disconnectRate.target}
        sparklineData={integrationKPIs.disconnectRate.sparkline}
        invertTrend={true}
      />
    </KPICardGrid>
  </section>

  <!-- Charts Grid -->
  <section class="dashboard-section">
    <div class="charts-grid">
      <!-- Connection trends -->
      <div class="chart-full-width">
        <LineChart
          data={connectionTrendsData}
          xKey="week"
          yKeys={['newConnections', 'activeUsage']}
          seriesNames={['Neue Verbindungen', 'Aktive Nutzung']}
          title="Verbindungs-Trends"
          subtitle="Letzte 12 Wochen"
          height="320px"
        />
      </div>

      <!-- Integration funnel -->
      <div class="chart-half">
        <SignupFunnelChart
          data={integrationFunnelData}
          title="Integration Funnel"
          height="340px"
        />
      </div>

      <!-- Connections by provider -->
      <div class="chart-half">
        <PieChart
          data={connectionsByProvider.map(d => ({
            name: d.provider,
            value: d.connections,
            color: d.color,
          }))}
          title="Verbindungen nach Provider"
          height="340px"
        />
      </div>

      <!-- Service usage table -->
      <div class="chart-half">
        <DataTable
          data={serviceUsageData}
          columns={[
            { key: 'service', label: 'Service', type: 'text' },
            { key: 'provider', label: 'Provider', type: 'text' },
            { key: 'usage', label: 'Nutzung', type: 'percent', align: 'right' },
            { key: 'trend', label: 'Trend', type: 'trend', align: 'right' },
          ]}
          title="Service-Nutzung"
        />
      </div>

      <!-- Integration health -->
      <div class="chart-half">
        <DataTable
          data={integrationHealthData}
          columns={[
            { key: 'provider', label: 'Provider', type: 'text' },
            { key: 'status', label: 'Status', type: 'badge' },
            { key: 'uptime', label: 'Uptime', type: 'percent', align: 'right' },
          ]}
          title="Integration Health"
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
