![Momentum Team](../assets/MomentumTeam-hor.png)

# Agent Events

> **Analytics Documentation** · Version 1.0 · Last updated: 2024-12-06

Events for AI Team / Agent interactions.

---

## Übersicht

| Event | Beschreibung | Priorität |
|-------|--------------|-----------|
| `agent_card_viewed` | Agent-Karte angesehen | P2 |
| `agent_card_expanded` | Agent-Details aufgeklappt | P2 |
| `agent_selected` | Agent ausgewählt | P0 |
| `agent_switched_mid_chat` | Agent während Chat gewechselt | P1 |
| `agent_search` | Nach Agent gesucht | P2 |
| `agent_ideas_clicked` | Agent-Idee angeklickt | P2 |

---

## Verfügbare Agents

| Agent ID | Name | Specialty |
|----------|------|-----------|
| `greta` | Greta | General Assistant |
| `sarah` | Sarah | Writing & Content |
| `derek` | Derek | Design & Creative |
| `dora` | Dora | Data & Analytics |
| `chris` | Chris | Coding & Development |
| `simon` | Simon | Strategy & Planning |
| `anna` | Anna | Customer Support |
| `sofia` | Sofia | Social Media |
| `ben` | Ben | Business & Finance |
| `leo` | Leo | Learning & Education |
| `rita` | Rita | Custom Agent |

---

## Event-Definitionen

### agent_card_viewed

User sieht eine Agent-Karte (ohne Details).

```typescript
interface AgentCardViewedEvent {
  event: 'agent_card_viewed';
  properties: {
    agent_id: string;
    agent_name: string;
    /** Wo wurde die Karte angezeigt */
    view_source: 'explore_page' | 'sidebar' | 'search_results' | 'recommendation';
    /** Position in der Liste (0-indexed) */
    list_position: number;
    /** Wie lange wurde die Karte angesehen (ms) */
    view_duration_ms: number;
    /** Wurde die Karte im Viewport sichtbar */
    was_visible: boolean;
  };
}
```

---

### agent_card_expanded

User klappt Agent-Details auf.

```typescript
interface AgentCardExpandedEvent {
  event: 'agent_card_expanded';
  properties: {
    agent_id: string;
    agent_name: string;
    /** Wie lange Details angezeigt (ms) */
    expansion_duration_ms: number;
    /** Hat User Capabilities gelesen */
    viewed_capabilities: boolean;
    /** Hat User Ideas gelesen */
    viewed_ideas: boolean;
  };
}
```

---

### agent_selected ⭐

User wählt einen Agent aus.

```typescript
interface AgentSelectedEvent {
  event: 'agent_selected';
  properties: {
    agent_id: string;
    agent_name: string;
    /** Vorher ausgewählter Agent (null wenn erster) */
    previous_agent_id: string | null;
    previous_agent_name: string | null;
    /** Wo wurde der Agent ausgewählt */
    selection_source: 'agent_card' | 'agent_selector' | 'sidebar' |
                      'chat_header' | 'quick_action' | 'search' | 'recommendation';
    /** Position wenn aus Liste ausgewählt */
    list_position: number | null;
    /** Wurde Agent gewechselt oder initial gewählt */
    is_switch: boolean;
    /** Hat User die Details vorher angesehen */
    viewed_details_before: boolean;
  };
}
```

**Trigger:**
- Click auf Agent-Card "Chat starten"
- Auswahl im Agent-Selector
- Click auf Agent in Sidebar

**Code-Location:**
- `src/routes/momentum/components/AgentCard.svelte`
- `src/lib/IONOS/components/chat/SmallAgentSelector.svelte`

**Dashboard-Nutzung:**
- Most Selected Agents
- Agent Selection Source Distribution
- Agent Switch Patterns

---

### agent_switched_mid_chat

User wechselt Agent während eines aktiven Chats.

```typescript
interface AgentSwitchedMidChatEvent {
  event: 'agent_switched_mid_chat';
  properties: {
    chat_id: string;
    from_agent_id: string;
    from_agent_name: string;
    to_agent_id: string;
    to_agent_name: string;
    /** Nachrichten im Chat vor dem Wechsel */
    messages_before_switch: number;
    /** Wie wurde gewechselt */
    switch_source: 'chat_header' | 'agent_selector' | 'sidebar';
    /** Zeit seit Chat-Start (ms) */
    time_in_chat_ms: number;
  };
}
```

**Dashboard-Nutzung:**
- Agent Switch Rate
- Common Switch Patterns (from → to)
- Messages before Switch

---

### agent_search

User sucht nach einem Agent.

```typescript
interface AgentSearchEvent {
  event: 'agent_search';
  properties: {
    /** Suchanfrage (anonymisiert - nur Länge) */
    query_length: number;
    /** Anzahl Ergebnisse */
    results_count: number;
    /** Wurde ein Agent aus den Ergebnissen ausgewählt */
    selected_from_results: boolean;
    /** Welcher Agent wurde ausgewählt (wenn ja) */
    selected_agent_id: string | null;
    /** Position des ausgewählten Agents in Ergebnissen */
    selected_position: number | null;
  };
}
```

---

### agent_ideas_clicked

User klickt auf eine vorgeschlagene Idee eines Agents.

```typescript
interface AgentIdeasClickedEvent {
  event: 'agent_ideas_clicked';
  properties: {
    agent_id: string;
    agent_name: string;
    /** Index der Idee (0, 1, 2) */
    idea_index: number;
    /** Wurde dadurch ein Chat gestartet */
    started_chat: boolean;
  };
}
```

---

## TypeScript Export

```typescript
// src/lib/IONOS/analytics/events/agent.events.ts

export type AgentId = 'greta' | 'sarah' | 'derek' | 'dora' | 'chris' |
                      'simon' | 'anna' | 'sofia' | 'ben' | 'leo' | 'rita' | string;

export type AgentSelectionSource =
  | 'agent_card'
  | 'agent_selector'
  | 'sidebar'
  | 'chat_header'
  | 'quick_action'
  | 'search'
  | 'recommendation';

export type AgentEvents =
  | AgentCardViewedEvent
  | AgentCardExpandedEvent
  | AgentSelectedEvent
  | AgentSwitchedMidChatEvent
  | AgentSearchEvent
  | AgentIdeasClickedEvent;
```

---

## Dashboard-Metriken

### Agent Popularity

```
┌─────────────────────────────────────────────────────────────────┐
│                    AGENT POPULARITY (30 Days)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Greta     ████████████████████████████████████████  35%       │
│  Chris     █████████████████████████                 22%       │
│  Sarah     ████████████████████                      17%       │
│  Derek     ██████████████                            12%       │
│  Dora      ████████                                   7%       │
│  Others    █████                                      7%       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Agent Switch Matrix

```
┌─────────────────────────────────────────────────────────────────┐
│                    AGENT SWITCH MATRIX                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  FROM ↓ / TO →   Greta  Chris  Sarah  Derek  Other             │
│  ─────────────────────────────────────────────────              │
│  Greta            -      45     32     18     12               │
│  Chris           23       -     15      8      5               │
│  Sarah           18      12      -     22      3               │
│  Derek            8       5     28      -      4               │
│                                                                 │
│  Insight: Users often switch from Greta to Chris               │
│           (General → Coding) for technical tasks               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### SQL Queries

```sql
-- Most Popular Agents
SELECT
  properties.agent_id,
  properties.agent_name,
  COUNT(*) as selections,
  COUNT(DISTINCT user_id) as unique_users
FROM events
WHERE event = 'agent_selected'
  AND timestamp > NOW() - INTERVAL 30 DAY
GROUP BY properties.agent_id, properties.agent_name
ORDER BY selections DESC
```

```sql
-- Agent Selection Sources
SELECT
  properties.agent_id,
  properties.selection_source,
  COUNT(*) as count
FROM events
WHERE event = 'agent_selected'
  AND timestamp > NOW() - INTERVAL 30 DAY
GROUP BY properties.agent_id, properties.selection_source
ORDER BY count DESC
```

```sql
-- Agent Switch Patterns
SELECT
  properties.from_agent_id,
  properties.to_agent_id,
  COUNT(*) as switches,
  AVG(properties.messages_before_switch) as avg_messages_before
FROM events
WHERE event = 'agent_switched_mid_chat'
  AND timestamp > NOW() - INTERVAL 30 DAY
GROUP BY properties.from_agent_id, properties.to_agent_id
HAVING switches > 5
ORDER BY switches DESC
```

---

## Implementation Example

```typescript
// In AgentCard.svelte
import { analytics } from '$lib/IONOS/analytics';
import { selectedAgent } from '$lib/IONOS/stores/agents';

let viewStartTime: number;
let detailsExpanded = false;

onMount(() => {
  viewStartTime = Date.now();

  // Track visibility using IntersectionObserver
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      // Will be tracked on selection or leave
    }
  });
  observer.observe(cardElement);

  return () => observer.disconnect();
});

function handleExpand() {
  detailsExpanded = true;
}

function handleSelect() {
  const previousAgent = get(selectedAgent);

  analytics.track({
    event: 'agent_selected',
    properties: {
      agent_id: agent.id,
      agent_name: agent.name,
      previous_agent_id: previousAgent?.id || null,
      previous_agent_name: previousAgent?.name || null,
      selection_source: 'agent_card',
      list_position: index,
      is_switch: !!previousAgent,
      viewed_details_before: detailsExpanded,
    }
  });

  // Also track view duration
  analytics.track({
    event: 'agent_card_viewed',
    properties: {
      agent_id: agent.id,
      agent_name: agent.name,
      view_source: 'explore_page',
      list_position: index,
      view_duration_ms: Date.now() - viewStartTime,
      was_visible: true,
    }
  });

  selectedAgent.set(agent);
  goto(`/momentum/chat`);
}

function handleIdeaClick(ideaIndex: number) {
  analytics.track({
    event: 'agent_ideas_clicked',
    properties: {
      agent_id: agent.id,
      agent_name: agent.name,
      idea_index: ideaIndex,
      started_chat: true,
    }
  });

  // Start chat with idea as initial message
  startChatWithIdea(agent, agent.ideas[ideaIndex]);
}
```

---

## Privacy Considerations

### Was wird getrackt:

- ✅ Agent IDs und Namen (öffentliche Daten)
- ✅ Selection Sources
- ✅ Timing-Metriken
- ✅ Position in Listen
- ✅ Switch-Patterns

### Was wird NICHT getrackt:

- ❌ Konkrete Suchanfragen (nur Länge)
- ❌ Gesprächsinhalte
- ❌ Custom Agent Konfigurationen
