![Momentum Team](../../MomentumTeam-hor.png)

# Knowledge Events

> **Analytics Documentation** · Version 1.0 · Last updated: 2024-12-06

Events for Knowledge Hub interactions: files, websites, memories, cloud storage.

---

## Übersicht

| Event | Beschreibung | Priorität |
|-------|--------------|-----------|
| `knowledge_base_created` | Knowledge Base erstellt | P1 |
| `knowledge_base_edited` | Knowledge Base bearbeitet | P2 |
| `knowledge_base_deleted` | Knowledge Base gelöscht | P1 |
| `knowledge_base_reset` | Knowledge Base zurückgesetzt | P2 |
| `knowledge_base_reindexed` | Knowledge Base reindexiert | P2 |
| `file_uploaded` | Datei hochgeladen | P1 |
| `file_deleted` | Datei gelöscht | P2 |
| `directory_uploaded` | Ordner hochgeladen | P2 |
| `web_content_added` | Web-Inhalt hinzugefügt | P1 |
| `youtube_content_added` | YouTube-Inhalt hinzugefügt | P2 |
| `web_content_failed` | Web-Inhalt fehlgeschlagen | P2 |
| `memory_created` | Memory erstellt | P1 |
| `memory_updated` | Memory aktualisiert | P2 |
| `memory_deleted` | Memory gelöscht | P2 |
| `text_content_added` | Text manuell hinzugefügt | P2 |
| `google_drive_file_added` | Google Drive Datei | P2 |
| `onedrive_file_added` | OneDrive Datei | P2 |

---

## Event-Definitionen

### Knowledge Base Lifecycle

#### knowledge_base_created

```typescript
interface KnowledgeBaseCreatedEvent {
  event: 'knowledge_base_created';
  properties: {
    /** Eindeutige Knowledge Base ID */
    knowledge_id: string;
    /** Name der Knowledge Base */
    name: string;
    /** Länge der Beschreibung */
    description_length: number;
    /** Zugriffstyp */
    access_type: 'private' | 'shared' | 'public';
    /** Wurde direkt Inhalt hinzugefügt */
    has_initial_content: boolean;
    /** Quelle der Erstellung */
    source: 'workspace' | 'settings' | 'chat_context';
  };
}
```

**Trigger:** User erstellt neue Knowledge Base

**Code-Location:** `src/lib/IONOS/components/knowledge/CreateKnowledge.svelte`

---

#### knowledge_base_edited

```typescript
interface KnowledgeBaseEditedEvent {
  event: 'knowledge_base_edited';
  properties: {
    knowledge_id: string;
    /** Welche Felder wurden geändert */
    fields_changed: ('name' | 'description' | 'access')[];
    /** Alter der Knowledge Base in Tagen */
    age_days: number;
  };
}
```

---

#### knowledge_base_deleted

```typescript
interface KnowledgeBaseDeletedEvent {
  event: 'knowledge_base_deleted';
  properties: {
    knowledge_id: string;
    /** Anzahl der Dateien die gelöscht wurden */
    file_count: number;
    /** Gesamtgröße in KB */
    total_size_kb: number;
    /** Alter in Tagen */
    age_days: number;
    /** Wie oft wurde sie in Chats verwendet */
    usage_count: number;
  };
}
```

---

#### knowledge_base_reset

```typescript
interface KnowledgeBaseResetEvent {
  event: 'knowledge_base_reset';
  properties: {
    knowledge_id: string;
    /** Anzahl gelöschter Dateien */
    files_removed: number;
    /** Grund für Reset */
    reason: 'user_initiated' | 'error_recovery';
  };
}
```

---

#### knowledge_base_reindexed

```typescript
interface KnowledgeBaseReindexedEvent {
  event: 'knowledge_base_reindexed';
  properties: {
    knowledge_id: string;
    file_count: number;
    /** Reindexierung-Dauer in ms */
    duration_ms: number;
    /** War erfolgreich */
    success: boolean;
  };
}
```

---

### Dateien (Files)

#### file_uploaded ⭐

```typescript
interface FileUploadedEvent {
  event: 'file_uploaded';
  properties: {
    knowledge_id: string;
    /** Dateityp */
    file_type: 'pdf' | 'doc' | 'docx' | 'odt' | 'csv' | 'txt' | 'md' | 'other';
    /** MIME-Type */
    mime_type: string;
    /** Dateigröße in KB */
    file_size_kb: number;
    /** Upload-Methode */
    upload_method: 'drag_drop' | 'file_picker' | 'paste';
    /** Upload-Dauer in ms */
    upload_duration_ms: number;
    /** War Verarbeitung erfolgreich */
    processing_success: boolean;
    /** Anzahl extrahierter Chunks */
    chunks_created: number;
  };
}
```

**Trigger:** Datei zu Knowledge Base hinzugefügt

**Dashboard-Nutzung:**
- File Type Distribution
- Average File Size
- Upload Success Rate
- Processing Time by File Type

---

#### file_deleted

```typescript
interface FileDeletedEvent {
  event: 'file_deleted';
  properties: {
    knowledge_id: string;
    file_id: string;
    file_type: string;
    /** Alter der Datei in Tagen */
    file_age_days: number;
    /** Größe der gelöschten Datei */
    file_size_kb: number;
  };
}
```

---

#### directory_uploaded

```typescript
interface DirectoryUploadedEvent {
  event: 'directory_uploaded';
  properties: {
    knowledge_id: string;
    /** Anzahl hochgeladener Dateien */
    file_count: number;
    /** Gesamtgröße in KB */
    total_size_kb: number;
    /** Dateitypen im Ordner */
    file_types: string[];
    /** Erfolgreich verarbeitet */
    files_processed: number;
    /** Fehlgeschlagen */
    files_failed: number;
  };
}
```

---

### Websites & URLs

#### web_content_added

```typescript
interface WebContentAddedEvent {
  event: 'web_content_added';
  properties: {
    knowledge_id: string;
    /** Domain der URL (ohne Path) */
    url_domain: string;
    /** Content-Typ */
    content_type: 'webpage' | 'article' | 'documentation';
    /** Erfolgreich geladen */
    success: boolean;
    /** Extrahierte Textlänge */
    content_length_chars: number;
    /** Erstellte Chunks */
    chunks_created: number;
    /** Ladezeit in ms */
    load_duration_ms: number;
  };
}
```

**Hinweis:** Vollständige URL wird NICHT getrackt (könnte sensitive Daten enthalten)

---

#### youtube_content_added

```typescript
interface YouTubeContentAddedEvent {
  event: 'youtube_content_added';
  properties: {
    knowledge_id: string;
    /** Video-Dauer in Sekunden */
    video_duration_seconds: number;
    /** Sprache des Transkripts */
    transcript_language: string;
    /** Wurde übersetzt */
    has_translation: boolean;
    /** Zielsprache bei Übersetzung */
    translation_language: string | null;
    /** Erfolgreich verarbeitet */
    success: boolean;
    /** Länge des Transkripts */
    transcript_length_chars: number;
  };
}
```

---

#### web_content_failed

```typescript
interface WebContentFailedEvent {
  event: 'web_content_failed';
  properties: {
    knowledge_id: string;
    /** Domain der fehlgeschlagenen URL */
    url_domain: string;
    /** Fehlertyp */
    error_type: 'ssl_error' | 'timeout' | 'not_found' | 'forbidden' | 'parsing_error' | 'other';
    /** HTTP Status Code wenn verfügbar */
    http_status: number | null;
  };
}
```

---

### Memories

#### memory_created

```typescript
interface MemoryCreatedEvent {
  event: 'memory_created';
  properties: {
    /** Länge des Memory-Textes */
    memory_length_chars: number;
    /** Wie wurde das Memory erstellt */
    source: 'manual' | 'chat_extracted' | 'imported';
    /** Wurde aus einem Chat extrahiert */
    from_chat_id: string | null;
  };
}
```

---

#### memory_updated

```typescript
interface MemoryUpdatedEvent {
  event: 'memory_updated';
  properties: {
    memory_id: string;
    /** Änderung der Länge */
    length_change: number;
    /** Alter des Memories in Tagen */
    memory_age_days: number;
  };
}
```

---

#### memory_deleted

```typescript
interface MemoryDeletedEvent {
  event: 'memory_deleted';
  properties: {
    memory_id: string;
    /** Alter in Tagen */
    memory_age_days: number;
    /** Länge des gelöschten Memories */
    memory_length_chars: number;
  };
}
```

---

### Text Content

#### text_content_added

```typescript
interface TextContentAddedEvent {
  event: 'text_content_added';
  properties: {
    knowledge_id: string;
    /** Länge des Textes */
    text_length_chars: number;
    /** Eingabemethode */
    input_method: 'modal' | 'paste' | 'import';
    /** Erstellte Chunks */
    chunks_created: number;
  };
}
```

---

### Cloud Storage Integration

#### google_drive_file_added

```typescript
interface GoogleDriveFileAddedEvent {
  event: 'google_drive_file_added';
  properties: {
    knowledge_id: string;
    /** Dateityp */
    file_type: string;
    /** Größe in KB */
    file_size_kb: number;
    /** Google Docs/Sheets/Slides oder Upload */
    is_google_native: boolean;
    /** Erfolgreich verarbeitet */
    success: boolean;
    /** Verarbeitungszeit in ms */
    processing_duration_ms: number;
  };
}
```

---

#### onedrive_file_added

```typescript
interface OneDriveFileAddedEvent {
  event: 'onedrive_file_added';
  properties: {
    knowledge_id: string;
    file_type: string;
    file_size_kb: number;
    /** Office Online Dokument */
    is_office_online: boolean;
    success: boolean;
    processing_duration_ms: number;
  };
}
```

---

## TypeScript Export

```typescript
// src/lib/IONOS/analytics/events/knowledge.events.ts

export type KnowledgeEvents =
  | KnowledgeBaseCreatedEvent
  | KnowledgeBaseEditedEvent
  | KnowledgeBaseDeletedEvent
  | KnowledgeBaseResetEvent
  | KnowledgeBaseReindexedEvent
  | FileUploadedEvent
  | FileDeletedEvent
  | DirectoryUploadedEvent
  | WebContentAddedEvent
  | YouTubeContentAddedEvent
  | WebContentFailedEvent
  | MemoryCreatedEvent
  | MemoryUpdatedEvent
  | MemoryDeletedEvent
  | TextContentAddedEvent
  | GoogleDriveFileAddedEvent
  | OneDriveFileAddedEvent;
```

---

## Dashboard-Metriken

### Knowledge Base Adoption

```sql
-- PostHog Query: Knowledge Base Creation Funnel
SELECT
  COUNT(DISTINCT user_id) as users,
  COUNT(CASE WHEN event = 'knowledge_base_created' THEN 1 END) as created,
  COUNT(CASE WHEN event = 'file_uploaded' THEN 1 END) as uploaded_file,
  COUNT(CASE WHEN event = 'knowledge_context_used' THEN 1 END) as used_in_chat
FROM events
WHERE timestamp > NOW() - INTERVAL 30 DAY
```

### Content Type Distribution

```sql
-- Welche Inhaltstypen werden am meisten genutzt
SELECT
  CASE
    WHEN event = 'file_uploaded' THEN properties.file_type
    WHEN event = 'web_content_added' THEN 'website'
    WHEN event = 'youtube_content_added' THEN 'youtube'
    WHEN event = 'memory_created' THEN 'memory'
    WHEN event = 'text_content_added' THEN 'text'
    WHEN event LIKE '%drive%' THEN 'cloud_storage'
  END as content_type,
  COUNT(*) as count
FROM events
WHERE event IN ('file_uploaded', 'web_content_added', 'youtube_content_added',
                'memory_created', 'text_content_added', 'google_drive_file_added',
                'onedrive_file_added')
GROUP BY content_type
ORDER BY count DESC
```

### File Type Breakdown

```sql
-- Welche Dateitypen werden hochgeladen
SELECT
  properties.file_type,
  COUNT(*) as uploads,
  AVG(properties.file_size_kb) as avg_size_kb,
  AVG(properties.chunks_created) as avg_chunks
FROM events
WHERE event = 'file_uploaded'
GROUP BY properties.file_type
ORDER BY uploads DESC
```

---

## Implementation Example

```typescript
// In KnowledgeUpload.svelte
import { analytics } from '$lib/IONOS/analytics';

async function uploadFile(file: File) {
  const startTime = performance.now();

  try {
    const result = await knowledgeService.uploadFile(knowledgeId, file);

    analytics.track({
      event: 'file_uploaded',
      properties: {
        knowledge_id: knowledgeId,
        file_type: getFileExtension(file.name),
        mime_type: file.type,
        file_size_kb: Math.round(file.size / 1024),
        upload_method: lastDragEvent ? 'drag_drop' : 'file_picker',
        upload_duration_ms: Math.round(performance.now() - startTime),
        processing_success: true,
        chunks_created: result.chunks_count,
      }
    });
  } catch (error) {
    analytics.track({
      event: 'file_uploaded',
      properties: {
        knowledge_id: knowledgeId,
        file_type: getFileExtension(file.name),
        mime_type: file.type,
        file_size_kb: Math.round(file.size / 1024),
        upload_method: lastDragEvent ? 'drag_drop' : 'file_picker',
        upload_duration_ms: Math.round(performance.now() - startTime),
        processing_success: false,
        chunks_created: 0,
      }
    });
  }
}
```
