# API Contract / Test Harness

The backend exposes OpenAPI automatically at:
- `GET /openapi.json`
- `GET /docs`

## Endpoints

### Health
```bash
curl -s http://127.0.0.1:8000/health
```

### List Inventory (filterable)
```bash
curl -s "http://127.0.0.1:8000/vehicles?make=Toyota&model=Corolla&min_age_days=0&max_age_days=180"
```

### Aging Stock (>90 days)
```bash
curl -s http://127.0.0.1:8000/vehicles/aging
```

### Log/Persist Action for a Vehicle
```bash
curl -s -X PATCH http://127.0.0.1:8000/vehicles/2/action \
  -H "Content-Type: application/json" \
  -d '{"proposed_action":"Price Reduction Planned"}'
```
