![Momentum Team](../assets/MomentumTeam-hor.png)

# Consent Management

> **Analytics Documentation** · Version 1.0 · Last updated: 2024-12-06

GDPR-compliant consent system for analytics tracking.

---

## Legal Foundation

### GDPR Requirements

| Requirement | Implementation |
|-------------|----------------|----|
| **Informed Consent** | Clear description of what is tracked |
| **Voluntary** | No restrictions on rejection |
| **Revocable** | Changeable anytime in settings |
| **Documentation** | Timestamp and version stored |
| **Granularity** | Categories individually selectable |

### ePrivacy-Konformität

- Keine Cookies vor Consent
- Keine Fingerprinting-Techniken
- Transparente Datenverarbeitung

---

## Consent-Kategorien

### 1. Essential (Immer aktiv)

```typescript
essential: true // Nicht deaktivierbar
```

**Umfasst:**
- Session-Management
- Authentifizierung
- CSRF-Schutz
- Grundlegende Funktionalität

**Keine Einwilligung nötig** - Rechtliche Grundlage: Berechtigtes Interesse

### 2. Analytics (Opt-in)

```typescript
analytics: boolean // User-Entscheidung
```

**Umfasst:**
- Feature-Nutzung tracking
- Performance-Metriken
- Error-Tracking
- User Journey Analyse

**Einwilligung erforderlich** - Rechtliche Grundlage: Einwilligung (Art. 6 Abs. 1 lit. a DSGVO)

### 3. Marketing (Opt-in, Future)

```typescript
marketing: boolean // Für zukünftige Erweiterungen
```

**Umfasst (zukünftig):**
- Retargeting
- Marketing-Pixel
- Cross-Site Tracking

**Aktuell nicht implementiert**

---

## UI-Design

### Consent Banner

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  🍪 Wir respektieren Ihre Privatsphäre                                 │
│                                                                         │
│  IONOS GPT verwendet Analyse-Cookies, um die Nutzererfahrung zu        │
│  verbessern. Ihre Daten werden ausschließlich auf Servern in           │
│  Deutschland verarbeitet.                                               │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ ✓ Notwendig                                           [Aktiv]   │   │
│  │   Session-Management, Authentifizierung                         │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ ○ Analyse                                             [    ]    │   │
│  │   Nutzungsstatistiken, Feature-Tracking, Performance            │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐     │
│  │ Alle akzeptieren │  │ Nur notwendige   │  │ Einstellungen    │     │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘     │
│                                                                         │
│  Mehr erfahren: Datenschutzerklärung                                   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Settings Integration

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Einstellungen > Datenschutz                                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Datenschutz-Einstellungen                                             │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Notwendige Cookies                                    [Aktiv]   │   │
│  │ Erforderlich für die Grundfunktionalität              Immer an  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Analyse-Cookies                                       [  ○  ]   │   │
│  │ Helfen uns, IONOS GPT zu verbessern                            │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  Letzte Änderung: 06.12.2025, 14:32 Uhr                               │
│                                                                         │
│  [Alle widerrufen]                                                     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Svelte Component

### ConsentBanner.svelte

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
    class="fixed inset-0 z-[9999] bg-black/50 flex items-end sm:items-center justify-center"
    transition:fade={{ duration: 200 }}
  >
    <div
      class="bg-white dark:bg-gray-800 w-full sm:max-w-lg sm:rounded-xl shadow-2xl p-6"
      transition:fly={{ y: 100, duration: 300 }}
    >
      <!-- Header -->
      <div class="flex items-center gap-3 mb-4">
        <span class="text-2xl">🔒</span>
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
          {$t('consent.title', { default: 'Datenschutz-Einstellungen' })}
        </h2>
      </div>

      <!-- Description -->
      <p class="text-gray-600 dark:text-gray-300 mb-6">
        {$t('consent.description', {
          default: 'IONOS GPT verwendet Analyse-Tools, um die Nutzererfahrung zu verbessern. Ihre Daten werden ausschließlich auf Servern in Deutschland verarbeitet.'
        })}
      </p>

      <!-- Categories -->
      <div class="space-y-3 mb-6">
        <!-- Essential - Always on -->
        <div class="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <div>
            <div class="font-medium text-gray-900 dark:text-white">
              {$t('consent.essential.title', { default: 'Notwendig' })}
            </div>
            <div class="text-sm text-gray-500 dark:text-gray-400">
              {$t('consent.essential.description', { default: 'Session-Management, Authentifizierung' })}
            </div>
          </div>
          <span class="text-green-600 dark:text-green-400 font-medium text-sm">
            {$t('consent.always_active', { default: 'Immer aktiv' })}
          </span>
        </div>

        <!-- Analytics - Toggle -->
        <div class="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <div>
            <div class="font-medium text-gray-900 dark:text-white">
              {$t('consent.analytics.title', { default: 'Analyse' })}
            </div>
            <div class="text-sm text-gray-500 dark:text-gray-400">
              {$t('consent.analytics.description', { default: 'Nutzungsstatistiken, Performance-Monitoring' })}
            </div>
          </div>
          {#if showDetails}
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                bind:checked={analyticsConsent}
                class="sr-only peer"
              />
              <div class="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          {/if}
        </div>
      </div>

      <!-- Buttons -->
      <div class="flex flex-col sm:flex-row gap-3">
        <button
          on:click={acceptAll}
          class="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          {$t('consent.accept_all', { default: 'Alle akzeptieren' })}
        </button>

        <button
          on:click={acceptEssentialOnly}
          class="flex-1 px-4 py-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition-colors"
        >
          {$t('consent.essential_only', { default: 'Nur notwendige' })}
        </button>

        {#if showDetails}
          <button
            on:click={savePreferences}
            class="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {$t('consent.save', { default: 'Speichern' })}
          </button>
        {:else}
          <button
            on:click={() => showDetails = true}
            class="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {$t('consent.settings', { default: 'Einstellungen' })}
          </button>
        {/if}
      </div>

      <!-- Privacy Link -->
      <div class="mt-4 text-center">
        <a
          href="https://www.ionos.de/terms-gtc/datenschutzerklaerung/"
          target="_blank"
          rel="noopener noreferrer"
          class="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          {$t('consent.privacy_link', { default: 'Datenschutzerklärung' })}
        </a>
      </div>
    </div>
  </div>
{/if}
```

---

## i18n Strings

### Deutsch (de-DE)

```json
{
  "consent.title": "Datenschutz-Einstellungen",
  "consent.description": "IONOS GPT verwendet Analyse-Tools, um die Nutzererfahrung zu verbessern. Ihre Daten werden ausschließlich auf Servern in Deutschland verarbeitet.",
  "consent.essential.title": "Notwendig",
  "consent.essential.description": "Session-Management, Authentifizierung",
  "consent.analytics.title": "Analyse",
  "consent.analytics.description": "Nutzungsstatistiken, Performance-Monitoring",
  "consent.always_active": "Immer aktiv",
  "consent.accept_all": "Alle akzeptieren",
  "consent.essential_only": "Nur notwendige",
  "consent.settings": "Einstellungen",
  "consent.save": "Speichern",
  "consent.privacy_link": "Datenschutzerklärung"
}
```

### English (en-US)

```json
{
  "consent.title": "Privacy Settings",
  "consent.description": "IONOS GPT uses analytics tools to improve user experience. Your data is processed exclusively on servers in Germany.",
  "consent.essential.title": "Essential",
  "consent.essential.description": "Session management, authentication",
  "consent.analytics.title": "Analytics",
  "consent.analytics.description": "Usage statistics, performance monitoring",
  "consent.always_active": "Always active",
  "consent.accept_all": "Accept all",
  "consent.essential_only": "Essential only",
  "consent.settings": "Settings",
  "consent.save": "Save",
  "consent.privacy_link": "Privacy Policy"
}
```

---

## Storage Schema

### localStorage

```typescript
// Key: 'analytics_consent'
interface StoredConsent {
  essential: true;
  analytics: boolean;
  marketing: boolean;
  timestamp: string; // ISO 8601
  version: string;   // Schema version
}

// Example:
{
  "essential": true,
  "analytics": true,
  "marketing": false,
  "timestamp": "2025-12-06T14:32:00.000Z",
  "version": "1.0"
}
```

### Versionierung

| Version | Änderungen | Migration |
|---------|------------|-----------|
| 1.0 | Initial | - |
| 1.1 | (Future) Marketing hinzugefügt | Re-Consent erforderlich |

---

## Consent-Prüfung im Code

### Vor Event-Tracking

```typescript
// In analytics.service.ts
track(event: AnalyticsEvent): void {
  // Prüfe Consent vor jedem Event
  if (!consentStore.hasConsent('analytics')) {
    return; // Silent return, kein Error
  }

  this.provider?.track(event.event, event.properties);
}
```

### In Komponenten

```typescript
// In einer Svelte-Komponente
import { useAnalytics } from '$lib/IONOS/analytics/hooks/useAnalytics';
import { consentStore } from '$lib/IONOS/analytics/consent.store';

const { track } = useAnalytics();

function handleClick() {
  // Track only if consented - analytics service handles this
  track({
    event: 'button_clicked',
    properties: { button_id: 'cta-main' }
  });
}
```

### API Requests

```typescript
// In API-Calls: Header für Backend-Tracking
const headers = {
  'Authorization': `Bearer ${token}`,
  'X-Analytics-Consent': consentStore.hasConsent('analytics') ? 'true' : 'false'
};
```

---

## Consent-Änderungen

### Bei Widerruf

```typescript
consentStore.subscribe(consent => {
  if (!consent.analytics) {
    // Analytics widerrufen
    analytics.reset(); // Lösche User-ID
    // Optional: Lösche gespeicherte Events
    eventQueue.clear();
  }
});
```

### Re-Consent bei Version-Änderung

```typescript
function loadFromStorage(): ConsentState | null {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const parsed = JSON.parse(stored);
    // Bei Version-Mismatch: Erneut Consent einholen
    if (parsed.version !== CONSENT_VERSION) {
      return null; // Banner wird angezeigt
    }
    return parsed;
  }
  return null;
}
```

---

## Testing

### Unit Tests

```typescript
// consent.store.test.ts
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

  it('should persist to localStorage', () => {
    consentStore.acceptAll();
    const stored = JSON.parse(localStorage.getItem('analytics_consent')!);
    expect(stored.analytics).toBe(true);
  });
});
```

---

## Checkliste

- [ ] ConsentBanner.svelte erstellt
- [ ] consentStore implementiert
- [ ] i18n Strings hinzugefügt (DE, EN)
- [ ] Settings-Integration
- [ ] Analytics-Service prüft Consent
- [ ] API-Header für Backend
- [ ] Unit Tests
- [ ] E2E Tests für Banner-Flow
- [ ] Datenschutzerklärung aktualisiert
