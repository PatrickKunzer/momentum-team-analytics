<script lang="ts">
  import { DashboardHeader, AlertsPanel } from '$lib/components/Layout';
  import { KPICard, KPICardGrid } from '$lib/components/KPICard';
  import { ActiveUsersChart, SignupFunnelChart, FeatureAdoptionChart } from '$lib/components/Charts';
  import {
    primaryKPIs,
    secondaryKPIs,
    activeUsersData,
    signupFunnelData,
    featureAdoptionData,
    alerts,
    dashboardMeta,
  } from '$lib/stores/mockData';
</script>

<svelte:head>
  <title>Executive Overview - Momentum Analytics</title>
</svelte:head>

<div class="dashboard-container">
  <DashboardHeader
    title={dashboardMeta.title}
    subtitle={dashboardMeta.subtitle}
    lastUpdated={dashboardMeta.lastUpdated}
  >
    <svelte:fragment slot="actions">
      <button class="refresh-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M23 4v6h-6" />
          <path d="M1 20v-6h6" />
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
        </svg>
        Aktualisieren
      </button>
    </svelte:fragment>
  </DashboardHeader>

  <!-- Primary KPIs: User Growth -->
  <section class="dashboard-section">
    <div class="section-header">
      <h2 class="section-title">Nutzer-Wachstum</h2>
      <span class="section-badge">Kernmetriken</span>
    </div>
    <KPICardGrid columns={3}>
      <KPICard
        title="DAU"
        value={primaryKPIs.dau.value}
        change={primaryKPIs.dau.change}
        target={primaryKPIs.dau.target}
        sparklineData={primaryKPIs.dau.sparkline}
        previousPeriod="vs. Vorwoche"
      />
      <KPICard
        title="WAU"
        value={primaryKPIs.wau.value}
        change={primaryKPIs.wau.change}
        target={primaryKPIs.wau.target}
        sparklineData={primaryKPIs.wau.sparkline}
        previousPeriod="vs. Vorwoche"
      />
      <KPICard
        title="MAU"
        value={primaryKPIs.mau.value}
        change={primaryKPIs.mau.change}
        target={primaryKPIs.mau.target}
        sparklineData={primaryKPIs.mau.sparkline}
        previousPeriod="vs. Vormonat"
      />
    </KPICardGrid>
  </section>

  <!-- Secondary KPIs: Engagement & Retention -->
  <section class="dashboard-section">
    <div class="section-header">
      <h2 class="section-title">Engagement & Retention</h2>
      <span class="section-badge">Qualitätsmetriken</span>
    </div>
    <KPICardGrid columns={3}>
      <KPICard
        title="Nachrichten/Tag"
        value={secondaryKPIs.messagesPerDay.value}
        change={secondaryKPIs.messagesPerDay.change}
        target={secondaryKPIs.messagesPerDay.target}
        sparklineData={secondaryKPIs.messagesPerDay.sparkline}
        previousPeriod="vs. Vorwoche"
      />
      <KPICard
        title="Ø Session-Dauer"
        value={secondaryKPIs.avgSessionDuration.value}
        change={secondaryKPIs.avgSessionDuration.change}
        format="duration"
        target={secondaryKPIs.avgSessionDuration.target}
        sparklineData={secondaryKPIs.avgSessionDuration.sparkline}
        previousPeriod="vs. Vorwoche"
      />
      <KPICard
        title="D7 Retention"
        value={secondaryKPIs.d7Retention.value}
        change={secondaryKPIs.d7Retention.change}
        format="percent"
        target={secondaryKPIs.d7Retention.target}
        sparklineData={secondaryKPIs.d7Retention.sparkline}
        previousPeriod="vs. Vorwoche"
      />
    </KPICardGrid>
  </section>

  <!-- Charts Grid -->
  <section class="dashboard-section">
    <div class="charts-grid">
      <!-- Active Users Trend -->
      <div class="chart-full-width">
        <ActiveUsersChart data={activeUsersData} height="380px" />
      </div>

      <!-- Funnel & Adoption side by side -->
      <div class="chart-half">
        <SignupFunnelChart data={signupFunnelData} height="360px" />
      </div>
      <div class="chart-half">
        <FeatureAdoptionChart data={featureAdoptionData} height="360px" />
      </div>
    </div>
  </section>

  <!-- Alerts Panel -->
  <section class="dashboard-section">
    <AlertsPanel {alerts} maxVisible={3} />
  </section>
</div>

<style>
  :global(*) {
    box-sizing: border-box;
  }

  :global(:root) {
    --primary-dark: #001b41;
    --primary-blue: #003d8f;
    --primary-purple: #560e8a;
    --accent-magenta: #d746f5;
    --accent-cyan: #00d4ff;
    --bg-light: #fafafa;
    --bg-card: #f4f7fa;
    --text-primary: #001b41;
    --text-secondary: #718095;
    --text-muted: #97a3b4;
    --white: #ffffff;
  }

  .dashboard-container {
    font-family: 'Open Sans', sans-serif;
    max-width: 1400px;
    margin: 0 auto;
    padding: 24px 32px;
    background: var(--bg-light);
    min-height: 100vh;
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
    color: var(--text-primary);
    margin: 0;
  }

  .section-badge {
    font-family: 'Open Sans', sans-serif;
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--primary-purple);
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

  .refresh-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 18px;
    font-family: 'Open Sans', sans-serif;
    font-size: 13px;
    font-weight: 600;
    color: var(--white);
    background: linear-gradient(135deg, var(--primary-blue) 0%, var(--primary-purple) 100%);
    border: none;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .refresh-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(86, 14, 138, 0.25);
  }

  .refresh-btn svg {
    width: 16px;
    height: 16px;
  }

  @media (max-width: 1024px) {
    .charts-grid {
      grid-template-columns: 1fr;
    }

    .chart-half {
      grid-column: 1;
    }
  }

  @media (max-width: 768px) {
    .dashboard-container {
      padding: 16px;
    }

    .section-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }
  }
</style>
