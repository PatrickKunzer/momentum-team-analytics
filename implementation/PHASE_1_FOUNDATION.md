![Momentum Team](../../MomentumTeam-hor.png)

# Phase 1: Foundation

> **Analytics Documentation** · Version 1.0 · Last updated: 2024-12-06

PostHog Setup, Consent Management, Analytics Service Core.

---

## Übersicht

| Task | Beschreibung | Priorität |
|------|--------------|-----------|
| 1.1 | PostHog Self-Hosted Setup | P0 |
| 1.2 | Environment Configuration | P0 |
| 1.3 | Consent Store Implementation | P0 |
| 1.4 | Consent Banner UI | P0 |
| 1.5 | Analytics Service Core | P0 |
| 1.6 | Provider Abstraction | P0 |
| 1.7 | Core Events Implementation | P0 |
| 1.8 | Integration & Testing | P0 |

---

## 1.1 PostHog Self-Hosted Setup

### Option A: Docker Compose (Empfohlen für Start)

```bash
# Auf IONOS Cloud Server
git clone https://github.com/PostHog/posthog.git
cd posthog
docker compose -f docker-compose.hobby.yml up -d
```

### Option B: Kubernetes (Empfohlen für Production)

```bash
# Helm Chart Installation
helm repo add posthog https://posthog.github.io/charts-clickhouse/
helm repo update

helm install posthog posthog/posthog \
  --namespace posthog \
  --create-namespace \
  --set cloud=ionos \
  --set ingress.hostname=analytics.ionos-gpt.de
```

### Konfiguration

```yaml
# values.yaml für PostHog
posthog:
  persistence:
    size: 100Gi
  replicaCount: 2

clickhouse:
  persistence:
    size: 500Gi

postgresql:
  persistence:
    size: 50Gi

ingress:
  enabled: true
  hostname: analytics.ionos-gpt.de
  tls: true
```

---

## 1.2 Environment Configuration

### Frontend (.env)

```bash
# .env.production
VITE_ANALYTICS_ENABLED=true
VITE_ANALYTICS_PROVIDER=posthog
VITE_POSTHOG_API_KEY=phc_your_api_key_here
VITE_POSTHOG_HOST=https://analytics.ionos-gpt.de

# .env.development
VITE_ANALYTICS_ENABLED=true
VITE_ANALYTICS_PROVIDER=console
VITE_ANALYTICS_DEBUG=true

# .env.test
VITE_ANALYTICS_ENABLED=false
VITE_ANALYTICS_PROVIDER=noop
```

### Vite Config Update

```typescript
// vite.config.ts
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __ENVIRONMENT__: JSON.stringify(process.env.NODE_ENV),
  },
});
```

---

## 1.3 Consent Store Implementation

### Datei erstellen

```bash
mkdir -p src/lib/IONOS/analytics
touch src/lib/IONOS/analytics/consent.store.ts
```

### Implementation

```typescript
// src/lib/IONOS/analytics/consent.store.ts

import { writable, derived, get } from 'svelte/store';

export type ConsentCategory = 'essential' | 'analytics' | 'marketing';

export interface ConsentState {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: string | null;
  version: string;
}

const STORAGE_KEY = 'ionos_gpt_analytics_consent';
const CONSENT_VERSION = '1.0';

function createConsentStore() {
  const initialState: ConsentState = {
    essential: true,
    analytics: false,
    marketing: false,
    timestamp: null,
    version: CONSENT_VERSION,
  };

  const stored = loadFromStorage();
  const { subscribe, set, update } = writable<ConsentState>(stored || initialState);

  return {
    subscribe,

    hasConsent(category: ConsentCategory): boolean {
      return get({ subscribe })[category] === true;
    },

    acceptAll(): void {
      const newState: ConsentState = {
        essential: true,
        analytics: true,
        marketing: true,
        timestamp: new Date().toISOString(),
        version: CONSENT_VERSION,
      };
      set(newState);
      saveToStorage(newState);
    },

    acceptEssentialOnly(): void {
      const newState: ConsentState = {
        essential: true,
        analytics: false,
        marketing: false,
        timestamp: new Date().toISOString(),
        version: CONSENT_VERSION,
      };
      set(newState);
      saveToStorage(newState);
    },

    setCategory(category: ConsentCategory, value: boolean): void {
      update(state => {
        const newState = {
          ...state,
          [category]: category === 'essential' ? true : value,
          timestamp: new Date().toISOString(),
        };
        saveToStorage(newState);
        return newState;
      });
    },

    hasDecided(): boolean {
      return get({ subscribe }).timestamp !== null;
    },

    reset(): void {
      set(initialState);
      localStorage.removeItem(STORAGE_KEY);
    },
  };
}

function loadFromStorage(): ConsentState | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.version !== CONSENT_VERSION) {
        return null;
      }
      return parsed;
    }
  } catch {
    // Invalid storage
  }
  return null;
}

function saveToStorage(state: ConsentState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage not available
  }
}

export const consentStore = createConsentStore();

export const showConsentBanner = derived(
  consentStore,
  $consent => $consent.timestamp === null
);
```

---

## 1.4 Consent Banner UI

### Datei erstellen

```bash
touch src/lib/IONOS/analytics/components/ConsentBanner.svelte
```

### Implementation

```svelte
<!-- src/lib/IONOS/analytics/components/ConsentBanner.svelte -->
<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { consentStore, showConsentBanner } from '../consent.store';
  import { t } from '$lib/i18n';

  let showDetails = false;
  let analyticsConsent = false;

  function acceptAll() {
    consentStore.acceptAll();
  }

  function acceptEssentialOnly() {
    consentStore.acceptEssentialOnly();
  }

  function savePreferences() {
    consentStore.setCategory('analytics', analyticsConsent);
  }
</script>

{#if $showConsentBanner}
  <div
    class="fixed inset-0 z-[9999] bg-black/50 flex items-end sm:items-center justify-center p-4"
    transition:fade={{ duration: 200 }}
    role="dialog"
    aria-modal="true"
    aria-labelledby="consent-title"
  >
    <div
      class="bg-white dark:bg-gray-800 w-full sm:max-w-lg rounded-xl shadow-2xl p-6"
      transition:fly={{ y: 100, duration: 300 }}
    >
      <div class="flex items-center gap-3 mb-4">
        <span class="text-2xl" aria-hidden="true">🔒</span>
        <h2 id="consent-title" class="text-xl font-semibold text-gray-900 dark:text-white">
          {$t('consent.title') || 'Datenschutz-Einstellungen'}
        </h2>
      </div>

      <p class="text-gray-600 dark:text-gray-300 mb-6 text-sm">
        {$t('consent.description') || 'Wir verwenden Analytics, um IONOS GPT zu verbessern. Ihre Daten bleiben in Deutschland.'}
      </p>

      <div class="space-y-3 mb-6">
        <div class="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <div>
            <div class="font-medium text-gray-900 dark:text-white text-sm">
              {$t('consent.essential.title') || 'Notwendig'}
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400">
              {$t('consent.essential.description') || 'Session, Authentifizierung'}
            </div>
          </div>
          <span class="text-green-600 dark:text-green-400 font-medium text-xs">
            {$t('consent.always_active') || 'Immer aktiv'}
          </span>
        </div>

        <div class="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <div>
            <div class="font-medium text-gray-900 dark:text-white text-sm">
              {$t('consent.analytics.title') || 'Analyse'}
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400">
              {$t('consent.analytics.description') || 'Nutzungsstatistiken, Performance'}
            </div>
          </div>
          {#if showDetails}
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" bind:checked={analyticsConsent} class="sr-only peer" />
              <div class="w-11 h-6 bg-gray-300 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          {/if}
        </div>
      </div>

      <div class="flex flex-col sm:flex-row gap-3">
        <button
          on:click={acceptAll}
          class="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm"
        >
          {$t('consent.accept_all') || 'Alle akzeptieren'}
        </button>

        <button
          on:click={acceptEssentialOnly}
          class="flex-1 px-4 py-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition-colors text-sm"
        >
          {$t('consent.essential_only') || 'Nur notwendige'}
        </button>

        {#if showDetails}
          <button
            on:click={savePreferences}
            class="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
          >
            {$t('consent.save') || 'Speichern'}
          </button>
        {:else}
          <button
            on:click={() => showDetails = true}
            class="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
          >
            {$t('consent.settings') || 'Einstellungen'}
          </button>
        {/if}
      </div>

      <div class="mt-4 text-center">
        <a
          href="https://www.ionos.de/terms-gtc/datenschutzerklaerung/"
          target="_blank"
          rel="noopener noreferrer"
          class="text-xs text-blue-600 dark:text-blue-400 hover:underline"
        >
          {$t('consent.privacy_link') || 'Datenschutzerklärung'}
        </a>
      </div>
    </div>
  </div>
{/if}
```

---

## 1.5 Analytics Service Core

### Dateien erstellen

```bash
touch src/lib/IONOS/analytics/analytics.service.ts
touch src/lib/IONOS/analytics/event-queue.ts
touch src/lib/IONOS/analytics/index.ts
```

### Analytics Service

```typescript
// src/lib/IONOS/analytics/analytics.service.ts

import { get } from 'svelte/store';
import { consentStore, type ConsentCategory } from './consent.store';
import { eventQueue } from './event-queue';
import type { AnalyticsProvider, ProviderConfig } from './providers/types';
import type { AnalyticsEvent } from './events/types';

class AnalyticsService {
  private provider: AnalyticsProvider | null = null;
  private initialized = false;
  private userId: string | null = null;
  private userProperties: Record<string, unknown> = {};

  async init(provider: AnalyticsProvider, config: ProviderConfig): Promise<void> {
    try {
      this.provider = provider;
      await this.provider.init(config);
      this.initialized = true;

      // Flush queued events
      if (this.canTrack('analytics')) {
        await eventQueue.flush(this.provider);
      }
    } catch (error) {
      console.error('[Analytics] Initialization failed:', error);
    }
  }

  identify(userId: string, properties?: Record<string, unknown>): void {
    if (!this.canTrack('analytics')) return;

    this.userId = userId;
    this.userProperties = properties || {};
    this.provider?.identify(userId, this.enrichProperties(properties || {}));
  }

  track<T extends AnalyticsEvent>(event: T): void {
    if (!this.canTrack('analytics')) return;

    const enrichedEvent = {
      ...event,
      properties: this.enrichProperties(event.properties),
      timestamp: new Date().toISOString(),
    };

    if (this.initialized && this.provider) {
      this.provider.track(event.event, enrichedEvent.properties);
    } else {
      eventQueue.enqueue(enrichedEvent);
    }
  }

  page(name: string, properties?: Record<string, unknown>): void {
    if (!this.canTrack('analytics')) return;

    this.provider?.page(name, this.enrichProperties(properties || {}));
  }

  reset(): void {
    this.userId = null;
    this.userProperties = {};
    this.provider?.reset();
  }

  isReady(): boolean {
    return this.initialized && !!this.provider?.isReady();
  }

  private canTrack(category: ConsentCategory): boolean {
    const consent = get(consentStore);
    return consent[category] === true;
  }

  private enrichProperties(properties: Record<string, unknown>): Record<string, unknown> {
    return {
      ...properties,
      session_id: this.getSessionId(),
      user_id: this.userId,
      is_identified: !!this.userId,
      timestamp: new Date().toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      local_hour: new Date().getHours(),
      device_type: this.getDeviceType(),
      viewport_width: typeof window !== 'undefined' ? window.innerWidth : 0,
      viewport_height: typeof window !== 'undefined' ? window.innerHeight : 0,
      app_version: typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'unknown',
      environment: typeof __ENVIRONMENT__ !== 'undefined' ? __ENVIRONMENT__ : 'unknown',
      current_url: typeof window !== 'undefined' ? window.location.pathname : '',
      is_pwa: this.isPWA(),
    };
  }

  private getSessionId(): string {
    if (typeof sessionStorage === 'undefined') return 'unknown';

    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  private getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    if (typeof window === 'undefined') return 'desktop';
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  private isPWA(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  }
}

export const analytics = new AnalyticsService();
```

---

## 1.6 Provider Abstraction

### Dateien erstellen

```bash
mkdir -p src/lib/IONOS/analytics/providers
touch src/lib/IONOS/analytics/providers/types.ts
touch src/lib/IONOS/analytics/providers/posthog.provider.ts
touch src/lib/IONOS/analytics/providers/noop.provider.ts
touch src/lib/IONOS/analytics/providers/index.ts
```

Siehe [PROVIDER_ABSTRACTION.md](../architecture/PROVIDER_ABSTRACTION.md) für vollständige Implementierung.

---

## 1.7 Core Events Implementation

### Session Started Event

```typescript
// In +layout.svelte oder hooks.client.ts
import { analytics } from '$lib/IONOS/analytics';
import { browser } from '$app/environment';

if (browser) {
  analytics.track({
    event: 'session_started',
    properties: {
      entry_type: document.referrer ? 'referral' : 'direct',
      referrer_domain: document.referrer ? new URL(document.referrer).hostname : null,
      landing_page: window.location.pathname,
      is_authenticated: false, // Update after auth check
      is_returning_user: localStorage.getItem('has_visited') === 'true',
    }
  });

  localStorage.setItem('has_visited', 'true');
}
```

---

## 1.8 Integration & Testing

### ConsentBanner in Layout einbinden

```svelte
<!-- src/routes/+layout.svelte -->
<script>
  import ConsentBanner from '$lib/IONOS/analytics/components/ConsentBanner.svelte';
</script>

<ConsentBanner />
<slot />
```

### Testing

```typescript
// consent.store.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { consentStore } from './consent.store';

describe('ConsentStore', () => {
  beforeEach(() => {
    localStorage.clear();
    consentStore.reset();
  });

  it('should start with no consent decided', () => {
    expect(consentStore.hasDecided()).toBe(false);
  });

  it('should accept all categories', () => {
    consentStore.acceptAll();
    expect(consentStore.hasConsent('analytics')).toBe(true);
    expect(consentStore.hasDecided()).toBe(true);
  });

  it('should accept essential only', () => {
    consentStore.acceptEssentialOnly();
    expect(consentStore.hasConsent('essential')).toBe(true);
    expect(consentStore.hasConsent('analytics')).toBe(false);
  });
});
```

---

## Checkliste Phase 1

- [ ] PostHog auf IONOS Cloud deployed
- [ ] Environment Variables konfiguriert
- [ ] `consent.store.ts` erstellt
- [ ] `ConsentBanner.svelte` erstellt
- [ ] `analytics.service.ts` erstellt
- [ ] Provider-Abstraction implementiert
- [ ] PostHog Provider implementiert
- [ ] NoOp Provider implementiert
- [ ] ConsentBanner in Layout eingebunden
- [ ] `session_started` Event implementiert
- [ ] `page_viewed` Event implementiert
- [ ] Unit Tests geschrieben
- [ ] E2E Test für Consent Flow
- [ ] Keine Events vor Consent (verifiziert)
- [ ] PostHog Dashboard zeigt Events

---

## Nächste Phase

Weiter zu [Phase 2: Chat Tracking](./PHASE_2_CHAT.md)
