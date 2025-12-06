![Momentum Team](../../MomentumTeam-hor.png)

# Executive Overview Dashboard

> **Analytics Documentation** · Version 1.0 · Last updated: 2024-12-06

High-level KPIs for management and product owners.

---

## Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      EXECUTIVE OVERVIEW                                 │
│                      Last updated: [timestamp]                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐        │
│  │      DAU        │  │      WAU        │  │      MAU        │        │
│  │                 │  │                 │  │                 │        │
│  │    12,450       │  │    45,230       │  │    98,500       │        │
│  │    ▲ +8.3%      │  │    ▲ +5.2%      │  │    ▲ +12.1%     │        │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘        │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐        │
│  │  Messages/Day   │  │  Avg Session    │  │  D7 Retention   │        │
│  │                 │  │  Duration       │  │                 │        │
│  │    78,500       │  │    12.5 min     │  │    42.3%        │        │
│  │    ▲ +15.2%     │  │    ▲ +2.1 min   │  │    ▼ -1.2%      │        │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘        │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Active Users (30 Days)                                                │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                                                         ▄▄▄     │  │
│  │                                              ▄▄▄  ▄▄▄  ████     │  │
│  │                                   ▄▄▄  ▄▄▄  ████  ████  ████    │  │
│  │                        ▄▄▄  ▄▄▄  ████  ████  ████  ████  ████   │  │
│  │             ▄▄▄  ▄▄▄  ████  ████  ████  ████  ████  ████  ████  │  │
│  │  ▄▄▄  ▄▄▄  ████  ████  ████  ████  ████  ████  ████  ████  ████ │  │
│  │  ────────────────────────────────────────────────────────────── │  │
│  │  W1   W2   W3   W4   W5   W6   W7   W8   W9  W10  W11  W12      │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Signup Funnel (Last 30 Days)                                          │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                                                                  │  │
│  │  Visited        ████████████████████████████████████████  10,000│  │
│  │       ↓ 45%                                                      │  │
│  │  Signed Up      █████████████████████                    4,500 │  │
│  │       ↓ 78%                                                      │  │
│  │  First Chat     ████████████████                         3,510 │  │
│  │       ↓ 65%                                                      │  │
│  │  Day 7 Active   ██████████                               2,282 │  │
│  │                                                                  │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Feature Adoption                                                      │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                                                                  │  │
│  │  Chat             ████████████████████████████████████████  95% │  │
│  │  Multiple Agents  ██████████████████████████████          68%  │  │
│  │  Knowledge Base   ████████████████████                    42%  │  │
│  │  Integrations     ██████████████                          28%  │  │
│  │  Custom Prompts   ████████                                15%  │  │
│  │  Image Generation ██████                                  12%  │  │
│  │                                                                  │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## KPI Definitions

### Primary KPIs

| KPI | Definition | Target | Query |
|-----|------------|--------|-------|
| DAU | Unique users with ≥1 message/day | Growth | `COUNT(DISTINCT user_id) WHERE event='message_sent' AND date=today` |
| WAU | Unique users with ≥1 message/week | Growth | Same, 7 days |
| MAU | Unique users with ≥1 message/month | Growth | Same, 30 days |
| D7 Retention | % returning after 7 days | >40% | Cohort analysis |
| Activation Rate | % signup → first chat in 24h | >70% | Funnel |

### Secondary KPIs

| KPI | Definition | Target |
|-----|------------|--------|
| Messages/User/Day | Engagement depth | >5 |
| Session Duration | Time in app | >10 min |
| Feature Adoption | % using feature | Varies |
| NPS | Survey score | >50 |

---

## SQL Queries

### DAU/WAU/MAU

```sql
SELECT
  -- DAU
  COUNT(DISTINCT CASE
    WHEN DATE(timestamp) = CURRENT_DATE THEN user_id
  END) as dau,

  -- WAU
  COUNT(DISTINCT CASE
    WHEN timestamp > NOW() - INTERVAL 7 DAY THEN user_id
  END) as wau,

  -- MAU
  COUNT(DISTINCT CASE
    WHEN timestamp > NOW() - INTERVAL 30 DAY THEN user_id
  END) as mau

FROM events
WHERE event = 'message_sent'
```

### Week-over-Week Growth

```sql
WITH current_week AS (
  SELECT COUNT(DISTINCT user_id) as users
  FROM events
  WHERE event = 'message_sent'
    AND timestamp > NOW() - INTERVAL 7 DAY
),
previous_week AS (
  SELECT COUNT(DISTINCT user_id) as users
  FROM events
  WHERE event = 'message_sent'
    AND timestamp BETWEEN NOW() - INTERVAL 14 DAY AND NOW() - INTERVAL 7 DAY
)
SELECT
  cw.users as current_wau,
  pw.users as previous_wau,
  ROUND((cw.users - pw.users) * 100.0 / pw.users, 1) as wow_growth_percent
FROM current_week cw, previous_week pw
```

### Feature Adoption by Active Users

```sql
WITH active_users AS (
  SELECT DISTINCT user_id
  FROM events
  WHERE event = 'message_sent'
    AND timestamp > NOW() - INTERVAL 30 DAY
)
SELECT
  'knowledge_base' as feature,
  COUNT(DISTINCT e.user_id) as adopters,
  COUNT(DISTINCT au.user_id) as total_active,
  ROUND(COUNT(DISTINCT e.user_id) * 100.0 / COUNT(DISTINCT au.user_id), 1) as adoption_rate
FROM active_users au
LEFT JOIN events e ON au.user_id = e.user_id
  AND e.event = 'knowledge_base_created'
  AND e.timestamp > NOW() - INTERVAL 30 DAY

UNION ALL

SELECT
  'integrations' as feature,
  COUNT(DISTINCT e.user_id) as adopters,
  COUNT(DISTINCT au.user_id) as total_active,
  ROUND(COUNT(DISTINCT e.user_id) * 100.0 / COUNT(DISTINCT au.user_id), 1) as adoption_rate
FROM active_users au
LEFT JOIN events e ON au.user_id = e.user_id
  AND e.event = 'integration_oauth_completed'
  AND e.timestamp > NOW() - INTERVAL 30 DAY
```

---

## Alerts

| Alert | Condition | Severity | Action |
|-------|-----------|----------|--------|
| DAU Drop | >20% vs yesterday | High | Notify Product |
| Signup Drop | >30% vs last week | High | Investigate |
| Activation Drop | <60% | Medium | Review onboarding |
| Retention Drop | D7 < 35% | High | User research |
