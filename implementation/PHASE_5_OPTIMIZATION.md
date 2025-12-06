![Momentum Team](../../MomentumTeam-hor.png)

# Phase 5: Optimization

> **Analytics Documentation** · Version 1.0 · Last updated: 2024-12-06

Dashboards, Alerts, Feature Flags, and A/B Testing.

---

## Overview

This phase optimizes the analytics system through dashboards, alerting, feature flags, and optional advanced features like session recording.

---

## Voraussetzungen

- [ ] Phase 1-4 vollständig abgeschlossen
- [ ] Events fließen in PostHog
- [ ] Frontend und Backend Tracking aktiv

---

## 5.1 Dashboard Setup

### Executive Overview Dashboard

```yaml
# PostHog Dashboard Configuration
name: "Executive Overview"
description: "High-level metrics for leadership"
refresh_interval: 3600  # 1 hour

panels:
  - type: trend
    name: "Daily Active Users"
    query: |
      SELECT
        DATE(timestamp) as day,
        COUNT(DISTINCT person_id) as dau
      FROM events
      WHERE timestamp > NOW() - INTERVAL 30 DAY
      GROUP BY day
      ORDER BY day

  - type: number
    name: "Weekly Active Chatters"
    query: |
      SELECT COUNT(DISTINCT person_id)
      FROM events
      WHERE event = 'message_sent'
        AND timestamp > NOW() - INTERVAL 7 DAY

  - type: funnel
    name: "Onboarding Funnel"
    steps:
      - event: signup_completed
      - event: chat_created
      - event: message_sent
        count: 2
      - event: session_started
        days_since_signup: 7

  - type: bar
    name: "Feature Adoption"
    query: |
      SELECT
        CASE
          WHEN event = 'knowledge_base_created' THEN 'Knowledge Hub'
          WHEN event = 'integration_oauth_completed' THEN 'Integrations'
          WHEN event = 'prompt_created' THEN 'Custom Prompts'
          WHEN event = 'audio_recording_started' THEN 'Voice Input'
        END as feature,
        COUNT(DISTINCT person_id) as users
      FROM events
      WHERE event IN (
        'knowledge_base_created',
        'integration_oauth_completed',
        'prompt_created',
        'audio_recording_started'
      )
      AND timestamp > NOW() - INTERVAL 30 DAY
      GROUP BY feature
```

### Chat & AI Metrics Dashboard

```yaml
name: "Chat & AI Metrics"
description: "Detailed chat and model usage metrics"
refresh_interval: 900  # 15 minutes

panels:
  - type: trend
    name: "Messages per Day"
    query: |
      SELECT
        DATE(timestamp) as day,
        COUNT(*) as messages
      FROM events
      WHERE event = 'message_sent'
        AND timestamp > NOW() - INTERVAL 30 DAY
      GROUP BY day

  - type: distribution
    name: "Message Length Distribution"
    query: |
      SELECT
        properties.message_length_bucket as bucket,
        COUNT(*) as count
      FROM events
      WHERE event = 'message_sent'
        AND timestamp > NOW() - INTERVAL 7 DAY
      GROUP BY bucket

  - type: bar
    name: "Agent Usage"
    query: |
      SELECT
        properties.agent_name as agent,
        COUNT(*) as chats
      FROM events
      WHERE event = 'agent_selected'
        AND timestamp > NOW() - INTERVAL 7 DAY
      GROUP BY agent
      ORDER BY chats DESC
      LIMIT 10

  - type: line
    name: "Response Time P95"
    query: |
      SELECT
        DATE_TRUNC('hour', timestamp) as hour,
        PERCENTILE_CONT(0.95) WITHIN GROUP (
          ORDER BY properties.response_time_ms
        ) as p95
      FROM events
      WHERE event = 'response_received'
        AND timestamp > NOW() - INTERVAL 24 HOUR
      GROUP BY hour

  - type: pie
    name: "Feedback Distribution"
    query: |
      SELECT
        properties.feedback_type as type,
        COUNT(*) as count
      FROM events
      WHERE event = 'message_feedback_given'
        AND timestamp > NOW() - INTERVAL 30 DAY
      GROUP BY type
```

### Performance Dashboard

```yaml
name: "Performance & Errors"
description: "Technical health metrics for engineering"
refresh_interval: 300  # 5 minutes

panels:
  - type: number
    name: "Error Rate"
    query: |
      WITH totals AS (
        SELECT
          COUNT(CASE WHEN event IN ('api_error', 'client_error') THEN 1 END) as errors,
          COUNT(*) as total
        FROM events
        WHERE timestamp > NOW() - INTERVAL 24 HOUR
      )
      SELECT ROUND(errors * 100.0 / NULLIF(total, 0), 2) as error_rate
      FROM totals
    thresholds:
      warning: 2
      critical: 5

  - type: line
    name: "Error Rate Over Time"
    query: |
      SELECT
        DATE_TRUNC('hour', timestamp) as hour,
        COUNT(CASE WHEN event IN ('api_error', 'client_error') THEN 1 END) * 100.0 /
          NULLIF(COUNT(*), 0) as error_rate
      FROM events
      WHERE timestamp > NOW() - INTERVAL 24 HOUR
      GROUP BY hour

  - type: table
    name: "Top Errors"
    query: |
      SELECT
        properties.error_type,
        properties.endpoint,
        COUNT(*) as count
      FROM events
      WHERE event = 'api_error'
        AND timestamp > NOW() - INTERVAL 24 HOUR
      GROUP BY properties.error_type, properties.endpoint
      ORDER BY count DESC
      LIMIT 10

  - type: line
    name: "API Latency (P50, P95, P99)"
    query: |
      SELECT
        DATE_TRUNC('hour', timestamp) as hour,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY properties.request_duration_ms) as p50,
        PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY properties.request_duration_ms) as p95,
        PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY properties.request_duration_ms) as p99
      FROM events
      WHERE event = 'api_request'
        AND timestamp > NOW() - INTERVAL 24 HOUR
      GROUP BY hour
```

### Dashboard Import Script

```python
# scripts/import_dashboards.py

import json
import requests
from pathlib import Path

POSTHOG_HOST = "https://analytics.ionos-gpt.de"
POSTHOG_API_KEY = "phc_xxxx"  # Personal API key

def import_dashboard(dashboard_config: dict) -> str:
    """Import a dashboard configuration to PostHog."""
    response = requests.post(
        f"{POSTHOG_HOST}/api/projects/@current/dashboards/",
        headers={
            "Authorization": f"Bearer {POSTHOG_API_KEY}",
            "Content-Type": "application/json"
        },
        json=dashboard_config
    )
    response.raise_for_status()
    return response.json()["id"]

def main():
    dashboards_dir = Path("docs/analytics/dashboards")

    for dashboard_file in dashboards_dir.glob("*.json"):
        with open(dashboard_file) as f:
            config = json.load(f)

        dashboard_id = import_dashboard(config)
        print(f"Imported {dashboard_file.name}: {dashboard_id}")

if __name__ == "__main__":
    main()
```

---

## 5.2 Alert Configuration

### Alert Definitions

```typescript
// PostHog Alert Configuration

interface Alert {
  name: string;
  description: string;
  condition: AlertCondition;
  threshold: number;
  frequency: 'hourly' | 'daily';
  channels: AlertChannel[];
}

const alerts: Alert[] = [
  // Error Rate Alert
  {
    name: 'High Error Rate',
    description: 'Error rate exceeds 5% in the last hour',
    condition: {
      query: `
        SELECT
          COUNT(CASE WHEN event IN ('api_error', 'client_error') THEN 1 END) * 100.0 /
          NULLIF(COUNT(*), 0) as error_rate
        FROM events
        WHERE timestamp > NOW() - INTERVAL 1 HOUR
      `,
      operator: '>',
      value: 5
    },
    threshold: 5,
    frequency: 'hourly',
    channels: ['slack', 'email']
  },

  // API Latency Alert
  {
    name: 'High API Latency',
    description: 'API P95 latency exceeds 5 seconds',
    condition: {
      query: `
        SELECT
          PERCENTILE_CONT(0.95) WITHIN GROUP (
            ORDER BY properties.request_duration_ms
          ) / 1000 as p95_seconds
        FROM events
        WHERE event = 'api_request'
          AND timestamp > NOW() - INTERVAL 1 HOUR
      `,
      operator: '>',
      value: 5
    },
    threshold: 5,
    frequency: 'hourly',
    channels: ['slack']
  },

  // DAU Drop Alert
  {
    name: 'DAU Drop',
    description: 'Daily active users dropped by more than 20% week over week',
    condition: {
      query: `
        WITH current_week AS (
          SELECT COUNT(DISTINCT person_id) as dau
          FROM events
          WHERE timestamp > NOW() - INTERVAL 1 DAY
        ),
        previous_week AS (
          SELECT COUNT(DISTINCT person_id) as dau
          FROM events
          WHERE timestamp BETWEEN NOW() - INTERVAL 8 DAY AND NOW() - INTERVAL 7 DAY
        )
        SELECT
          (previous_week.dau - current_week.dau) * 100.0 / NULLIF(previous_week.dau, 0) as drop_percent
        FROM current_week, previous_week
      `,
      operator: '>',
      value: 20
    },
    threshold: 20,
    frequency: 'daily',
    channels: ['slack', 'email']
  },

  // WebSocket Disconnect Alert
  {
    name: 'High WebSocket Disconnects',
    description: 'WebSocket disconnect rate exceeds 10%',
    condition: {
      query: `
        WITH connections AS (
          SELECT COUNT(*) as total
          FROM events
          WHERE event = 'websocket_connected'
            AND timestamp > NOW() - INTERVAL 1 HOUR
        ),
        disconnects AS (
          SELECT COUNT(*) as total
          FROM events
          WHERE event = 'websocket_error'
            AND timestamp > NOW() - INTERVAL 1 HOUR
        )
        SELECT disconnects.total * 100.0 / NULLIF(connections.total, 0) as disconnect_rate
        FROM connections, disconnects
      `,
      operator: '>',
      value: 10
    },
    threshold: 10,
    frequency: 'hourly',
    channels: ['slack']
  },

  // Signup Conversion Drop
  {
    name: 'Low Signup Conversion',
    description: 'Signup to first chat conversion dropped below 50%',
    condition: {
      query: `
        WITH signups AS (
          SELECT COUNT(DISTINCT person_id) as total
          FROM events
          WHERE event = 'signup_completed'
            AND timestamp > NOW() - INTERVAL 1 DAY
        ),
        first_chats AS (
          SELECT COUNT(DISTINCT person_id) as total
          FROM events
          WHERE event = 'chat_created'
            AND person_id IN (
              SELECT DISTINCT person_id
              FROM events
              WHERE event = 'signup_completed'
                AND timestamp > NOW() - INTERVAL 1 DAY
            )
            AND timestamp > NOW() - INTERVAL 1 DAY
        )
        SELECT first_chats.total * 100.0 / NULLIF(signups.total, 0) as conversion_rate
        FROM signups, first_chats
      `,
      operator: '<',
      value: 50
    },
    threshold: 50,
    frequency: 'daily',
    channels: ['email']
  }
];
```

### Slack Integration

```python
# backend/services/alerting/slack_notifier.py

import httpx
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)


class SlackNotifier:
    """Send alerts to Slack."""

    def __init__(self, webhook_url: str):
        self.webhook_url = webhook_url

    async def send_alert(
        self,
        alert_name: str,
        message: str,
        severity: str,
        details: Dict[str, Any]
    ) -> None:
        """Send alert to Slack channel."""
        color = {
            'critical': '#FF0000',
            'warning': '#FFA500',
            'info': '#0000FF'
        }.get(severity, '#808080')

        payload = {
            'attachments': [{
                'color': color,
                'title': f'🚨 {alert_name}',
                'text': message,
                'fields': [
                    {'title': key, 'value': str(value), 'short': True}
                    for key, value in details.items()
                ],
                'footer': 'IONOS GPT Analytics',
                'ts': int(time.time())
            }]
        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(self.webhook_url, json=payload)
                response.raise_for_status()
        except Exception as e:
            logger.error(f"Failed to send Slack alert: {e}")
```

---

## 5.3 Feature Flags

### PostHog Feature Flags Setup

```typescript
// src/lib/analytics/feature-flags.ts

import posthog from 'posthog-js';
import { writable, derived } from 'svelte/store';

interface FeatureFlags {
  new_chat_ui: boolean;
  enhanced_knowledge_hub: boolean;
  voice_input_v2: boolean;
  dark_mode_oled: boolean;
  beta_agents: boolean;
}

// Default values
const defaultFlags: FeatureFlags = {
  new_chat_ui: false,
  enhanced_knowledge_hub: false,
  voice_input_v2: false,
  dark_mode_oled: false,
  beta_agents: false
};

// Feature flags store
export const featureFlags = writable<FeatureFlags>(defaultFlags);

// Load feature flags from PostHog
export function loadFeatureFlags(): void {
  posthog.onFeatureFlags((flags) => {
    featureFlags.set({
      new_chat_ui: posthog.isFeatureEnabled('new_chat_ui') ?? false,
      enhanced_knowledge_hub: posthog.isFeatureEnabled('enhanced_knowledge_hub') ?? false,
      voice_input_v2: posthog.isFeatureEnabled('voice_input_v2') ?? false,
      dark_mode_oled: posthog.isFeatureEnabled('dark_mode_oled') ?? false,
      beta_agents: posthog.isFeatureEnabled('beta_agents') ?? false
    });
  });
}

// Derived stores for individual flags
export const isNewChatUIEnabled = derived(featureFlags, $flags => $flags.new_chat_ui);
export const isEnhancedKnowledgeHubEnabled = derived(featureFlags, $flags => $flags.enhanced_knowledge_hub);
export const isVoiceInputV2Enabled = derived(featureFlags, $flags => $flags.voice_input_v2);
export const isDarkModeOLEDEnabled = derived(featureFlags, $flags => $flags.dark_mode_oled);
export const isBetaAgentsEnabled = derived(featureFlags, $flags => $flags.beta_agents);
```

### Feature Flag Usage

```svelte
<!-- src/lib/components/chat/ChatInput.svelte -->
<script lang="ts">
  import { isVoiceInputV2Enabled } from '$lib/analytics/feature-flags';

  // Use feature flag
  $: showVoiceInputV2 = $isVoiceInputV2Enabled;
</script>

{#if showVoiceInputV2}
  <VoiceInputV2 />
{:else}
  <VoiceInput />
{/if}
```

### Feature Flag Analytics

```typescript
// Track feature flag exposure
export function trackFeatureFlagExposure(flagName: string, value: boolean): void {
  analytics.track('feature_flag_exposure', {
    flag_name: flagName,
    flag_value: value,
    source: 'posthog'
  });
}

// Wrap feature flag check with tracking
export function useFeatureFlag(flagName: keyof FeatureFlags): boolean {
  const value = get(featureFlags)[flagName];
  trackFeatureFlagExposure(flagName, value);
  return value;
}
```

---

## 5.4 A/B Testing

### Experiment Configuration

```typescript
// src/lib/analytics/experiments.ts

import posthog from 'posthog-js';
import { analytics } from './analytics.service';

interface Experiment {
  name: string;
  variants: string[];
  defaultVariant: string;
}

const experiments: Record<string, Experiment> = {
  chat_input_design: {
    name: 'chat_input_design',
    variants: ['control', 'compact', 'expanded'],
    defaultVariant: 'control'
  },
  onboarding_flow: {
    name: 'onboarding_flow',
    variants: ['control', 'guided', 'video'],
    defaultVariant: 'control'
  },
  agent_recommendation: {
    name: 'agent_recommendation',
    variants: ['control', 'ml_based', 'usage_based'],
    defaultVariant: 'control'
  }
};

export function getExperimentVariant(experimentName: string): string {
  const experiment = experiments[experimentName];

  if (!experiment) {
    console.warn(`Unknown experiment: ${experimentName}`);
    return 'control';
  }

  // Get variant from PostHog
  const variant = posthog.getFeatureFlag(experiment.name);

  // Track exposure
  analytics.track('experiment_exposure', {
    experiment_name: experimentName,
    variant: variant || experiment.defaultVariant
  });

  return (variant as string) || experiment.defaultVariant;
}

export function trackExperimentConversion(
  experimentName: string,
  conversionEvent: string,
  value?: number
): void {
  const variant = posthog.getFeatureFlag(experimentName);

  analytics.track('experiment_conversion', {
    experiment_name: experimentName,
    variant,
    conversion_event: conversionEvent,
    conversion_value: value
  });
}
```

### Experiment Usage

```svelte
<!-- src/routes/onboarding/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import {
    getExperimentVariant,
    trackExperimentConversion
  } from '$lib/analytics/experiments';

  let onboardingVariant: string;

  onMount(() => {
    onboardingVariant = getExperimentVariant('onboarding_flow');
  });

  function handleOnboardingComplete() {
    trackExperimentConversion('onboarding_flow', 'onboarding_completed');
    // Continue...
  }
</script>

{#if onboardingVariant === 'guided'}
  <GuidedOnboarding on:complete={handleOnboardingComplete} />
{:else if onboardingVariant === 'video'}
  <VideoOnboarding on:complete={handleOnboardingComplete} />
{:else}
  <StandardOnboarding on:complete={handleOnboardingComplete} />
{/if}
```

---

## 5.5 Session Recording (Optional)

### Configuration

```typescript
// src/lib/analytics/session-recording.ts

import posthog from 'posthog-js';
import { get } from 'svelte/store';
import { consentStore } from './stores/consent.store';

interface SessionRecordingConfig {
  enabled: boolean;
  sampleRate: number;  // 0-1, percentage of sessions to record
  minimumDuration: number;  // Minimum session length to keep (seconds)
  maskInputs: boolean;
  maskTextSelector: string;
  blockSelector: string;
}

const config: SessionRecordingConfig = {
  enabled: true,
  sampleRate: 0.1,  // Record 10% of sessions
  minimumDuration: 30,
  maskInputs: true,
  maskTextSelector: '[data-ph-mask]',
  blockSelector: '[data-ph-block]'
};

export function initSessionRecording(): void {
  const consent = get(consentStore);

  if (!consent.categories.analytics) {
    return;
  }

  // Check sample rate
  if (Math.random() > config.sampleRate) {
    return;
  }

  posthog.startSessionRecording();
}

export function stopSessionRecording(): void {
  posthog.stopSessionRecording();
}
```

### Privacy Rules

```html
<!-- Mask sensitive content -->
<input type="password" data-ph-mask />
<div class="api-key" data-ph-mask>sk-xxxxx</div>

<!-- Block entire elements from recording -->
<div class="private-content" data-ph-block>
  This content will not be recorded
</div>
```

### PostHog Session Recording Settings

```javascript
// PostHog init with session recording
posthog.init('phc_xxx', {
  api_host: 'https://analytics.ionos-gpt.de',
  session_recording: {
    maskAllInputs: true,
    maskInputOptions: {
      password: true,
      email: true
    },
    blockClass: 'ph-no-capture',
    ignoreClass: 'ph-ignore',
    maskTextClass: 'ph-mask',
    recordCrossOriginIframes: false
  }
});
```

---

## 5.6 Data Retention & Cleanup

### Retention Policy

```python
# backend/services/analytics/retention.py

from datetime import datetime, timedelta
from typing import List
import logging

logger = logging.getLogger(__name__)


class RetentionPolicy:
    """Manage analytics data retention."""

    # Retention periods by event type
    RETENTION_DAYS = {
        'default': 365,  # 1 year
        'session_recording': 30,  # 30 days
        'api_request': 90,  # 3 months
        'error_events': 180,  # 6 months
        'user_events': 730,  # 2 years
    }

    @classmethod
    def get_retention_days(cls, event_type: str) -> int:
        """Get retention period for event type."""
        return cls.RETENTION_DAYS.get(event_type, cls.RETENTION_DAYS['default'])

    @classmethod
    def get_events_to_delete(cls, event_type: str) -> datetime:
        """Get cutoff date for event deletion."""
        days = cls.get_retention_days(event_type)
        return datetime.utcnow() - timedelta(days=days)


# Cleanup job (run via cron)
async def cleanup_old_events():
    """Delete events older than retention policy."""
    event_types = [
        'session_recording',
        'api_request',
        'client_error',
        'api_error'
    ]

    for event_type in event_types:
        cutoff = RetentionPolicy.get_events_to_delete(event_type)
        # Execute cleanup via PostHog API or direct DB access
        logger.info(f"Cleaning up {event_type} events older than {cutoff}")
```

### GDPR Data Deletion

```python
# backend/services/analytics/gdpr.py

from services.analytics_service import analytics
import posthog


async def delete_user_data(user_id: str) -> None:
    """Delete all analytics data for a user (GDPR right to erasure)."""

    # Delete from PostHog
    # Note: This requires PostHog's data deletion API
    posthog.capture(
        distinct_id=user_id,
        event='$delete',
        properties={'$delete_all': True}
    )

    # Log deletion request
    analytics.track('system', 'user_data_deletion_requested', {
        'user_id_hash': hash_user_id(user_id),  # Hash for audit trail
        'deletion_type': 'gdpr_request'
    })
```

---

## 5.7 Documentation & Training

### Team Documentation

```markdown
# PostHog Runbook

## Access

- URL: https://analytics.ionos-gpt.de
- Login: SSO via IONOS Identity

## Common Tasks

### Viewing User Journey
1. Go to "Persons" tab
2. Search for user by pseudonymized ID
3. View event timeline

### Creating a New Dashboard
1. Go to "Dashboards" → "New Dashboard"
2. Add insights using the query builder
3. Set refresh interval
4. Share with team

### Investigating Errors
1. Go to "Insights" → "New Insight"
2. Select "Trends" view
3. Filter by event = 'api_error' OR 'client_error'
4. Break down by properties.error_type

### Checking Feature Flag Impact
1. Go to "Experiments"
2. Select the feature flag
3. View conversion metrics by variant

## Alert Response

### High Error Rate
1. Check error breakdown in Performance Dashboard
2. Identify affected endpoints
3. Check recent deployments
4. Escalate to on-call if needed

### API Latency Spike
1. Check Performance Dashboard for affected endpoints
2. Review backend logs
3. Check database performance
4. Scale resources if needed
```

### Query Examples

```sql
-- Most active users this week
SELECT
  person_id,
  COUNT(*) as events,
  COUNT(DISTINCT DATE(timestamp)) as active_days
FROM events
WHERE timestamp > NOW() - INTERVAL 7 DAY
GROUP BY person_id
ORDER BY events DESC
LIMIT 100;

-- Feature adoption over time
SELECT
  DATE(timestamp) as day,
  COUNT(DISTINCT CASE WHEN event = 'knowledge_base_created' THEN person_id END) as kb_users,
  COUNT(DISTINCT CASE WHEN event = 'integration_oauth_completed' THEN person_id END) as integration_users,
  COUNT(DISTINCT CASE WHEN event = 'prompt_created' THEN person_id END) as prompt_users
FROM events
WHERE timestamp > NOW() - INTERVAL 30 DAY
GROUP BY day
ORDER BY day;

-- Churn risk users (no activity in 7 days but active before)
SELECT DISTINCT person_id
FROM events
WHERE person_id NOT IN (
  SELECT DISTINCT person_id
  FROM events
  WHERE timestamp > NOW() - INTERVAL 7 DAY
)
AND person_id IN (
  SELECT DISTINCT person_id
  FROM events
  WHERE timestamp BETWEEN NOW() - INTERVAL 30 DAY AND NOW() - INTERVAL 7 DAY
);
```

---

## 5.8 Erfolgskriterien

### Phase 5 Completion Checklist

- [ ] Dashboards erstellt und funktionieren
  - [ ] Executive Overview
  - [ ] Chat & AI Metrics
  - [ ] Knowledge Hub
  - [ ] Integration Metrics
  - [ ] Performance & Errors
  - [ ] User Journey
- [ ] Alerts konfiguriert
  - [ ] Error Rate Alert
  - [ ] API Latency Alert
  - [ ] DAU Drop Alert
  - [ ] WebSocket Alert
- [ ] Feature Flags eingerichtet
- [ ] A/B Testing Framework implementiert
- [ ] Session Recording (optional) konfiguriert
- [ ] Retention Policy definiert
- [ ] GDPR Deletion Process
- [ ] Team-Schulung durchgeführt
- [ ] Runbook dokumentiert

### Validation Checklist

```bash
# Verify PostHog is receiving events
curl -X GET "https://analytics.ionos-gpt.de/api/projects/@current/events/?limit=10" \
  -H "Authorization: Bearer $POSTHOG_PERSONAL_API_KEY"

# Verify dashboards are loading
curl -X GET "https://analytics.ionos-gpt.de/api/projects/@current/dashboards/" \
  -H "Authorization: Bearer $POSTHOG_PERSONAL_API_KEY"

# Verify feature flags are active
curl -X GET "https://analytics.ionos-gpt.de/api/projects/@current/feature_flags/" \
  -H "Authorization: Bearer $POSTHOG_PERSONAL_API_KEY"
```

---

## Go-Live Checklist

### Pre-Launch

- [ ] All phases completed and tested
- [ ] Staging environment validated
- [ ] All dashboards showing data
- [ ] Alerts tested (triggered manually)
- [ ] Team has PostHog access
- [ ] Consent Banner approved by Legal
- [ ] Privacy Policy updated
- [ ] Performance impact verified (<50ms)

### Launch Day

- [ ] Enable analytics in production
- [ ] Monitor error rates
- [ ] Verify events flowing
- [ ] Check dashboard data
- [ ] Confirm alerts working

### Post-Launch

- [ ] Review first 24h of data
- [ ] Verify no PII leakage
- [ ] Check event volumes
- [ ] Gather team feedback
- [ ] Plan iteration based on insights

---

## Abschluss

Mit Abschluss dieser Phase ist das Analytics-System vollständig implementiert:

- **130+ Events** über alle Features
- **6 Dashboards** für verschiedene Stakeholder
- **Alerting** für kritische Metriken
- **Feature Flags** für kontrollierte Rollouts
- **A/B Testing** für datengetriebene Entscheidungen
- **DSGVO-konform** mit Consent-First-Architektur

Zurück zur [Implementierungs-Übersicht](./README.md)
