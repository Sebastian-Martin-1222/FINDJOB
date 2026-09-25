"""Configuración y fixtures compartidas para la suite de pruebas de FindJob."""

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.mocks.mock_db import mock_db


@pytest.fixture(autouse=True)
def reset_mock_db() -> None:
    """Restablece la base de datos mock antes de cada prueba para aislar escenarios."""
    mock_db._reset()


@pytest.fixture
def client() -> TestClient:
    """Cliente HTTP de prueba para ejecutar peticiones sobre FastAPI."""
    return TestClient(app)


@pytest.fixture
def auth_cliente_headers() -> dict[str, str]:
    """Headers para simular peticiones del usuario con rol CLIENTE (usuario_id = 1)."""
    return {"X-User-Id": "1"}


@pytest.fixture
def auth_trabajador_headers() -> dict[str, str]:
    """Headers para simular peticiones del usuario con rol TRABAJADOR (usuario_id = 2)."""
    return {"X-User-Id": "2"}


@pytest.fixture
def auth_admin_headers() -> dict[str, str]:
    """Headers para simular peticiones del usuario con rol ADMIN (usuario_id = 3)."""
    return {"X-User-Id": "3"}
