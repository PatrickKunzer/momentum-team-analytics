![Momentum Team](../../MomentumTeam-hor.png)

# Chat Events

> **Analytics Documentation** · Version 1.0 · Last updated: 2024-12-06

Events for chat and AI interactions in Momentum Team.

---

## Übersicht

| Event | Beschreibung | Priorität |
|-------|--------------|-----------|
| `chat_created` | Neuer Chat gestartet | P0 |
| `chat_resumed` | Bestehender Chat fortgesetzt | P1 |
| `chat_archived` | Chat archiviert | P2 |
| `chat_deleted` | Chat gelöscht | P1 |
| `chat_title_changed` | Chat-Titel geändert | P2 |
| `message_sent` | Nachricht gesendet | P0 |
| `message_with_image` | Nachricht mit Bild | P1 |
| `message_with_audio` | Nachricht mit Audio | P1 |
| `message_with_file` | Nachricht mit Datei | P1 |
| `response_received` | AI-Antwort erhalten | P0 |
| `response_streaming_started` | Streaming begonnen | P1 |
| `response_streaming_completed` | Streaming beendet | P1 |
| `response_generation_stopped` | Generation gestoppt | P1 |
| `tool_selected` | Tool ausgewählt | P1 |
| `tool_deselected` | Tool abgewählt | P2 |
| `tool_executed` | Tool ausgeführt | P1 |
| `web_search_triggered` | Web-Suche ausgelöst | P1 |
| `image_generated` | Bild generiert | P1 |
| `code_executed` | Code ausgeführt | P1 |
| `knowledge_context_used` | Knowledge im Chat genutzt | P1 |
| `message_copied` | Nachricht kopiert | P2 |
| `message_feedback_given` | Feedback gegeben | P1 |
| `message_regenerated` | Nachricht regeneriert | P2 |
| `code_block_copied` | Code-Block kopiert | P2 |
| `chat_exported` | Chat exportiert | P2 |

---

## Event-Definitionen

### chat_created

Wird ausgelöst, wenn ein neuer Chat gestartet wird.

```typescript
interface ChatCreatedEvent {
  event: 'chat_created';
  properties: {
    /** Eindeutige Chat-ID */
    chat_id: string;
    /** ID des ausgewählten Agenten */
    agent_id: string;
    /** Name des Agenten */
    agent_name: string;
    /** Wie wurde der Chat gestartet */
    source: 'explore' | 'sidebar' | 'direct_url' | 'agent_card';
    /** War ein vorheriger Chat aktiv */
    had_previous_chat: boolean;
  };
}
```

**Trigger:** User startet neuen Chat (klickt Agent, "New Chat", etc.)

**Code-Location:** `src/routes/momentum/chat/+page.svelte`

---

### chat_resumed

Wird ausgelöst, wenn ein bestehender Chat geöffnet wird.

```typescript
interface ChatResumedEvent {
  event: 'chat_resumed';
  properties: {
    chat_id: string;
    /** Anzahl vorhandener Nachrichten */
    message_count: number;
    /** Stunden seit letzter Aktivität */
    last_active_hours_ago: number;
    /** Agent des Chats */
    agent_id: string;
  };
}
```

**Trigger:** User wählt Chat aus Sidebar/History

---

### chat_deleted

```typescript
interface ChatDeletedEvent {
  event: 'chat_deleted';
  properties: {
    chat_id: string;
    message_count: number;
    /** Alter des Chats in Tagen */
    age_days: number;
    agent_id: string;
  };
}
```

**Trigger:** User löscht einzelnen Chat

---

### chat_title_changed

```typescript
interface ChatTitleChangedEvent {
  event: 'chat_title_changed';
  properties: {
    chat_id: string;
    /** War es ein auto-generierter Titel */
    auto_generated: boolean;
    /** Länge des neuen Titels */
    title_length: number;
  };
}
```

---

### message_sent ⭐

**Wichtigstes Chat-Event** - Nachricht vom User gesendet.

```typescript
interface MessageSentEvent {
  event: 'message_sent';
  properties: {
    chat_id: string;
    agent_id: string;
    agent_name: string;
    /** Länge der Nachricht in Zeichen */
    message_length_chars: number;
    /** Hat die Nachricht Anhänge */
    has_attachments: boolean;
    /** Anzahl der Anhänge */
    attachment_count: number;
    /** Typen der Anhänge */
    attachment_types: string[]; // ['image', 'file', 'audio']
    /** Wurde Knowledge-Kontext verwendet */
    has_knowledge_context: boolean;
    /** IDs der verwendeten Knowledge Bases */
    knowledge_ids: string[];
    /** Ist Web-Suche aktiviert */
    has_web_search: boolean;
    /** Ist Bildgenerierung aktiviert */
    has_image_generation: boolean;
    /** Ausgewählte Tool-IDs */
    selected_tool_ids: string[];
    /** Wie wurde die Nachricht eingegeben */
    input_method: 'typed' | 'pasted' | 'voice';
    /** Position im Chat (wievielte Nachricht) */
    message_position: number;
  };
}
```

**Trigger:** User sendet Nachricht (Enter, Send-Button)

**Code-Location:** `src/lib/IONOS/components/chat/MessageInput.svelte`

**Dashboard-Nutzung:**
- Messages per User per Day
- Average Message Length
- Attachment Usage Rate
- Knowledge Usage Rate
- Tool Usage Distribution

---

### message_with_image

```typescript
interface MessageWithImageEvent {
  event: 'message_with_image';
  properties: {
    chat_id: string;
    /** Anzahl der Bilder */
    image_count: number;
    /** Wie wurden Bilder hinzugefügt */
    image_source: 'upload' | 'paste' | 'camera' | 'drag_drop';
    /** Gesamtgröße in KB */
    total_size_kb: number;
    /** Bildformate */
    image_formats: string[]; // ['jpeg', 'png', 'gif']
  };
}
```

---

### message_with_audio

```typescript
interface MessageWithAudioEvent {
  event: 'message_with_audio';
  properties: {
    chat_id: string;
    /** Dauer in Sekunden */
    audio_duration_seconds: number;
    /** Audio-Format */
    audio_format: 'mpeg' | 'wav' | 'ogg' | 'm4a';
    /** Größe in KB */
    file_size_kb: number;
  };
}
```

---

### message_with_file

```typescript
interface MessageWithFileEvent {
  event: 'message_with_file';
  properties: {
    chat_id: string;
    file_count: number;
    /** Dateitypen */
    file_types: string[]; // ['pdf', 'docx', 'txt']
    /** Gesamtgröße in KB */
    total_size_kb: number;
  };
}
```

---

### response_received ⭐

AI-Antwort vollständig erhalten.

```typescript
interface ResponseReceivedEvent {
  event: 'response_received';
  properties: {
    chat_id: string;
    agent_id: string;
    /** Zeit bis erste Antwort (TTFB) in ms */
    time_to_first_byte_ms: number;
    /** Gesamte Response-Zeit in ms */
    response_time_ms: number;
    /** Anzahl generierter Tokens */
    token_count: number;
    /** Wurden Quellen zurückgegeben (RAG) */
    has_sources: boolean;
    /** Anzahl der Quellen */
    source_count: number;
    /** Enthält Code-Blöcke */
    has_code_blocks: boolean;
    /** Anzahl Code-Blöcke */
    code_block_count: number;
    /** Wurden Tools aufgerufen */
    has_tool_calls: boolean;
    /** Anzahl Tool-Calls */
    tool_call_count: number;
    /** Länge der Antwort in Zeichen */
    response_length_chars: number;
  };
}
```

**Dashboard-Nutzung:**
- Average Response Time
- Token Usage per Message
- Tool Call Rate
- RAG Source Usage

---

### response_streaming_started

```typescript
interface ResponseStreamingStartedEvent {
  event: 'response_streaming_started';
  properties: {
    chat_id: string;
    agent_id: string;
  };
}
```

---

### response_streaming_completed

```typescript
interface ResponseStreamingCompletedEvent {
  event: 'response_streaming_completed';
  properties: {
    chat_id: string;
    agent_id: string;
    /** Streaming-Dauer in ms */
    duration_ms: number;
    /** Generierte Tokens */
    total_tokens: number;
  };
}
```

---

### response_generation_stopped

User stoppt die Generierung manuell.

```typescript
interface ResponseGenerationStoppedEvent {
  event: 'response_generation_stopped';
  properties: {
    chat_id: string;
    agent_id: string;
    /** Bereits generierte Tokens */
    tokens_generated: number;
    /** Grund für Stopp */
    stop_reason: 'user_click' | 'error' | 'timeout' | 'limit_reached';
    /** Zeit seit Start in ms */
    time_elapsed_ms: number;
  };
}
```

**Dashboard-Nutzung:**
- Generation Stop Rate
- Average Tokens before Stop

---

### tool_selected

```typescript
interface ToolSelectedEvent {
  event: 'tool_selected';
  properties: {
    chat_id: string;
    tool_id: string;
    tool_name: string;
    /** Anzahl bereits ausgewählter Tools */
    total_selected_tools: number;
  };
}
```

---

### tool_executed

```typescript
interface ToolExecutedEvent {
  event: 'tool_executed';
  properties: {
    chat_id: string;
    agent_id: string;
    tool_id: string;
    tool_name: string;
    /** War die Ausführung erfolgreich */
    success: boolean;
    /** Ausführungsdauer in ms */
    duration_ms: number;
    /** Fehlertyp wenn nicht erfolgreich */
    error_type: string | null;
  };
}
```

---

### web_search_triggered

```typescript
interface WebSearchTriggeredEvent {
  event: 'web_search_triggered';
  properties: {
    chat_id: string;
    agent_id: string;
    /** Länge der Suchanfrage */
    query_length: number;
    /** Anzahl zurückgegebener Ergebnisse */
    results_count: number;
    /** Suchzeit in ms */
    search_duration_ms: number;
  };
}
```

---

### image_generated

```typescript
interface ImageGeneratedEvent {
  event: 'image_generated';
  properties: {
    chat_id: string;
    agent_id: string;
    /** Länge des Prompts */
    prompt_length: number;
    /** Verwendetes Model */
    model_used: string;
    /** Erfolgreich generiert */
    success: boolean;
    /** Generierungszeit in ms */
    generation_time_ms: number;
    /** Fehlertyp wenn nicht erfolgreich */
    error_type: string | null;
  };
}
```

---

### code_executed

```typescript
interface CodeExecutedEvent {
  event: 'code_executed';
  properties: {
    chat_id: string;
    agent_id: string;
    /** Programmiersprache */
    language: string;
    /** Länge des Codes */
    code_length_chars: number;
    /** Erfolgreich ausgeführt */
    success: boolean;
    /** Ausführungszeit in ms */
    execution_time_ms: number;
    /** Fehlertyp */
    error_type: string | null;
  };
}
```

---

### knowledge_context_used

```typescript
interface KnowledgeContextUsedEvent {
  event: 'knowledge_context_used';
  properties: {
    chat_id: string;
    agent_id: string;
    knowledge_id: string;
    knowledge_name: string;
    /** Anzahl abgerufener Chunks */
    chunks_retrieved: number;
    /** Durchschnittlicher Relevanz-Score */
    avg_relevance_score: number;
  };
}
```

---

### message_feedback_given

```typescript
interface MessageFeedbackGivenEvent {
  event: 'message_feedback_given';
  properties: {
    chat_id: string;
    message_id: string;
    agent_id: string;
    /** Feedback-Typ */
    feedback_type: 'thumbs_up' | 'thumbs_down';
    /** Optional: Freitext-Feedback */
    has_feedback_text: boolean;
    /** Position der Nachricht im Chat */
    message_position: number;
  };
}
```

**Dashboard-Nutzung:**
- Thumbs Up/Down Ratio per Agent
- Feedback Rate
- Problem Messages Analysis

---

### message_copied

```typescript
interface MessageCopiedEvent {
  event: 'message_copied';
  properties: {
    chat_id: string;
    message_id: string;
    /** Was wurde kopiert */
    content_type: 'full_message' | 'selection' | 'code_block';
    /** Länge des kopierten Inhalts */
    content_length_chars: number;
  };
}
```

---

### code_block_copied

```typescript
interface CodeBlockCopiedEvent {
  event: 'code_block_copied';
  properties: {
    chat_id: string;
    message_id: string;
    /** Programmiersprache */
    language: string;
    /** Länge des Codes */
    code_length_chars: number;
  };
}
```

---

### message_regenerated

```typescript
interface MessageRegeneratedEvent {
  event: 'message_regenerated';
  properties: {
    chat_id: string;
    message_id: string;
    agent_id: string;
    /** Wievielte Regenerierung */
    regeneration_count: number;
  };
}
```

---

### chat_exported

```typescript
interface ChatExportedEvent {
  event: 'chat_exported';
  properties: {
    chat_id: string;
    /** Export-Format */
    format: 'json' | 'markdown' | 'txt';
    /** Anzahl der Nachrichten */
    message_count: number;
    /** Alter des Chats in Tagen */
    chat_age_days: number;
  };
}
```

---

## TypeScript Export

```typescript
// src/lib/IONOS/analytics/events/chat.events.ts

export type ChatEvents =
  | ChatCreatedEvent
  | ChatResumedEvent
  | ChatArchivedEvent
  | ChatDeletedEvent
  | ChatTitleChangedEvent
  | MessageSentEvent
  | MessageWithImageEvent
  | MessageWithAudioEvent
  | MessageWithFileEvent
  | ResponseReceivedEvent
  | ResponseStreamingStartedEvent
  | ResponseStreamingCompletedEvent
  | ResponseGenerationStoppedEvent
  | ToolSelectedEvent
  | ToolDeselectedEvent
  | ToolExecutedEvent
  | WebSearchTriggeredEvent
  | ImageGeneratedEvent
  | CodeExecutedEvent
  | KnowledgeContextUsedEvent
  | MessageCopiedEvent
  | MessageFeedbackGivenEvent
  | MessageRegeneratedEvent
  | CodeBlockCopiedEvent
  | ChatExportedEvent;
```

---

## Implementation Example

```typescript
// In MessageInput.svelte
import { analytics } from '$lib/IONOS/analytics';

async function sendMessage() {
  const messageId = await chatService.send(message, files);

  analytics.track({
    event: 'message_sent',
    properties: {
      chat_id: $chatId,
      agent_id: selectedAgent.id,
      agent_name: selectedAgent.name,
      message_length_chars: message.length,
      has_attachments: files.length > 0,
      attachment_count: files.length,
      attachment_types: files.map(f => getFileType(f)),
      has_knowledge_context: selectedKnowledge.length > 0,
      knowledge_ids: selectedKnowledge.map(k => k.id),
      has_web_search: webSearchEnabled,
      has_image_generation: imageGenEnabled,
      selected_tool_ids: selectedTools.map(t => t.id),
      input_method: inputMethod,
      message_position: messageCount + 1,
    }
  });
}
```
