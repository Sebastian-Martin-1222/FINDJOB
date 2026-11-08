"""Conexión PostgreSQL para Cloud SQL."""

import psycopg

from app.core.config import settings


def get_db_connection():
    """Crear una conexión PostgreSQL por socket de Cloud SQL."""
    required = {
        "INSTANCE_CONNECTION_NAME": settings.INSTANCE_CONNECTION_NAME,
        "DB_NAME": settings.DB_NAME,
        "DB_USER": settings.DB_USER,
        "DB_PASSWORD": settings.DB_PASSWORD,
    }
    missing = [name for name, value in required.items() if not value]
    if missing:
        raise RuntimeError("Configuración de base de datos incompleta: " + ", ".join(missing))

    return psycopg.connect(
        dbname=settings.DB_NAME,
        user=settings.DB_USER,
        password=settings.DB_PASSWORD,
        host=f"/cloudsql/{settings.INSTANCE_CONNECTION_NAME}",
        connect_timeout=10,
    )
