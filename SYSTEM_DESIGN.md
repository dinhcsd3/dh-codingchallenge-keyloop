# Intelligent Inventory Dashboard - System Design

## Architecture Diagram

```mermaid
flowchart LR
    Manager[Dealership Manager Browser] --> FE[Frontend Dashboard\n(React/Angular/Vue - future)]
    FE --> API[Inventory API Service\n(FastAPI)]
    API --> DB[(SQLite/PostgreSQL)]
    API --> OBS[Observability Stack\nLogs + Metrics + Traces]
```

## Component Roles
- **Frontend Dashboard**: Displays inventory list, filters (make/model/age), highlights aging stock, and lets managers submit actions.
- **Inventory API Service**: Exposes REST endpoints for listing/filtering vehicles, retrieving aging stock, and persisting manager actions.
- **Database**: Stores vehicles and manager action/status updates per vehicle.
- **Observability Stack**: Captures request logs, API latency/error metrics, and trace spans for request-path visibility.

## Data Flow
1. Manager opens dashboard and applies filters.
2. Frontend calls `GET /vehicles` with query params.
3. API computes `days_in_inventory` and `is_aging_stock` (>90 days), returns sorted list with aging stock first.
4. Frontend can call `GET /vehicles/aging` for dedicated aging panel.
5. Manager records action via `PATCH /vehicles/{id}/action`.
6. API persists action in database and returns updated metadata.

## Technology Choices & Justification
- **FastAPI (Python)**: Quick REST delivery, built-in OpenAPI docs, typed models.
- **SQLite (implementation)**: Lightweight persistent storage for challenge scope; easy migration path to PostgreSQL.
- **Pytest + TestClient**: Fast API and business-rule validation with low overhead.
- **Uvicorn**: Standard ASGI server for local/dev runtime.

## Observability Strategy
- **Logging**: Structured request/response and error logs from API layer.
- **Metrics**: Request count/latency/error-rate per endpoint; aging-stock counts.
- **Tracing**: Distributed traces for API + DB calls (OpenTelemetry-ready instrumentation).
- **Operational Alerts**: Trigger on elevated error rate, high p95 latency, or DB failures.

## GenAI-Assisted Design Process
- Used GenAI to rapidly compare backend-first vs frontend-first delivery options.
- Used GenAI prompts to draft schema and endpoint shapes aligned to acceptance criteria.
- Manually validated generated design decisions for persistence, testability, and extensibility.
- Refined outputs by constraining scope to the minimum viable backend while preserving future scalability.
