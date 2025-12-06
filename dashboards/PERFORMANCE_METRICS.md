![Momentum Team](../../MomentumTeam-hor.png)

# Performance & Error Metrics Dashboard

> **Analytics Documentation** · Version 1.0 · Last updated: 2024-12-06

Technical health metrics for Engineering and SRE.

---

## Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    PERFORMANCE & ERRORS                                 │
│                    Last 24 Hours | Auto-refresh: 5min                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│  │ Error Rate  │  │ API P95     │  │ WebSocket   │  │ Slow        │   │
│  │             │  │ Latency     │  │ Uptime      │  │ Requests    │   │
│  │             │  │             │  │             │  │             │   │
│  │   0.8%      │  │   1.2s      │  │   99.5%     │  │   2.1%      │   │
│  │   ✅ OK     │  │   ✅ OK     │  │   ✅ OK     │  │   ⚠️ Watch  │   │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Error Rate Over Time                                                  │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │  5%│                                                            │  │
│  │    │        ▄                                                   │  │
│  │  3%│       ██▄                                                  │  │
│  │    │  ▄▄▄▄████▄▄    ▄                                          │  │
│  │  1%│  ████████████▄███▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄          │  │
│  │    │──────────────────────────────────────────────────          │  │
│  │     00:00    04:00    08:00    12:00    16:00    20:00          │  │
│  │                              ↑ Spike: Auth service restart      │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Top Errors (Last 24h)                                                 │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │  # │ Error                          │ Count │ % of Total       │  │
│  │ ───┼────────────────────────────────┼───────┼──────────────── │  │
│  │  1 │ 401 /api/chat                  │   145 │ ████████  35%   │  │
│  │  2 │ 500 /api/knowledge/upload      │    89 │ █████     22%   │  │
│  │  3 │ 429 /api/chat (rate limit)     │    67 │ ████      16%   │  │
│  │  4 │ 504 /api/integrations/oauth    │    52 │ ███       13%   │  │
│  │  5 │ Client: TypeError              │    38 │ ██         9%   │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  API Latency (P50, P95, P99)          │  WebSocket Health              │
│  ┌─────────────────────────────┐      │  ┌─────────────────────────┐  │
│  │                             │      │  │                         │  │
│  │  /api/chat                  │      │  │  Connected:     12,450  │  │
│  │    P50: 0.8s  P95: 2.1s    │      │  │  Disconnects/h:     23  │  │
│  │                             │      │  │  Reconnects/h:      21  │  │
│  │  /api/knowledge             │      │  │  Avg Uptime:    99.5%   │  │
│  │    P50: 0.3s  P95: 1.2s    │      │  │                         │  │
│  │                             │      │  │  Top Disconnect Reason: │  │
│  │  /api/integrations          │      │  │  - ping_timeout: 65%   │  │
│  │    P50: 0.5s  P95: 1.8s    │      │  │  - network_error: 25%  │  │
│  │                             │      │  │                         │  │
│  └─────────────────────────────┘      │  └─────────────────────────┘  │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Client Errors                         │  Slow Requests (>2s)         │
│  ┌─────────────────────────────┐      │  ┌─────────────────────────┐  │
│  │                             │      │  │                         │  │
│  │  Total: 156                 │      │  │  /api/chat       68%    │  │
│  │                             │      │  │  /api/knowledge  22%    │  │
│  │  By Type:                   │      │  │  /api/files       7%    │  │
│  │  - TypeError      45%      │      │  │  Other            3%    │  │
│  │  - ReferenceError 28%      │      │  │                         │  │
│  │  - NetworkError   18%      │      │  │  Avg Duration: 3.2s     │  │
│  │  - Other           9%      │      │  │                         │  │
│  │                             │      │  └─────────────────────────┘  │
│  └─────────────────────────────┘      │                               │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Alert Thresholds

| Metric | Warning | Critical | Action |
|--------|---------|----------|--------|
| Error Rate | >2% | >5% | Page on-call |
| API P95 | >3s | >5s | Page on-call |
| WS Disconnect Rate | >5% | >10% | Notify team |
| Client Errors/hour | >100 | >500 | Investigate |

---

## SQL Queries

### Error Rate Over Time

```sql
SELECT
  DATE_TRUNC('hour', timestamp) as hour,
  COUNT(CASE WHEN event IN ('api_error', 'client_error') THEN 1 END) as errors,
  COUNT(CASE WHEN event IN ('api_request', 'page_viewed') THEN 1 END) as total,
  ROUND(
    COUNT(CASE WHEN event IN ('api_error', 'client_error') THEN 1 END) * 100.0 /
    NULLIF(COUNT(CASE WHEN event IN ('api_request', 'page_viewed') THEN 1 END), 0),
    2
  ) as error_rate
FROM events
WHERE timestamp > NOW() - INTERVAL 24 HOUR
GROUP BY hour
ORDER BY hour
```

### Top Errors

```sql
SELECT
  properties.status_code,
  properties.endpoint,
  properties.error_category,
  COUNT(*) as count
FROM events
WHERE event = 'api_error'
  AND timestamp > NOW() - INTERVAL 24 HOUR
GROUP BY properties.status_code, properties.endpoint, properties.error_category
ORDER BY count DESC
LIMIT 10
```

### API Latency by Endpoint

```sql
SELECT
  properties.endpoint,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY properties.request_duration_ms) as p50,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY properties.request_duration_ms) as p95,
  PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY properties.request_duration_ms) as p99
FROM events
WHERE event = 'api_request'
  AND timestamp > NOW() - INTERVAL 24 HOUR
GROUP BY properties.endpoint
ORDER BY p95 DESC
```
