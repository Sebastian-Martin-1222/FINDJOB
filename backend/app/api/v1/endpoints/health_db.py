"""Endpoint de verificación de conectividad con Cloud SQL."""

from fastapi import APIRouter, HTTPException

from app.db import get_db_connection

router = APIRouter()


@router.get("/health/db", tags=["Salud del Sistema"])
def database_health_check() -> dict[str, str]:
    """Verificar conectividad real con PostgreSQL."""
    try:
        with get_db_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                result = cursor.fetchone()

        if not result or result[0] != 1:
            raise RuntimeError("PostgreSQL no respondió correctamente.")

        return {
            "status": "ok",
            "database": "PostgreSQL",
            "connection": "Cloud SQL",
        }
    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail="No fue posible conectar con PostgreSQL.",
        ) from exc
