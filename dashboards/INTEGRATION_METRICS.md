![Momentum Team](../assets/MomentumTeam-hor.png)

# Integration Metrics Dashboard

> **Analytics Documentation** · Version 1.0 · Last updated: 2024-12-06

Metrics for third-party integrations.

---

## Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      INTEGRATION METRICS                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│  │ Connected   │  │ OAuth       │  │ Usage in    │  │ Disconnect  │   │
│  │ Users       │  │ Success     │  │ Chat        │  │ Rate        │   │
│  │             │  │             │  │             │  │             │   │
│  │   2,450     │  │   78.5%     │  │   45%       │  │   12%       │   │
│  │   ▲ +18%    │  │   ▲ +3.2%   │  │   ▲ +8%     │  │   ▼ -2%     │   │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Integration Funnel (Last 30 Days)                                     │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                                                                  │  │
│  │  Viewed           ████████████████████████████████████   5,000  │  │
│  │       ↓ 45%                                                      │  │
│  │  Connect Clicked  █████████████████████                  2,250  │  │
│  │       ↓ 78%                                                      │  │
│  │  OAuth Complete   ████████████████                       1,755  │  │
│  │       ↓ 65%                                                      │  │
│  │  Used in Chat     ██████████                             1,141  │  │
│  │                                                                  │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Connections by Provider           │  OAuth Failure Reasons           │
│  ┌─────────────────────────────┐  │  ┌─────────────────────────────┐ │
│  │                             │  │  │                             │ │
│  │  Google      ████████  52%  │  │  │  User Cancelled   ████ 45% │ │
│  │  Microsoft   █████     32%  │  │  │  Access Denied    ███  28% │ │
│  │  Meta        ██        12%  │  │  │  Timeout          ██   15% │ │
│  │  LinkedIn    █          4%  │  │  │  Server Error     █    12% │ │
│  │                             │  │  │                             │ │
│  └─────────────────────────────┘  │  └─────────────────────────────┘ │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Service Usage                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                                                                  │  │
│  │  Gmail              ████████████████████████████████████  42%   │  │
│  │  Google Calendar    █████████████████████████             28%   │  │
│  │  Google Drive       ████████████████                      18%   │  │
│  │  Outlook            ████████                               8%   │  │
│  │  OneDrive           ████                                   4%   │  │
│  │                                                                  │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Key Metrics

| Metric | Description | Target |
|--------|-------------|--------|
| Connection Rate | Viewed → Connected | >35% |
| OAuth Success | Click → Complete | >75% |
| Usage Rate | Connected → Used | >50% |
| Retention | Still connected after 30d | >70% |

---

## SQL Queries

### Connection Funnel by Provider

```sql
SELECT
  properties.provider,
  COUNT(CASE WHEN event = 'integration_viewed' THEN 1 END) as viewed,
  COUNT(CASE WHEN event = 'integration_connect_clicked' THEN 1 END) as clicked,
  COUNT(CASE WHEN event = 'integration_oauth_completed' THEN 1 END) as connected,
  COUNT(CASE WHEN event = 'integration_used_in_chat' THEN 1 END) as used,
  ROUND(
    COUNT(CASE WHEN event = 'integration_oauth_completed' THEN 1 END) * 100.0 /
    NULLIF(COUNT(CASE WHEN event = 'integration_connect_clicked' THEN 1 END), 0),
    1
  ) as oauth_success_rate
FROM events
WHERE event IN ('integration_viewed', 'integration_connect_clicked',
                'integration_oauth_completed', 'integration_used_in_chat')
  AND timestamp > NOW() - INTERVAL 30 DAY
GROUP BY properties.provider
ORDER BY clicked DESC
```

### OAuth Failure Analysis

```sql
SELECT
  properties.provider,
  properties.error_type,
  COUNT(*) as failures,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY properties.provider), 1) as percentage
FROM events
WHERE event = 'integration_oauth_failed'
  AND timestamp > NOW() - INTERVAL 30 DAY
GROUP BY properties.provider, properties.error_type
ORDER BY failures DESC
```
