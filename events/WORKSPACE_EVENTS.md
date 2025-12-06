![Momentum Team](../../MomentumTeam-hor.png)

# Workspace Events

> **Analytics Documentation** · Version 1.0 · Last updated: 2024-12-06

Events for Workspace features: Models, Prompts, Tools, Functions.

---

## Übersicht

| Event | Beschreibung | Priorität |
|-------|--------------|-----------|
| `model_created` | Custom Model erstellt | P2 |
| `model_edited` | Model bearbeitet | P2 |
| `model_deleted` | Model gelöscht | P2 |
| `prompt_created` | Prompt erstellt | P2 |
| `prompt_edited` | Prompt bearbeitet | P2 |
| `prompt_deleted` | Prompt gelöscht | P2 |
| `prompt_used` | Prompt im Chat verwendet | P1 |
| `tool_created` | Tool erstellt | P2 |
| `tool_edited` | Tool bearbeitet | P2 |
| `tool_deleted` | Tool gelöscht | P2 |
| `tool_bound_to_model` | Tool an Model gebunden | P2 |
| `function_created` | Function erstellt (Admin) | P3 |

---

## Event-Definitionen

### Models

#### model_created

```typescript
interface ModelCreatedEvent {
  event: 'model_created';
  properties: {
    model_id: string;
    /** Basis-Model */
    base_model_id: string;
    /** Hat System Prompt */
    has_system_prompt: boolean;
    /** Länge des System Prompts */
    system_prompt_length: number;
    /** Anzahl gebundener Tools */
    tools_count: number;
    /** Anzahl gebundener Knowledge Bases */
    knowledge_count: number;
    /** Konfigurierte Capabilities */
    capabilities: string[];
  };
}
```

---

### Prompts

#### prompt_created

```typescript
interface PromptCreatedEvent {
  event: 'prompt_created';
  properties: {
    prompt_id: string;
    /** Command (z.B. /summarize) */
    command: string;
    /** Titel-Länge */
    title_length: number;
    /** Content-Länge */
    content_length: number;
  };
}
```

#### prompt_used ⭐

```typescript
interface PromptUsedEvent {
  event: 'prompt_used';
  properties: {
    prompt_id: string;
    command: string;
    chat_id: string;
    agent_id: string;
    /** Wie wurde Prompt ausgelöst */
    trigger: 'command_typed' | 'autocomplete' | 'menu_select';
  };
}
```

---

### Tools

#### tool_created

```typescript
interface ToolCreatedEvent {
  event: 'tool_created';
  properties: {
    tool_id: string;
    tool_name: string;
    /** War Manifest valide */
    manifest_valid: boolean;
  };
}
```

#### tool_bound_to_model

```typescript
interface ToolBoundToModelEvent {
  event: 'tool_bound_to_model';
  properties: {
    tool_id: string;
    model_id: string;
    /** Ist es ein Custom Model */
    is_custom_model: boolean;
  };
}
```

---

## TypeScript Export

```typescript
// src/lib/IONOS/analytics/events/workspace.events.ts

export type WorkspaceEvents =
  | ModelCreatedEvent
  | ModelEditedEvent
  | ModelDeletedEvent
  | PromptCreatedEvent
  | PromptEditedEvent
  | PromptDeletedEvent
  | PromptUsedEvent
  | ToolCreatedEvent
  | ToolEditedEvent
  | ToolDeletedEvent
  | ToolBoundToModelEvent
  | FunctionCreatedEvent;
```
