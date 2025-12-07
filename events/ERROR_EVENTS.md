![Momentum Team](../assets/MomentumTeam-hor.png)

# Error Events

> **Analytics Documentation** · Version 1.0 · Last updated: 2024-12-06

Events for error and performance tracking.

---

## Übersicht

| Event | Beschreibung | Priorität |
|-------|--------------|-----------|
| `client_error` | Client-seitiger Fehler | P0 |
| `unhandled_rejection` | Unhandled Promise Rejection | P0 |
| `api_error` | API-Fehler | P0 |
| `api_timeout` | API Timeout | P1 |
| `api_retry` | API Retry | P2 |
| `websocket_connected` | WebSocket verbunden | P2 |
| `websocket_disconnected` | WebSocket getrennt | P1 |
| `websocket_reconnected` | WebSocket wiederverbunden | P2 |
| `websocket_error` | WebSocket-Fehler | P1 |
| `slow_response` | Langsame API-Antwort | P2 |

---

## Event-Definitionen

### Client Errors

#### client_error ⭐

```typescript
interface ClientErrorEvent {
  event: 'client_error';
  properties: {
    error_type: 'runtime' | 'syntax' | 'type' | 'reference' | 'range' | 'unknown';
    error_message: string; // Sanitized, no PII
    /** Komponente wo Fehler auftrat */
    component: string | null;
    /** Stack Trace (erste 3 Frames) */
    stack_frames: string[];
    /** User-Aktion die zum Fehler führte */
    user_action: string | null;
    /** URL Path */
    page_path: string;
  };
}
```

**Hinweis:** Error Messages werden sanitized - keine User-Daten oder Tokens

---

### API Errors

#### api_error ⭐

```typescript
interface APIErrorEvent {
  event: 'api_error';
  properties: {
    /** API Endpoint (ohne Query-Params) */
    endpoint: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    status_code: number;
    /** Kategorisierte Fehlermeldung */
    error_category: 'auth' | 'validation' | 'not_found' | 'rate_limit' |
                    'server' | 'network' | 'timeout' | 'unknown';
    /** Request-Dauer bis Fehler (ms) */
    request_duration_ms: number;
  };
}
```

---

### WebSocket Events

#### websocket_disconnected

```typescript
interface WebSocketDisconnectedEvent {
  event: 'websocket_disconnected';
  properties: {
    /** Grund für Disconnect */
    reason: 'transport_close' | 'ping_timeout' | 'server_disconnect' |
            'client_disconnect' | 'network_error';
    /** War es ein sauberer Disconnect */
    was_clean: boolean;
    /** Wie lange war verbunden (ms) */
    connection_duration_ms: number;
    /** Während aktivem Chat */
    during_active_chat: boolean;
  };
}
```

---

### Performance

#### slow_response

```typescript
interface SlowResponseEvent {
  event: 'slow_response';
  properties: {
    endpoint: string;
    method: string;
    /** Tatsächliche Dauer (ms) */
    duration_ms: number;
    /** Threshold der überschritten wurde (ms) */
    threshold_ms: number;
    status_code: number;
  };
}
```

**Threshold:** Default 2000ms, konfigurierbar

---

## TypeScript Export

```typescript
// src/lib/IONOS/analytics/events/error.events.ts

export type ErrorCategory =
  | 'auth'
  | 'validation'
  | 'not_found'
  | 'rate_limit'
  | 'server'
  | 'network'
  | 'timeout'
  | 'unknown';

export type ErrorEvents =
  | ClientErrorEvent
  | UnhandledRejectionEvent
  | APIErrorEvent
  | APITimeoutEvent
  | APIRetryEvent
  | WebSocketConnectedEvent
  | WebSocketDisconnectedEvent
  | WebSocketReconnectedEvent
  | WebSocketErrorEvent
  | SlowResponseEvent;
```

---

## Auto-Capture Setup

```typescript
// src/lib/IONOS/analytics/error-tracking.ts

import { analytics } from './analytics.service';

export function setupErrorTracking() {
  // Global error handler
  window.onerror = (message, source, lineno, colno, error) => {
    analytics.track({
      event: 'client_error',
      properties: {
        error_type: getErrorType(error),
        error_message: sanitizeMessage(String(message)),
        component: extractComponent(source),
        stack_frames: extractStackFrames(error?.stack, 3),
        user_action: getLastUserAction(),
        page_path: window.location.pathname,
      }
    });
  };

  // Unhandled promise rejections
  window.onunhandledrejection = (event) => {
    analytics.track({
      event: 'unhandled_rejection',
      properties: {
        reason: sanitizeMessage(String(event.reason)),
        page_path: window.location.pathname,
      }
    });
  };
}

function sanitizeMessage(message: string): string {
  // Remove potential PII
  return message
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL]')
    .replace(/Bearer\s+[A-Za-z0-9\-._~+\/]+=*/g, '[TOKEN]')
    .substring(0, 500);
}
```

---

## Dashboard-Metriken

### Error Rate

```sql
-- Error Rate über Zeit
SELECT
  DATE_TRUNC('hour', timestamp) as hour,
  COUNT(CASE WHEN event IN ('client_error', 'api_error') THEN 1 END) as errors,
  COUNT(DISTINCT session_id) as sessions,
  ROUND(
    COUNT(CASE WHEN event IN ('client_error', 'api_error') THEN 1 END) * 100.0 /
    NULLIF(COUNT(DISTINCT session_id), 0),
    2
  ) as error_rate
FROM events
WHERE timestamp > NOW() - INTERVAL 24 HOUR
GROUP BY hour
ORDER BY hour
```

### Top Errors

```sql
-- Häufigste Fehler
SELECT
  properties.error_category,
  properties.endpoint,
  properties.status_code,
  COUNT(*) as occurrences
FROM events
WHERE event = 'api_error'
  AND timestamp > NOW() - INTERVAL 7 DAY
GROUP BY properties.error_category, properties.endpoint, properties.status_code
ORDER BY occurrences DESC
LIMIT 20
```
