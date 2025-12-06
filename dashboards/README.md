![Momentum Team](../../MomentumTeam-hor.png)

# Dashboard Documentation

> **Analytics Documentation** · Version 1.0 · Last updated: 2024-12-06

KPIs, metrics, and dashboard layouts for Momentum Team Analytics.

---

## Dashboard-Übersicht

| Dashboard | Zielgruppe | Dokument |
|-----------|------------|----------|
| Executive Overview | Management, POs | [EXECUTIVE_OVERVIEW.md](./EXECUTIVE_OVERVIEW.md) |
| Chat & AI Metrics | Product, Engineering | [CHAT_METRICS.md](./CHAT_METRICS.md) |
| Knowledge Hub | Product | [KNOWLEDGE_METRICS.md](./KNOWLEDGE_METRICS.md) |
| Integration Metrics | Product, Partnerships | [INTEGRATION_METRICS.md](./INTEGRATION_METRICS.md) |
| Performance & Errors | Engineering, SRE | [PERFORMANCE_METRICS.md](./PERFORMANCE_METRICS.md) |
| User Journey | Product, UX | [USER_JOURNEY.md](./USER_JOURNEY.md) |

---

## KPI-Hierarchie

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           NORTH STAR METRIC                             │
│                                                                         │
│                    Weekly Active Chatters (WAC)                         │
│                    = Users with ≥1 message/week                         │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                         PRIMARY METRICS                                 │
│                                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│  │ Activation  │  │ Engagement  │  │ Retention   │  │ Expansion   │   │
│  │             │  │             │  │             │  │             │   │
│  │ First Chat  │  │ Messages/   │  │ D7/D30      │  │ Feature     │   │
│  │ within 24h  │  │ Active User │  │ Retention   │  │ Adoption    │   │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                        SECONDARY METRICS                                │
│                                                                         │
│  • Knowledge Base Adoption Rate                                         │
│  • Integration Connection Rate                                          │
│  • Agent Diversity (unique agents used)                                 │
│  • Tool Usage Rate                                                      │
│  • Session Duration                                                     │
│  • Error Rate                                                           │
│  • Response Time P95                                                    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Metric Definitions

### North Star: Weekly Active Chatters (WAC)

```sql
SELECT COUNT(DISTINCT user_id) as wac
FROM events
WHERE event = 'message_sent'
  AND timestamp > NOW() - INTERVAL 7 DAY
```

**Warum diese Metrik?**
- Misst echte Produktnutzung (nicht nur Logins)
- Wöchentlicher Rhythmus passt zum Use Case
- Korreliert mit Kundenwert

---

### Primary Metrics

#### 1. Activation Rate

```sql
-- % der Signups die innerhalb 24h ersten Chat starten
WITH signups AS (
  SELECT user_id, MIN(timestamp) as signup_time
  FROM events
  WHERE event = 'signup_completed'
  GROUP BY user_id
),
first_chats AS (
  SELECT user_id, MIN(timestamp) as first_chat_time
  FROM events
  WHERE event = 'chat_created'
  GROUP BY user_id
)
SELECT
  COUNT(CASE WHEN fc.first_chat_time < s.signup_time + INTERVAL 24 HOUR THEN 1 END) * 100.0 /
  COUNT(*) as activation_rate_24h
FROM signups s
LEFT JOIN first_chats fc ON s.user_id = fc.user_id
```

#### 2. Engagement: Messages per Active User

```sql
SELECT
  COUNT(*) * 1.0 / COUNT(DISTINCT user_id) as messages_per_user
FROM events
WHERE event = 'message_sent'
  AND timestamp > NOW() - INTERVAL 7 DAY
```

#### 3. D7 Retention

```sql
-- % der User die nach 7 Tagen zurückkehren
WITH cohort AS (
  SELECT
    user_id,
    DATE(MIN(timestamp)) as signup_date
  FROM events
  WHERE event = 'signup_completed'
  GROUP BY user_id
),
day7_active AS (
  SELECT DISTINCT user_id
  FROM events
  WHERE event = 'message_sent'
)
SELECT
  c.signup_date,
  COUNT(DISTINCT c.user_id) as cohort_size,
  COUNT(DISTINCT CASE
    WHEN d7.user_id IS NOT NULL
    AND DATE(e.timestamp) = c.signup_date + INTERVAL 7 DAY
    THEN c.user_id
  END) as retained_d7,
  -- Calculate %
FROM cohort c
LEFT JOIN day7_active d7 ON c.user_id = d7.user_id
LEFT JOIN events e ON c.user_id = e.user_id
GROUP BY c.signup_date
```

#### 4. Feature Adoption

```sql
-- % der aktiven User die Feature X nutzen
SELECT
  'knowledge_base' as feature,
  COUNT(DISTINCT CASE WHEN event = 'knowledge_base_created' THEN user_id END) * 100.0 /
  COUNT(DISTINCT user_id) as adoption_rate
FROM events
WHERE timestamp > NOW() - INTERVAL 30 DAY
  AND user_id IN (SELECT DISTINCT user_id FROM events WHERE event = 'message_sent')

UNION ALL

SELECT
  'integrations' as feature,
  COUNT(DISTINCT CASE WHEN event = 'integration_oauth_completed' THEN user_id END) * 100.0 /
  COUNT(DISTINCT user_id) as adoption_rate
FROM events
WHERE timestamp > NOW() - INTERVAL 30 DAY
```

---

## Dashboard Refresh Rates

| Dashboard | Refresh Rate | Reason |
|-----------|--------------|--------|
| Executive Overview | Daily | Strategic decisions |
| Chat Metrics | Hourly | Operational monitoring |
| Knowledge Hub | Daily | Feature tracking |
| Integrations | Daily | Partnership metrics |
| Performance | Real-time (5min) | Incident detection |
| User Journey | Daily | Funnel optimization |

---

## PostHog Dashboard Setup

### Dashboard Template Export

```json
{
  "name": "IONOS GPT - Executive Overview",
  "description": "High-level KPIs for leadership",
  "items": [
    {
      "type": "insight",
      "name": "Weekly Active Chatters",
      "query": {
        "kind": "TrendsQuery",
        "series": [{
          "event": "message_sent",
          "math": "dau"
        }],
        "interval": "week"
      }
    },
    {
      "type": "insight",
      "name": "Activation Rate",
      "query": {
        "kind": "FunnelQuery",
        "series": [
          { "event": "signup_completed" },
          { "event": "chat_created" }
        ],
        "funnelWindowInterval": 1,
        "funnelWindowIntervalUnit": "day"
      }
    }
  ]
}
```

---

## Alert Configuration

### Critical Alerts

| Metric | Threshold | Action |
|--------|-----------|--------|
| Error Rate | > 5% | Page on-call |
| API P95 Latency | > 5000ms | Page on-call |
| WebSocket Disconnects | > 10% | Notify team |
| Signup Failures | > 20% | Notify team |

### Warning Alerts

| Metric | Threshold | Action |
|--------|-----------|--------|
| DAU Drop | > 20% day-over-day | Notify product |
| Message Volume | > 30% drop | Notify product |
| Error Rate | > 2% | Log for review |

---

## Nächste Schritte

1. [Executive Overview](./EXECUTIVE_OVERVIEW.md) - Management KPIs
2. [Chat Metrics](./CHAT_METRICS.md) - Core Feature Metrics
3. [Knowledge Metrics](./KNOWLEDGE_METRICS.md) - Knowledge Hub Details
4. [Integration Metrics](./INTEGRATION_METRICS.md) - Third-Party Connections
5. [Performance Metrics](./PERFORMANCE_METRICS.md) - Technical Health
6. [User Journey](./USER_JOURNEY.md) - Funnels & Retention
