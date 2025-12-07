![Momentum Team](../assets/MomentumTeam-hor.png)

# Data Flow

> **Analytics Documentation** · Version 1.0 · Last updated: 2024-12-06

Event pipeline and data processing documentation.

---

## Event-Lifecycle

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           EVENT LIFECYCLE                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  1. TRIGGER          2. CAPTURE         3. ENRICH         4. SEND      │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                         │
│  ┌─────────┐       ┌─────────┐       ┌─────────┐       ┌─────────┐    │
│  │ User    │──────▶│ Event   │──────▶│ Context │──────▶│ Provider│    │
│  │ Action  │       │ Created │       │ Added   │       │ API     │    │
│  └─────────┘       └─────────┘       └─────────┘       └─────────┘    │
│       │                 │                 │                 │          │
│       ▼                 ▼                 ▼                 ▼          │
│  ┌─────────┐       ┌─────────┐       ┌─────────┐       ┌─────────┐    │
│  │ Click,  │       │ Consent │       │ Session,│       │ PostHog │    │
│  │ Submit, │       │ Check   │       │ User,   │       │ Ingests │    │
│  │ Navigate│       │         │       │ Device  │       │         │    │
│  └─────────┘       └─────────┘       └─────────┘       └─────────┘    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Frontend Event Flow

### Detaillierter Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND EVENT FLOW                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                      UI COMPONENT                                 │  │
│  │                                                                   │  │
│  │   on:click={() => track({ event: 'message_sent', ... })}        │  │
│  │                                                                   │  │
│  └───────────────────────────────┬──────────────────────────────────┘  │
│                                  │                                      │
│                                  ▼                                      │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    ANALYTICS SERVICE                              │  │
│  │                                                                   │  │
│  │   track(event) {                                                  │  │
│  │     ┌─────────────────────────────────────────────────────────┐  │  │
│  │     │ 1. Check Consent                                        │  │  │
│  │     │    if (!consentStore.hasConsent('analytics')) return;   │  │  │
│  │     └─────────────────────────────────────────────────────────┘  │  │
│  │                           │                                       │  │
│  │                           ▼                                       │  │
│  │     ┌─────────────────────────────────────────────────────────┐  │  │
│  │     │ 2. Enrich Event                                         │  │  │
│  │     │    - Add session_id                                     │  │  │
│  │     │    - Add user_id (pseudonymized)                        │  │  │
│  │     │    - Add device_type, viewport                          │  │  │
│  │     │    - Add timestamp                                      │  │  │
│  │     │    - Add app_version                                    │  │  │
│  │     └─────────────────────────────────────────────────────────┘  │  │
│  │                           │                                       │  │
│  │                           ▼                                       │  │
│  │     ┌─────────────────────────────────────────────────────────┐  │  │
│  │     │ 3. Check Provider Status                                │  │  │
│  │     │    if (provider.isReady()) {                            │  │  │
│  │     │      provider.track(event);                             │  │  │
│  │     │    } else {                                             │  │  │
│  │     │      eventQueue.enqueue(event);                         │  │  │
│  │     │    }                                                    │  │  │
│  │     └─────────────────────────────────────────────────────────┘  │  │
│  │   }                                                               │  │
│  └───────────────────────────────┬──────────────────────────────────┘  │
│                                  │                                      │
│              ┌───────────────────┴───────────────────┐                 │
│              │                                       │                  │
│              ▼                                       ▼                  │
│  ┌───────────────────────┐           ┌───────────────────────┐        │
│  │    PROVIDER           │           │    EVENT QUEUE        │        │
│  │    (PostHog SDK)      │           │    (localStorage)     │        │
│  │                       │           │                       │        │
│  │   posthog.capture()   │           │   Offline storage     │        │
│  │                       │           │   Retry logic         │        │
│  └───────────┬───────────┘           └───────────┬───────────┘        │
│              │                                   │                     │
│              │                                   │ (on reconnect)     │
│              │                                   │                     │
│              └───────────────┬───────────────────┘                     │
│                              │                                         │
│                              ▼                                         │
│              ┌───────────────────────────────────────┐                │
│              │         HTTPS REQUEST                 │                │
│              │         to PostHog Server             │                │
│              └───────────────────────────────────────┘                │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Backend Event Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         BACKEND EVENT FLOW                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                     INCOMING REQUEST                              │  │
│  │                                                                   │  │
│  │   POST /api/chat                                                  │  │
│  │   Headers:                                                        │  │
│  │     Authorization: Bearer <token>                                 │  │
│  │     X-Analytics-Consent: true                                     │  │
│  │                                                                   │  │
│  └───────────────────────────────┬──────────────────────────────────┘  │
│                                  │                                      │
│                                  ▼                                      │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                   ANALYTICS MIDDLEWARE                            │  │
│  │                                                                   │  │
│  │   1. Extract user from token                                      │  │
│  │   2. Check X-Analytics-Consent header                             │  │
│  │   3. Start timer for duration                                     │  │
│  │                                                                   │  │
│  └───────────────────────────────┬──────────────────────────────────┘  │
│                                  │                                      │
│                                  ▼                                      │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                     REQUEST HANDLER                               │  │
│  │                                                                   │  │
│  │   Process business logic...                                       │  │
│  │                                                                   │  │
│  └───────────────────────────────┬──────────────────────────────────┘  │
│                                  │                                      │
│                                  ▼                                      │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                   ANALYTICS MIDDLEWARE                            │  │
│  │                   (Response Phase)                                │  │
│  │                                                                   │  │
│  │   if (consent_header == 'true') {                                │  │
│  │     posthog.capture(                                              │  │
│  │       distinct_id=user.pseudonymized_user_id,                     │  │
│  │       event='api_request',                                        │  │
│  │       properties={                                                │  │
│  │         endpoint: '/api/chat',                                    │  │
│  │         method: 'POST',                                           │  │
│  │         status_code: 200,                                         │  │
│  │         duration_ms: 145,                                         │  │
│  │       }                                                           │  │
│  │     );                                                            │  │
│  │   }                                                               │  │
│  │                                                                   │  │
│  └───────────────────────────────┬──────────────────────────────────┘  │
│                                  │                                      │
│                                  ▼                                      │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                   POSTHOG PYTHON SDK                              │  │
│  │                                                                   │  │
│  │   - Batches events (flush every 30s or 100 events)               │  │
│  │   - Sends to PostHog server                                       │  │
│  │                                                                   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Event Enrichment

### Automatisch hinzugefügte Properties

```typescript
interface EnrichedEvent {
  // Original event properties
  ...originalProperties,

  // Session Context
  session_id: string;           // UUID pro Browser-Session
  session_start: string;        // ISO timestamp

  // User Context (wenn identifiziert)
  user_id?: string;             // pseudonymized_user_id
  is_identified: boolean;

  // Device Context
  device_type: 'mobile' | 'tablet' | 'desktop';
  viewport_width: number;
  viewport_height: number;
  screen_width: number;
  screen_height: number;

  // App Context
  app_version: string;
  environment: 'development' | 'staging' | 'production';

  // Time Context
  timestamp: string;            // ISO timestamp
  timezone: string;             // z.B. 'Europe/Berlin'
  local_hour: number;           // 0-23

  // Page Context
  current_url: string;          // Path ohne Domain
  referrer: string;             // Vorherige Seite (intern)

  // Technical Context
  browser: string;              // z.B. 'Chrome 120'
  os: string;                   // z.B. 'macOS 14'
  is_pwa: boolean;              // PWA oder Browser
}
```

### Enrichment-Logik

```typescript
function enrichProperties(properties: Record<string, unknown>): Record<string, unknown> {
  return {
    ...properties,

    // Session
    session_id: getSessionId(),

    // User
    user_id: analytics.userId,
    is_identified: !!analytics.userId,

    // Device
    device_type: getDeviceType(),
    viewport_width: window.innerWidth,
    viewport_height: window.innerHeight,
    screen_width: window.screen.width,
    screen_height: window.screen.height,

    // App
    app_version: __APP_VERSION__,
    environment: __ENVIRONMENT__,

    // Time
    timestamp: new Date().toISOString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    local_hour: new Date().getHours(),

    // Page
    current_url: window.location.pathname,
    referrer: document.referrer ? new URL(document.referrer).pathname : null,

    // Technical
    browser: getBrowserInfo(),
    os: getOSInfo(),
    is_pwa: isPWA(),
  };
}
```

---

## Offline-Handling

### Event Queue Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         OFFLINE HANDLING                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ONLINE                              OFFLINE                            │
│  ──────                              ───────                            │
│                                                                         │
│  ┌─────────┐                        ┌─────────┐                        │
│  │ Event   │                        │ Event   │                        │
│  └────┬────┘                        └────┬────┘                        │
│       │                                  │                              │
│       ▼                                  ▼                              │
│  ┌─────────┐                        ┌─────────┐                        │
│  │Provider │                        │Provider │                        │
│  │ Ready?  │                        │ Ready?  │                        │
│  └────┬────┘                        └────┬────┘                        │
│       │ YES                              │ NO                           │
│       ▼                                  ▼                              │
│  ┌─────────┐                        ┌─────────────────┐                │
│  │ Send    │                        │ Event Queue     │                │
│  │ Direct  │                        │ (localStorage)  │                │
│  └─────────┘                        │                 │                │
│                                     │ - Max 100 events│                │
│                                     │ - FIFO          │                │
│                                     │ - Retry 3x      │                │
│                                     └────────┬────────┘                │
│                                              │                          │
│                                              │ (on reconnect)          │
│                                              ▼                          │
│                                     ┌─────────────────┐                │
│                                     │ Flush Queue     │                │
│                                     │ to Provider     │                │
│                                     └─────────────────┘                │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow: Vollständiges Beispiel

### Beispiel: Chat-Nachricht senden

```
┌─────────────────────────────────────────────────────────────────────────┐
│                 EXAMPLE: MESSAGE_SENT EVENT                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  1. USER ACTION                                                         │
│  ───────────────────────────────────────────────────────────────────── │
│  User klickt "Senden" in Chat                                          │
│                                                                         │
│                                                                         │
│  2. COMPONENT                                                           │
│  ───────────────────────────────────────────────────────────────────── │
│  // MessageInput.svelte                                                 │
│  async function sendMessage() {                                         │
│    const response = await chatService.send(message);                    │
│                                                                         │
│    track({                                                              │
│      event: 'message_sent',                                             │
│      properties: {                                                      │
│        chat_id: chatId,                                                 │
│        agent_id: selectedAgent.id,                                      │
│        message_length_chars: message.length,                            │
│        has_attachments: files.length > 0,                               │
│        attachment_count: files.length,                                  │
│      }                                                                  │
│    });                                                                  │
│  }                                                                      │
│                                                                         │
│                                                                         │
│  3. ANALYTICS SERVICE                                                   │
│  ───────────────────────────────────────────────────────────────────── │
│  // analytics.service.ts                                                │
│                                                                         │
│  Consent Check: ✓ analytics=true                                       │
│                                                                         │
│  Enriched Event:                                                        │
│  {                                                                      │
│    event: 'message_sent',                                               │
│    properties: {                                                        │
│      // Original                                                        │
│      chat_id: 'chat_abc123',                                           │
│      agent_id: 'agent_greta',                                          │
│      message_length_chars: 156,                                         │
│      has_attachments: true,                                             │
│      attachment_count: 2,                                               │
│                                                                         │
│      // Enriched                                                        │
│      session_id: 'sess_xyz789',                                        │
│      user_id: 'pseudo_user_456',                                       │
│      device_type: 'desktop',                                            │
│      viewport_width: 1920,                                              │
│      app_version: '1.5.0',                                             │
│      timestamp: '2025-12-06T14:32:00.000Z',                            │
│      browser: 'Chrome 120',                                             │
│    }                                                                    │
│  }                                                                      │
│                                                                         │
│                                                                         │
│  4. POSTHOG SDK                                                         │
│  ───────────────────────────────────────────────────────────────────── │
│  posthog.capture('message_sent', enrichedProperties);                   │
│                                                                         │
│  → Batched with other events                                           │
│  → Sent via HTTPS to PostHog server                                    │
│                                                                         │
│                                                                         │
│  5. POSTHOG SERVER                                                      │
│  ───────────────────────────────────────────────────────────────────── │
│  - Event ingested                                                       │
│  - Stored in ClickHouse                                                 │
│  - Available in dashboards                                              │
│  - Person profile updated                                               │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Data Retention

### PostHog Einstellungen

```yaml
# PostHog Data Retention Configuration

events:
  retention_days: 365        # Events für 1 Jahr speichern

session_recordings:
  enabled: false             # Vorerst deaktiviert
  retention_days: 30         # Falls aktiviert

person_profiles:
  retention_days: 730        # 2 Jahre

feature_flags:
  retention_days: 365
```

### DSGVO-Löschung

```python
# Bei Account-Löschung: Alle Daten löschen
def delete_user_analytics(pseudonymized_user_id: str):
    posthog.capture(
        distinct_id=pseudonymized_user_id,
        event='$delete',  # PostHog löscht alle Daten
    )
```

---

## Monitoring

### Health Checks

```typescript
// Analytics Health Status
interface AnalyticsHealth {
  provider_ready: boolean;
  queue_size: number;
  last_event_sent: string | null;
  errors_last_hour: number;
}

function getAnalyticsHealth(): AnalyticsHealth {
  return {
    provider_ready: analytics.isReady(),
    queue_size: eventQueue.size,
    last_event_sent: analytics.lastEventTimestamp,
    errors_last_hour: analytics.errorCount,
  };
}
```

### Error Tracking

```typescript
// Bei Analytics-Fehlern
window.addEventListener('error', (event) => {
  // Fehler in separatem Error-Tracking erfassen
  // NICHT über Analytics (könnte selbst fehlerhaft sein)
  console.error('[Analytics Error]', event.error);
});
```
