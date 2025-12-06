![Momentum Team](../../MomentumTeam-hor.png)

# Navigation Events

> **Analytics Documentation** · Version 1.0 · Last updated: 2024-12-06

Events for page views and UI interactions.

---

## Übersicht

| Event | Beschreibung | Priorität |
|-------|--------------|-----------|
| `session_started` | Session begonnen | P0 |
| `page_viewed` | Seite angesehen | P0 |
| `sidebar_opened` | Sidebar geöffnet | P2 |
| `sidebar_closed` | Sidebar geschlossen | P2 |
| `explore_page_viewed` | Explore-Seite besucht | P1 |
| `help_clicked` | Hilfe geklickt | P2 |
| `faq_clicked` | FAQ geklickt | P2 |
| `feedback_clicked` | Feedback geklickt | P1 |
| `survey_started` | Survey gestartet | P1 |
| `survey_completed` | Survey abgeschlossen | P1 |
| `external_link_clicked` | Externer Link | P2 |
| `keyboard_shortcut_used` | Keyboard Shortcut | P3 |

---

## Event-Definitionen

### session_started ⭐

Wird bei jedem App-Start/Refresh getrackt.

```typescript
interface SessionStartedEvent {
  event: 'session_started';
  properties: {
    /** Wie wurde die App geöffnet */
    entry_type: 'direct' | 'referral' | 'pwa' | 'bookmark';
    /** Referrer Domain (wenn vorhanden) */
    referrer_domain: string | null;
    /** Erste Seite der Session */
    landing_page: string;
    /** Ist User eingeloggt */
    is_authenticated: boolean;
    /** Returning oder New User */
    is_returning_user: boolean;
    /** Tage seit letzter Session */
    days_since_last_session: number | null;
  };
}
```

---

### page_viewed ⭐

```typescript
interface PageViewedEvent {
  event: 'page_viewed';
  properties: {
    /** Seiten-Name */
    page_name: 'explore' | 'chat' | 'integrations' | 'settings' |
               'knowledge' | 'workspace' | 'auth' | 'other';
    /** URL Path */
    page_path: string;
    /** Vorherige Seite */
    previous_page: string | null;
    /** Zeit auf vorheriger Seite (ms) */
    time_on_previous_ms: number | null;
    /** Ist es der erste Pageview der Session */
    is_first_pageview: boolean;
  };
}
```

---

### explore_page_viewed

```typescript
interface ExplorePageViewedEvent {
  event: 'explore_page_viewed';
  properties: {
    /** Anzahl sichtbarer Agents */
    agents_visible: number;
    /** Scroll-Tiefe (%) */
    scroll_depth_percent: number;
    /** Zeit auf Seite (ms) */
    time_on_page_ms: number;
    /** Wurde ein Agent ausgewählt */
    selected_agent: boolean;
  };
}
```

---

### Survey Events

#### survey_started

```typescript
interface SurveyStartedEvent {
  event: 'survey_started';
  properties: {
    survey_type: 'new_user' | 'feedback' | 'nps' | 'feature';
    /** Wo wurde Survey angezeigt */
    trigger_location: 'settings' | 'notification' | 'modal';
  };
}
```

#### survey_completed

```typescript
interface SurveyCompletedEvent {
  event: 'survey_completed';
  properties: {
    survey_type: string;
    /** Zeit zum Ausfüllen (ms) */
    duration_ms: number;
    /** Wurde vollständig ausgefüllt */
    completed_all_questions: boolean;
  };
}
```

---

### external_link_clicked

```typescript
interface ExternalLinkClickedEvent {
  event: 'external_link_clicked';
  properties: {
    link_type: 'terms' | 'privacy' | 'imprint' | 'help' | 'faq' |
               'model_license' | 'other';
    /** Ziel-Domain */
    destination_domain: string;
    /** Von welcher Seite */
    source_page: string;
  };
}
```

---

## TypeScript Export

```typescript
// src/lib/IONOS/analytics/events/navigation.events.ts

export type PageName =
  | 'explore'
  | 'chat'
  | 'integrations'
  | 'settings'
  | 'knowledge'
  | 'workspace'
  | 'auth'
  | 'other';

export type NavigationEvents =
  | SessionStartedEvent
  | PageViewedEvent
  | SidebarOpenedEvent
  | SidebarClosedEvent
  | ExplorePageViewedEvent
  | HelpClickedEvent
  | FAQClickedEvent
  | FeedbackClickedEvent
  | SurveyStartedEvent
  | SurveyCompletedEvent
  | ExternalLinkClickedEvent
  | KeyboardShortcutUsedEvent;
```

---

## Auto-Tracking Setup

```typescript
// In +layout.svelte
import { analytics } from '$lib/IONOS/analytics';
import { page } from '$app/stores';
import { onMount } from 'svelte';

let previousPage: string | null = null;
let pageStartTime: number = Date.now();

onMount(() => {
  // Track session start
  analytics.track({
    event: 'session_started',
    properties: {
      entry_type: document.referrer ? 'referral' : 'direct',
      referrer_domain: document.referrer ? new URL(document.referrer).hostname : null,
      landing_page: window.location.pathname,
      is_authenticated: !!$user,
      is_returning_user: localStorage.getItem('has_visited') === 'true',
      days_since_last_session: getDaysSinceLastSession(),
    }
  });

  localStorage.setItem('has_visited', 'true');
});

// Track page changes
$: {
  const currentPath = $page.url.pathname;
  const timeOnPrevious = previousPage ? Date.now() - pageStartTime : null;

  analytics.track({
    event: 'page_viewed',
    properties: {
      page_name: getPageName(currentPath),
      page_path: currentPath,
      previous_page: previousPage,
      time_on_previous_ms: timeOnPrevious,
      is_first_pageview: !previousPage,
    }
  });

  previousPage = currentPath;
  pageStartTime = Date.now();
}
```
