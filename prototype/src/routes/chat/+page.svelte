<script lang="ts">
  import { DashboardHeader } from '$lib/components/Layout';
  import { KPICard, KPICardGrid } from '$lib/components/KPICard';
  import { LineChart, BarChart, PieChart, DataTable } from '$lib/components/Charts';
  import {
    chatKPIs,
    messagesPerHourData,
    agentUsageData,
    toolUsageData,
    messagesOverTimeData,
    feedbackData,
  } from '$lib/stores/chatData';

  const lastUpdated = new Date();
</script>

<svelte:head>
  <title>Chat & AI Metrics - Momentum Analytics</title>
</svelte:head>

<div class="dashboard-container">
  <DashboardHeader
    title="Chat & AI Metrics"
    subtitle="Nachrichten, Response-Zeiten und Agent-Nutzung"
    {lastUpdated}
  />

  <!-- Primary KPIs -->
  <section class="dashboard-section">
    <div class="section-header">
      <h2 class="section-title">Chat Performance</h2>
      <span class="section-badge">Kernmetriken</span>
    </div>
    <KPICardGrid columns={4}>
      <KPICard
        title="Nachrichten/Tag"
        value={chatKPIs.messagesPerDay.value}
        change={chatKPIs.messagesPerDay.change}
        target={chatKPIs.messagesPerDay.target}
        sparklineData={chatKPIs.messagesPerDay.sparkline}
      />
      <KPICard
        title="Ø Response-Zeit"
        value={chatKPIs.avgResponseTime.value}
        change={chatKPIs.avgResponseTime.change}
        format="duration"
        target={chatKPIs.avgResponseTime.target}
        sparklineData={chatKPIs.avgResponseTime.sparkline}
        invertTrend={true}
      />
      <KPICard
        title="Abbruch-Rate"
        value={chatKPIs.generationStopRate.value}
        change={chatKPIs.generationStopRate.change}
        format="percent"
        target={chatKPIs.generationStopRate.target}
        sparklineData={chatKPIs.generationStopRate.sparkline}
        invertTrend={true}
      />
      <KPICard
        title="Feedback Score"
        value={chatKPIs.feedbackScore.value}
        change={chatKPIs.feedbackScore.change}
        format="raw"
        target={chatKPIs.feedbackScore.target}
        sparklineData={chatKPIs.feedbackScore.sparkline}
      />
    </KPICardGrid>
  </section>

  <!-- Charts Grid -->
  <section class="dashboard-section">
    <div class="charts-grid">
      <!-- Messages over time -->
      <div class="chart-full-width">
        <LineChart
          data={messagesOverTimeData}
          xKey="day"
          yKeys={['messages', 'chats']}
          seriesNames={['Nachrichten', 'Chat-Sessions']}
          title="Nachrichten & Sessions"
          subtitle="Letzte 7 Tage"
          height="320px"
        />
      </div>

      <!-- Messages per hour -->
      <div class="chart-half">
        <BarChart
          data={messagesPerHourData.map(d => ({ label: d.hour, value: d.messages }))}
          title="Nachrichten pro Stunde"
          subtitle="Heute"
          height="300px"
          showLabels={false}
        />
      </div>

      <!-- Agent usage -->
      <div class="chart-half">
        <PieChart
          data={agentUsageData}
          title="Agent-Nutzung"
          height="300px"
        />
      </div>

      <!-- Tool usage table -->
      <div class="chart-half">
        <DataTable
          data={toolUsageData}
          columns={[
            { key: 'tool', label: 'Tool', type: 'text' },
            { key: 'usage', label: 'Nutzung', type: 'percent', align: 'right' },
            { key: 'trend', label: 'Trend', type: 'trend', align: 'right' },
          ]}
          title="Tool-Nutzung"
        />
      </div>

      <!-- Feedback distribution -->
      <div class="chart-half">
        <PieChart
          data={[
            { name: 'Positiv', value: feedbackData.positive, color: '#10B981' },
            { name: 'Negativ', value: feedbackData.negative, color: '#EF4444' },
            { name: 'Kein Feedback', value: feedbackData.noFeedback, color: '#97A3B4' },
          ]}
          title="Feedback-Verteilung"
          height="300px"
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
