# dh-codingchallenge-keyloop

## Service Choice
This submission implements the **backend service layer** fully, with API contract examples to stub/mock frontend integration.

## Build & Run
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

API runs at `http://127.0.0.1:8000`.

## Test
```bash
pytest tests/test_inventory_api.py
```

## Artifacts
- System Design Document: `/home/runner/work/dh-codingchallenge-keyloop/dh-codingchallenge-keyloop/SYSTEM_DESIGN.md`
- API Contract/Test Harness: `/home/runner/work/dh-codingchallenge-keyloop/dh-codingchallenge-keyloop/API_CONTRACT.md`
- Backend Implementation: `/home/runner/work/dh-codingchallenge-keyloop/dh-codingchallenge-keyloop/app`
- Tests: `/home/runner/work/dh-codingchallenge-keyloop/dh-codingchallenge-keyloop/tests`

## AI Collaboration Narrative
- I used AI to generate an initial architecture option set and select a backend-first implementation path matching the challenge constraints.
- I used AI to draft endpoint, schema, and test outlines, then manually validated each requirement (filtering, aging-stock rule, persistent action logging).
- I iteratively verified and refined outputs through targeted tests and manual endpoint checks.
- I constrained generated changes to a minimal, maintainable implementation with clear extension points for production-scale upgrades.
