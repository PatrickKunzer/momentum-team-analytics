![Momentum Team](../assets/MomentumTeam-hor.png)

# User Journey Dashboard

> **Analytics Documentation** · Version 1.0 · Last updated: 2024-12-06

Funnels, retention, and user lifecycle metrics.

---

## Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        USER JOURNEY                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│  │ Signups     │  │ Activation  │  │ D7          │  │ D30         │   │
│  │ (30d)       │  │ Rate        │  │ Retention   │  │ Retention   │   │
│  │             │  │             │  │             │  │             │   │
│  │   4,520     │  │   72%       │  │   42%       │  │   28%       │   │
│  │   ▲ +15%    │  │   ▲ +3%     │  │   ▼ -2%     │  │   ▲ +1%     │   │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Onboarding Funnel                                                     │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                                                                  │  │
│  │  Visit App         ████████████████████████████████████  10,000 │  │
│  │        ↓ 45%                                                     │  │
│  │  Signup            █████████████████████                  4,520 │  │
│  │        ↓ 72%                                                     │  │
│  │  First Chat        ████████████████                       3,254 │  │
│  │        ↓ 58%                                                     │  │
│  │  Second Chat       █████████                              1,887 │  │
│  │        ↓ 65%                                                     │  │
│  │  Day 7 Return      ██████                                 1,227 │  │
│  │        ↓ 68%                                                     │  │
│  │  Day 30 Return     ████                                     834 │  │
│  │                                                                  │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Retention Cohort Analysis                                             │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                                                                  │  │
│  │  Cohort   │ Size │  D1  │  D7  │ D14  │ D30  │ D60  │ D90      │  │
│  │  ─────────┼──────┼──────┼──────┼──────┼──────┼──────┼──────    │  │
│  │  Nov W1   │  850 │  68% │  42% │  35% │  28% │  22% │  18%     │  │
│  │  Nov W2   │  920 │  71% │  45% │  38% │  30% │  24% │   -      │  │
│  │  Nov W3   │  780 │  65% │  40% │  32% │  26% │   -  │   -      │  │
│  │  Nov W4   │ 1050 │  72% │  48% │  40% │   -  │   -  │   -      │  │
│  │  Dec W1   │ 1120 │  74% │  46% │   -  │   -  │   -  │   -      │  │
│  │                                                                  │  │
│  │  ✅ Trend: Improving activation and early retention             │  │
│  │                                                                  │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  First Actions After Signup           │  Churn Indicators              │
│  (Sankey Diagram)                     │                                 │
│  ┌─────────────────────────────┐     │  ┌─────────────────────────┐   │
│  │                             │     │  │                         │   │
│  │  Signup ─┬─ Explore (45%)   │     │  │  Users at Risk:         │   │
│  │          │      └─ Chat     │     │  │                         │   │
│  │          │                  │     │  │  - No chat in 7d:  450  │   │
│  │          ├─ Chat (35%)      │     │  │  - 1 message only: 280  │   │
│  │          │      └─ More     │     │  │  - Deleted account: 45  │   │
│  │          │                  │     │  │                         │   │
│  │          ├─ Settings (12%)  │     │  │  Common Patterns:       │   │
│  │          │                  │     │  │  - Error → Churn: 32%   │   │
│  │          └─ Leave (8%)      │     │  │  - 1 chat → Churn: 28% │   │
│  │                             │     │  │                         │   │
│  └─────────────────────────────┘     │  └─────────────────────────┘   │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Feature Adoption Timeline                                             │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                                                                  │  │
│  │  Time After Signup →   Day 1   Week 1   Month 1   Month 3       │  │
│  │  ────────────────────────────────────────────────────────────── │  │
│  │  First Chat            ████████████  72%                        │  │
│  │  Second Agent          ████████      55%                        │  │
│  │  Knowledge Base        ████          28%                        │  │
│  │  Integration           ███           18%                        │  │
│  │  Custom Prompt         ██            12%                        │  │
│  │                                                                  │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Key Metrics

| Metric | Definition | Target |
|--------|------------|--------|
| Activation | Signup → First Chat (24h) | >70% |
| D1 Retention | Return next day | >65% |
| D7 Retention | Return after 7 days | >40% |
| D30 Retention | Return after 30 days | >25% |
| Time to Value | Signup → First meaningful action | <5 min |

---

## SQL Queries

### Retention Cohort

```sql
WITH cohorts AS (
  SELECT
    user_id,
    DATE_TRUNC('week', MIN(timestamp)) as cohort_week
  FROM events
  WHERE event = 'signup_completed'
  GROUP BY user_id
),
activity AS (
  SELECT
    user_id,
    DATE(timestamp) as activity_date
  FROM events
  WHERE event = 'message_sent'
  GROUP BY user_id, DATE(timestamp)
)
SELECT
  c.cohort_week,
  COUNT(DISTINCT c.user_id) as cohort_size,
  COUNT(DISTINCT CASE WHEN a.activity_date = c.cohort_week + INTERVAL 1 DAY THEN c.user_id END) * 100.0 /
    COUNT(DISTINCT c.user_id) as d1_retention,
  COUNT(DISTINCT CASE WHEN a.activity_date = c.cohort_week + INTERVAL 7 DAY THEN c.user_id END) * 100.0 /
    COUNT(DISTINCT c.user_id) as d7_retention,
  COUNT(DISTINCT CASE WHEN a.activity_date = c.cohort_week + INTERVAL 30 DAY THEN c.user_id END) * 100.0 /
    COUNT(DISTINCT c.user_id) as d30_retention
FROM cohorts c
LEFT JOIN activity a ON c.user_id = a.user_id
GROUP BY c.cohort_week
ORDER BY c.cohort_week DESC
```

### First Action After Signup

```sql
WITH signup_times AS (
  SELECT user_id, MIN(timestamp) as signup_time
  FROM events WHERE event = 'signup_completed'
  GROUP BY user_id
),
first_actions AS (
  SELECT
    e.user_id,
    e.event,
    ROW_NUMBER() OVER (PARTITION BY e.user_id ORDER BY e.timestamp) as action_rank
  FROM events e
  JOIN signup_times s ON e.user_id = s.user_id
  WHERE e.timestamp > s.signup_time
    AND e.event IN ('page_viewed', 'chat_created', 'agent_selected', 'settings_opened')
)
SELECT
  event as first_action,
  COUNT(*) as users,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as percentage
FROM first_actions
WHERE action_rank = 1
GROUP BY event
ORDER BY users DESC
```
