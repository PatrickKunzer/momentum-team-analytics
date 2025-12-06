![Momentum Team](../../MomentumTeam-hor.png)

# Account Events

> **Analytics Documentation** · Version 1.0 · Last updated: 2024-12-06

Events for account lifecycle: registration, login, deletion.

---

## Übersicht

| Event | Beschreibung | Priorität |
|-------|--------------|-----------|
| `signup_started` | Registrierung gestartet | P0 |
| `signup_completed` | Registrierung abgeschlossen | P0 |
| `signup_abandoned` | Registrierung abgebrochen | P1 |
| `login_attempted` | Login-Versuch | P1 |
| `login_succeeded` | Login erfolgreich | P0 |
| `login_failed` | Login fehlgeschlagen | P1 |
| `logout` | Logout | P1 |
| `password_reset_requested` | Passwort-Reset angefordert | P2 |
| `password_reset_completed` | Passwort-Reset abgeschlossen | P2 |
| `account_deletion_started` | Löschung gestartet | P1 |
| `account_deleted` | Account gelöscht | P1 |

---

## Event-Definitionen

### Signup Flow

#### signup_started

```typescript
interface SignupStartedEvent {
  event: 'signup_started';
  properties: {
    method: 'email' | 'google' | 'microsoft' | 'linkedin';
    referrer: string | null;
    /** Landing Page */
    entry_page: string;
  };
}
```

#### signup_completed ⭐

```typescript
interface SignupCompletedEvent {
  event: 'signup_completed';
  properties: {
    method: 'email' | 'google' | 'microsoft' | 'linkedin';
    /** Zeit von Start bis Completion (ms) */
    duration_ms: number;
  };
}
```

#### signup_abandoned

```typescript
interface SignupAbandonedEvent {
  event: 'signup_abandoned';
  properties: {
    method: string;
    /** Bei welchem Schritt abgebrochen */
    step: 'provider_selection' | 'oauth_redirect' | 'email_entry' | 'verification';
    duration_ms: number;
  };
}
```

---

### Login Flow

#### login_succeeded ⭐

```typescript
interface LoginSucceededEvent {
  event: 'login_succeeded';
  properties: {
    method: 'email' | 'google' | 'microsoft' | 'linkedin' | 'token';
    /** Tage seit letztem Login */
    days_since_last_login: number | null;
    /** Ist es ein returning User */
    is_returning: boolean;
  };
}
```

#### login_failed

```typescript
interface LoginFailedEvent {
  event: 'login_failed';
  properties: {
    method: string;
    error_type: 'invalid_credentials' | 'account_locked' | 'oauth_error' |
                'network_error' | 'unknown';
    /** Wievielter Versuch */
    attempt_count: number;
  };
}
```

---

### Account Deletion

#### account_deletion_started

```typescript
interface AccountDeletionStartedEvent {
  event: 'account_deletion_started';
  properties: {
    source: 'settings' | 'support_request';
  };
}
```

#### account_deleted ⭐

```typescript
interface AccountDeletedEvent {
  event: 'account_deleted';
  properties: {
    /** Account-Alter in Tagen */
    account_age_days: number;
    /** Gesamtanzahl Chats */
    total_chats: number;
    /** Gesamtanzahl Nachrichten */
    total_messages: number;
    /** Anzahl Knowledge Bases */
    total_knowledge_bases: number;
    /** Hat Feedback gegeben vor Löschung */
    gave_feedback: boolean;
  };
}
```

---

## TypeScript Export

```typescript
// src/lib/IONOS/analytics/events/account.events.ts

export type AuthMethod = 'email' | 'google' | 'microsoft' | 'linkedin' | 'token';

export type AccountEvents =
  | SignupStartedEvent
  | SignupCompletedEvent
  | SignupAbandonedEvent
  | LoginAttemptedEvent
  | LoginSucceededEvent
  | LoginFailedEvent
  | LogoutEvent
  | PasswordResetRequestedEvent
  | PasswordResetCompletedEvent
  | AccountDeletionStartedEvent
  | AccountDeletedEvent;
```

---

## Dashboard-Metriken

### Signup Funnel

```
Signup Started      ████████████████████  1000
       ↓ 72%
Signup Completed    ██████████████        720
       ↓ 85%
First Chat          ████████████          612
```

### Churn Analysis

```sql
-- Account Deletion Reasons
SELECT
  properties.account_age_days,
  COUNT(*) as deletions,
  AVG(properties.total_messages) as avg_messages
FROM events
WHERE event = 'account_deleted'
GROUP BY
  CASE
    WHEN properties.account_age_days < 1 THEN '< 1 day'
    WHEN properties.account_age_days < 7 THEN '1-7 days'
    WHEN properties.account_age_days < 30 THEN '7-30 days'
    ELSE '30+ days'
  END
```
