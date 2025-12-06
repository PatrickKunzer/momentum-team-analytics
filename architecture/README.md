![Momentum Team](../../MomentumTeam-hor.png)

# Analytics Architecture

> **Analytics Documentation** · Version 1.0 · Last updated: 2024-12-06

System design and architecture documentation for Momentum Team Analytics.

---

## Quick Links

| Document | Description |
|----------|-------------|
| [System Design](./SYSTEM_DESIGN.md) | Complete system architecture |
| [Consent Management](./CONSENT_MANAGEMENT.md) | GDPR-compliant consent system |
| [Provider Abstraction](./PROVIDER_ABSTRACTION.md) | Exchangeable analytics providers |
| [Data Flow](./DATA_FLOW.md) | Data flow and event pipeline |

---

## Architecture Overview

### High-Level Architektur

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              USER BROWSER                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                     SVELTEKIT APPLICATION                        │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │                                                                  │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │   │
│  │  │ UI Components│  │ Svelte Stores│  │ Service Layer        │  │   │
│  │  │              │  │              │  │                      │  │   │
│  │  │ - Chat       │  │ - user       │  │ - chatService        │  │   │
│  │  │ - Settings   │  │ - config     │  │ - knowledgeService   │  │   │
│  │  │ - Knowledge  │  │ - settings   │  │ - integrationService │  │   │
│  │  │ - Agents     │  │ - chats      │  │ - agentService       │  │   │
│  │  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘  │   │
│  │         │                 │                      │              │   │
│  │         └─────────────────┼──────────────────────┘              │   │
│  │                           │                                      │   │
│  │                           ▼                                      │   │
│  │  ┌────────────────────────────────────────────────────────────┐ │   │
│  │  │                   ANALYTICS MODULE                          │ │   │
│  │  ├────────────────────────────────────────────────────────────┤ │   │
│  │  │                                                             │ │   │
│  │  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐│ │   │
│  │  │  │ Consent     │  │ Analytics   │  │ Event Queue         ││ │   │
│  │  │  │ Store       │  │ Service     │  │ (localStorage)      ││ │   │
│  │  │  │             │  │             │  │                     ││ │   │
│  │  │  │ - essential │  │ - track()   │  │ - offline support   ││ │   │
│  │  │  │ - analytics │  │ - identify()│  │ - batch sending     ││ │   │
│  │  │  │ - marketing │  │ - page()    │  │ - retry logic       ││ │   │
│  │  │  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘│ │   │
│  │  │         │                │                     │           │ │   │
│  │  │         └────────────────┼─────────────────────┘           │ │   │
│  │  │                          │                                  │ │   │
│  │  │                          ▼                                  │ │   │
│  │  │  ┌─────────────────────────────────────────────────────┐   │ │   │
│  │  │  │              PROVIDER ADAPTER                        │   │ │   │
│  │  │  ├─────────────────────────────────────────────────────┤   │ │   │
│  │  │  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌────────┐ │   │ │   │
│  │  │  │  │ PostHog │  │Plausible│  │ Matomo  │  │  NoOp  │ │   │ │   │
│  │  │  │  │ Adapter │  │ Adapter │  │ Adapter │  │Adapter │ │   │ │   │
│  │  │  │  └─────────┘  └─────────┘  └─────────┘  └────────┘ │   │ │   │
│  │  │  └─────────────────────────────────────────────────────┘   │ │   │
│  │  └────────────────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTPS
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           BACKEND (FastAPI)                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    ANALYTICS MIDDLEWARE                          │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │  - Request/Response tracking                                     │   │
│  │  - Error capturing                                               │   │
│  │  - Performance metrics                                           │   │
│  │  - Server-side event enrichment                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                    │                                    │
│                                    ▼                                    │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                   POSTHOG PYTHON SDK                             │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTPS
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    POSTHOG (Self-Hosted on IONOS Cloud)                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │ Event        │  │ Analytics    │  │ Feature      │                  │
│  │ Ingestion    │  │ Engine       │  │ Flags        │                  │
│  └──────────────┘  └──────────────┘  └──────────────┘                  │
│                                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │ Session      │  │ Dashboards   │  │ Data         │                  │
│  │ Recording    │  │ & Insights   │  │ Warehouse    │                  │
│  └──────────────┘  └──────────────┘  └──────────────┘                  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Kernkomponenten

### 1. Analytics Service (Frontend)

**Verantwortlichkeiten:**
- Event-Tracking API für UI-Komponenten
- Consent-Prüfung vor jedem Event
- Event-Enrichment (User-Kontext, Session-Daten)
- Offline-Queue-Management

**Location:** `src/lib/IONOS/analytics/analytics.service.ts`

### 2. Consent Store (Frontend)

**Verantwortlichkeiten:**
- Consent-Status verwalten
- Persistenz in localStorage
- Reaktive Updates für UI

**Location:** `src/lib/IONOS/analytics/consent.store.ts`

### 3. Provider Adapter (Frontend)

**Verantwortlichkeiten:**
- Abstraktion über Analytics-Provider
- Einheitliches Interface für alle Provider
- Hot-Swapping von Providern

**Location:** `src/lib/IONOS/analytics/providers/`

### 4. Analytics Middleware (Backend)

**Verantwortlichkeiten:**
- Server-Side Event-Tracking
- Request/Response Metriken
- Error-Capturing

**Location:** `backend/open_webui/middleware/analytics.py`

---

## Design-Prinzipien

### 1. Privacy by Design

```typescript
// Jedes Event prüft Consent
track(event: AnalyticsEvent) {
  if (!this.consentStore.hasConsent('analytics')) {
    return; // Kein Tracking ohne Consent
  }
  // ... tracking logic
}
```

### 2. Provider Agnostic

```typescript
// Interface für alle Provider
interface AnalyticsProvider {
  init(config: ProviderConfig): void;
  track(event: string, properties: Record<string, unknown>): void;
  identify(userId: string, traits: Record<string, unknown>): void;
  page(name: string, properties: Record<string, unknown>): void;
  reset(): void;
}
```

### 3. Offline-First

```typescript
// Events werden lokal gespeichert und bei Verbindung gesendet
class EventQueue {
  private queue: AnalyticsEvent[] = [];

  enqueue(event: AnalyticsEvent) {
    this.queue.push(event);
    this.persist();
    this.flush();
  }
}
```

### 4. Type-Safe Events

```typescript
// Typisierte Events verhindern Fehler
interface MessageSentEvent {
  event: 'message_sent';
  properties: {
    chat_id: string;
    agent_id: string;
    message_length_chars: number;
    has_attachments: boolean;
  };
}
```

---

## Datenschutz-Architektur

### Datenklassifizierung

| Kategorie | Beispiele | Behandlung |
|-----------|-----------|------------|
| **PII (verboten)** | Email, Name, IP | Niemals tracken |
| **Pseudonymisiert** | `pseudonymized_user_id` | Für Analytics erlaubt |
| **Aggregiert** | Message Count, Duration | Immer erlaubt |
| **Technisch** | Browser, OS, Device | Mit Consent erlaubt |

### User-Identifikation

```typescript
// Nur pseudonymisierte IDs verwenden
identify(user: SessionUser) {
  if (!user.pseudonymized_user_id) {
    return; // Keine Identifikation ohne Pseudonym
  }

  this.provider.identify(user.pseudonymized_user_id, {
    created_at: user.created_at,
    // KEINE Email, Name, etc.
  });
}
```

---

## Deployment-Architektur

### Self-Hosted PostHog auf IONOS Cloud

```
┌─────────────────────────────────────────────────────────────┐
│                     IONOS CLOUD (EU)                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Kubernetes Cluster                      │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │                                                      │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │   │
│  │  │  PostHog    │  │  PostHog    │  │  PostHog    │ │   │
│  │  │  Web        │  │  Worker     │  │  Plugin     │ │   │
│  │  │  (3 pods)   │  │  (2 pods)   │  │  Server     │ │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘ │   │
│  │                                                      │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │   │
│  │  │ PostgreSQL  │  │   Redis     │  │ ClickHouse  │ │   │
│  │  │ (Primary +  │  │  Cluster    │  │  Cluster    │ │   │
│  │  │  Replica)   │  │             │  │             │ │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘ │   │
│  │                                                      │   │
│  │  ┌─────────────┐  ┌─────────────┐                   │   │
│  │  │   Kafka     │  │   MinIO     │                   │   │
│  │  │  Cluster    │  │  (S3-comp.) │                   │   │
│  │  └─────────────┘  └─────────────┘                   │   │
│  │                                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Load Balancer                           │   │
│  │              analytics.ionos-gpt.de                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Ressourcen-Empfehlung

| Komponente | CPU | RAM | Storage |
|------------|-----|-----|---------|
| PostHog Web | 2 cores | 4 GB | - |
| PostHog Worker | 2 cores | 4 GB | - |
| PostgreSQL | 4 cores | 16 GB | 100 GB SSD |
| ClickHouse | 8 cores | 32 GB | 500 GB SSD |
| Redis | 2 cores | 8 GB | - |
| Kafka | 4 cores | 8 GB | 200 GB SSD |

---

## Nächste Schritte

1. [System Design](./SYSTEM_DESIGN.md) - Detaillierte Komponenten
2. [Consent Management](./CONSENT_MANAGEMENT.md) - GDPR Implementation
3. [Provider Abstraction](./PROVIDER_ABSTRACTION.md) - Provider-Wechsel
4. [Data Flow](./DATA_FLOW.md) - Event-Pipeline
