![Momentum Team](../../MomentumTeam-hor.png)

# Integration Events

> **Analytics Documentation** · Version 1.0 · Last updated: 2024-12-06

Events for third-party integrations: Google, Microsoft, Social Media, etc.

---

## Übersicht

| Event | Beschreibung | Priorität |
|-------|--------------|-----------|
| `integration_viewed` | Integration angesehen | P2 |
| `integration_connect_clicked` | Connect-Button geklickt | P1 |
| `integration_oauth_started` | OAuth-Flow gestartet | P1 |
| `integration_oauth_completed` | OAuth erfolgreich | P1 |
| `integration_oauth_failed` | OAuth fehlgeschlagen | P1 |
| `integration_disconnected` | Integration getrennt | P1 |
| `integration_reconnected` | Integration wiederverbunden | P2 |
| `integration_data_fetched` | Daten abgerufen | P2 |
| `integration_used_in_chat` | Integration im Chat genutzt | P1 |
| `integration_error` | Integrations-Fehler | P2 |

---

## Verfügbare Integrationen

### Produktivität

| Integration | Provider | OAuth | Status |
|-------------|----------|-------|--------|
| Gmail | Google | ✅ | Aktiv |
| Google Calendar | Google | ✅ | Aktiv |
| Google Drive | Google | ✅ | Aktiv |
| Outlook | Microsoft | ✅ | Aktiv |
| OneDrive | Microsoft | ✅ | Aktiv |
| GitHub | - | ❌ | Geplant |
| Atlassian (Jira/Confluence) | - | ❌ | Geplant |
| IONOS Mail | - | ❌ | Geplant |

### Social

| Integration | Provider | OAuth | Status |
|-------------|----------|-------|--------|
| Facebook | Meta | ✅ | Geplant |
| Instagram | Meta | ✅ | Geplant |
| LinkedIn | LinkedIn | ✅ | Geplant |
| Twitter/X | - | ❌ | Geplant |
| Slack | - | ❌ | Geplant |
| Discord | - | ❌ | Geplant |

---

## Event-Definitionen

### integration_viewed

User sieht Integration in der Übersicht.

```typescript
interface IntegrationViewedEvent {
  event: 'integration_viewed';
  properties: {
    /** OAuth-Provider */
    provider: 'google' | 'microsoft' | 'meta' | 'linkedin' | 'none';
    /** Spezifischer Service */
    service: 'gmail' | 'google_calendar' | 'google_drive' | 'outlook' |
             'onedrive' | 'github' | 'atlassian' | 'ionos_mail' |
             'facebook' | 'instagram' | 'linkedin' | 'slack' | 'discord';
    /** Aktueller Status */
    current_status: 'disconnected' | 'connecting' | 'connected' | 'error';
    /** Kategorie */
    category: 'productivity' | 'social';
  };
}
```

---

### integration_connect_clicked ⭐

User klickt auf "Verbinden".

```typescript
interface IntegrationConnectClickedEvent {
  event: 'integration_connect_clicked';
  properties: {
    provider: string;
    service: string;
    category: 'productivity' | 'social';
    /** Ist es ein erneuter Verbindungsversuch */
    is_reconnect: boolean;
    /** Vorheriger Status */
    previous_status: 'disconnected' | 'error';
  };
}
```

**Trigger:** Click auf "Connect"/"Verbinden" Button

**Code-Location:** `src/routes/momentum/integrations/components/Integrations.svelte`

---

### integration_oauth_started

OAuth-Flow beginnt (Redirect zu Provider).

```typescript
interface IntegrationOAuthStartedEvent {
  event: 'integration_oauth_started';
  properties: {
    provider: string;
    service: string;
    /** OAuth Redirect URL (nur Domain) */
    oauth_domain: string;
  };
}
```

---

### integration_oauth_completed ⭐

OAuth erfolgreich abgeschlossen.

```typescript
interface IntegrationOAuthCompletedEvent {
  event: 'integration_oauth_completed';
  properties: {
    provider: string;
    service: string;
    /** Zeit vom Klick bis zur Rückkehr in ms */
    duration_ms: number;
    /** Gewährte Berechtigungen (anonymisiert) */
    scopes_granted_count: number;
    /** Erste Verbindung oder Reconnect */
    is_first_connection: boolean;
  };
}
```

**Dashboard-Nutzung:**
- Integration Conversion Rate
- Average OAuth Duration
- First-time vs Reconnect Rate

---

### integration_oauth_failed

OAuth fehlgeschlagen oder abgebrochen.

```typescript
interface IntegrationOAuthFailedEvent {
  event: 'integration_oauth_failed';
  properties: {
    provider: string;
    service: string;
    /** Fehlertyp */
    error_type: 'user_cancelled' | 'access_denied' | 'timeout' |
                'invalid_scope' | 'server_error' | 'network_error' | 'unknown';
    /** OAuth Error Code wenn verfügbar */
    oauth_error_code: string | null;
    /** Zeit bis Fehler in ms */
    duration_ms: number;
  };
}
```

**Dashboard-Nutzung:**
- OAuth Failure Rate by Provider
- Common Error Types
- Drop-off Analysis

---

### integration_disconnected

Integration wurde getrennt.

```typescript
interface IntegrationDisconnectedEvent {
  event: 'integration_disconnected';
  properties: {
    provider: string;
    service: string;
    /** Wie lange war die Integration verbunden (Tage) */
    connection_age_days: number;
    /** Grund für Trennung */
    disconnect_reason: 'user_initiated' | 'token_expired' | 'revoked' | 'error';
    /** Wie oft wurde die Integration genutzt */
    usage_count: number;
  };
}
```

---

### integration_reconnected

Zuvor getrennte Integration wiederverbunden.

```typescript
interface IntegrationReconnectedEvent {
  event: 'integration_reconnected';
  properties: {
    provider: string;
    service: string;
    /** Tage seit letzter Verbindung */
    days_since_disconnect: number;
    /** Grund für ursprüngliche Trennung */
    previous_disconnect_reason: string;
  };
}
```

---

### integration_data_fetched

Daten von Integration abgerufen.

```typescript
interface IntegrationDataFetchedEvent {
  event: 'integration_data_fetched';
  properties: {
    provider: string;
    service: string;
    /** Art der abgerufenen Daten */
    data_type: 'emails' | 'calendar_events' | 'files' | 'contacts' |
               'posts' | 'messages' | 'issues' | 'documents';
    /** Anzahl abgerufener Items */
    item_count: number;
    /** Abrufzeit in ms */
    fetch_duration_ms: number;
    /** War es ein Refresh oder Initial-Load */
    is_refresh: boolean;
  };
}
```

---

### integration_used_in_chat ⭐

Integration wurde in einem Chat verwendet.

```typescript
interface IntegrationUsedInChatEvent {
  event: 'integration_used_in_chat';
  properties: {
    chat_id: string;
    agent_id: string;
    provider: string;
    service: string;
    /** Was wurde gemacht */
    action_type: 'read_emails' | 'read_calendar' | 'read_files' |
                 'send_email' | 'create_event' | 'upload_file' |
                 'search' | 'other';
    /** Erfolgreich */
    success: boolean;
    /** Items verarbeitet */
    items_processed: number;
  };
}
```

**Dashboard-Nutzung:**
- Most Used Integrations in Chat
- Integration Action Distribution
- Integration Success Rate

---

### integration_error

Fehler bei Integration-Operation.

```typescript
interface IntegrationErrorEvent {
  event: 'integration_error';
  properties: {
    provider: string;
    service: string;
    /** Fehlertyp */
    error_type: 'auth_expired' | 'rate_limited' | 'permission_denied' |
                'not_found' | 'server_error' | 'network_error';
    /** HTTP Status Code */
    http_status: number | null;
    /** Bei welcher Operation */
    operation: string;
    /** Automatisch recovered */
    auto_recovered: boolean;
  };
}
```

---

## TypeScript Export

```typescript
// src/lib/IONOS/analytics/events/integration.events.ts

export type IntegrationProvider = 'google' | 'microsoft' | 'meta' | 'linkedin' | 'none';

export type IntegrationService =
  | 'gmail' | 'google_calendar' | 'google_drive'
  | 'outlook' | 'onedrive'
  | 'github' | 'atlassian' | 'ionos_mail'
  | 'facebook' | 'instagram' | 'linkedin'
  | 'slack' | 'discord';

export type IntegrationStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export type IntegrationEvents =
  | IntegrationViewedEvent
  | IntegrationConnectClickedEvent
  | IntegrationOAuthStartedEvent
  | IntegrationOAuthCompletedEvent
  | IntegrationOAuthFailedEvent
  | IntegrationDisconnectedEvent
  | IntegrationReconnectedEvent
  | IntegrationDataFetchedEvent
  | IntegrationUsedInChatEvent
  | IntegrationErrorEvent;
```

---

## Dashboard-Metriken

### Integration Funnel

```
┌─────────────────────────────────────────────────────────────────┐
│                    INTEGRATION FUNNEL                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  integration_viewed        ████████████████████████  1000      │
│         ↓ 45%                                                   │
│  integration_connect_clicked  █████████████         450        │
│         ↓ 78%                                                   │
│  integration_oauth_started    ██████████            351        │
│         ↓ 85%                                                   │
│  integration_oauth_completed  ████████              298        │
│         ↓ 60%                                                   │
│  integration_used_in_chat     █████                 179        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### SQL Queries

```sql
-- Integration Connection Rate by Provider
SELECT
  properties.provider,
  COUNT(CASE WHEN event = 'integration_connect_clicked' THEN 1 END) as attempts,
  COUNT(CASE WHEN event = 'integration_oauth_completed' THEN 1 END) as connected,
  ROUND(
    COUNT(CASE WHEN event = 'integration_oauth_completed' THEN 1 END) * 100.0 /
    NULLIF(COUNT(CASE WHEN event = 'integration_connect_clicked' THEN 1 END), 0),
    2
  ) as conversion_rate
FROM events
WHERE event IN ('integration_connect_clicked', 'integration_oauth_completed')
  AND timestamp > NOW() - INTERVAL 30 DAY
GROUP BY properties.provider
ORDER BY attempts DESC
```

```sql
-- OAuth Failure Reasons
SELECT
  properties.provider,
  properties.error_type,
  COUNT(*) as failures
FROM events
WHERE event = 'integration_oauth_failed'
  AND timestamp > NOW() - INTERVAL 30 DAY
GROUP BY properties.provider, properties.error_type
ORDER BY failures DESC
```

```sql
-- Most Active Integrations in Chat
SELECT
  properties.service,
  properties.action_type,
  COUNT(*) as usage_count,
  COUNT(DISTINCT properties.chat_id) as unique_chats,
  ROUND(AVG(CASE WHEN properties.success THEN 1 ELSE 0 END) * 100, 2) as success_rate
FROM events
WHERE event = 'integration_used_in_chat'
  AND timestamp > NOW() - INTERVAL 30 DAY
GROUP BY properties.service, properties.action_type
ORDER BY usage_count DESC
```

---

## Implementation Example

```typescript
// In IntegrationCard.svelte
import { analytics } from '$lib/IONOS/analytics';

let connectStartTime: number;

function handleConnectClick() {
  connectStartTime = Date.now();

  analytics.track({
    event: 'integration_connect_clicked',
    properties: {
      provider: integration.provider,
      service: integration.service,
      category: integration.category,
      is_reconnect: integration.previouslyConnected,
      previous_status: integration.status,
    }
  });

  // Start OAuth
  startOAuth(integration);
}

function handleOAuthCallback(result: OAuthResult) {
  const duration = Date.now() - connectStartTime;

  if (result.success) {
    analytics.track({
      event: 'integration_oauth_completed',
      properties: {
        provider: integration.provider,
        service: integration.service,
        duration_ms: duration,
        scopes_granted_count: result.scopes.length,
        is_first_connection: !integration.previouslyConnected,
      }
    });
  } else {
    analytics.track({
      event: 'integration_oauth_failed',
      properties: {
        provider: integration.provider,
        service: integration.service,
        error_type: mapErrorType(result.error),
        oauth_error_code: result.errorCode,
        duration_ms: duration,
      }
    });
  }
}
```

---

## Privacy Considerations

### Was wird NICHT getrackt:

- ❌ OAuth Tokens
- ❌ Konkrete Email-Inhalte
- ❌ Kalender-Details
- ❌ Dateinamen aus Cloud Storage
- ❌ User-IDs der Provider
- ❌ Spezifische Berechtigungen (nur Anzahl)

### Was wird getrackt:

- ✅ Provider und Service (generisch)
- ✅ Erfolg/Fehler Status
- ✅ Aggregierte Counts
- ✅ Timing-Metriken
- ✅ Fehlertypen (kategorisiert)
