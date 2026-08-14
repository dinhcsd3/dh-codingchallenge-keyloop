from datetime import UTC, date, datetime
from typing import Literal

from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel, Field

from app.db import DEFAULT_DB_PATH, get_connection, init_db, seed_if_empty

app = FastAPI(title="Intelligent Inventory Dashboard API", version="1.0.0")


class VehicleActionUpdate(BaseModel):
    proposed_action: str = Field(min_length=1, max_length=200)


class Vehicle(BaseModel):
    id: int
    vin: str
    make: str
    model: str
    acquired_date: date
    days_in_inventory: int
    is_aging_stock: bool
    proposed_action: str | None


@app.on_event("startup")
def startup() -> None:
    init_db(DEFAULT_DB_PATH)
    seed_if_empty(DEFAULT_DB_PATH)


@app.get("/health")
def health() -> dict[str, Literal["ok"]]:
    return {"status": "ok"}


@app.get("/vehicles", response_model=list[Vehicle])
def list_vehicles(
    make: str | None = Query(default=None),
    model: str | None = Query(default=None),
    min_age_days: int | None = Query(default=None, ge=0),
    max_age_days: int | None = Query(default=None, ge=0),
    aging_only: bool = Query(default=False),
) -> list[Vehicle]:
    query = """
        SELECT
            v.id,
            v.vin,
            v.make,
            v.model,
            v.acquired_date,
            CAST(julianday('now') - julianday(v.acquired_date) AS INTEGER) AS days_in_inventory,
            CASE WHEN (julianday('now') - julianday(v.acquired_date)) > 90 THEN 1 ELSE 0 END AS is_aging_stock,
            a.status AS proposed_action
        FROM vehicles v
        LEFT JOIN vehicle_actions a ON a.vehicle_id = v.id
        WHERE 1=1
    """
    params: list[object] = []

    if make:
        query += " AND lower(v.make) = lower(?)"
        params.append(make)
    if model:
        query += " AND lower(v.model) = lower(?)"
        params.append(model)
    if min_age_days is not None:
        query += " AND (julianday('now') - julianday(v.acquired_date)) >= ?"
        params.append(min_age_days)
    if max_age_days is not None:
        query += " AND (julianday('now') - julianday(v.acquired_date)) <= ?"
        params.append(max_age_days)
    if aging_only:
        query += " AND (julianday('now') - julianday(v.acquired_date)) > 90"

    query += " ORDER BY is_aging_stock DESC, days_in_inventory DESC, v.id ASC"

    with get_connection(DEFAULT_DB_PATH) as conn:
        rows = conn.execute(query, params).fetchall()

    return [
        Vehicle(
            id=row["id"],
            vin=row["vin"],
            make=row["make"],
            model=row["model"],
            acquired_date=date.fromisoformat(row["acquired_date"]),
            days_in_inventory=row["days_in_inventory"],
            is_aging_stock=bool(row["is_aging_stock"]),
            proposed_action=row["proposed_action"],
        )
        for row in rows
    ]


@app.get("/vehicles/aging", response_model=list[Vehicle])
def list_aging_vehicles() -> list[Vehicle]:
    return list_vehicles(
        make=None,
        model=None,
        min_age_days=None,
        max_age_days=None,
        aging_only=True,
    )


@app.patch("/vehicles/{vehicle_id}/action")
def update_vehicle_action(vehicle_id: int, payload: VehicleActionUpdate) -> dict[str, str | int]:
    now = datetime.now(UTC).isoformat()
    with get_connection(DEFAULT_DB_PATH) as conn:
        exists = conn.execute("SELECT id FROM vehicles WHERE id = ?", (vehicle_id,)).fetchone()
        if not exists:
            raise HTTPException(status_code=404, detail="Vehicle not found")

        conn.execute(
            """
            INSERT INTO vehicle_actions (vehicle_id, status, updated_at)
            VALUES (?, ?, ?)
            ON CONFLICT(vehicle_id)
            DO UPDATE SET status = excluded.status, updated_at = excluded.updated_at
            """,
            (vehicle_id, payload.proposed_action, now),
        )
        conn.commit()

    return {
        "vehicle_id": vehicle_id,
        "proposed_action": payload.proposed_action,
        "updated_at": now,
    }
