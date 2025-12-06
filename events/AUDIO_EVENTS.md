![Momentum Team](../../MomentumTeam-hor.png)

# Audio Events

> **Analytics Documentation** · Version 1.0 · Last updated: 2024-12-06

Events for audio features: STT (Speech-to-Text) and TTS (Text-to-Speech).

---

## Übersicht

| Event | Beschreibung | Priorität |
|-------|--------------|-----------|
| `audio_recording_started` | Aufnahme gestartet | P2 |
| `audio_recording_completed` | Aufnahme beendet | P2 |
| `audio_transcription_requested` | Transkription angefordert | P1 |
| `audio_transcription_completed` | Transkription fertig | P1 |
| `tts_playback_started` | TTS gestartet | P2 |
| `tts_playback_completed` | TTS beendet | P2 |
| `tts_playback_stopped` | TTS gestoppt | P2 |

---

## Event-Definitionen

### Speech-to-Text (STT)

#### audio_recording_started

```typescript
interface AudioRecordingStartedEvent {
  event: 'audio_recording_started';
  properties: {
    chat_id: string;
    /** Aufnahme-Quelle */
    source: 'microphone' | 'system_audio';
  };
}
```

#### audio_recording_completed

```typescript
interface AudioRecordingCompletedEvent {
  event: 'audio_recording_completed';
  properties: {
    chat_id: string;
    /** Dauer in Sekunden */
    duration_seconds: number;
    /** Größe in KB */
    file_size_kb: number;
    /** Audio-Format */
    format: 'webm' | 'mp3' | 'wav';
  };
}
```

#### audio_transcription_completed ⭐

```typescript
interface AudioTranscriptionCompletedEvent {
  event: 'audio_transcription_completed';
  properties: {
    chat_id: string;
    /** Audio-Dauer in Sekunden */
    audio_duration_seconds: number;
    /** Verarbeitungszeit in ms */
    processing_duration_ms: number;
    /** Länge des transkribierten Texts */
    text_length_chars: number;
    /** Erkannte Sprache */
    detected_language: string;
    /** Erfolgreich */
    success: boolean;
    /** Verwendete Engine */
    engine: string;
  };
}
```

---

### Text-to-Speech (TTS)

#### tts_playback_started

```typescript
interface TTSPlaybackStartedEvent {
  event: 'tts_playback_started';
  properties: {
    chat_id: string;
    message_id: string;
    /** Länge des zu sprechenden Texts */
    text_length_chars: number;
    /** Verwendete Stimme */
    voice_id: string;
    /** Ist automatische Wiedergabe */
    is_auto_playback: boolean;
  };
}
```

#### tts_playback_completed

```typescript
interface TTSPlaybackCompletedEvent {
  event: 'tts_playback_completed';
  properties: {
    chat_id: string;
    message_id: string;
    /** Wiedergabe-Dauer in Sekunden */
    duration_seconds: number;
    /** War es vollständig */
    completed_full: boolean;
  };
}
```

#### tts_playback_stopped

```typescript
interface TTSPlaybackStoppedEvent {
  event: 'tts_playback_stopped';
  properties: {
    chat_id: string;
    message_id: string;
    /** Bei wieviel Prozent gestoppt */
    stopped_at_percent: number;
    /** Grund */
    stop_reason: 'user_click' | 'new_message' | 'navigation' | 'error';
  };
}
```

---

## TypeScript Export

```typescript
// src/lib/IONOS/analytics/events/audio.events.ts

export type AudioEvents =
  | AudioRecordingStartedEvent
  | AudioRecordingCompletedEvent
  | AudioTranscriptionRequestedEvent
  | AudioTranscriptionCompletedEvent
  | TTSPlaybackStartedEvent
  | TTSPlaybackCompletedEvent
  | TTSPlaybackStoppedEvent;
```

---

## Dashboard-Metriken

### Audio Feature Usage

```sql
-- STT vs TTS Usage
SELECT
  CASE
    WHEN event LIKE 'audio_%' THEN 'STT'
    WHEN event LIKE 'tts_%' THEN 'TTS'
  END as feature,
  COUNT(*) as usage_count,
  COUNT(DISTINCT user_id) as unique_users
FROM events
WHERE event LIKE 'audio_%' OR event LIKE 'tts_%'
GROUP BY feature
```

### Transcription Success Rate

```sql
SELECT
  properties.engine,
  COUNT(*) as total,
  SUM(CASE WHEN properties.success THEN 1 ELSE 0 END) as successful,
  AVG(properties.processing_duration_ms) as avg_duration_ms
FROM events
WHERE event = 'audio_transcription_completed'
GROUP BY properties.engine
```
