![Momentum Team](../assets/MomentumTeam-hor.png)

# Knowledge Hub Metrics Dashboard

> **Analytics Documentation** · Version 1.0 · Last updated: 2024-12-06

Metrics for Knowledge Base, files, websites, memories, and cloud storage.

---

## Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      KNOWLEDGE HUB METRICS                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│  │ Knowledge   │  │ Files       │  │ Usage in    │  │ Processing  │   │
│  │ Bases       │  │ Uploaded    │  │ Chat        │  │ Success     │   │
│  │             │  │             │  │             │  │             │   │
│  │   1,245     │  │   8,920     │  │   18.5%     │  │   96.2%     │   │
│  │   ▲ +15%    │  │   ▲ +22%    │  │   ▲ +3.2%   │  │   ▼ -0.8%   │   │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Content Type Distribution                                             │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                                                                  │  │
│  │  PDF Files         ████████████████████████████████████   52%   │  │
│  │  DOCX Files        ████████████████████                   28%   │  │
│  │  Web Content       ██████████                             14%   │  │
│  │  Memories          ████                                    5%   │  │
│  │  Cloud Storage     █                                       1%   │  │
│  │                                                                  │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Knowledge Base Lifecycle        │  File Size Distribution            │
│  (Funnel)                        │                                     │
│  ┌─────────────────────────┐    │  ┌─────────────────────────────┐   │
│  │                         │    │  │                             │   │
│  │  Created      1,245    │    │  │  < 100KB    ████████  45%   │   │
│  │      ↓ 85%              │    │  │  100KB-1MB  ██████    35%   │   │
│  │  Files Added  1,058    │    │  │  1-5MB      ███       15%   │   │
│  │      ↓ 72%              │    │  │  > 5MB      █          5%   │   │
│  │  Used in Chat   762    │    │  │                             │   │
│  │                         │    │  │  Avg: 420KB                │   │
│  └─────────────────────────┘    │  └─────────────────────────────┘   │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Upload Methods                  │  Processing Performance            │
│  ┌─────────────────────────┐    │  ┌─────────────────────────────┐   │
│  │                         │    │  │                             │   │
│  │  File Picker    55%    │    │  │  Success Rate: 96.2%        │   │
│  │  Drag & Drop    38%    │    │  │  Avg Duration: 2.4s         │   │
│  │  Paste           5%    │    │  │  Avg Chunks: 12.5           │   │
│  │  Directory       2%    │    │  │                             │   │
│  │                         │    │  │  Top Errors:               │   │
│  │                         │    │  │  - Format: 2.1%            │   │
│  │                         │    │  │  - Size: 1.2%              │   │
│  │                         │    │  │  - Timeout: 0.5%           │   │
│  └─────────────────────────┘    │  └─────────────────────────────┘   │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Knowledge Usage in Chat (Last 30 Days)                                │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │  800│                                              ▄▄▄          │  │
│  │     │                                   ▄▄▄  ▄▄▄  ████          │  │
│  │  600│                        ▄▄▄  ▄▄▄  ████  ████  ████         │  │
│  │     │             ▄▄▄  ▄▄▄  ████  ████  ████  ████  ████        │  │
│  │  400│  ▄▄▄  ▄▄▄  ████  ████  ████  ████  ████  ████  ████       │  │
│  │     │  ████  ████  ████  ████  ████  ████  ████  ████  ████      │  │
│  │  200│  ████  ████  ████  ████  ████  ████  ████  ████  ████      │  │
│  │     │──────────────────────────────────────────────────────      │  │
│  │      W1   W2   W3   W4   W5   W6   W7   W8   W9  W10             │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Key Metrics

| Metric | Description | Target |
|--------|-------------|--------|
| KB Adoption | % active users with KB | >30% |
| Files per KB | Avg files uploaded | >3 |
| Usage Rate | % KBs used in chat | >60% |
| Processing Success | % successful uploads | >95% |

---

## SQL Queries

### Content Type Distribution

```sql
SELECT
  CASE
    WHEN event = 'file_uploaded' THEN properties.file_type
    WHEN event = 'web_content_added' THEN 'website'
    WHEN event = 'youtube_content_added' THEN 'youtube'
    WHEN event = 'memory_created' THEN 'memory'
    WHEN event LIKE '%drive%' THEN 'cloud_storage'
  END as content_type,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as percentage
FROM events
WHERE event IN ('file_uploaded', 'web_content_added', 'youtube_content_added',
                'memory_created', 'google_drive_file_added', 'onedrive_file_added')
  AND timestamp > NOW() - INTERVAL 30 DAY
GROUP BY content_type
ORDER BY count DESC
```

### Knowledge Base Funnel

```sql
WITH kb_created AS (
  SELECT properties.knowledge_id, user_id
  FROM events WHERE event = 'knowledge_base_created'
),
kb_with_files AS (
  SELECT DISTINCT properties.knowledge_id
  FROM events WHERE event = 'file_uploaded'
),
kb_used AS (
  SELECT DISTINCT properties.knowledge_id
  FROM events WHERE event = 'knowledge_context_used'
)
SELECT
  COUNT(DISTINCT kc.knowledge_id) as created,
  COUNT(DISTINCT kwf.knowledge_id) as with_files,
  COUNT(DISTINCT ku.knowledge_id) as used_in_chat
FROM kb_created kc
LEFT JOIN kb_with_files kwf ON kc.knowledge_id = kwf.knowledge_id
LEFT JOIN kb_used ku ON kc.knowledge_id = ku.knowledge_id
```

### Processing Success Rate by File Type

```sql
SELECT
  properties.file_type,
  COUNT(*) as total,
  SUM(CASE WHEN properties.processing_success THEN 1 ELSE 0 END) as successful,
  ROUND(SUM(CASE WHEN properties.processing_success THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) as success_rate,
  AVG(properties.upload_duration_ms) as avg_duration_ms,
  AVG(properties.chunks_created) as avg_chunks
FROM events
WHERE event = 'file_uploaded'
  AND timestamp > NOW() - INTERVAL 30 DAY
GROUP BY properties.file_type
ORDER BY total DESC
```
