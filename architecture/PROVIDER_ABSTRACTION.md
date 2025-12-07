![Momentum Team](../assets/MomentumTeam-hor.png)

# Provider Abstraction

> **Analytics Documentation** · Version 1.0 · Last updated: 2024-12-06

Exchangeable analytics providers with unified interface.

---

## Overview

The provider abstraction pattern enables:
- Easy switching between analytics providers
- Testability through mock providers
- Graceful degradation on failures
- A/B testing of different providers

---

## Interface Definition

```typescript
// src/lib/IONOS/analytics/providers/types.ts

/**
 * Configuration for analytics providers
 */
export interface ProviderConfig {
  /** API key for authentication */
  apiKey?: string;

  /** API host URL */
  apiHost?: string;

  /** Enable debug logging */
  debug?: boolean;

  /** Auto-capture clicks, pageviews, etc. */
  autocapture?: boolean;

  /** Storage method for persistence */
  persistence?: 'localStorage' | 'sessionStorage' | 'memory';

  /** Custom options per provider */
  options?: Record<string, unknown>;
}

/**
 * Analytics provider interface
 * All providers must implement this interface
 */
export interface AnalyticsProvider {
  /**
   * Provider identifier
   */
  readonly name: string;

  /**
   * Initialize the provider
   * @param config Provider configuration
   */
  init(config: ProviderConfig): Promise<void>;

  /**
   * Identify a user
   * @param userId Unique user identifier (pseudonymized)
   * @param properties User properties
   */
  identify(userId: string, properties: Record<string, unknown>): void;

  /**
   * Track an event
   * @param event Event name
   * @param properties Event properties
   */
  track(event: string, properties: Record<string, unknown>): void;

  /**
   * Track a page view
   * @param name Page name
   * @param properties Page properties
   */
  page(name: string, properties: Record<string, unknown>): void;

  /**
   * Reset user identity (logout)
   */
  reset(): void;

  /**
   * Check if provider is initialized and ready
   */
  isReady(): boolean;

  /**
   * Gracefully shutdown the provider
   */
  shutdown(): void;

  /**
   * Optional: Set user properties without tracking
   */
  setUserProperties?(properties: Record<string, unknown>): void;

  /**
   * Optional: Create an alias for user
   */
  alias?(newId: string, originalId: string): void;

  /**
   * Optional: Opt user out of tracking
   */
  optOut?(): void;

  /**
   * Optional: Opt user back into tracking
   */
  optIn?(): void;
}
```

---

## Provider Implementierungen

### 1. PostHog Provider (Empfohlen)

```typescript
// src/lib/IONOS/analytics/providers/posthog.provider.ts

import posthog from 'posthog-js';
import type { AnalyticsProvider, ProviderConfig } from './types';

export class PostHogProvider implements AnalyticsProvider {
  readonly name = 'posthog';
  private ready = false;

  async init(config: ProviderConfig): Promise<void> {
    if (!config.apiKey) {
      throw new Error('PostHog requires an API key');
    }

    return new Promise((resolve, reject) => {
      try {
        posthog.init(config.apiKey!, {
          api_host: config.apiHost || 'https://eu.posthog.com',
          autocapture: config.autocapture ?? false,
          capture_pageview: false,
          capture_pageleave: true,
          persistence: config.persistence ?? 'localStorage',
          disable_session_recording: true,
          bootstrap: {
            distinctID: undefined, // Will be set on identify
          },
          loaded: (ph) => {
            this.ready = true;
            if (config.debug) {
              ph.debug();
            }
            resolve();
          },
          ...config.options,
        });

        // Timeout after 5 seconds
        setTimeout(() => {
          if (!this.ready) {
            reject(new Error('PostHog initialization timeout'));
          }
        }, 5000);
      } catch (error) {
        reject(error);
      }
    });
  }

  identify(userId: string, properties: Record<string, unknown>): void {
    if (!this.ready) return;
    posthog.identify(userId, properties);
  }

  track(event: string, properties: Record<string, unknown>): void {
    if (!this.ready) return;
    posthog.capture(event, properties);
  }

  page(name: string, properties: Record<string, unknown>): void {
    if (!this.ready) return;
    posthog.capture('$pageview', {
      ...properties,
      $current_url: window.location.href,
      page_name: name,
    });
  }

  reset(): void {
    if (!this.ready) return;
    posthog.reset();
  }

  isReady(): boolean {
    return this.ready;
  }

  shutdown(): void {
    posthog.opt_out_capturing();
    this.ready = false;
  }

  // Optional methods
  setUserProperties(properties: Record<string, unknown>): void {
    if (!this.ready) return;
    posthog.people.set(properties);
  }

  alias(newId: string, originalId: string): void {
    if (!this.ready) return;
    posthog.alias(newId, originalId);
  }

  optOut(): void {
    posthog.opt_out_capturing();
  }

  optIn(): void {
    posthog.opt_in_capturing();
  }
}
```

### 2. Plausible Provider (Alternative)

```typescript
// src/lib/IONOS/analytics/providers/plausible.provider.ts

import type { AnalyticsProvider, ProviderConfig } from './types';

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, unknown> }) => void;
  }
}

export class PlausibleProvider implements AnalyticsProvider {
  readonly name = 'plausible';
  private ready = false;
  private domain: string = '';

  async init(config: ProviderConfig): Promise<void> {
    this.domain = config.options?.domain as string || window.location.hostname;

    return new Promise((resolve, reject) => {
      try {
        // Load Plausible script
        const script = document.createElement('script');
        script.defer = true;
        script.dataset.domain = this.domain;
        script.src = config.apiHost || 'https://plausible.io/js/script.js';

        script.onload = () => {
          this.ready = true;
          resolve();
        };

        script.onerror = () => {
          reject(new Error('Failed to load Plausible script'));
        };

        document.head.appendChild(script);

        // Timeout
        setTimeout(() => {
          if (!this.ready) {
            reject(new Error('Plausible initialization timeout'));
          }
        }, 5000);
      } catch (error) {
        reject(error);
      }
    });
  }

  identify(_userId: string, _properties: Record<string, unknown>): void {
    // Plausible doesn't support user identification (privacy-first)
    // User properties are sent as event props instead
  }

  track(event: string, properties: Record<string, unknown>): void {
    if (!this.ready || !window.plausible) return;

    // Plausible has limited custom properties
    // Only strings allowed, max 30 props
    const sanitizedProps: Record<string, string> = {};
    Object.entries(properties).slice(0, 30).forEach(([key, value]) => {
      sanitizedProps[key] = String(value);
    });

    window.plausible(event, { props: sanitizedProps });
  }

  page(name: string, properties: Record<string, unknown>): void {
    // Plausible auto-tracks pageviews
    // Only track if custom page name needed
    if (name !== window.location.pathname) {
      this.track('pageview', { ...properties, page: name });
    }
  }

  reset(): void {
    // No session to reset in Plausible
  }

  isReady(): boolean {
    return this.ready;
  }

  shutdown(): void {
    this.ready = false;
  }
}
```

### 3. Matomo Provider (Alternative)

```typescript
// src/lib/IONOS/analytics/providers/matomo.provider.ts

import type { AnalyticsProvider, ProviderConfig } from './types';

declare global {
  interface Window {
    _paq?: unknown[][];
  }
}

export class MatomoProvider implements AnalyticsProvider {
  readonly name = 'matomo';
  private ready = false;

  async init(config: ProviderConfig): Promise<void> {
    if (!config.apiHost) {
      throw new Error('Matomo requires apiHost');
    }

    return new Promise((resolve, reject) => {
      try {
        window._paq = window._paq || [];

        // Configure Matomo
        window._paq.push(['setTrackerUrl', `${config.apiHost}/matomo.php`]);
        window._paq.push(['setSiteId', config.options?.siteId || '1']);

        // Disable cookies if needed
        if (config.persistence === 'memory') {
          window._paq.push(['disableCookies']);
        }

        // Load script
        const script = document.createElement('script');
        script.async = true;
        script.src = `${config.apiHost}/matomo.js`;

        script.onload = () => {
          this.ready = true;
          resolve();
        };

        script.onerror = () => {
          reject(new Error('Failed to load Matomo script'));
        };

        document.head.appendChild(script);

        setTimeout(() => {
          if (!this.ready) {
            reject(new Error('Matomo initialization timeout'));
          }
        }, 5000);
      } catch (error) {
        reject(error);
      }
    });
  }

  identify(userId: string, _properties: Record<string, unknown>): void {
    if (!this.ready || !window._paq) return;
    window._paq.push(['setUserId', userId]);
  }

  track(event: string, properties: Record<string, unknown>): void {
    if (!this.ready || !window._paq) return;

    // Matomo custom events: category, action, name, value
    window._paq.push([
      'trackEvent',
      properties.category || 'app',
      event,
      properties.label || '',
      properties.value || 0,
    ]);
  }

  page(name: string, properties: Record<string, unknown>): void {
    if (!this.ready || !window._paq) return;

    window._paq.push(['setCustomUrl', window.location.href]);
    window._paq.push(['setDocumentTitle', name]);

    // Custom dimensions
    if (properties.device_type) {
      window._paq.push(['setCustomDimension', 1, properties.device_type]);
    }

    window._paq.push(['trackPageView']);
  }

  reset(): void {
    if (!this.ready || !window._paq) return;
    window._paq.push(['resetUserId']);
  }

  isReady(): boolean {
    return this.ready;
  }

  shutdown(): void {
    this.ready = false;
  }
}
```

### 4. NoOp Provider (Testing/Opt-Out)

```typescript
// src/lib/IONOS/analytics/providers/noop.provider.ts

import type { AnalyticsProvider, ProviderConfig } from './types';

export class NoOpProvider implements AnalyticsProvider {
  readonly name = 'noop';
  private debugMode = false;

  async init(config: ProviderConfig): Promise<void> {
    this.debugMode = config.debug ?? false;
    if (this.debugMode) {
      console.log('[Analytics NoOp] Initialized');
    }
  }

  identify(userId: string, properties: Record<string, unknown>): void {
    if (this.debugMode) {
      console.log('[Analytics NoOp] identify:', userId, properties);
    }
  }

  track(event: string, properties: Record<string, unknown>): void {
    if (this.debugMode) {
      console.log('[Analytics NoOp] track:', event, properties);
    }
  }

  page(name: string, properties: Record<string, unknown>): void {
    if (this.debugMode) {
      console.log('[Analytics NoOp] page:', name, properties);
    }
  }

  reset(): void {
    if (this.debugMode) {
      console.log('[Analytics NoOp] reset');
    }
  }

  isReady(): boolean {
    return true;
  }

  shutdown(): void {
    if (this.debugMode) {
      console.log('[Analytics NoOp] shutdown');
    }
  }
}
```

### 5. Console Provider (Development)

```typescript
// src/lib/IONOS/analytics/providers/console.provider.ts

import type { AnalyticsProvider, ProviderConfig } from './types';

export class ConsoleProvider implements AnalyticsProvider {
  readonly name = 'console';
  private userId: string | null = null;

  async init(_config: ProviderConfig): Promise<void> {
    console.group('🔍 Analytics Initialized');
    console.log('Provider: Console (Development)');
    console.groupEnd();
  }

  identify(userId: string, properties: Record<string, unknown>): void {
    this.userId = userId;
    console.group('🔍 Analytics: identify');
    console.log('User ID:', userId);
    console.table(properties);
    console.groupEnd();
  }

  track(event: string, properties: Record<string, unknown>): void {
    console.group(`🔍 Analytics: ${event}`);
    console.log('Event:', event);
    console.log('User:', this.userId);
    console.table(properties);
    console.groupEnd();
  }

  page(name: string, properties: Record<string, unknown>): void {
    console.group('🔍 Analytics: pageview');
    console.log('Page:', name);
    console.table(properties);
    console.groupEnd();
  }

  reset(): void {
    this.userId = null;
    console.log('🔍 Analytics: reset');
  }

  isReady(): boolean {
    return true;
  }

  shutdown(): void {
    console.log('🔍 Analytics: shutdown');
  }
}
```

---

## Provider Factory

```typescript
// src/lib/IONOS/analytics/providers/index.ts

import type { AnalyticsProvider, ProviderConfig } from './types';
import { PostHogProvider } from './posthog.provider';
import { PlausibleProvider } from './plausible.provider';
import { MatomoProvider } from './matomo.provider';
import { NoOpProvider } from './noop.provider';
import { ConsoleProvider } from './console.provider';

export type ProviderType = 'posthog' | 'plausible' | 'matomo' | 'noop' | 'console';

/**
 * Create analytics provider instance
 */
export function createProvider(type: ProviderType): AnalyticsProvider {
  switch (type) {
    case 'posthog':
      return new PostHogProvider();
    case 'plausible':
      return new PlausibleProvider();
    case 'matomo':
      return new MatomoProvider();
    case 'console':
      return new ConsoleProvider();
    case 'noop':
    default:
      return new NoOpProvider();
  }
}

/**
 * Get provider based on environment
 */
export function getDefaultProvider(): AnalyticsProvider {
  const env = import.meta.env;

  // Development: Console or NoOp
  if (env.DEV) {
    return env.VITE_ANALYTICS_DEBUG === 'true'
      ? new ConsoleProvider()
      : new NoOpProvider();
  }

  // Production: PostHog
  if (env.VITE_POSTHOG_API_KEY) {
    return new PostHogProvider();
  }

  // Fallback
  return new NoOpProvider();
}

export type { AnalyticsProvider, ProviderConfig };
```

---

## Provider-Wechsel zur Laufzeit

```typescript
// src/lib/IONOS/analytics/analytics.service.ts

class AnalyticsService {
  private provider: AnalyticsProvider | null = null;

  /**
   * Switch to a different provider
   * Useful for A/B testing providers or feature flags
   */
  async switchProvider(
    newProvider: AnalyticsProvider,
    config: ProviderConfig
  ): Promise<void> {
    // Shutdown old provider
    if (this.provider) {
      this.provider.shutdown();
    }

    // Initialize new provider
    this.provider = newProvider;
    await this.provider.init(config);

    // Re-identify user if we have one
    if (this.userId) {
      this.provider.identify(this.userId, this.userProperties);
    }
  }
}
```

---

## Konfiguration

### Environment Variables

```bash
# .env.production
VITE_ANALYTICS_PROVIDER=posthog
VITE_POSTHOG_API_KEY=phc_xxxxxxxxxxxxx
VITE_POSTHOG_HOST=https://analytics.ionos-gpt.de

# .env.development
VITE_ANALYTICS_PROVIDER=console
VITE_ANALYTICS_DEBUG=true

# .env.test
VITE_ANALYTICS_PROVIDER=noop
```

### App-Initialisierung

```typescript
// src/lib/IONOS/analytics/init.ts

import { analytics } from './analytics.service';
import { createProvider, type ProviderType } from './providers';

export async function initAnalytics(): Promise<void> {
  const providerType = (import.meta.env.VITE_ANALYTICS_PROVIDER || 'noop') as ProviderType;
  const provider = createProvider(providerType);

  await analytics.init(provider, {
    apiKey: import.meta.env.VITE_POSTHOG_API_KEY,
    apiHost: import.meta.env.VITE_POSTHOG_HOST,
    debug: import.meta.env.DEV,
    autocapture: false,
  });
}
```

---

## Provider-Vergleich

| Feature | PostHog | Plausible | Matomo | Console | NoOp |
|---------|---------|-----------|--------|---------|------|
| User Identification | ✅ | ❌ | ✅ | ✅ | - |
| Custom Events | ✅ | ✅ (limited) | ✅ | ✅ | - |
| Event Properties | ✅ Unlimited | ⚠️ 30 max | ✅ | ✅ | - |
| Session Recording | ✅ | ❌ | ✅ | ❌ | - |
| Feature Flags | ✅ | ❌ | ❌ | ❌ | - |
| Self-Hosted | ✅ | ✅ | ✅ | N/A | N/A |
| GDPR-Ready | ✅ | ✅ | ✅ | N/A | N/A |
| Cost | $$$ | $ | Free | Free | Free |

---

## Testing

```typescript
// analytics.service.test.ts

import { analytics } from './analytics.service';
import { NoOpProvider } from './providers/noop.provider';

describe('AnalyticsService', () => {
  beforeEach(async () => {
    // Always use NoOp in tests
    await analytics.init(new NoOpProvider(), { debug: false });
  });

  it('should track events without errors', () => {
    expect(() => {
      analytics.track({
        event: 'test_event',
        properties: { foo: 'bar' }
      });
    }).not.toThrow();
  });

  it('should identify users', () => {
    analytics.identify('user_123', { plan: 'pro' });
    // NoOp doesn't throw
  });
});
```
