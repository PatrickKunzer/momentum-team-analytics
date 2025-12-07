![Momentum Team](../assets/MomentumTeam-hor.png)

# Phase 4: Backend Integration

> **Analytics Documentation** · Version 1.0 · Last updated: 2024-12-06

Python PostHog SDK, FastAPI Middleware, and Server-Side Events.

---

## Overview

This phase implements server-side tracking for API requests, performance metrics, and server events.

---

## Voraussetzungen

- [ ] Phase 1-3 vollständig abgeschlossen
- [ ] Frontend-Tracking funktioniert
- [ ] PostHog Instance erreichbar vom Backend

---

## 4.1 PostHog Python SDK Setup

### Installation

```bash
# In der Backend-Umgebung
pip install posthog

# Oder in requirements.txt
echo "posthog>=3.0.0" >> requirements.txt
```

### Konfiguration

```python
# backend/config/analytics.py

import os
from typing import Optional
from functools import lru_cache

class AnalyticsConfig:
    """Analytics configuration loaded from environment."""

    def __init__(self):
        self.posthog_api_key: str = os.getenv("POSTHOG_API_KEY", "")
        self.posthog_host: str = os.getenv("POSTHOG_HOST", "https://analytics.ionos-gpt.de")
        self.environment: str = os.getenv("ENVIRONMENT", "development")
        self.enabled: bool = os.getenv("ANALYTICS_ENABLED", "true").lower() == "true"
        self.debug: bool = os.getenv("ANALYTICS_DEBUG", "false").lower() == "true"

    @property
    def is_production(self) -> bool:
        return self.environment == "production"

@lru_cache()
def get_analytics_config() -> AnalyticsConfig:
    return AnalyticsConfig()
```

### Environment Variables

```bash
# .env.production
POSTHOG_API_KEY=phc_xxxxxxxxxxxxxxxxxxxxx
POSTHOG_HOST=https://analytics.ionos-gpt.de
ENVIRONMENT=production
ANALYTICS_ENABLED=true
ANALYTICS_DEBUG=false

# .env.development
POSTHOG_API_KEY=phc_dev_xxxxxxxxxxxxxxxxxxxxx
POSTHOG_HOST=https://analytics.ionos-gpt.de
ENVIRONMENT=development
ANALYTICS_ENABLED=true
ANALYTICS_DEBUG=true

# .env.test
ANALYTICS_ENABLED=false
```

---

## 4.2 Analytics Service

### Service Implementation

```python
# backend/services/analytics_service.py

import posthog
from typing import Any, Dict, Optional
from datetime import datetime
import logging

from config.analytics import get_analytics_config

logger = logging.getLogger(__name__)


class AnalyticsService:
    """Backend analytics service using PostHog."""

    _instance: Optional["AnalyticsService"] = None

    def __init__(self):
        self.config = get_analytics_config()
        self._initialized = False

    @classmethod
    def get_instance(cls) -> "AnalyticsService":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def init(self) -> None:
        """Initialize PostHog client."""
        if not self.config.enabled:
            logger.info("Analytics disabled")
            return

        if not self.config.posthog_api_key:
            logger.warning("PostHog API key not configured")
            return

        posthog.project_api_key = self.config.posthog_api_key
        posthog.host = self.config.posthog_host
        posthog.debug = self.config.debug

        # Disable automatic capturing in backend
        posthog.disabled = False

        self._initialized = True
        logger.info(f"Analytics initialized for {self.config.environment}")

    def identify(
        self,
        user_id: str,
        properties: Optional[Dict[str, Any]] = None
    ) -> None:
        """Identify a user with properties."""
        if not self._initialized:
            return

        try:
            posthog.identify(
                distinct_id=user_id,
                properties=properties or {}
            )
        except Exception as e:
            logger.error(f"Failed to identify user: {e}")

    def track(
        self,
        user_id: str,
        event: str,
        properties: Optional[Dict[str, Any]] = None
    ) -> None:
        """Track an event."""
        if not self._initialized:
            if self.config.debug:
                logger.debug(f"[Analytics Debug] {event}: {properties}")
            return

        try:
            enriched_properties = self._enrich_properties(properties or {})

            posthog.capture(
                distinct_id=user_id,
                event=event,
                properties=enriched_properties
            )

            if self.config.debug:
                logger.debug(f"Tracked: {event} for {user_id}")

        except Exception as e:
            logger.error(f"Failed to track event: {e}")

    def _enrich_properties(self, properties: Dict[str, Any]) -> Dict[str, Any]:
        """Add common properties to all events."""
        return {
            **properties,
            "source": "backend",
            "environment": self.config.environment,
            "timestamp_server": datetime.utcnow().isoformat(),
        }

    def flush(self) -> None:
        """Flush pending events."""
        if self._initialized:
            posthog.flush()

    def shutdown(self) -> None:
        """Shutdown the analytics service."""
        if self._initialized:
            posthog.shutdown()
            self._initialized = False


# Singleton instance
analytics = AnalyticsService.get_instance()
```

### Application Startup Integration

```python
# backend/main.py

from fastapi import FastAPI
from contextlib import asynccontextmanager

from services.analytics_service import analytics

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    analytics.init()
    yield
    # Shutdown
    analytics.flush()
    analytics.shutdown()

app = FastAPI(lifespan=lifespan)
```

---

## 4.3 FastAPI Middleware

### Request Tracking Middleware

```python
# backend/middleware/analytics_middleware.py

import time
import logging
from typing import Callable, Optional
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp

from services.analytics_service import analytics

logger = logging.getLogger(__name__)


class AnalyticsMiddleware(BaseHTTPMiddleware):
    """Middleware to track API requests."""

    # Endpoints to exclude from tracking
    EXCLUDED_PATHS = {
        "/health",
        "/metrics",
        "/favicon.ico",
        "/_next",
        "/static",
    }

    # Sensitive endpoints - track but with minimal data
    SENSITIVE_PATHS = {
        "/api/auth",
        "/api/users/me",
    }

    def __init__(self, app: ASGIApp):
        super().__init__(app)

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Skip excluded paths
        if self._should_exclude(request.url.path):
            return await call_next(request)

        # Check consent header
        consent = request.headers.get("X-Analytics-Consent", "false")
        if consent.lower() != "true":
            return await call_next(request)

        # Get user ID
        user_id = self._get_user_id(request)
        if not user_id:
            return await call_next(request)

        # Track request timing
        start_time = time.time()

        try:
            response = await call_next(request)
            duration_ms = (time.time() - start_time) * 1000

            # Track successful request
            self._track_request(
                user_id=user_id,
                request=request,
                response=response,
                duration_ms=duration_ms
            )

            return response

        except Exception as e:
            duration_ms = (time.time() - start_time) * 1000

            # Track failed request
            self._track_error(
                user_id=user_id,
                request=request,
                error=e,
                duration_ms=duration_ms
            )

            raise

    def _should_exclude(self, path: str) -> bool:
        """Check if path should be excluded from tracking."""
        return any(path.startswith(excluded) for excluded in self.EXCLUDED_PATHS)

    def _is_sensitive(self, path: str) -> bool:
        """Check if path contains sensitive data."""
        return any(path.startswith(sensitive) for sensitive in self.SENSITIVE_PATHS)

    def _get_user_id(self, request: Request) -> Optional[str]:
        """Extract user ID from request."""
        # Try to get from auth header/token
        user_id = getattr(request.state, "user_id", None)

        # Fallback to pseudonymized ID header
        if not user_id:
            user_id = request.headers.get("X-User-ID")

        return user_id

    def _track_request(
        self,
        user_id: str,
        request: Request,
        response: Response,
        duration_ms: float
    ) -> None:
        """Track API request."""
        is_sensitive = self._is_sensitive(request.url.path)

        properties = {
            "endpoint": self._sanitize_endpoint(request.url.path),
            "method": request.method,
            "status_code": response.status_code,
            "request_duration_ms": round(duration_ms, 2),
            "is_slow": duration_ms > 2000,
        }

        # Add non-sensitive details
        if not is_sensitive:
            properties.update({
                "has_query_params": bool(request.query_params),
                "content_type": request.headers.get("content-type"),
            })

        analytics.track(user_id, "api_request", properties)

    def _track_error(
        self,
        user_id: str,
        request: Request,
        error: Exception,
        duration_ms: float
    ) -> None:
        """Track API error."""
        analytics.track(user_id, "api_error", {
            "endpoint": self._sanitize_endpoint(request.url.path),
            "method": request.method,
            "error_type": type(error).__name__,
            "error_category": self._categorize_error(error),
            "request_duration_ms": round(duration_ms, 2),
        })

    def _sanitize_endpoint(self, path: str) -> str:
        """Remove IDs from endpoint path."""
        import re
        # Replace UUIDs
        path = re.sub(
            r'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}',
            ':id',
            path
        )
        # Replace numeric IDs
        path = re.sub(r'/\d+(?=/|$)', '/:id', path)
        return path

    def _categorize_error(self, error: Exception) -> str:
        """Categorize error type."""
        error_type = type(error).__name__

        if "Validation" in error_type:
            return "validation"
        if "Auth" in error_type or "Permission" in error_type:
            return "auth"
        if "NotFound" in error_type:
            return "not_found"
        if "Timeout" in error_type:
            return "timeout"

        return "server_error"
```

### Middleware Registration

```python
# backend/main.py

from fastapi import FastAPI
from middleware.analytics_middleware import AnalyticsMiddleware

app = FastAPI()

# Add analytics middleware
app.add_middleware(AnalyticsMiddleware)
```

---

## 4.4 Server-Side Events

### Chat Events (Server-Side)

```python
# backend/services/events/chat_events.py

from typing import Optional, Dict, Any
from services.analytics_service import analytics


def track_chat_completion(
    user_id: str,
    chat_id: str,
    model: str,
    prompt_tokens: int,
    completion_tokens: int,
    total_tokens: int,
    duration_ms: float,
    success: bool,
    error_type: Optional[str] = None
) -> None:
    """Track chat completion on server side."""
    analytics.track(user_id, "chat_completion_backend", {
        "chat_id": chat_id,
        "model": model,
        "prompt_tokens": prompt_tokens,
        "completion_tokens": completion_tokens,
        "total_tokens": total_tokens,
        "duration_ms": round(duration_ms, 2),
        "tokens_per_second": round(completion_tokens / (duration_ms / 1000), 2) if duration_ms > 0 else 0,
        "success": success,
        "error_type": error_type,
    })


def track_model_usage(
    user_id: str,
    model: str,
    tokens_used: int,
    cost_estimate: Optional[float] = None
) -> None:
    """Track model token usage."""
    analytics.track(user_id, "model_usage", {
        "model": model,
        "tokens_used": tokens_used,
        "cost_estimate_usd": cost_estimate,
    })


def track_streaming_metrics(
    user_id: str,
    chat_id: str,
    time_to_first_token_ms: float,
    total_duration_ms: float,
    tokens_generated: int
) -> None:
    """Track streaming response metrics."""
    analytics.track(user_id, "streaming_metrics", {
        "chat_id": chat_id,
        "time_to_first_token_ms": round(time_to_first_token_ms, 2),
        "total_duration_ms": round(total_duration_ms, 2),
        "tokens_generated": tokens_generated,
        "tokens_per_second": round(tokens_generated / (total_duration_ms / 1000), 2) if total_duration_ms > 0 else 0,
    })
```

### Knowledge Events (Server-Side)

```python
# backend/services/events/knowledge_events.py

from typing import List, Optional
from services.analytics_service import analytics


def track_document_processed(
    user_id: str,
    knowledge_base_id: str,
    document_id: str,
    file_type: str,
    file_size_kb: int,
    pages_processed: int,
    chunks_created: int,
    processing_time_ms: float,
    success: bool,
    error_type: Optional[str] = None
) -> None:
    """Track document processing."""
    analytics.track(user_id, "document_processed_backend", {
        "knowledge_base_id": knowledge_base_id,
        "document_id": document_id,
        "file_type": file_type,
        "file_size_kb": file_size_kb,
        "pages_processed": pages_processed,
        "chunks_created": chunks_created,
        "processing_time_ms": round(processing_time_ms, 2),
        "success": success,
        "error_type": error_type,
    })


def track_rag_query(
    user_id: str,
    chat_id: str,
    knowledge_base_ids: List[str],
    query_length: int,
    documents_retrieved: int,
    retrieval_time_ms: float,
    relevance_scores: List[float]
) -> None:
    """Track RAG query execution."""
    analytics.track(user_id, "rag_query_backend", {
        "chat_id": chat_id,
        "knowledge_bases_queried": len(knowledge_base_ids),
        "query_length": query_length,
        "documents_retrieved": documents_retrieved,
        "retrieval_time_ms": round(retrieval_time_ms, 2),
        "avg_relevance_score": round(sum(relevance_scores) / len(relevance_scores), 3) if relevance_scores else 0,
        "max_relevance_score": round(max(relevance_scores), 3) if relevance_scores else 0,
    })


def track_embedding_generation(
    user_id: str,
    document_id: str,
    chunks_embedded: int,
    embedding_model: str,
    processing_time_ms: float
) -> None:
    """Track embedding generation."""
    analytics.track(user_id, "embedding_generated_backend", {
        "document_id": document_id,
        "chunks_embedded": chunks_embedded,
        "embedding_model": embedding_model,
        "processing_time_ms": round(processing_time_ms, 2),
        "chunks_per_second": round(chunks_embedded / (processing_time_ms / 1000), 2) if processing_time_ms > 0 else 0,
    })
```

### Integration Events (Server-Side)

```python
# backend/services/events/integration_events.py

from typing import Optional
from services.analytics_service import analytics


def track_oauth_token_refresh(
    user_id: str,
    provider: str,
    success: bool,
    error_type: Optional[str] = None
) -> None:
    """Track OAuth token refresh."""
    analytics.track(user_id, "oauth_token_refresh_backend", {
        "provider": provider,
        "success": success,
        "error_type": error_type,
    })


def track_external_api_call(
    user_id: str,
    provider: str,
    endpoint: str,
    duration_ms: float,
    status_code: int,
    success: bool
) -> None:
    """Track external API call to integration."""
    analytics.track(user_id, "external_api_call_backend", {
        "provider": provider,
        "endpoint_category": _categorize_endpoint(endpoint),
        "duration_ms": round(duration_ms, 2),
        "status_code": status_code,
        "success": success,
    })


def _categorize_endpoint(endpoint: str) -> str:
    """Categorize endpoint for analytics."""
    if "file" in endpoint.lower():
        return "file_operation"
    if "user" in endpoint.lower():
        return "user_data"
    if "auth" in endpoint.lower():
        return "authentication"
    return "other"
```

---

## 4.5 Event Validation

### Pydantic Schemas

```python
# backend/schemas/analytics_events.py

from pydantic import BaseModel, Field, validator
from typing import Optional, List, Any
from datetime import datetime


class BaseEventProperties(BaseModel):
    """Base properties for all events."""
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        extra = "allow"


class APIRequestEvent(BaseEventProperties):
    """API request event schema."""
    endpoint: str
    method: str
    status_code: int
    request_duration_ms: float = Field(ge=0)
    is_slow: bool = False

    @validator("endpoint")
    def validate_endpoint(cls, v):
        if not v.startswith("/"):
            raise ValueError("Endpoint must start with /")
        return v


class ChatCompletionEvent(BaseEventProperties):
    """Chat completion event schema."""
    chat_id: str
    model: str
    prompt_tokens: int = Field(ge=0)
    completion_tokens: int = Field(ge=0)
    total_tokens: int = Field(ge=0)
    duration_ms: float = Field(ge=0)
    success: bool
    error_type: Optional[str] = None

    @validator("total_tokens")
    def validate_total_tokens(cls, v, values):
        expected = values.get("prompt_tokens", 0) + values.get("completion_tokens", 0)
        if v != expected:
            raise ValueError(f"total_tokens ({v}) must equal prompt_tokens + completion_tokens ({expected})")
        return v


class DocumentProcessedEvent(BaseEventProperties):
    """Document processing event schema."""
    knowledge_base_id: str
    document_id: str
    file_type: str
    file_size_kb: int = Field(ge=0)
    pages_processed: int = Field(ge=0)
    chunks_created: int = Field(ge=0)
    processing_time_ms: float = Field(ge=0)
    success: bool
    error_type: Optional[str] = None


class RAGQueryEvent(BaseEventProperties):
    """RAG query event schema."""
    chat_id: str
    knowledge_bases_queried: int = Field(ge=1)
    query_length: int = Field(ge=1)
    documents_retrieved: int = Field(ge=0)
    retrieval_time_ms: float = Field(ge=0)
    avg_relevance_score: float = Field(ge=0, le=1)
    max_relevance_score: float = Field(ge=0, le=1)
```

### Validation Middleware

```python
# backend/middleware/event_validation.py

from typing import Dict, Any, Optional, Type
from pydantic import BaseModel, ValidationError
import logging

from schemas.analytics_events import (
    APIRequestEvent,
    ChatCompletionEvent,
    DocumentProcessedEvent,
    RAGQueryEvent,
)

logger = logging.getLogger(__name__)


EVENT_SCHEMAS: Dict[str, Type[BaseModel]] = {
    "api_request": APIRequestEvent,
    "chat_completion_backend": ChatCompletionEvent,
    "document_processed_backend": DocumentProcessedEvent,
    "rag_query_backend": RAGQueryEvent,
}


def validate_event(event_name: str, properties: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Validate event properties against schema.
    Returns validated properties or None if validation fails.
    """
    schema = EVENT_SCHEMAS.get(event_name)

    if not schema:
        # No schema defined, pass through
        return properties

    try:
        validated = schema(**properties)
        return validated.dict()
    except ValidationError as e:
        logger.warning(f"Event validation failed for {event_name}: {e}")
        return None


class ValidatedAnalyticsService:
    """Analytics service wrapper with validation."""

    def __init__(self, analytics_service):
        self._analytics = analytics_service

    def track(
        self,
        user_id: str,
        event: str,
        properties: Optional[Dict[str, Any]] = None
    ) -> None:
        """Track event with validation."""
        validated_props = validate_event(event, properties or {})

        if validated_props is None:
            logger.error(f"Skipping invalid event: {event}")
            return

        self._analytics.track(user_id, event, validated_props)
```

---

## 4.6 Consent Header Handling

### Consent Extraction

```python
# backend/utils/consent.py

from fastapi import Request
from typing import Dict


def get_consent_from_request(request: Request) -> Dict[str, bool]:
    """Extract consent settings from request headers."""
    consent_header = request.headers.get("X-Analytics-Consent", "")

    # Parse consent header format: "essential:true,analytics:true,marketing:false"
    consent = {
        "essential": True,  # Always true
        "analytics": False,
        "marketing": False,
    }

    if consent_header:
        try:
            for item in consent_header.split(","):
                key, value = item.split(":")
                if key in consent:
                    consent[key] = value.lower() == "true"
        except ValueError:
            # Invalid format, use defaults
            pass

    return consent


def has_analytics_consent(request: Request) -> bool:
    """Check if request has analytics consent."""
    consent = get_consent_from_request(request)
    return consent.get("analytics", False)
```

### Frontend Consent Header

```typescript
// src/lib/api/client.ts

import { get } from 'svelte/store';
import { consentStore } from '$lib/analytics/stores/consent.store';

// Add consent header to all API requests
export function getRequestHeaders(): Record<string, string> {
  const consent = get(consentStore);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Add consent header
  const consentParts = Object.entries(consent.categories)
    .map(([key, value]) => `${key}:${value}`)
    .join(',');

  headers['X-Analytics-Consent'] = consentParts;

  // Add user ID if available
  const userId = get(userStore)?.pseudonymized_user_id;
  if (userId) {
    headers['X-User-ID'] = userId;
  }

  return headers;
}
```

---

## 4.7 Performance Tracking

### Database Query Tracking

```python
# backend/utils/db_analytics.py

import time
from functools import wraps
from typing import Callable, Any
import logging

from services.analytics_service import analytics

logger = logging.getLogger(__name__)


def track_db_query(query_name: str):
    """Decorator to track database query performance."""
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs) -> Any:
            start_time = time.time()
            error_type = None

            try:
                result = await func(*args, **kwargs)
                return result
            except Exception as e:
                error_type = type(e).__name__
                raise
            finally:
                duration_ms = (time.time() - start_time) * 1000

                # Only track slow queries (>100ms) to reduce noise
                if duration_ms > 100:
                    logger.info(f"Slow query {query_name}: {duration_ms:.2f}ms")

                    # Get user_id from context if available
                    user_id = kwargs.get("user_id", "system")

                    analytics.track(user_id, "slow_db_query", {
                        "query_name": query_name,
                        "duration_ms": round(duration_ms, 2),
                        "error_type": error_type,
                    })

        return wrapper
    return decorator


# Usage example
class ChatRepository:
    @track_db_query("get_chat_by_id")
    async def get_by_id(self, chat_id: str, user_id: str):
        # Database query...
        pass
```

### External Service Tracking

```python
# backend/utils/external_service_analytics.py

import time
import httpx
from typing import Optional
from services.analytics_service import analytics


class TrackedHTTPClient:
    """HTTP client with analytics tracking."""

    def __init__(self, user_id: str, service_name: str):
        self.user_id = user_id
        self.service_name = service_name
        self._client = httpx.AsyncClient()

    async def request(
        self,
        method: str,
        url: str,
        **kwargs
    ) -> httpx.Response:
        start_time = time.time()

        try:
            response = await self._client.request(method, url, **kwargs)
            duration_ms = (time.time() - start_time) * 1000

            analytics.track(self.user_id, "external_service_request", {
                "service_name": self.service_name,
                "method": method,
                "status_code": response.status_code,
                "duration_ms": round(duration_ms, 2),
                "success": response.is_success,
            })

            return response

        except Exception as e:
            duration_ms = (time.time() - start_time) * 1000

            analytics.track(self.user_id, "external_service_error", {
                "service_name": self.service_name,
                "method": method,
                "error_type": type(e).__name__,
                "duration_ms": round(duration_ms, 2),
            })

            raise

    async def close(self):
        await self._client.aclose()
```

---

## 4.8 Batch Processing

### Background Event Processing

```python
# backend/services/analytics_batch.py

import asyncio
from typing import List, Dict, Any
from datetime import datetime
import logging

from services.analytics_service import analytics

logger = logging.getLogger(__name__)


class AnalyticsBatchProcessor:
    """Process analytics events in batches."""

    def __init__(self, batch_size: int = 100, flush_interval: float = 30.0):
        self.batch_size = batch_size
        self.flush_interval = flush_interval
        self._queue: List[Dict[str, Any]] = []
        self._lock = asyncio.Lock()
        self._running = False

    async def start(self):
        """Start the batch processor."""
        self._running = True
        asyncio.create_task(self._flush_loop())

    async def stop(self):
        """Stop the batch processor and flush remaining events."""
        self._running = False
        await self._flush()

    async def enqueue(self, user_id: str, event: str, properties: Dict[str, Any]):
        """Add event to batch queue."""
        async with self._lock:
            self._queue.append({
                "user_id": user_id,
                "event": event,
                "properties": properties,
                "timestamp": datetime.utcnow().isoformat(),
            })

            if len(self._queue) >= self.batch_size:
                await self._flush()

    async def _flush(self):
        """Flush queued events to PostHog."""
        async with self._lock:
            if not self._queue:
                return

            events_to_send = self._queue.copy()
            self._queue.clear()

        try:
            for event in events_to_send:
                analytics.track(
                    event["user_id"],
                    event["event"],
                    event["properties"]
                )

            analytics.flush()
            logger.debug(f"Flushed {len(events_to_send)} events")

        except Exception as e:
            logger.error(f"Failed to flush events: {e}")
            # Re-queue failed events
            async with self._lock:
                self._queue = events_to_send + self._queue

    async def _flush_loop(self):
        """Periodically flush events."""
        while self._running:
            await asyncio.sleep(self.flush_interval)
            await self._flush()


# Global instance
batch_processor = AnalyticsBatchProcessor()
```

---

## 4.9 Testing

### Unit Tests

```python
# backend/tests/test_analytics_service.py

import pytest
from unittest.mock import patch, MagicMock

from services.analytics_service import AnalyticsService


class TestAnalyticsService:
    @pytest.fixture
    def analytics_service(self):
        service = AnalyticsService()
        return service

    @pytest.fixture
    def mock_posthog(self):
        with patch("services.analytics_service.posthog") as mock:
            yield mock

    def test_init_disabled_when_no_api_key(self, analytics_service, mock_posthog):
        with patch.object(analytics_service.config, "posthog_api_key", ""):
            analytics_service.init()
            assert not analytics_service._initialized

    def test_track_enriches_properties(self, analytics_service, mock_posthog):
        analytics_service._initialized = True

        analytics_service.track("user-123", "test_event", {"foo": "bar"})

        mock_posthog.capture.assert_called_once()
        call_args = mock_posthog.capture.call_args
        properties = call_args.kwargs["properties"]

        assert properties["foo"] == "bar"
        assert properties["source"] == "backend"
        assert "timestamp_server" in properties

    def test_track_skipped_when_not_initialized(self, analytics_service, mock_posthog):
        analytics_service._initialized = False

        analytics_service.track("user-123", "test_event", {})

        mock_posthog.capture.assert_not_called()


class TestAnalyticsMiddleware:
    @pytest.fixture
    def app(self):
        from fastapi import FastAPI
        from middleware.analytics_middleware import AnalyticsMiddleware

        app = FastAPI()
        app.add_middleware(AnalyticsMiddleware)

        @app.get("/api/test")
        async def test_endpoint():
            return {"status": "ok"}

        return app

    @pytest.mark.asyncio
    async def test_tracks_request_with_consent(self, app):
        from fastapi.testclient import TestClient

        with patch("middleware.analytics_middleware.analytics") as mock_analytics:
            client = TestClient(app)
            response = client.get(
                "/api/test",
                headers={
                    "X-Analytics-Consent": "true",
                    "X-User-ID": "user-123"
                }
            )

            assert response.status_code == 200
            mock_analytics.track.assert_called_once()

    @pytest.mark.asyncio
    async def test_skips_tracking_without_consent(self, app):
        from fastapi.testclient import TestClient

        with patch("middleware.analytics_middleware.analytics") as mock_analytics:
            client = TestClient(app)
            response = client.get("/api/test")

            assert response.status_code == 200
            mock_analytics.track.assert_not_called()
```

---

## 4.10 Erfolgskriterien

### Phase 4 Completion Checklist

- [ ] PostHog Python SDK installiert und konfiguriert
- [ ] Analytics Service implementiert
- [ ] FastAPI Middleware für Request-Tracking
- [ ] Consent Header Handling
- [ ] Server-Side Events:
  - [ ] Chat Completion Events
  - [ ] Document Processing Events
  - [ ] RAG Query Events
  - [ ] External API Calls
- [ ] Event Validation mit Pydantic
- [ ] Performance Tracking (DB, External Services)
- [ ] Batch Processing für High-Volume Events
- [ ] Unit Tests mit >80% Coverage
- [ ] Backend Events in PostHog sichtbar

### PostHog Validation Query

```sql
-- Verify backend events are being tracked
SELECT
  event,
  properties.source,
  COUNT(*) as count
FROM events
WHERE properties.source = 'backend'
  AND timestamp > NOW() - INTERVAL 24 HOUR
GROUP BY event, properties.source
ORDER BY count DESC;
```

---

## Nächste Schritte

Nach Abschluss dieser Phase: [Phase 5: Optimization](./PHASE_5_OPTIMIZATION.md)
