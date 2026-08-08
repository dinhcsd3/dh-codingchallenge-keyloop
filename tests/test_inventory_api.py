from datetime import date, timedelta

import pytest
from fastapi.testclient import TestClient

from app.db import get_connection, init_db
from app.main import app


@pytest.fixture
def client(tmp_path, monkeypatch):
    db_path = tmp_path / "test_inventory.db"
    monkeypatch.setattr("app.db.DEFAULT_DB_PATH", str(db_path))
    monkeypatch.setattr("app.main.DEFAULT_DB_PATH", str(db_path))

    init_db(str(db_path))
    with get_connection(str(db_path)) as conn:
        today = date.today()
        vehicles = [
            ("TVIN1", "Toyota", "Corolla", (today - timedelta(days=30)).isoformat()),
            ("TVIN2", "Toyota", "Camry", (today - timedelta(days=95)).isoformat()),
            ("TVIN3", "BMW", "X5", (today - timedelta(days=140)).isoformat()),
        ]
        conn.executemany(
            "INSERT INTO vehicles (vin, make, model, acquired_date) VALUES (?, ?, ?, ?)",
            vehicles,
        )
        conn.commit()

    return TestClient(app)


def test_filters_inventory_by_make(client):
    response = client.get("/vehicles", params={"make": "Toyota"})
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert all(v["make"] == "Toyota" for v in data)


def test_aging_stock_endpoint_only_returns_over_90_days(client):
    response = client.get("/vehicles/aging")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert all(v["is_aging_stock"] for v in data)
    assert all(v["days_in_inventory"] > 90 for v in data)


def test_persist_action_for_vehicle(client):
    vehicle_id = client.get("/vehicles").json()[0]["id"]

    update = client.patch(
        f"/vehicles/{vehicle_id}/action",
        json={"proposed_action": "Price Reduction Planned"},
    )
    assert update.status_code == 200

    updated_vehicle = [v for v in client.get("/vehicles").json() if v["id"] == vehicle_id][0]
    assert updated_vehicle["proposed_action"] == "Price Reduction Planned"
