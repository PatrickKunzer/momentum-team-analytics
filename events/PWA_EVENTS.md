![Momentum Team](../../MomentumTeam-hor.png)

# PWA Events

> **Analytics Documentation** · Version 1.0 · Last updated: 2024-12-06

Events for Progressive Web App installation and usage.

---

## Übersicht

| Event | Beschreibung | Priorität |
|-------|--------------|-----------|
| `pwa_install_banner_shown` | Install-Banner angezeigt | P1 |
| `pwa_install_banner_dismissed` | Banner geschlossen | P2 |
| `pwa_install_clicked` | Install geklickt | P1 |
| `pwa_installed` | PWA installiert | P1 |
| `pwa_launched` | PWA gestartet | P1 |
| `app_backgrounded` | App in Hintergrund | P3 |

---

## Event-Definitionen

### pwa_install_banner_shown

```typescript
interface PWAInstallBannerShownEvent {
  event: 'pwa_install_banner_shown';
  properties: {
    device_type: 'mobile' | 'tablet' | 'desktop';
    browser: string;
    os: string;
    /** Wievielter Anzeige-Versuch */
    show_count: number;
  };
}
```

---

### pwa_installed ⭐

```typescript
interface PWAInstalledEvent {
  event: 'pwa_installed';
  properties: {
    device_type: 'mobile' | 'tablet' | 'desktop';
    browser: string;
    os: string;
    /** Zeit von Banner bis Install (ms) */
    time_to_install_ms: number;
    /** Bei wievieltem Banner-Anzeige */
    banner_show_count: number;
  };
}
```

---

### pwa_launched

```typescript
interface PWALaunchedEvent {
  event: 'pwa_launched';
  properties: {
    device_type: string;
    /** Wie wurde PWA gestartet */
    launch_source: 'homescreen' | 'dock' | 'app_drawer' | 'shortcut';
    /** Tage seit Installation */
    days_since_install: number;
  };
}
```

---

## TypeScript Export

```typescript
// src/lib/IONOS/analytics/events/pwa.events.ts

export type PWAEvents =
  | PWAInstallBannerShownEvent
  | PWAInstallBannerDismissedEvent
  | PWAInstallClickedEvent
  | PWAInstalledEvent
  | PWALaunchedEvent
  | AppBackgroundedEvent;
```

---

## Detection Logic

```typescript
// PWA Detection
function isPWA(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true;
}

// Launch Source Detection
function getLaunchSource(): string {
  if (document.referrer === '') {
    return 'homescreen';
  }
  return 'browser';
}
```
