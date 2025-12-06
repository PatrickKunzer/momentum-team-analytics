![Momentum Team](../../MomentumTeam-hor.png)

# Phase 3: Feature Tracking

> **Analytics Documentation** · Version 1.0 · Last updated: 2024-12-06

Tracking all features outside the chat context.

---

## Overview

This phase implements tracking for Knowledge Hub, Integrations, Settings, Workspace, Audio, and Navigation.

---

## Voraussetzungen

- [ ] Phase 1 & 2 vollständig abgeschlossen
- [ ] Chat-Tracking funktioniert
- [ ] Event-Struktur etabliert

---

## 3.1 Knowledge Hub Events

### Datei-Events

```typescript
// src/lib/analytics/events/knowledge.events.ts

import { analytics } from '../analytics.service';

// Knowledge Base erstellt
export function trackKnowledgeBaseCreated(
  knowledgeBaseId: string,
  name: string,
  description?: string
): void {
  analytics.track('knowledge_base_created', {
    knowledge_base_id: knowledgeBaseId,
    name_length: name.length,
    has_description: !!description
  });
}

// Knowledge Base bearbeitet
export function trackKnowledgeBaseEdited(
  knowledgeBaseId: string,
  changes: string[]
): void {
  analytics.track('knowledge_base_edited', {
    knowledge_base_id: knowledgeBaseId,
    changed_fields: changes // ['name', 'description', 'settings']
  });
}

// Knowledge Base gelöscht
export function trackKnowledgeBaseDeleted(
  knowledgeBaseId: string,
  fileCount: number,
  totalSizeKb: number
): void {
  analytics.track('knowledge_base_deleted', {
    knowledge_base_id: knowledgeBaseId,
    file_count: fileCount,
    total_size_kb: totalSizeKb
  });
}

// Datei hochgeladen
export function trackFileUploaded(
  knowledgeBaseId: string,
  fileInfo: FileUploadInfo
): void {
  analytics.track('file_uploaded', {
    knowledge_base_id: knowledgeBaseId,
    file_type: fileInfo.type, // 'pdf', 'doc', 'docx', 'odt', 'csv', 'txt'
    file_size_kb: Math.round(fileInfo.size / 1024),
    file_extension: fileInfo.extension,
    upload_source: fileInfo.source, // 'drag_drop', 'file_picker', 'paste'
    processing_time_ms: fileInfo.processingTime
  });
}

// Datei gelöscht
export function trackFileDeleted(
  knowledgeBaseId: string,
  fileId: string,
  fileType: string
): void {
  analytics.track('file_deleted', {
    knowledge_base_id: knowledgeBaseId,
    file_id: fileId,
    file_type: fileType
  });
}

// Verzeichnis hochgeladen
export function trackDirectoryUploaded(
  knowledgeBaseId: string,
  fileCount: number,
  totalSizeKb: number,
  fileTypes: string[]
): void {
  analytics.track('directory_uploaded', {
    knowledge_base_id: knowledgeBaseId,
    file_count: fileCount,
    total_size_kb: totalSizeKb,
    file_types: [...new Set(fileTypes)],
    unique_types_count: new Set(fileTypes).size
  });
}
```

### Web Content Events

```typescript
// Web-Inhalt hinzugefügt
export function trackWebContentAdded(
  knowledgeBaseId: string,
  url: string,
  success: boolean
): void {
  analytics.track('web_content_added', {
    knowledge_base_id: knowledgeBaseId,
    url_domain: extractDomain(url),
    success,
    content_type: 'website'
  });
}

// YouTube-Inhalt hinzugefügt
export function trackYoutubeContentAdded(
  knowledgeBaseId: string,
  videoId: string,
  success: boolean,
  durationSeconds?: number
): void {
  analytics.track('youtube_content_added', {
    knowledge_base_id: knowledgeBaseId,
    video_duration_minutes: durationSeconds ? Math.round(durationSeconds / 60) : null,
    has_transcript: success,
    success
  });
}
```

### Memory Events

```typescript
// Memory erstellt
export function trackMemoryCreated(
  memoryId: string,
  contentLength: number,
  source: string
): void {
  analytics.track('memory_created', {
    memory_id: memoryId,
    content_length: contentLength,
    content_length_bucket: getBucket(contentLength, [100, 500, 1000, 5000]),
    source // 'manual', 'chat_extract', 'import'
  });
}

// Memory bearbeitet
export function trackMemoryEdited(memoryId: string): void {
  analytics.track('memory_edited', {
    memory_id: memoryId
  });
}

// Memory gelöscht
export function trackMemoryDeleted(memoryId: string): void {
  analytics.track('memory_deleted', {
    memory_id: memoryId
  });
}
```

### Cloud Storage Events

```typescript
// Google Drive Datei hinzugefügt
export function trackGoogleDriveFileAdded(
  knowledgeBaseId: string,
  fileType: string,
  fileSizeKb: number
): void {
  analytics.track('google_drive_file_added', {
    knowledge_base_id: knowledgeBaseId,
    file_type: fileType,
    file_size_kb: fileSizeKb,
    provider: 'google_drive'
  });
}

// OneDrive Datei hinzugefügt
export function trackOneDriveFileAdded(
  knowledgeBaseId: string,
  fileType: string,
  fileSizeKb: number
): void {
  analytics.track('onedrive_file_added', {
    knowledge_base_id: knowledgeBaseId,
    file_type: fileType,
    file_size_kb: fileSizeKb,
    provider: 'onedrive'
  });
}
```

### Integration in Knowledge Hub Components

```svelte
<!-- src/lib/components/knowledge/FileUploader.svelte -->
<script lang="ts">
  import {
    trackFileUploaded,
    trackDirectoryUploaded
  } from '$lib/analytics/events/knowledge.events';

  async function handleFileUpload(files: FileList) {
    const startTime = Date.now();

    for (const file of files) {
      try {
        await uploadFile(file);

        trackFileUploaded($currentKnowledgeBaseId, {
          type: getFileType(file.name),
          size: file.size,
          extension: getExtension(file.name),
          source: 'file_picker',
          processingTime: Date.now() - startTime
        });
      } catch (error) {
        // Track error...
      }
    }
  }

  function handleDrop(event: DragEvent) {
    const items = event.dataTransfer?.items;
    if (!items) return;

    // Check if directory
    const entry = items[0].webkitGetAsEntry();
    if (entry?.isDirectory) {
      handleDirectoryUpload(entry);
    } else {
      handleFileUpload(event.dataTransfer.files);
    }
  }
</script>
```

---

## 3.2 Integration Events

### OAuth Flow Events

```typescript
// src/lib/analytics/events/integration.events.ts

// Integration angesehen
export function trackIntegrationViewed(
  integrationId: string,
  provider: string
): void {
  analytics.track('integration_viewed', {
    integration_id: integrationId,
    provider, // 'google', 'microsoft', 'meta', etc.
    integration_category: getCategory(provider)
  });
}

// Connect Button geklickt
export function trackIntegrationConnectClicked(
  integrationId: string,
  provider: string
): void {
  analytics.track('integration_connect_clicked', {
    integration_id: integrationId,
    provider
  });
}

// OAuth gestartet
export function trackIntegrationOAuthStarted(
  integrationId: string,
  provider: string
): void {
  analytics.track('integration_oauth_started', {
    integration_id: integrationId,
    provider,
    timestamp: Date.now()
  });
}

// OAuth erfolgreich
export function trackIntegrationOAuthCompleted(
  integrationId: string,
  provider: string,
  durationMs: number,
  scopes: string[]
): void {
  analytics.track('integration_oauth_completed', {
    integration_id: integrationId,
    provider,
    oauth_duration_ms: durationMs,
    scopes_granted: scopes,
    scope_count: scopes.length
  });
}

// OAuth fehlgeschlagen
export function trackIntegrationOAuthFailed(
  integrationId: string,
  provider: string,
  errorType: string
): void {
  analytics.track('integration_oauth_failed', {
    integration_id: integrationId,
    provider,
    error_type: errorType // 'user_denied', 'timeout', 'server_error'
  });
}

// Integration getrennt
export function trackIntegrationDisconnected(
  integrationId: string,
  provider: string,
  reason: string
): void {
  analytics.track('integration_disconnected', {
    integration_id: integrationId,
    provider,
    disconnect_reason: reason // 'user_initiated', 'token_expired', 'revoked'
  });
}

// Integration im Chat verwendet
export function trackIntegrationUsedInChat(
  chatId: string,
  integrationId: string,
  provider: string,
  action: string
): void {
  analytics.track('integration_used_in_chat', {
    chat_id: chatId,
    integration_id: integrationId,
    provider,
    action // 'file_access', 'data_fetch', 'send_message'
  });
}
```

### Provider-spezifische Kategorisierung

```typescript
// src/lib/analytics/utils/integration.utils.ts

type IntegrationCategory =
  | 'cloud_storage'
  | 'productivity'
  | 'social'
  | 'developer'
  | 'communication'
  | 'other';

const PROVIDER_CATEGORIES: Record<string, IntegrationCategory> = {
  google_drive: 'cloud_storage',
  onedrive: 'cloud_storage',
  dropbox: 'cloud_storage',
  notion: 'productivity',
  google_docs: 'productivity',
  google_sheets: 'productivity',
  google_calendar: 'productivity',
  gmail: 'communication',
  outlook: 'communication',
  slack: 'communication',
  teams: 'communication',
  github: 'developer',
  gitlab: 'developer',
  jira: 'developer',
  linkedin: 'social',
  facebook: 'social',
  instagram: 'social'
};

export function getCategory(provider: string): IntegrationCategory {
  return PROVIDER_CATEGORIES[provider] || 'other';
}
```

### Integration in OAuth Modal

```svelte
<!-- src/lib/components/integrations/GoogleConnectModal.svelte -->
<script lang="ts">
  import {
    trackIntegrationConnectClicked,
    trackIntegrationOAuthStarted,
    trackIntegrationOAuthCompleted,
    trackIntegrationOAuthFailed
  } from '$lib/analytics/events/integration.events';

  let oauthStartTime: number;

  async function handleConnect() {
    trackIntegrationConnectClicked(integration.id, 'google');

    oauthStartTime = Date.now();
    trackIntegrationOAuthStarted(integration.id, 'google');

    try {
      const result = await initiateOAuth('google');

      trackIntegrationOAuthCompleted(
        integration.id,
        'google',
        Date.now() - oauthStartTime,
        result.scopes
      );

      closeModal();
    } catch (error) {
      trackIntegrationOAuthFailed(
        integration.id,
        'google',
        categorizeOAuthError(error)
      );
    }
  }
</script>
```

---

## 3.3 Settings Events

### Theme & UI Events

```typescript
// src/lib/analytics/events/settings.events.ts

// Settings geöffnet
export function trackSettingsOpened(section?: string): void {
  analytics.track('settings_opened', {
    initial_section: section || 'general'
  });
}

// Theme geändert
export function trackThemeChanged(
  fromTheme: string,
  toTheme: string
): void {
  analytics.track('theme_changed', {
    from_theme: fromTheme,
    to_theme: toTheme, // 'light', 'dark', 'system', 'oled'
    change_source: 'settings'
  });
}

// Sprache geändert
export function trackLanguageChanged(
  fromLanguage: string,
  toLanguage: string
): void {
  analytics.track('language_changed', {
    from_language: fromLanguage,
    to_language: toLanguage
  });
}
```

### Model Parameter Events

```typescript
// Model-Parameter geändert
export function trackModelParameterChanged(
  parameter: string,
  fromValue: any,
  toValue: any
): void {
  analytics.track('model_parameter_changed', {
    parameter_name: parameter, // 'temperature', 'max_tokens', 'top_p', etc.
    from_value: sanitizeParameterValue(fromValue),
    to_value: sanitizeParameterValue(toValue)
  });
}

// System Prompt geändert
export function trackSystemPromptChanged(
  promptLength: number,
  isDefault: boolean
): void {
  analytics.track('system_prompt_changed', {
    prompt_length: promptLength,
    is_default: isDefault,
    has_custom_prompt: !isDefault
  });
}

// Default Model geändert
export function trackDefaultModelChanged(
  fromModel: string,
  toModel: string
): void {
  analytics.track('default_model_changed', {
    from_model: fromModel,
    to_model: toModel
  });
}
```

### Preference Events

```typescript
// Chat-Einstellung geändert
export function trackChatPreferenceChanged(
  preference: string,
  value: boolean | string | number
): void {
  analytics.track('chat_preference_changed', {
    preference_name: preference,
    preference_value: value,
    preference_type: typeof value
  });
}

// Notification-Einstellung geändert
export function trackNotificationSettingChanged(
  setting: string,
  enabled: boolean
): void {
  analytics.track('notification_setting_changed', {
    setting_name: setting,
    enabled
  });
}

// Privacy-Einstellung geändert
export function trackPrivacySettingChanged(
  setting: string,
  value: boolean
): void {
  analytics.track('privacy_setting_changed', {
    setting_name: setting,
    setting_value: value
  });
}
```

---

## 3.4 Workspace Events

### Model Events

```typescript
// src/lib/analytics/events/workspace.events.ts

// Model erstellt
export function trackModelCreated(
  modelId: string,
  baseModel: string,
  hasCustomParams: boolean
): void {
  analytics.track('model_created', {
    model_id: modelId,
    base_model: baseModel,
    has_custom_parameters: hasCustomParams
  });
}

// Model bearbeitet
export function trackModelEdited(modelId: string, changes: string[]): void {
  analytics.track('model_edited', {
    model_id: modelId,
    changed_fields: changes
  });
}

// Model gelöscht
export function trackModelDeleted(modelId: string): void {
  analytics.track('model_deleted', {
    model_id: modelId
  });
}
```

### Prompt Events

```typescript
// Prompt erstellt
export function trackPromptCreated(
  promptId: string,
  promptLength: number,
  hasVariables: boolean
): void {
  analytics.track('prompt_created', {
    prompt_id: promptId,
    prompt_length: promptLength,
    has_variables: hasVariables,
    variable_count: hasVariables ? countVariables(promptId) : 0
  });
}

// Prompt verwendet
export function trackPromptUsed(
  promptId: string,
  chatId: string,
  variablesUsed: number
): void {
  analytics.track('prompt_used', {
    prompt_id: promptId,
    chat_id: chatId,
    variables_filled: variablesUsed
  });
}

// Prompt bearbeitet
export function trackPromptEdited(promptId: string): void {
  analytics.track('prompt_edited', {
    prompt_id: promptId
  });
}

// Prompt gelöscht
export function trackPromptDeleted(promptId: string): void {
  analytics.track('prompt_deleted', {
    prompt_id: promptId
  });
}
```

### Tool Events

```typescript
// Tool erstellt
export function trackToolCreated(
  toolId: string,
  toolType: string
): void {
  analytics.track('tool_created', {
    tool_id: toolId,
    tool_type: toolType // 'function', 'api', 'script'
  });
}

// Function erstellt
export function trackFunctionCreated(
  functionId: string,
  language: string
): void {
  analytics.track('function_created', {
    function_id: functionId,
    language // 'python', 'javascript'
  });
}
```

---

## 3.5 Audio Events

```typescript
// src/lib/analytics/events/audio.events.ts

// Audio-Aufnahme gestartet
export function trackAudioRecordingStarted(
  context: string
): void {
  analytics.track('audio_recording_started', {
    context, // 'chat_input', 'voice_note'
    timestamp: Date.now()
  });
}

// Audio-Aufnahme abgeschlossen
export function trackAudioRecordingCompleted(
  durationSeconds: number,
  fileSize: number
): void {
  analytics.track('audio_recording_completed', {
    duration_seconds: durationSeconds,
    file_size_kb: Math.round(fileSize / 1024)
  });
}

// Audio-Aufnahme abgebrochen
export function trackAudioRecordingCancelled(
  durationSeconds: number
): void {
  analytics.track('audio_recording_cancelled', {
    duration_at_cancel_seconds: durationSeconds
  });
}

// Transkription abgeschlossen
export function trackAudioTranscriptionCompleted(
  audioDurationSeconds: number,
  transcriptLength: number,
  processingTimeMs: number
): void {
  analytics.track('audio_transcription_completed', {
    audio_duration_seconds: audioDurationSeconds,
    transcript_length: transcriptLength,
    processing_time_ms: processingTimeMs,
    characters_per_second: transcriptLength / audioDurationSeconds
  });
}

// Transkription fehlgeschlagen
export function trackAudioTranscriptionFailed(
  errorType: string
): void {
  analytics.track('audio_transcription_failed', {
    error_type: errorType
  });
}

// TTS Wiedergabe gestartet
export function trackTTSPlaybackStarted(
  messageId: string,
  textLength: number
): void {
  analytics.track('tts_playback_started', {
    message_id: messageId,
    text_length: textLength
  });
}

// TTS Wiedergabe abgeschlossen
export function trackTTSPlaybackCompleted(
  messageId: string,
  durationSeconds: number,
  completedFully: boolean
): void {
  analytics.track('tts_playback_completed', {
    message_id: messageId,
    duration_seconds: durationSeconds,
    completed_fully: completedFully
  });
}
```

---

## 3.6 Navigation Events

```typescript
// src/lib/analytics/events/navigation.events.ts

// Sidebar geöffnet/geschlossen
export function trackSidebarToggled(isOpen: boolean): void {
  analytics.track('sidebar_toggled', {
    is_open: isOpen,
    toggle_method: 'button' // or 'keyboard', 'swipe'
  });
}

// Help geklickt
export function trackHelpClicked(helpType: string): void {
  analytics.track('help_clicked', {
    help_type: helpType // 'docs', 'support', 'faq', 'tour'
  });
}

// Keyboard Shortcut verwendet
export function trackKeyboardShortcutUsed(shortcut: string, action: string): void {
  analytics.track('keyboard_shortcut_used', {
    shortcut, // 'ctrl+k', 'ctrl+/', etc.
    action // 'search', 'new_chat', 'settings'
  });
}

// External Link geklickt
export function trackExternalLinkClicked(url: string, context: string): void {
  analytics.track('external_link_clicked', {
    link_domain: extractDomain(url),
    context // 'footer', 'help', 'integration', 'message'
  });
}

// Survey gestartet
export function trackSurveyStarted(surveyId: string, surveyType: string): void {
  analytics.track('survey_started', {
    survey_id: surveyId,
    survey_type: surveyType
  });
}

// Survey abgeschlossen
export function trackSurveyCompleted(
  surveyId: string,
  completionTimeSeconds: number,
  questionsAnswered: number
): void {
  analytics.track('survey_completed', {
    survey_id: surveyId,
    completion_time_seconds: completionTimeSeconds,
    questions_answered: questionsAnswered
  });
}

// Survey abgebrochen
export function trackSurveyAbandoned(
  surveyId: string,
  questionsAnswered: number,
  lastQuestion: number
): void {
  analytics.track('survey_abandoned', {
    survey_id: surveyId,
    questions_answered: questionsAnswered,
    abandoned_at_question: lastQuestion
  });
}
```

---

## 3.7 Account Events

```typescript
// src/lib/analytics/events/account.events.ts

// Signup gestartet
export function trackSignupStarted(method: string): void {
  analytics.track('signup_started', {
    signup_method: method, // 'email', 'google', 'microsoft'
    referrer: document.referrer,
    landing_page: window.location.pathname
  });
}

// Signup abgeschlossen
export function trackSignupCompleted(method: string): void {
  analytics.track('signup_completed', {
    signup_method: method,
    signup_duration_seconds: getSignupDuration()
  });
}

// Login erfolgreich
export function trackLoginSucceeded(method: string): void {
  analytics.track('login_succeeded', {
    login_method: method
  });
}

// Login fehlgeschlagen
export function trackLoginFailed(method: string, errorType: string): void {
  analytics.track('login_failed', {
    login_method: method,
    error_type: errorType // 'invalid_credentials', 'account_locked', 'network_error'
  });
}

// Logout
export function trackLogout(reason: string): void {
  analytics.track('logout', {
    logout_reason: reason // 'user_initiated', 'session_expired', 'security'
  });
}

// Account gelöscht
export function trackAccountDeleted(reason?: string): void {
  analytics.track('account_deleted', {
    deletion_reason: reason,
    account_age_days: getAccountAgeDays()
  });
}

// Profil aktualisiert
export function trackProfileUpdated(fields: string[]): void {
  analytics.track('profile_updated', {
    updated_fields: fields
  });
}

// Passwort geändert
export function trackPasswordChanged(): void {
  analytics.track('password_changed', {});
}
```

---

## 3.8 PWA Events

```typescript
// src/lib/analytics/events/pwa.events.ts

// Install Banner angezeigt
export function trackPWAInstallBannerShown(): void {
  analytics.track('pwa_install_banner_shown', {
    platform: getPlatform(),
    browser: getBrowser()
  });
}

// PWA installiert
export function trackPWAInstalled(): void {
  analytics.track('pwa_installed', {
    platform: getPlatform(),
    browser: getBrowser(),
    install_source: 'banner' // or 'browser_prompt'
  });
}

// Install Banner geschlossen
export function trackPWAInstallBannerDismissed(reason: string): void {
  analytics.track('pwa_install_banner_dismissed', {
    dismiss_reason: reason // 'close_button', 'outside_click', 'later'
  });
}

// PWA gestartet
export function trackPWALaunched(): void {
  analytics.track('pwa_launched', {
    display_mode: getDisplayMode(), // 'standalone', 'browser'
    launch_source: getLaunchSource()
  });
}

// Offline-Modus aktiviert
export function trackOfflineModeActivated(): void {
  analytics.track('offline_mode_activated', {
    pending_actions: getPendingActionsCount()
  });
}

// Online zurück
export function trackOnlineRestored(offlineDurationSeconds: number): void {
  analytics.track('online_restored', {
    offline_duration_seconds: offlineDurationSeconds,
    synced_events: getSyncedEventsCount()
  });
}
```

### PWA Detection Utilities

```typescript
// src/lib/analytics/utils/pwa.utils.ts

export function getDisplayMode(): string {
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return 'standalone';
  }
  if (window.matchMedia('(display-mode: fullscreen)').matches) {
    return 'fullscreen';
  }
  return 'browser';
}

export function getPlatform(): string {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua)) return 'ios';
  if (/Android/.test(ua)) return 'android';
  if (/Windows/.test(ua)) return 'windows';
  if (/Mac/.test(ua)) return 'macos';
  if (/Linux/.test(ua)) return 'linux';
  return 'unknown';
}

export function getBrowser(): string {
  const ua = navigator.userAgent;
  if (/Chrome/.test(ua) && !/Chromium|Edge/.test(ua)) return 'chrome';
  if (/Firefox/.test(ua)) return 'firefox';
  if (/Safari/.test(ua) && !/Chrome/.test(ua)) return 'safari';
  if (/Edge/.test(ua)) return 'edge';
  return 'other';
}
```

---

## 3.9 Error Events

```typescript
// src/lib/analytics/events/error.events.ts

// Client Error
export function trackClientError(error: Error, context: string): void {
  analytics.track('client_error', {
    error_type: error.name,
    error_message: sanitizeErrorMessage(error.message),
    error_stack_hash: hashStackTrace(error.stack),
    context,
    url: window.location.pathname,
    component: getCurrentComponent()
  });
}

// API Error
export function trackAPIError(
  endpoint: string,
  statusCode: number,
  errorType: string
): void {
  analytics.track('api_error', {
    endpoint: sanitizeEndpoint(endpoint),
    status_code: statusCode,
    error_category: categorizeHTTPError(statusCode),
    error_type: errorType
  });
}

// WebSocket Error
export function trackWebSocketError(errorType: string, reconnectAttempt: number): void {
  analytics.track('websocket_error', {
    error_type: errorType,
    reconnect_attempt: reconnectAttempt
  });
}

// Unhandled Promise Rejection
export function trackUnhandledRejection(reason: any): void {
  analytics.track('unhandled_rejection', {
    error_type: typeof reason,
    error_message: sanitizeErrorMessage(String(reason))
  });
}
```

### Global Error Handler Setup

```typescript
// src/lib/analytics/handlers/error.handler.ts

import { trackClientError, trackUnhandledRejection } from '../events/error.events';

export function setupGlobalErrorHandlers(): void {
  // JavaScript Errors
  window.onerror = (message, source, lineno, colno, error) => {
    if (error) {
      trackClientError(error, 'global_error_handler');
    }
    return false; // Don't suppress error
  };

  // Unhandled Promise Rejections
  window.onunhandledrejection = (event) => {
    trackUnhandledRejection(event.reason);
  };
}
```

---

## 3.10 Erfolgskriterien

### Phase 3 Completion Checklist

- [ ] Knowledge Hub Events vollständig
  - [ ] File Upload/Delete
  - [ ] Web Content
  - [ ] YouTube
  - [ ] Memories
  - [ ] Cloud Storage
- [ ] Integration Events vollständig
  - [ ] OAuth Flow tracking
  - [ ] Disconnect tracking
  - [ ] Usage in Chat
- [ ] Settings Events implementiert
- [ ] Workspace Events implementiert
- [ ] Audio Events implementiert
- [ ] Navigation Events implementiert
- [ ] Account Events implementiert
- [ ] PWA Events implementiert
- [ ] Error Events mit Global Handler
- [ ] Unit Tests für alle Event-Module
- [ ] Events in PostHog sichtbar

### PostHog Validation Query

```sql
-- Verify feature events are being tracked
SELECT
  event,
  COUNT(*) as count
FROM events
WHERE event IN (
  'file_uploaded',
  'knowledge_base_created',
  'integration_oauth_completed',
  'theme_changed',
  'prompt_created',
  'audio_recording_started',
  'pwa_installed'
)
AND timestamp > NOW() - INTERVAL 24 HOUR
GROUP BY event
ORDER BY count DESC;
```

---

## Nächste Schritte

Nach Abschluss dieser Phase: [Phase 4: Backend Integration](./PHASE_4_BACKEND.md)
