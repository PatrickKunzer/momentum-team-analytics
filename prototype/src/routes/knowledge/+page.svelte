<script lang="ts">
  import { DashboardHeader } from '$lib/components/Layout';
  import { KPICard, KPICardGrid } from '$lib/components/KPICard';
  import { PieChart, BarChart, LineChart, SignupFunnelChart } from '$lib/components/Charts';
  import {
    knowledgeKPIs,
    contentTypeData,
    kbLifecycleFunnel,
    fileSizeDistribution,
    uploadMethodsData,
    kbUsageOverTime,
  } from '$lib/stores/knowledgeData';

  const lastUpdated = new Date();
</script>

<svelte:head>
  <title>Knowledge Hub - Momentum Analytics</title>
</svelte:head>

<div class="dashboard-container">
  <DashboardHeader
    title="Knowledge Hub Metrics"
    subtitle="Wissensbasen, Uploads und Nutzung im Chat"
    {lastUpdated}
  />

  <!-- Primary KPIs -->
  <section class="dashboard-section">
    <div class="section-header">
      <h2 class="section-title">Knowledge Hub Performance</h2>
      <span class="section-badge">Kernmetriken</span>
    </div>
    <KPICardGrid columns={4}>
      <KPICard
        title="Knowledge Bases"
        value={knowledgeKPIs.totalKnowledgeBases.value}
        change={knowledgeKPIs.totalKnowledgeBases.change}
        target={knowledgeKPIs.totalKnowledgeBases.target}
        sparklineData={knowledgeKPIs.totalKnowledgeBases.sparkline}
      />
      <KPICard
        title="Dateien hochgeladen"
        value={knowledgeKPIs.totalFilesUploaded.value}
        change={knowledgeKPIs.totalFilesUploaded.change}
        target={knowledgeKPIs.totalFilesUploaded.target}
        sparklineData={knowledgeKPIs.totalFilesUploaded.sparkline}
      />
      <KPICard
        title="Nutzung im Chat"
        value={knowledgeKPIs.usageInChat.value}
        change={knowledgeKPIs.usageInChat.change}
        format="percent"
        target={knowledgeKPIs.usageInChat.target}
        sparklineData={knowledgeKPIs.usageInChat.sparkline}
      />
      <KPICard
        title="Verarbeitungs-Erfolg"
        value={knowledgeKPIs.processingSuccessRate.value}
        change={knowledgeKPIs.processingSuccessRate.change}
        format="percent"
        target={knowledgeKPIs.processingSuccessRate.target}
        sparklineData={knowledgeKPIs.processingSuccessRate.sparkline}
      />
    </KPICardGrid>
  </section>

  <!-- Charts Grid -->
  <section class="dashboard-section">
    <div class="charts-grid">
      <!-- Usage over time -->
      <div class="chart-full-width">
        <LineChart
          data={kbUsageOverTime}
          xKey="week"
          yKeys={['created', 'usedInChat']}
          seriesNames={['KB erstellt', 'Im Chat genutzt']}
          title="Knowledge Base Aktivität"
          subtitle="Letzte 12 Wochen"
          height="320px"
        />
      </div>

      <!-- KB Lifecycle Funnel -->
      <div class="chart-half">
        <SignupFunnelChart
          data={kbLifecycleFunnel}
          title="Knowledge Base Lifecycle"
          height="340px"
        />
      </div>

      <!-- Content type distribution -->
      <div class="chart-half">
        <PieChart
          data={contentTypeData.map(d => ({
            name: d.type,
            value: d.count,
            color: d.color,
          }))}
          title="Inhaltstypen"
          height="340px"
        />
      </div>

      <!-- File size distribution -->
      <div class="chart-half">
        <BarChart
          data={fileSizeDistribution.map(d => ({
            label: d.range,
            value: d.count,
          }))}
          title="Dateigröße Verteilung"
          subtitle="Anzahl Dateien"
          height="280px"
        />
      </div>

      <!-- Upload methods -->
      <div class="chart-half">
        <BarChart
          data={uploadMethodsData.map(d => ({
            label: d.method,
            value: d.percentage,
          }))}
          title="Upload-Methoden"
          subtitle="Prozent der Uploads"
          height="280px"
          horizontal={true}
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
