<script lang="ts">
  import { DashboardHeader } from '$lib/components/Layout';
  import { KPICard, KPICardGrid } from '$lib/components/KPICard';
  import { LineChart, BarChart, HeatmapChart, SignupFunnelChart, DataTable } from '$lib/components/Charts';
  import {
    userJourneyKPIs,
    onboardingFunnelData,
    retentionCohortData,
    firstActionsData,
    churnIndicatorsData,
    userSegmentsData,
    signupSourcesData,
    dailySignupsData,
  } from '$lib/stores/userJourneyData';

  const lastUpdated = new Date();
</script>

<svelte:head>
  <title>User Journey - Momentum Analytics</title>
</svelte:head>

<div class="dashboard-container">
  <DashboardHeader
    title="User Journey"
    subtitle="Signups, Retention und Nutzer-Segmente"
    {lastUpdated}
  />

  <!-- Primary KPIs -->
  <section class="dashboard-section">
    <div class="section-header">
      <h2 class="section-title">User Journey Performance</h2>
      <span class="section-badge">Kernmetriken</span>
    </div>
    <KPICardGrid columns={4}>
      <KPICard
        title="Signups (30 Tage)"
        value={userJourneyKPIs.signups30d.value}
        change={userJourneyKPIs.signups30d.change}
        target={userJourneyKPIs.signups30d.target}
        sparklineData={userJourneyKPIs.signups30d.sparkline}
      />
      <KPICard
        title="Aktivierungsrate"
        value={userJourneyKPIs.activationRate.value}
        change={userJourneyKPIs.activationRate.change}
        format="percent"
        target={userJourneyKPIs.activationRate.target}
        sparklineData={userJourneyKPIs.activationRate.sparkline}
      />
      <KPICard
        title="D7 Retention"
        value={userJourneyKPIs.d7Retention.value}
        change={userJourneyKPIs.d7Retention.change}
        format="percent"
        target={userJourneyKPIs.d7Retention.target}
        sparklineData={userJourneyKPIs.d7Retention.sparkline}
      />
      <KPICard
        title="D30 Retention"
        value={userJourneyKPIs.d30Retention.value}
        change={userJourneyKPIs.d30Retention.change}
        format="percent"
        target={userJourneyKPIs.d30Retention.target}
        sparklineData={userJourneyKPIs.d30Retention.sparkline}
      />
    </KPICardGrid>
  </section>

  <!-- Charts Grid -->
  <section class="dashboard-section">
    <div class="charts-grid">
      <!-- Daily signups trend -->
      <div class="chart-full-width">
        <LineChart
          data={dailySignupsData}
          xKey="date"
          yKeys={['signups', 'activations']}
          seriesNames={['Signups', 'Aktivierungen']}
          title="Signups & Aktivierungen"
          subtitle="Letzte 30 Tage"
          height="320px"
        />
      </div>

      <!-- Onboarding funnel -->
      <div class="chart-half">
        <SignupFunnelChart
          data={onboardingFunnelData}
          title="Onboarding Funnel"
          height="380px"
        />
      </div>

      <!-- Retention cohort -->
      <div class="chart-half">
        <HeatmapChart
          data={retentionCohortData}
          columns={['d1', 'd3', 'd7', 'd14', 'd30']}
          columnLabels={['Tag 1', 'Tag 3', 'Tag 7', 'Tag 14', 'Tag 30']}
          title="Retention Kohorten"
          subtitle="% Retention nach Signup-Woche"
          height="380px"
        />
      </div>

      <!-- User segments -->
      <div class="chart-half">
        <DataTable
          data={userSegmentsData}
          columns={[
            { key: 'segment', label: 'Segment', type: 'text' },
            { key: 'users', label: 'Nutzer', type: 'number', align: 'right' },
            { key: 'percentage', label: '%', type: 'percent', align: 'right' },
            { key: 'avgMessages', label: 'Ø Msg/Tag', type: 'number', align: 'right' },
          ]}
          title="Nutzer-Segmente"
        />
      </div>

      <!-- Signup sources -->
      <div class="chart-half">
        <DataTable
          data={signupSourcesData}
          columns={[
            { key: 'source', label: 'Quelle', type: 'text' },
            { key: 'signups', label: 'Signups', type: 'number', align: 'right' },
            { key: 'percentage', label: '%', type: 'percent', align: 'right' },
            { key: 'conversion', label: 'Conv. %', type: 'percent', align: 'right' },
          ]}
          title="Signup-Quellen"
        />
      </div>

      <!-- First actions -->
      <div class="chart-half">
        <DataTable
          data={firstActionsData}
          columns={[
            { key: 'action', label: 'Erste Aktion', type: 'text' },
            { key: 'percentage', label: '% Nutzer', type: 'percent', align: 'right' },
            { key: 'avgTime', label: 'Ø Zeit', type: 'text', align: 'right' },
          ]}
          title="Erste Aktionen nach Signup"
        />
      </div>

      <!-- Churn indicators -->
      <div class="chart-half">
        <DataTable
          data={churnIndicatorsData}
          columns={[
            { key: 'indicator', label: 'Indikator', type: 'text' },
            { key: 'riskLevel', label: 'Risiko', type: 'badge', align: 'center' },
            { key: 'users', label: 'Nutzer', type: 'number', align: 'right' },
            { key: 'percentage', label: '%', type: 'percent', align: 'right' },
          ]}
          title="Churn-Indikatoren"
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
