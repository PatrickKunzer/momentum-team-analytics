![Momentum Team](../../MomentumTeam-hor.png)

# Settings Events

> **Analytics Documentation** · Version 1.0 · Last updated: 2024-12-06

Events for user settings and preferences.

---

## Übersicht

| Event | Beschreibung | Priorität |
|-------|--------------|-----------|
| `settings_opened` | Settings geöffnet | P2 |
| `settings_section_changed` | Settings-Bereich gewechselt | P2 |
| `theme_changed` | Theme geändert | P2 |
| `language_changed` | Sprache geändert | P1 |
| `chat_direction_changed` | Leserichtung geändert | P3 |
| `notification_setting_changed` | Benachrichtigungen geändert | P2 |
| `conversation_mode_changed` | Konversationsmodus geändert | P2 |
| `auto_title_setting_changed` | Auto-Titel geändert | P3 |
| `stt_engine_changed` | STT-Engine geändert | P2 |
| `tts_engine_changed` | TTS-Engine geändert | P2 |
| `voice_changed` | Stimme geändert | P2 |
| `speech_auto_send_changed` | Auto-Senden geändert | P3 |
| `response_auto_playback_changed` | Auto-Playback geändert | P3 |
| `temperature_changed` | Temperature geändert | P2 |
| `model_parameter_changed` | Model-Parameter geändert | P2 |

---

## Event-Definitionen

### settings_opened

User öffnet Settings-Bereich.

```typescript
interface SettingsOpenedEvent {
  event: 'settings_opened';
  properties: {
    /** Welcher Bereich wurde geöffnet */
    section: 'general' | 'account' | 'knowledge' | 'audio' | 'privacy' | 'advanced';
    /** Von wo wurden Settings geöffnet */
    source: 'sidebar' | 'header_menu' | 'keyboard_shortcut' | 'direct_link';
  };
}
```

---

### settings_section_changed

User wechselt zwischen Settings-Bereichen.

```typescript
interface SettingsSectionChangedEvent {
  event: 'settings_section_changed';
  properties: {
    from_section: string;
    to_section: string;
    /** Zeit im vorherigen Bereich (ms) */
    time_in_previous_ms: number;
  };
}
```

---

### theme_changed

User ändert das Theme.

```typescript
interface ThemeChangedEvent {
  event: 'theme_changed';
  properties: {
    from_theme: 'light' | 'dark' | 'system';
    to_theme: 'light' | 'dark' | 'system';
  };
}
```

---

### language_changed

User ändert die App-Sprache.

```typescript
interface LanguageChangedEvent {
  event: 'language_changed';
  properties: {
    from_locale: string; // z.B. 'de-DE'
    to_locale: string;   // z.B. 'en-US'
  };
}
```

**Dashboard-Nutzung:**
- Language Distribution
- Language Change Patterns

---

### notification_setting_changed

```typescript
interface NotificationSettingChangedEvent {
  event: 'notification_setting_changed';
  properties: {
    setting_type: 'browser_notifications' | 'sound' | 'email';
    enabled: boolean;
  };
}
```

---

### conversation_mode_changed

```typescript
interface ConversationModeChangedEvent {
  event: 'conversation_mode_changed';
  properties: {
    enabled: boolean;
  };
}
```

---

### Audio Settings

#### stt_engine_changed

```typescript
interface STTEngineChangedEvent {
  event: 'stt_engine_changed';
  properties: {
    from_engine: string;
    to_engine: string;
  };
}
```

#### tts_engine_changed

```typescript
interface TTSEngineChangedEvent {
  event: 'tts_engine_changed';
  properties: {
    from_engine: string;
    to_engine: string;
  };
}
```

#### voice_changed

```typescript
interface VoiceChangedEvent {
  event: 'voice_changed';
  properties: {
    voice_id: string;
    voice_name: string;
    /** Ist es eine lokale oder Cloud-Stimme */
    is_local: boolean;
  };
}
```

---

### Model Parameters

#### temperature_changed

```typescript
interface TemperatureChangedEvent {
  event: 'temperature_changed';
  properties: {
    old_value: number;
    new_value: number;
    /** War es der Default-Wert */
    was_default: boolean;
  };
}
```

#### model_parameter_changed

Generisches Event für alle Model-Parameter.

```typescript
interface ModelParameterChangedEvent {
  event: 'model_parameter_changed';
  properties: {
    parameter_name: 'top_k' | 'top_p' | 'num_ctx' | 'num_batch' |
                    'repeat_penalty' | 'seed' | 'system_prompt';
    old_value: string | number | null;
    new_value: string | number;
    /** War es der Default-Wert */
    was_default: boolean;
  };
}
```

---

## TypeScript Export

```typescript
// src/lib/IONOS/analytics/events/settings.events.ts

export type SettingsSection =
  | 'general'
  | 'account'
  | 'knowledge'
  | 'audio'
  | 'privacy'
  | 'advanced';

export type ModelParameter =
  | 'temperature'
  | 'top_k'
  | 'top_p'
  | 'num_ctx'
  | 'num_batch'
  | 'repeat_penalty'
  | 'seed'
  | 'system_prompt';

export type SettingsEvents =
  | SettingsOpenedEvent
  | SettingsSectionChangedEvent
  | ThemeChangedEvent
  | LanguageChangedEvent
  | ChatDirectionChangedEvent
  | NotificationSettingChangedEvent
  | ConversationModeChangedEvent
  | AutoTitleSettingChangedEvent
  | STTEngineChangedEvent
  | TTSEngineChangedEvent
  | VoiceChangedEvent
  | SpeechAutoSendChangedEvent
  | ResponseAutoPlaybackChangedEvent
  | TemperatureChangedEvent
  | ModelParameterChangedEvent;
```

---

## Dashboard-Metriken

### Settings Usage

```sql
-- Most Changed Settings
SELECT
  event,
  COUNT(*) as changes,
  COUNT(DISTINCT user_id) as unique_users
FROM events
WHERE event LIKE '%_changed'
  AND timestamp > NOW() - INTERVAL 30 DAY
GROUP BY event
ORDER BY changes DESC
```

### Language Distribution

```sql
-- Current Language Distribution
SELECT
  properties.to_locale as locale,
  COUNT(DISTINCT user_id) as users
FROM events
WHERE event = 'language_changed'
GROUP BY properties.to_locale
ORDER BY users DESC
```
