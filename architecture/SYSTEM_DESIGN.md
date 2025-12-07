![Momentum Team](../assets/MomentumTeam-hor.png)

# System Design

> **Analytics Documentation** · Version 1.0 · Last updated: 2024-12-06

Analytics system architecture and modular design documentation.

---

## Component Overview

### Frontend-Module

```
src/lib/IONOS/analytics/
├── index.ts                    # Public API exports
├── analytics.service.ts        # Core Analytics Service
├── consent.store.ts            # Consent State Management
├── event-queue.ts              # Offline Event Queue
├── events.ts                   # Event Type Definitions
├── constants.ts                # Configuration Constants
├── providers/
│   ├── index.ts                # Provider exports
│   ├── types.ts                # Provider Interface
│   ├── posthog.provider.ts     # PostHog Implementation
│   ├── plausible.provider.ts   # Plausible Implementation
│   └── noop.provider.ts        # No-Op for Testing/Opt-Out
├── hooks/
│   ├── useAnalytics.ts         # Analytics Hook
│   └── useConsent.ts           # Consent Hook
└── components/
    └── ConsentBanner.svelte    # GDPR Consent UI
```

---

## Analytics Service

### Klassen-Design

```typescript
// src/lib/IONOS/analytics/analytics.service.ts

import { get } from 'svelte/store';
import { consentStore, ConsentCategory } from './consent.store';
import { eventQueue } from './event-queue';
import type { AnalyticsProvider } from './providers/types';
import type { AnalyticsEvent, UserProperties } from './events';

class AnalyticsService {
  private provider: AnalyticsProvider | null = null;
  private initialized = false;
  private userId: string | null = null;

  /**
   * Initialize analytics with provider
   */
  async init(provider: AnalyticsProvider, config: ProviderConfig): Promise<void> {
    this.provider = provider;
    await this.provider.init(config);
    this.initialized = true;

    // Flush queued events
    await eventQueue.flush(this.provider);
  }

  /**
   * Identify user (pseudonymized)
   */
  identify(userId: string, properties?: UserProperties): void {
    if (!this.canTrack('analytics')) return;

    this.userId = userId;
    this.provider?.identify(userId, this.enrichProperties(properties || {}));
  }

  /**
   * Track an event
   */
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

  /**
   * Track page view
   */
  page(name: string, properties?: Record<string, unknown>): void {
    if (!this.canTrack('analytics')) return;

    this.provider?.page(name, this.enrichProperties(properties || {}));
  }

  /**
   * Reset user identity (on logout)
   */
  reset(): void {
    this.userId = null;
    this.provider?.reset();
  }

  /**
   * Check if tracking is allowed
   */
  private canTrack(category: ConsentCategory): boolean {
    const consent = get(consentStore);
    return consent[category] === true;
  }

  /**
   * Enrich event properties with context
   */
  private enrichProperties(properties: Record<string, unknown>): Record<string, unknown> {
    return {
      ...properties,
      // Session context
      session_id: this.getSessionId(),
      // App context
      app_version: __APP_VERSION__,
      environment: __ENVIRONMENT__,
      // User context (if identified)
      ...(this.userId && { user_id: this.userId }),
      // Device context
      device_type: this.getDeviceType(),
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight,
    };
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  private getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }
}

export const analytics = new AnalyticsService();
```

---

## Event Queue (Offline Support)

### Design

```typescript
// src/lib/IONOS/analytics/event-queue.ts

import type { AnalyticsProvider } from './providers/types';
import type { AnalyticsEvent } from './events';

const STORAGE_KEY = 'analytics_event_queue';
const MAX_QUEUE_SIZE = 100;
const FLUSH_INTERVAL = 30000; // 30 seconds

interface QueuedEvent extends AnalyticsEvent {
  timestamp: string;
  attempts: number;
}

class EventQueue {
  private queue: QueuedEvent[] = [];
  private flushTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.loadFromStorage();
    this.startFlushTimer();
  }

  /**
   * Add event to queue
   */
  enqueue(event: AnalyticsEvent & { timestamp: string }): void {
    const queuedEvent: QueuedEvent = {
      ...event,
      attempts: 0,
    };

    this.queue.push(queuedEvent);

    // Trim queue if too large
    if (this.queue.length > MAX_QUEUE_SIZE) {
      this.queue = this.queue.slice(-MAX_QUEUE_SIZE);
    }

    this.saveToStorage();
  }

  /**
   * Flush queue to provider
   */
  async flush(provider: AnalyticsProvider): Promise<void> {
    if (this.queue.length === 0) return;

    const eventsToSend = [...this.queue];
    this.queue = [];

    for (const event of eventsToSend) {
      try {
        await provider.track(event.event, event.properties);
      } catch (error) {
        // Re-queue failed events (max 3 attempts)
        if (event.attempts < 3) {
          this.queue.push({ ...event, attempts: event.attempts + 1 });
        }
      }
    }

    this.saveToStorage();
  }

  /**
   * Get queue size
   */
  get size(): number {
    return this.queue.length;
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch {
      this.queue = [];
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.queue));
    } catch {
      // Storage full - clear old events
      this.queue = this.queue.slice(-10);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.queue));
    }
  }

  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      // Flush will be called by analytics service when provider is available
    }, FLUSH_INTERVAL);
  }

  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
  }
}

export const eventQueue = new EventQueue();
```

---

## Consent Store

### Design

```typescript
// src/lib/IONOS/analytics/consent.store.ts

import { writable, derived, get } from 'svelte/store';

export type ConsentCategory = 'essential' | 'analytics' | 'marketing';

export interface ConsentState {
  essential: boolean;  // Always true, required for app
  analytics: boolean;  // User tracking, feature usage
  marketing: boolean;  // Future: marketing pixels
  timestamp: string | null;
  version: string;
}

const STORAGE_KEY = 'analytics_consent';
const CONSENT_VERSION = '1.0';

function createConsentStore() {
  const initialState: ConsentState = {
    essential: true,
    analytics: false,
    marketing: false,
    timestamp: null,
    version: CONSENT_VERSION,
  };

  // Load from localStorage
  const stored = loadFromStorage();
  const { subscribe, set, update } = writable<ConsentState>(stored || initialState);

  return {
    subscribe,

    /**
     * Check if consent was given for category
     */
    hasConsent(category: ConsentCategory): boolean {
      return get({ subscribe })[category] === true;
    },

    /**
     * Accept all consent categories
     */
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

    /**
     * Accept only essential (reject analytics)
     */
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

    /**
     * Update specific category
     */
    setCategory(category: ConsentCategory, value: boolean): void {
      update(state => {
        const newState = {
          ...state,
          [category]: category === 'essential' ? true : value, // Essential always true
          timestamp: new Date().toISOString(),
        };
        saveToStorage(newState);
        return newState;
      });
    },

    /**
     * Check if consent decision was made
     */
    hasDecided(): boolean {
      return get({ subscribe }).timestamp !== null;
    },

    /**
     * Reset consent (for testing/debugging)
     */
    reset(): void {
      set(initialState);
      localStorage.removeItem(STORAGE_KEY);
    },
  };
}

function loadFromStorage(): ConsentState | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Check version - if outdated, require new consent
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
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage not available
  }
}

export const consentStore = createConsentStore();

// Derived store: should show banner?
export const showConsentBanner = derived(
  consentStore,
  $consent => $consent.timestamp === null
);
```

---

## Provider Interface

### Type Definitions

```typescript
// src/lib/IONOS/analytics/providers/types.ts

export interface ProviderConfig {
  apiKey?: string;
  apiHost?: string;
  debug?: boolean;
  autocapture?: boolean;
  persistence?: 'localStorage' | 'sessionStorage' | 'memory';
}

export interface AnalyticsProvider {
  /**
   * Provider name for debugging
   */
  readonly name: string;

  /**
   * Initialize provider with config
   */
  init(config: ProviderConfig): Promise<void>;

  /**
   * Identify user
   */
  identify(userId: string, properties: Record<string, unknown>): void;

  /**
   * Track event
   */
  track(event: string, properties: Record<string, unknown>): void;

  /**
   * Track page view
   */
  page(name: string, properties: Record<string, unknown>): void;

  /**
   * Reset user identity
   */
  reset(): void;

  /**
   * Check if provider is ready
   */
  isReady(): boolean;

  /**
   * Shutdown provider
   */
  shutdown(): void;
}
```

### PostHog Provider

```typescript
// src/lib/IONOS/analytics/providers/posthog.provider.ts

import posthog from 'posthog-js';
import type { AnalyticsProvider, ProviderConfig } from './types';

export class PostHogProvider implements AnalyticsProvider {
  readonly name = 'posthog';
  private ready = false;

  async init(config: ProviderConfig): Promise<void> {
    if (!config.apiKey || !config.apiHost) {
      throw new Error('PostHog requires apiKey and apiHost');
    }

    posthog.init(config.apiKey, {
      api_host: config.apiHost,
      autocapture: config.autocapture ?? false,
      capture_pageview: false, // Manual page tracking
      capture_pageleave: true,
      persistence: config.persistence ?? 'localStorage',
      disable_session_recording: true, // Enable separately if needed
      loaded: () => {
        this.ready = true;
      },
    });

    // Wait for initialization
    await new Promise<void>(resolve => {
      const check = () => {
        if (this.ready) {
          resolve();
        } else {
          setTimeout(check, 100);
        }
      };
      check();
    });
  }

  identify(userId: string, properties: Record<string, unknown>): void {
    posthog.identify(userId, properties);
  }

  track(event: string, properties: Record<string, unknown>): void {
    posthog.capture(event, properties);
  }

  page(name: string, properties: Record<string, unknown>): void {
    posthog.capture('$pageview', {
      ...properties,
      $current_url: window.location.href,
      page_name: name,
    });
  }

  reset(): void {
    posthog.reset();
  }

  isReady(): boolean {
    return this.ready;
  }

  shutdown(): void {
    posthog.opt_out_capturing();
  }
}
```

### NoOp Provider (for Testing/Opt-Out)

```typescript
// src/lib/IONOS/analytics/providers/noop.provider.ts

import type { AnalyticsProvider, ProviderConfig } from './types';

export class NoOpProvider implements AnalyticsProvider {
  readonly name = 'noop';

  async init(_config: ProviderConfig): Promise<void> {
    // No-op
  }

  identify(_userId: string, _properties: Record<string, unknown>): void {
    // No-op
  }

  track(_event: string, _properties: Record<string, unknown>): void {
    // No-op - optionally log to console in dev
    if (import.meta.env.DEV) {
      console.log('[Analytics NoOp]', _event, _properties);
    }
  }

  page(_name: string, _properties: Record<string, unknown>): void {
    // No-op
  }

  reset(): void {
    // No-op
  }

  isReady(): boolean {
    return true;
  }

  shutdown(): void {
    // No-op
  }
}
```

---

## Svelte Integration

### Analytics Hook

```typescript
// src/lib/IONOS/analytics/hooks/useAnalytics.ts

import { analytics } from '../analytics.service';
import type { AnalyticsEvent } from '../events';

export function useAnalytics() {
  return {
    track: <T extends AnalyticsEvent>(event: T) => analytics.track(event),
    page: (name: string, properties?: Record<string, unknown>) =>
      analytics.page(name, properties),
    identify: (userId: string, properties?: Record<string, unknown>) =>
      analytics.identify(userId, properties),
  };
}
```

### Consent Hook

```typescript
// src/lib/IONOS/analytics/hooks/useConsent.ts

import { consentStore, showConsentBanner, type ConsentCategory } from '../consent.store';

export function useConsent() {
  return {
    store: consentStore,
    showBanner: showConsentBanner,
    acceptAll: () => consentStore.acceptAll(),
    acceptEssentialOnly: () => consentStore.acceptEssentialOnly(),
    setCategory: (category: ConsentCategory, value: boolean) =>
      consentStore.setCategory(category, value),
    hasConsent: (category: ConsentCategory) => consentStore.hasConsent(category),
    hasDecided: () => consentStore.hasDecided(),
  };
}
```

---

## Backend Integration

### FastAPI Middleware

```python
# backend/open_webui/middleware/analytics.py

import time
from typing import Callable
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from posthog import Posthog

posthog = Posthog(
    api_key='your-api-key',
    host='https://analytics.ionos-gpt.de'
)

class AnalyticsMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        start_time = time.time()

        # Get user ID from auth (pseudonymized)
        user_id = getattr(request.state, 'pseudonymized_user_id', None)

        # Process request
        response = await call_next(request)

        # Calculate duration
        duration_ms = (time.time() - start_time) * 1000

        # Track API request (only if user consented - checked via header)
        if request.headers.get('X-Analytics-Consent') == 'true' and user_id:
            posthog.capture(
                distinct_id=user_id,
                event='api_request',
                properties={
                    'endpoint': request.url.path,
                    'method': request.method,
                    'status_code': response.status_code,
                    'duration_ms': duration_ms,
                }
            )

        return response
```

---

## Initialisierung

### App Startup

```typescript
// src/routes/+layout.svelte (oder src/hooks.client.ts)

import { analytics } from '$lib/IONOS/analytics';
import { PostHogProvider } from '$lib/IONOS/analytics/providers/posthog.provider';
import { NoOpProvider } from '$lib/IONOS/analytics/providers/noop.provider';
import { consentStore } from '$lib/IONOS/analytics/consent.store';
import { user } from '$lib/stores';

// Initialize analytics on app start
async function initAnalytics() {
  const provider = import.meta.env.VITE_ANALYTICS_ENABLED === 'true'
    ? new PostHogProvider()
    : new NoOpProvider();

  await analytics.init(provider, {
    apiKey: import.meta.env.VITE_POSTHOG_API_KEY,
    apiHost: import.meta.env.VITE_POSTHOG_HOST,
    autocapture: false,
  });

  // Identify user when logged in
  user.subscribe($user => {
    if ($user?.pseudonymized_user_id) {
      analytics.identify($user.pseudonymized_user_id, {
        created_at: $user.created_at,
      });
    }
  });
}

initAnalytics();
```
