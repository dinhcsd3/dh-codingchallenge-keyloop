import os
import sqlite3
from datetime import date, timedelta

DEFAULT_DB_PATH = os.getenv("INVENTORY_DB_PATH", "inventory.db")


def get_connection(db_path: str = DEFAULT_DB_PATH) -> sqlite3.Connection:
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn


def init_db(db_path: str = DEFAULT_DB_PATH) -> None:
    with get_connection(db_path) as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS vehicles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                vin TEXT NOT NULL UNIQUE,
                make TEXT NOT NULL,
                model TEXT NOT NULL,
                acquired_date TEXT NOT NULL
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS vehicle_actions (
                vehicle_id INTEGER PRIMARY KEY,
                status TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY(vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
            )
            """
        )


def seed_if_empty(db_path: str = DEFAULT_DB_PATH) -> None:
    with get_connection(db_path) as conn:
        existing = conn.execute("SELECT COUNT(*) AS count FROM vehicles").fetchone()["count"]
        if existing > 0:
            return

        today = date.today()
        vehicles = [
            ("VIN001", "Toyota", "Corolla", (today - timedelta(days=45)).isoformat()),
            ("VIN002", "BMW", "X5", (today - timedelta(days=120)).isoformat()),
            ("VIN003", "Tesla", "Model 3", (today - timedelta(days=92)).isoformat()),
            ("VIN004", "Honda", "Civic", (today - timedelta(days=10)).isoformat()),
        ]
        conn.executemany(
            "INSERT INTO vehicles (vin, make, model, acquired_date) VALUES (?, ?, ?, ?)",
            vehicles,
        )
        conn.commit()
