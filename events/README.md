![Momentum Team](../../MomentumTeam-hor.png)

# Event Schema

> **Analytics Documentation** · Version 1.0 · Last updated: 2024-12-06

Complete event catalog with 130+ events across 12 categories.

---

## Quick Navigation

| Category | Events | Documentation |
|-----------|--------|---------------|
| Chat & AI | 25 | [CHAT_EVENTS.md](./CHAT_EVENTS.md) |
| Knowledge Hub | 15 | [KNOWLEDGE_EVENTS.md](./KNOWLEDGE_EVENTS.md) |
| Integrations | 10 | [INTEGRATION_EVENTS.md](./INTEGRATION_EVENTS.md) |
| Agents | 6 | [AGENT_EVENTS.md](./AGENT_EVENTS.md) |
| Settings | 15 | [SETTINGS_EVENTS.md](./SETTINGS_EVENTS.md) |
| Workspace | 12 | [WORKSPACE_EVENTS.md](./WORKSPACE_EVENTS.md) |
| Audio | 7 | [AUDIO_EVENTS.md](./AUDIO_EVENTS.md) |
| Navigation | 12 | [NAVIGATION_EVENTS.md](./NAVIGATION_EVENTS.md) |
| Account | 11 | [ACCOUNT_EVENTS.md](./ACCOUNT_EVENTS.md) |
| Errors | 10 | [ERROR_EVENTS.md](./ERROR_EVENTS.md) |
| PWA | 6 | [PWA_EVENTS.md](./PWA_EVENTS.md) |

---

## Event-Naming-Konventionen

### Format

```
<object>_<action>
```

### Beispiele

| Event Name | Objekt | Aktion |
|------------|--------|--------|
| `message_sent` | message | sent |
| `chat_created` | chat | created |
| `knowledge_base_deleted` | knowledge_base | deleted |
| `integration_connected` | integration | connected |

### Regeln

1. **Snake_case** für alle Event-Namen
2. **Objekt zuerst**, dann Aktion
3. **Vergangenheitsform** für abgeschlossene Aktionen (`sent`, `created`)
4. **Präsens** für Zustandsänderungen (`started`, `stopped`)
5. **Keine Abkürzungen** außer etablierte (z.B. `pwa`, `api`)

---

## Property-Typen

### Basis-Typen

```typescript
type PropertyType =
  | string
  | number
  | boolean
  | string[]
  | null;

// Keine nested objects - flache Struktur!
```

### Naming-Konventionen

| Suffix | Typ | Beispiel |
|--------|-----|----------|
| `_id` | string | `chat_id`, `agent_id` |
| `_ids` | string[] | `knowledge_ids`, `tool_ids` |
| `_count` | number | `message_count`, `file_count` |
| `_ms` | number | `duration_ms`, `response_time_ms` |
| `_seconds` | number | `duration_seconds` |
| `_kb` | number | `file_size_kb` |
| `_chars` | number | `message_length_chars` |
| `_percent` | number | `scroll_depth_percent` |
| `has_*` | boolean | `has_attachments`, `has_knowledge` |
| `is_*` | boolean | `is_new_chat`, `is_pwa` |
| `*_type` | string | `device_type`, `file_type` |
| `*_at` | string (ISO) | `created_at`, `updated_at` |

---

## Automatisch hinzugefügte Properties

Diese Properties werden **automatisch** zu jedem Event hinzugefügt:

```typescript
interface AutomaticProperties {
  // Session
  session_id: string;           // UUID der Browser-Session

  // User
  user_id: string | null;       // pseudonymized_user_id
  is_identified: boolean;

  // Time
  timestamp: string;            // ISO 8601
  timezone: string;             // z.B. 'Europe/Berlin'
  local_hour: number;           // 0-23

  // Device
  device_type: 'mobile' | 'tablet' | 'desktop';
  viewport_width: number;
  viewport_height: number;

  // App
  app_version: string;
  environment: 'development' | 'staging' | 'production';

  // Page
  current_url: string;          // Path ohne Domain
  referrer: string | null;

  // Technical
  browser: string;
  os: string;
  is_pwa: boolean;
}
```

**Diese Properties NICHT manuell setzen!**

---

## TypeScript Event-Definitionen

### Base Event Interface

```typescript
// src/lib/IONOS/analytics/events/types.ts

export interface BaseEvent<T extends string, P extends Record<string, unknown>> {
  event: T;
  properties: P;
}

export type AnalyticsEvent =
  | ChatEvents
  | KnowledgeEvents
  | IntegrationEvents
  | AgentEvents
  | SettingsEvents
  | WorkspaceEvents
  | AudioEvents
  | NavigationEvents
  | AccountEvents
  | ErrorEvents
  | PWAEvents;
```

### Event Helper

```typescript
// src/lib/IONOS/analytics/events/index.ts

import type { AnalyticsEvent } from './types';

/**
 * Type-safe event creator
 */
export function createEvent<T extends AnalyticsEvent>(
  event: T['event'],
  properties: T['properties']
): T {
  return { event, properties } as T;
}

// Usage:
const event = createEvent('message_sent', {
  chat_id: 'abc123',
  agent_id: 'greta',
  message_length_chars: 150,
  has_attachments: false,
});
```

---

## Event-Kategorien Übersicht

### 1. Chat Events (25 Events)
Alle Interaktionen im Chat-Interface.
→ [CHAT_EVENTS.md](./CHAT_EVENTS.md)

```typescript
// Beispiele
'chat_created'
'message_sent'
'message_received'
'tool_executed'
'web_search_triggered'
'image_generated'
```

### 2. Knowledge Events (15 Events)
Knowledge Hub: Dateien, Websites, Memories.
→ [KNOWLEDGE_EVENTS.md](./KNOWLEDGE_EVENTS.md)

```typescript
// Beispiele
'knowledge_base_created'
'file_uploaded'
'web_content_added'
'memory_created'
'google_drive_file_added'
```

### 3. Integration Events (10 Events)
Third-Party Verbindungen.
→ [INTEGRATION_EVENTS.md](./INTEGRATION_EVENTS.md)

```typescript
// Beispiele
'integration_connect_clicked'
'integration_oauth_completed'
'integration_disconnected'
'integration_used_in_chat'
```

### 4. Agent Events (6 Events)
AI-Team / Agent-Auswahl.
→ [AGENT_EVENTS.md](./AGENT_EVENTS.md)

```typescript
// Beispiele
'agent_viewed'
'agent_selected'
'agent_search'
```

### 5. Settings Events (15 Events)
Benutzereinstellungen.
→ [SETTINGS_EVENTS.md](./SETTINGS_EVENTS.md)

```typescript
// Beispiele
'settings_opened'
'theme_changed'
'language_changed'
'temperature_changed'
```

### 6. Workspace Events (12 Events)
Models, Prompts, Tools.
→ [WORKSPACE_EVENTS.md](./WORKSPACE_EVENTS.md)

```typescript
// Beispiele
'model_created'
'prompt_used'
'tool_bound_to_model'
```

### 7. Audio Events (7 Events)
TTS/STT Features.
→ [AUDIO_EVENTS.md](./AUDIO_EVENTS.md)

```typescript
// Beispiele
'audio_recording_started'
'audio_transcription_completed'
'tts_playback_started'
```

### 8. Navigation Events (12 Events)
Seitenaufrufe, UI-Interaktionen.
→ [NAVIGATION_EVENTS.md](./NAVIGATION_EVENTS.md)

```typescript
// Beispiele
'page_viewed'
'sidebar_opened'
'help_clicked'
'survey_completed'
```

### 9. Account Events (11 Events)
Registrierung, Login, Account-Management.
→ [ACCOUNT_EVENTS.md](./ACCOUNT_EVENTS.md)

```typescript
// Beispiele
'signup_completed'
'login_succeeded'
'account_deleted'
```

### 10. Error Events (10 Events)
Fehler und Performance.
→ [ERROR_EVENTS.md](./ERROR_EVENTS.md)

```typescript
// Beispiele
'client_error'
'api_error'
'websocket_disconnected'
'slow_response'
```

### 11. PWA Events (6 Events)
Progressive Web App.
→ [PWA_EVENTS.md](./PWA_EVENTS.md)

```typescript
// Beispiele
'pwa_install_banner_shown'
'pwa_installed'
'pwa_launched'
```

---

## Vollständige Event-Liste

| # | Event | Kategorie | Priorität |
|---|-------|-----------|-----------|
| 1 | `session_started` | Navigation | P0 |
| 2 | `page_viewed` | Navigation | P0 |
| 3 | `chat_created` | Chat | P0 |
| 4 | `message_sent` | Chat | P0 |
| 5 | `message_received` | Chat | P0 |
| 6 | `agent_selected` | Agent | P0 |
| 7 | `signup_completed` | Account | P0 |
| 8 | `login_succeeded` | Account | P0 |
| 9 | `client_error` | Error | P0 |
| 10 | `api_error` | Error | P0 |
| ... | ... | ... | ... |

**Prioritäten:**
- **P0**: Phase 1 - Foundation (kritisch)
- **P1**: Phase 2 - Chat-Tracking
- **P2**: Phase 3 - Feature-Tracking
- **P3**: Phase 4/5 - Nice-to-have

---

## Validierung

### Schema-Validierung

```typescript
// src/lib/IONOS/analytics/events/validation.ts

import { z } from 'zod';

const MessageSentSchema = z.object({
  event: z.literal('message_sent'),
  properties: z.object({
    chat_id: z.string(),
    agent_id: z.string(),
    message_length_chars: z.number().int().min(0),
    has_attachments: z.boolean(),
    attachment_count: z.number().int().min(0).optional(),
    has_knowledge_context: z.boolean().optional(),
    knowledge_ids: z.array(z.string()).optional(),
  }),
});

export function validateEvent(event: unknown): boolean {
  // Validate against schema
  try {
    // ... validation logic
    return true;
  } catch {
    console.warn('Invalid event:', event);
    return false;
  }
}
```

---

## Best Practices

### DO ✅

```typescript
// Spezifische, aussagekräftige Events
track({ event: 'message_sent', properties: { chat_id: '...' } });

// Flache Properties
properties: {
  file_type: 'pdf',
  file_size_kb: 1024,
}

// IDs für Referenzen
properties: {
  chat_id: 'chat_abc123',
  agent_id: 'agent_greta',
}
```

### DON'T ❌

```typescript
// Zu generisch
track({ event: 'click', properties: { element: 'button' } });

// Nested Objects
properties: {
  file: { type: 'pdf', size: 1024 } // ❌
}

// PII (Personenbezogene Daten)
properties: {
  email: 'user@example.com', // ❌ NIEMALS!
  message_content: '...',    // ❌ NIEMALS!
}
```

---

## Checkliste für neue Events

- [ ] Event-Name folgt Konvention (`object_action`)
- [ ] Properties sind flach (kein Nesting)
- [ ] Keine PII in Properties
- [ ] TypeScript-Interface erstellt
- [ ] Dokumentation aktualisiert
- [ ] In entsprechende Kategorie-Datei eingetragen
- [ ] Priorität zugewiesen
- [ ] Dashboard-Relevanz geprüft
