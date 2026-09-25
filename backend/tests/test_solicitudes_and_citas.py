"""Pruebas de solicitudes de servicio, citas y ciclo de vida de ejecución."""

from datetime import UTC, datetime, timedelta

from fastapi.testclient import TestClient


def test_crear_solicitud_exitosa(
    client: TestClient, auth_cliente_headers: dict[str, str]
) -> None:
    fecha_futura = (datetime.now(UTC) + timedelta(days=5)).isoformat()
    payload = {
        "servicio_id": 1,
        "modalidad_id": 1,  # REMOTO
        "descripcion_necesidad": "Requiero refactorización de base de datos relacional y APIs.",
        "fecha_propuesta": fecha_futura,
        "valor_acordado": 180000.00,
    }
    response = client.post(
        "/api/v1/solicitudes", json=payload, headers=auth_cliente_headers
    )
    assert response.status_code == 201
    data = response.json()
    assert data["cliente_usuario_id"] == 1
    assert data["estado_codigo"] == "PENDIENTE"


def test_regla_no_autocontratacion(
    client: TestClient, auth_trabajador_headers: dict[str, str]
) -> None:
    # Trabajador (id=2) intentando contratar su propio servicio (servicio 1 pertenece a perfil 1, usuario 2)
    # Primero agregamos el rol CLIENTE al usuario 2 temporalmente para probar la regla de negocio
    from app.mocks.mock_db import mock_db

    mock_db.usuario_roles.append(
        {"usuario_id": 2, "rol_id": 1, "asignado_en": datetime.now(UTC)}
    )

    fecha_futura = (datetime.now(UTC) + timedelta(days=2)).isoformat()
    payload = {
        "servicio_id": 1,
        "modalidad_id": 1,
        "descripcion_necesidad": "Intento de auto-contratación no permitido.",
        "fecha_propuesta": fecha_futura,
    }
    response = client.post(
        "/api/v1/solicitudes", json=payload, headers=auth_trabajador_headers
    )
    assert response.status_code == 422
    data = response.json()
    assert data["error"]["code"] == "BUSINESS_RULE_VIOLATION"
    assert "propio servicio" in data["error"]["message"].lower()


def test_regla_solicitud_presencial_requiere_direccion(
    client: TestClient, auth_cliente_headers: dict[str, str]
) -> None:
    # Servicio 2 es PRESENCIAL (modalidad 2)
    fecha_futura = (datetime.now(UTC) + timedelta(days=3)).isoformat()
    payload = {
        "servicio_id": 2,
        "modalidad_id": 2,
        "direccion_id": None,  # Omitida deliberadamente
        "descripcion_necesidad": "Instalación en sitio pero sin dirección.",
        "fecha_propuesta": fecha_futura,
    }
    response = client.post(
        "/api/v1/solicitudes", json=payload, headers=auth_cliente_headers
    )
    assert response.status_code == 422
    data = response.json()
    assert data["error"]["code"] == "BUSINESS_RULE_VIOLATION"
    assert "dirección" in data["error"]["message"].lower()


def test_ciclo_cita_iniciar_y_finalizar(
    client: TestClient, auth_trabajador_headers: dict[str, str]
) -> None:
    # En mock_db, solicitud_servicio_id = 1 ya está ACEPTADA
    # Crear una nueva cita
    fecha_inicio = (datetime.now(UTC) + timedelta(days=1)).isoformat()
    payload_cita = {
        "fecha_inicio": fecha_inicio,
        "plataforma_remota": "Google Meet",
    }
    # Reset de citas para la prueba
    from app.mocks.mock_db import mock_db

    mock_db.citas = []

    resp_cita = client.post(
        "/api/v1/solicitudes/1/cita", json=payload_cita, headers=auth_trabajador_headers
    )
    assert resp_cita.status_code == 201
    cita = resp_cita.json()
    cita_id = cita["cita_id"]
    assert cita["estado_codigo"] == "PROGRAMADA"

    # Iniciar cita
    resp_iniciar = client.patch(
        f"/api/v1/citas/{cita_id}/iniciar", headers=auth_trabajador_headers
    )
    assert resp_iniciar.status_code == 200
    assert resp_iniciar.json()["estado_codigo"] == "EN_EJECUCION"

    # Finalizar cita
    resp_fin = client.patch(
        f"/api/v1/citas/{cita_id}/finalizar", headers=auth_trabajador_headers
    )
    assert resp_fin.status_code == 200
    assert resp_fin.json()["estado_codigo"] == "FINALIZADA"
