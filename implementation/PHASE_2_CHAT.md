![Momentum Team](../assets/MomentumTeam-hor.png)

# Phase 2: Chat Tracking

> **Analytics Documentation** · Version 1.0 · Last updated: 2024-12-06

Complete implementation of chat and message tracking.

---

## Overview

This phase implements tracking for all chat-related interactions - the core of the Momentum Team application.

---

## Voraussetzungen

- [ ] Phase 1 vollständig abgeschlossen
- [ ] Analytics Service funktioniert
- [ ] Consent Management aktiv
- [ ] PostHog empfängt Events

---

## 2.1 Chat Lifecycle Events

### Event Definitionen

```typescript
// src/lib/analytics/events/chat.events.ts

import { analytics } from '../analytics.service';

// Chat erstellt
export function trackChatCreated(chatId: string, agentId?: string): void {
  analytics.track('chat_created', {
    chat_id: chatId,
    agent_id: agentId,
    agent_name: agentId ? getAgentName(agentId) : 'default',
    initial_context: hasInitialContext()
  });
}

// Chat fortgesetzt
export function trackChatResumed(chatId: string, messageCount: number): void {
  analytics.track('chat_resumed', {
    chat_id: chatId,
    existing_message_count: messageCount,
    time_since_last_message: getTimeSinceLastMessage(chatId)
  });
}

// Chat gelöscht
export function trackChatDeleted(chatId: string, messageCount: number): void {
  analytics.track('chat_deleted', {
    chat_id: chatId,
    message_count: messageCount,
    chat_duration_minutes: getChatDuration(chatId)
  });
}

// Chat Titel geändert
export function trackChatTitleChanged(chatId: string, method: 'auto' | 'manual'): void {
  analytics.track('chat_title_changed', {
    chat_id: chatId,
    change_method: method
  });
}

// Chat exportiert
export function trackChatExported(chatId: string, format: string): void {
  analytics.track('chat_exported', {
    chat_id: chatId,
    export_format: format, // 'json', 'markdown', 'pdf'
    message_count: getMessageCount(chatId)
  });
}
```

### Integration Points

```svelte
<!-- src/lib/components/chat/Chat.svelte -->
<script lang="ts">
  import { trackChatCreated, trackChatResumed } from '$lib/analytics/events/chat.events';
  import { onMount } from 'svelte';

  export let chatId: string;
  export let messages: Message[];

  onMount(() => {
    if (messages.length === 0) {
      trackChatCreated(chatId, $selectedAgent?.id);
    } else {
      trackChatResumed(chatId, messages.length);
    }
  });
</script>
```

---

## 2.2 Message Events

### Nachricht gesendet

```typescript
// src/lib/analytics/events/message.events.ts

interface MessageSentProperties {
  chat_id: string;
  message_id: string;
  message_length: number;
  has_image: boolean;
  has_audio: boolean;
  has_file: boolean;
  file_types?: string[];
  agent_id?: string;
  model_id: string;
  is_regenerate: boolean;
  input_method: 'keyboard' | 'voice' | 'paste';
}

export function trackMessageSent(props: MessageSentProperties): void {
  analytics.track('message_sent', {
    ...props,
    // Keine Message-Inhalte speichern!
    message_length_bucket: getBucket(props.message_length, [10, 50, 200, 500, 1000])
  });
}

// Mit Bild
export function trackMessageWithImage(chatId: string, messageId: string, imageSource: string): void {
  analytics.track('message_with_image', {
    chat_id: chatId,
    message_id: messageId,
    image_source: imageSource, // 'upload', 'paste', 'camera', 'url'
    image_count: 1
  });
}

// Mit Audio
export function trackMessageWithAudio(chatId: string, messageId: string, durationSeconds: number): void {
  analytics.track('message_with_audio', {
    chat_id: chatId,
    message_id: messageId,
    audio_duration_seconds: durationSeconds,
    transcription_used: true
  });
}

// Mit Datei
export function trackMessageWithFile(chatId: string, messageId: string, files: FileInfo[]): void {
  analytics.track('message_with_file', {
    chat_id: chatId,
    message_id: messageId,
    file_count: files.length,
    file_types: files.map(f => f.type),
    total_size_kb: files.reduce((sum, f) => sum + f.size, 0) / 1024
  });
}
```

### Integration in MessageInput

```svelte
<!-- src/lib/components/chat/MessageInput.svelte -->
<script lang="ts">
  import {
    trackMessageSent,
    trackMessageWithImage,
    trackMessageWithFile
  } from '$lib/analytics/events/message.events';

  async function submitMessage() {
    const messageId = generateId();

    // Track message
    trackMessageSent({
      chat_id: $currentChatId,
      message_id: messageId,
      message_length: prompt.length,
      has_image: images.length > 0,
      has_audio: audioData !== null,
      has_file: files.length > 0,
      file_types: files.map(f => getFileExtension(f.name)),
      agent_id: $selectedAgent?.id,
      model_id: $selectedModel,
      is_regenerate: false,
      input_method: inputMethod
    });

    // Track attachments
    if (images.length > 0) {
      trackMessageWithImage($currentChatId, messageId, imageSource);
    }

    if (files.length > 0) {
      trackMessageWithFile($currentChatId, messageId, files);
    }

    // Send message...
  }
</script>
```

---

## 2.3 Response Events

### Antwort-Tracking

```typescript
// src/lib/analytics/events/response.events.ts

// Streaming gestartet
export function trackResponseStreamingStarted(chatId: string, messageId: string): void {
  analytics.track('response_streaming_started', {
    chat_id: chatId,
    message_id: messageId,
    timestamp: Date.now()
  });
}

// Streaming abgeschlossen
export function trackResponseStreamingCompleted(
  chatId: string,
  messageId: string,
  metrics: StreamMetrics
): void {
  analytics.track('response_streaming_completed', {
    chat_id: chatId,
    message_id: messageId,
    response_length: metrics.totalLength,
    streaming_duration_ms: metrics.durationMs,
    tokens_generated: metrics.tokenCount,
    first_token_ms: metrics.timeToFirstToken,
    tokens_per_second: metrics.tokensPerSecond
  });
}

// Antwort erhalten (nach Streaming)
export function trackResponseReceived(
  chatId: string,
  messageId: string,
  response: ResponseData
): void {
  analytics.track('response_received', {
    chat_id: chatId,
    message_id: messageId,
    model_id: response.model,
    response_length: response.content.length,
    response_time_ms: response.duration,
    has_code_blocks: containsCodeBlocks(response.content),
    code_languages: extractCodeLanguages(response.content),
    has_tool_calls: response.toolCalls?.length > 0,
    tool_names: response.toolCalls?.map(t => t.name),
    finish_reason: response.finishReason // 'stop', 'length', 'tool_calls'
  });
}

// Generation gestoppt
export function trackResponseGenerationStopped(
  chatId: string,
  messageId: string,
  partialLength: number
): void {
  analytics.track('response_generation_stopped', {
    chat_id: chatId,
    message_id: messageId,
    partial_response_length: partialLength,
    stop_reason: 'user_cancelled'
  });
}
```

### Integration in Chat-Response-Handler

```typescript
// src/lib/utils/chat-response.ts

import {
  trackResponseStreamingStarted,
  trackResponseStreamingCompleted,
  trackResponseReceived
} from '$lib/analytics/events/response.events';

export async function handleStreamingResponse(
  chatId: string,
  messageId: string,
  stream: ReadableStream
): Promise<string> {
  const startTime = Date.now();
  let firstTokenTime: number | null = null;
  let totalContent = '';
  let tokenCount = 0;

  trackResponseStreamingStarted(chatId, messageId);

  const reader = stream.getReader();

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      if (!firstTokenTime) {
        firstTokenTime = Date.now();
      }

      totalContent += value;
      tokenCount++;

      // Update UI...
    }

    const duration = Date.now() - startTime;

    trackResponseStreamingCompleted(chatId, messageId, {
      totalLength: totalContent.length,
      durationMs: duration,
      tokenCount,
      timeToFirstToken: firstTokenTime ? firstTokenTime - startTime : 0,
      tokensPerSecond: tokenCount / (duration / 1000)
    });

    return totalContent;
  } catch (error) {
    // Handle error...
  }
}
```

---

## 2.4 Tool & Feature Events

### Tool-Nutzung

```typescript
// src/lib/analytics/events/tool.events.ts

// Tool ausgewählt
export function trackToolSelected(toolId: string, toolName: string, context: string): void {
  analytics.track('tool_selected', {
    tool_id: toolId,
    tool_name: toolName,
    selection_context: context // 'chat', 'sidebar', 'suggestion'
  });
}

// Tool abgewählt
export function trackToolDeselected(toolId: string): void {
  analytics.track('tool_deselected', {
    tool_id: toolId
  });
}

// Tool ausgeführt
export function trackToolExecuted(
  chatId: string,
  toolId: string,
  result: ToolResult
): void {
  analytics.track('tool_executed', {
    chat_id: chatId,
    tool_id: toolId,
    tool_name: result.toolName,
    execution_time_ms: result.durationMs,
    success: result.success,
    error_type: result.error?.type
  });
}

// Web-Suche
export function trackWebSearchTriggered(
  chatId: string,
  searchType: 'auto' | 'manual'
): void {
  analytics.track('web_search_triggered', {
    chat_id: chatId,
    trigger_type: searchType,
    results_count: 0 // Updated after results
  });
}

// Bild generiert
export function trackImageGenerated(
  chatId: string,
  model: string,
  success: boolean
): void {
  analytics.track('image_generated', {
    chat_id: chatId,
    generation_model: model,
    success,
    generation_time_ms: 0 // Set actual value
  });
}

// Code ausgeführt
export function trackCodeExecuted(
  chatId: string,
  language: string,
  result: CodeExecutionResult
): void {
  analytics.track('code_executed', {
    chat_id: chatId,
    language,
    execution_time_ms: result.durationMs,
    success: result.success,
    has_output: result.output?.length > 0,
    error_type: result.error?.type
  });
}

// Knowledge Context verwendet
export function trackKnowledgeContextUsed(
  chatId: string,
  knowledgeBaseId: string,
  documentsUsed: number
): void {
  analytics.track('knowledge_context_used', {
    chat_id: chatId,
    knowledge_base_id: knowledgeBaseId,
    documents_retrieved: documentsUsed,
    rag_enabled: true
  });
}
```

---

## 2.5 Interaction Events

### User Interactions mit Nachrichten

```typescript
// src/lib/analytics/events/interaction.events.ts

// Nachricht kopiert
export function trackMessageCopied(chatId: string, messageId: string, role: string): void {
  analytics.track('message_copied', {
    chat_id: chatId,
    message_id: messageId,
    message_role: role, // 'user' | 'assistant'
    copy_method: 'button' // or 'keyboard'
  });
}

// Feedback gegeben
export function trackMessageFeedbackGiven(
  chatId: string,
  messageId: string,
  feedback: 'positive' | 'negative',
  reason?: string
): void {
  analytics.track('message_feedback_given', {
    chat_id: chatId,
    message_id: messageId,
    feedback_type: feedback,
    feedback_reason: reason,
    has_comment: !!reason
  });
}

// Nachricht regeneriert
export function trackMessageRegenerated(chatId: string, messageId: string): void {
  analytics.track('message_regenerated', {
    chat_id: chatId,
    original_message_id: messageId,
    regeneration_count: getRegenerationCount(messageId)
  });
}

// Code Block kopiert
export function trackCodeBlockCopied(
  chatId: string,
  messageId: string,
  language: string,
  codeLength: number
): void {
  analytics.track('code_block_copied', {
    chat_id: chatId,
    message_id: messageId,
    code_language: language,
    code_length: codeLength
  });
}
```

### Integration in Message Component

```svelte
<!-- src/lib/components/chat/Message.svelte -->
<script lang="ts">
  import {
    trackMessageCopied,
    trackMessageFeedbackGiven,
    trackCodeBlockCopied
  } from '$lib/analytics/events/interaction.events';

  function handleCopy() {
    navigator.clipboard.writeText(message.content);
    trackMessageCopied($currentChatId, message.id, message.role);
  }

  function handleFeedback(type: 'positive' | 'negative') {
    trackMessageFeedbackGiven($currentChatId, message.id, type);
    // Submit feedback...
  }

  function handleCodeCopy(codeBlock: CodeBlock) {
    navigator.clipboard.writeText(codeBlock.code);
    trackCodeBlockCopied(
      $currentChatId,
      message.id,
      codeBlock.language,
      codeBlock.code.length
    );
  }
</script>

<div class="message">
  <div class="actions">
    <button on:click={handleCopy}>Copy</button>
    <button on:click={() => handleFeedback('positive')}>👍</button>
    <button on:click={() => handleFeedback('negative')}>👎</button>
  </div>

  {#each codeBlocks as block}
    <CodeBlock {block} onCopy={() => handleCodeCopy(block)} />
  {/each}
</div>
```

---

## 2.6 Agent Events

### Agent-Tracking

```typescript
// src/lib/analytics/events/agent.events.ts

// Agent Card angesehen
export function trackAgentCardViewed(agentId: string, viewContext: string): void {
  analytics.track('agent_card_viewed', {
    agent_id: agentId,
    agent_name: getAgentName(agentId),
    view_context: viewContext, // 'sidebar', 'modal', 'search'
    view_duration_ms: 0 // Set on unmount
  });
}

// Agent ausgewählt
export function trackAgentSelected(
  agentId: string,
  selectionContext: string,
  previousAgentId?: string
): void {
  analytics.track('agent_selected', {
    agent_id: agentId,
    agent_name: getAgentName(agentId),
    agent_category: getAgentCategory(agentId),
    selection_context: selectionContext,
    is_default_agent: isDefaultAgent(agentId),
    previous_agent_id: previousAgentId
  });
}

// Agent während Chat gewechselt
export function trackAgentSwitchedMidChat(
  chatId: string,
  fromAgentId: string,
  toAgentId: string,
  messageCount: number
): void {
  analytics.track('agent_switched_mid_chat', {
    chat_id: chatId,
    from_agent_id: fromAgentId,
    to_agent_id: toAgentId,
    messages_before_switch: messageCount
  });
}

// Agent-Suche
export function trackAgentSearch(
  query: string,
  resultsCount: number,
  selectedAgentId?: string
): void {
  analytics.track('agent_search', {
    search_query_length: query.length,
    results_count: resultsCount,
    selected_from_search: !!selectedAgentId,
    selected_agent_id: selectedAgentId
  });
}
```

### Integration in Agent Selector

```svelte
<!-- src/lib/components/chat/AgentSelector.svelte -->
<script lang="ts">
  import {
    trackAgentSelected,
    trackAgentSearch,
    trackAgentCardViewed
  } from '$lib/analytics/events/agent.events';

  let searchQuery = '';
  let searchResults: Agent[] = [];
  let viewedAgentId: string | null = null;
  let viewStartTime: number | null = null;

  function handleSearch() {
    searchResults = filterAgents(searchQuery);
    // Debounced search tracking
    debouncedTrackSearch();
  }

  const debouncedTrackSearch = debounce(() => {
    if (searchQuery.length >= 2) {
      trackAgentSearch(searchQuery, searchResults.length);
    }
  }, 500);

  function handleAgentSelect(agent: Agent) {
    trackAgentSelected(
      agent.id,
      searchQuery ? 'search' : 'browse',
      $selectedAgent?.id
    );
    selectedAgent.set(agent);
  }

  function handleAgentHover(agent: Agent) {
    viewedAgentId = agent.id;
    viewStartTime = Date.now();
  }

  function handleAgentLeave() {
    if (viewedAgentId && viewStartTime) {
      const duration = Date.now() - viewStartTime;
      if (duration > 500) { // Only track if viewed for >500ms
        trackAgentCardViewed(viewedAgentId, 'selector');
      }
    }
    viewedAgentId = null;
    viewStartTime = null;
  }
</script>
```

---

## 2.7 Helper Functions

### Utility Functions für Chat-Tracking

```typescript
// src/lib/analytics/utils/chat.utils.ts

// Bucket-Einteilung für Längen
export function getBucket(value: number, boundaries: number[]): string {
  for (let i = 0; i < boundaries.length; i++) {
    if (value <= boundaries[i]) {
      const lower = i === 0 ? 0 : boundaries[i - 1];
      return `${lower}-${boundaries[i]}`;
    }
  }
  return `${boundaries[boundaries.length - 1]}+`;
}

// Code-Blöcke erkennen
export function containsCodeBlocks(content: string): boolean {
  return /```[\s\S]*?```/.test(content);
}

// Code-Sprachen extrahieren
export function extractCodeLanguages(content: string): string[] {
  const matches = content.matchAll(/```(\w+)/g);
  return [...new Set([...matches].map(m => m[1]))];
}

// Chat-Dauer berechnen
export function getChatDuration(chatId: string): number {
  // Implementation based on stored chat data
  const chat = getChatById(chatId);
  if (!chat?.createdAt) return 0;
  return Math.round((Date.now() - chat.createdAt) / 60000);
}

// Zeit seit letzter Nachricht
export function getTimeSinceLastMessage(chatId: string): number {
  const chat = getChatById(chatId);
  if (!chat?.messages?.length) return 0;
  const lastMessage = chat.messages[chat.messages.length - 1];
  return Math.round((Date.now() - lastMessage.timestamp) / 60000);
}

// Regeneration Count
const regenerationCounts = new Map<string, number>();

export function getRegenerationCount(messageId: string): number {
  const count = (regenerationCounts.get(messageId) || 0) + 1;
  regenerationCounts.set(messageId, count);
  return count;
}
```

---

## 2.8 Event Index Export

### Zentrale Event-Exports

```typescript
// src/lib/analytics/events/index.ts

// Chat Events
export {
  trackChatCreated,
  trackChatResumed,
  trackChatDeleted,
  trackChatTitleChanged,
  trackChatExported
} from './chat.events';

// Message Events
export {
  trackMessageSent,
  trackMessageWithImage,
  trackMessageWithAudio,
  trackMessageWithFile
} from './message.events';

// Response Events
export {
  trackResponseStreamingStarted,
  trackResponseStreamingCompleted,
  trackResponseReceived,
  trackResponseGenerationStopped
} from './response.events';

// Tool Events
export {
  trackToolSelected,
  trackToolDeselected,
  trackToolExecuted,
  trackWebSearchTriggered,
  trackImageGenerated,
  trackCodeExecuted,
  trackKnowledgeContextUsed
} from './tool.events';

// Interaction Events
export {
  trackMessageCopied,
  trackMessageFeedbackGiven,
  trackMessageRegenerated,
  trackCodeBlockCopied
} from './interaction.events';

// Agent Events
export {
  trackAgentCardViewed,
  trackAgentSelected,
  trackAgentSwitchedMidChat,
  trackAgentSearch
} from './agent.events';
```

---

## 2.9 Testing

### Unit Tests

```typescript
// src/lib/analytics/events/__tests__/chat.events.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analytics } from '../../analytics.service';
import { trackChatCreated, trackMessageSent } from '../chat.events';

vi.mock('../../analytics.service', () => ({
  analytics: {
    track: vi.fn()
  }
}));

describe('Chat Events', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('trackChatCreated', () => {
    it('should track chat creation with agent', () => {
      trackChatCreated('chat-123', 'agent-456');

      expect(analytics.track).toHaveBeenCalledWith('chat_created', {
        chat_id: 'chat-123',
        agent_id: 'agent-456',
        agent_name: expect.any(String),
        initial_context: expect.any(Boolean)
      });
    });

    it('should track chat creation without agent', () => {
      trackChatCreated('chat-123');

      expect(analytics.track).toHaveBeenCalledWith('chat_created', {
        chat_id: 'chat-123',
        agent_id: undefined,
        agent_name: 'default',
        initial_context: expect.any(Boolean)
      });
    });
  });

  describe('trackMessageSent', () => {
    it('should track message with correct properties', () => {
      trackMessageSent({
        chat_id: 'chat-123',
        message_id: 'msg-456',
        message_length: 150,
        has_image: false,
        has_audio: false,
        has_file: true,
        file_types: ['pdf'],
        model_id: 'gpt-4',
        is_regenerate: false,
        input_method: 'keyboard'
      });

      expect(analytics.track).toHaveBeenCalledWith('message_sent', expect.objectContaining({
        chat_id: 'chat-123',
        message_id: 'msg-456',
        has_file: true
      }));
    });

    it('should not include message content', () => {
      trackMessageSent({
        chat_id: 'chat-123',
        message_id: 'msg-456',
        message_length: 150,
        has_image: false,
        has_audio: false,
        has_file: false,
        model_id: 'gpt-4',
        is_regenerate: false,
        input_method: 'keyboard'
      });

      const callArgs = (analytics.track as any).mock.calls[0][1];
      expect(callArgs).not.toHaveProperty('message_content');
      expect(callArgs).not.toHaveProperty('content');
    });
  });
});
```

### E2E Tests

```typescript
// tests/e2e/analytics/chat-tracking.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Chat Analytics', () => {
  test.beforeEach(async ({ page }) => {
    // Accept consent
    await page.goto('/');
    await page.click('[data-testid="consent-accept-all"]');
    await page.waitForTimeout(500);
  });

  test('should track chat creation', async ({ page }) => {
    const analyticsEvents: any[] = [];

    // Intercept analytics calls
    await page.route('**/posthog/**', async (route) => {
      const body = route.request().postDataJSON();
      if (body?.batch) {
        analyticsEvents.push(...body.batch);
      }
      await route.fulfill({ status: 200, body: '{}' });
    });

    // Start new chat
    await page.click('[data-testid="new-chat-button"]');
    await page.waitForTimeout(1000);

    // Verify chat_created event
    const chatCreatedEvent = analyticsEvents.find(e => e.event === 'chat_created');
    expect(chatCreatedEvent).toBeDefined();
    expect(chatCreatedEvent.properties).toHaveProperty('chat_id');
  });

  test('should track message sent', async ({ page }) => {
    const analyticsEvents: any[] = [];

    await page.route('**/posthog/**', async (route) => {
      const body = route.request().postDataJSON();
      if (body?.batch) {
        analyticsEvents.push(...body.batch);
      }
      await route.fulfill({ status: 200, body: '{}' });
    });

    // Send message
    await page.fill('[data-testid="message-input"]', 'Hello, this is a test message');
    await page.click('[data-testid="send-button"]');
    await page.waitForTimeout(1000);

    // Verify message_sent event
    const messageSentEvent = analyticsEvents.find(e => e.event === 'message_sent');
    expect(messageSentEvent).toBeDefined();
    expect(messageSentEvent.properties.message_length).toBeGreaterThan(0);
    expect(messageSentEvent.properties).not.toHaveProperty('message_content');
  });
});
```

---

## 2.10 Erfolgskriterien

### Phase 2 Completion Checklist

- [ ] Alle Chat Lifecycle Events implementiert
- [ ] Message Events mit allen Attachment-Typen
- [ ] Response Events inkl. Streaming-Metriken
- [ ] Tool Events für alle integrierten Tools
- [ ] Interaction Events (Copy, Feedback, Regenerate)
- [ ] Agent Events vollständig
- [ ] Unit Tests mit >80% Coverage
- [ ] E2E Tests für kritische Flows
- [ ] Events in PostHog sichtbar
- [ ] Keine PII in Events

### Validierung in PostHog

```sql
-- Verify chat events are being tracked
SELECT
  event,
  COUNT(*) as count,
  COUNT(DISTINCT properties.chat_id) as unique_chats
FROM events
WHERE event LIKE 'chat_%' OR event LIKE 'message_%'
  AND timestamp > NOW() - INTERVAL 24 HOUR
GROUP BY event
ORDER BY count DESC;
```

---

## Nächste Schritte

Nach Abschluss dieser Phase: [Phase 3: Feature Tracking](./PHASE_3_FEATURES.md)
