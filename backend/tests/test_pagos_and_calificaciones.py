"""Pruebas de pagos, comisión de plataforma y calificaciones de citas finalizadas."""

from fastapi.testclient import TestClient


def test_pago_exitoso_cita_finalizada(
    client: TestClient, auth_cliente_headers: dict[str, str]
) -> None:
    # Cita 1 en mock_db está FINALIZADA, reiniciamos mock_db.pagos para probar el registro
    from app.mocks.mock_db import mock_db

    mock_db.pagos = []

    payload = {
        "metodo_pago_id": 1,  # SIMULADO
        "monto_total": 200000.00,
    }
    response = client.post(
        "/api/v1/citas/1/pagos", json=payload, headers=auth_cliente_headers
    )
    assert response.status_code == 201
    data = response.json()
    assert data["cita_id"] == 1
    assert float(data["monto_total"]) == 200000.00
    # Comisión del 10%
    assert float(data["monto_comision"]) == 20000.00
    assert float(data["monto_trabajador"]) == 180000.00
    assert data["estado_pago_codigo"] == "APROBADO"


def test_pago_falla_si_cita_no_finalizada(
    client: TestClient, auth_cliente_headers: dict[str, str]
) -> None:
    # Modificar estado de cita 1 a PROGRAMADA
    from app.mocks.mock_db import mock_db

    mock_db.citas[0]["estado_cita_id"] = 1  # PROGRAMADA
    mock_db.pagos = []

    payload = {"metodo_pago_id": 1, "monto_total": 100000.00}
    response = client.post(
        "/api/v1/citas/1/pagos", json=payload, headers=auth_cliente_headers
    )
    assert response.status_code == 422
    data = response.json()
    assert data["error"]["code"] == "BUSINESS_RULE_VIOLATION"


def test_calificar_cita_finalizada(
    client: TestClient, auth_cliente_headers: dict[str, str]
) -> None:
    # Cita 1 está FINALIZADA, vaciamos calificaciones para la prueba
    from app.mocks.mock_db import mock_db

    mock_db.calificaciones = []

    payload = {
        "puntuacion": 5,
        "comentario": "Excelente trabajo, superó todas las expectativas.",
    }
    response = client.post(
        "/api/v1/citas/1/calificacion", json=payload, headers=auth_cliente_headers
    )
    assert response.status_code == 201
    data = response.json()
    assert data["puntuacion"] == 5
    assert data["cita_id"] == 1


def test_calificar_puntuacion_invalida(
    client: TestClient, auth_cliente_headers: dict[str, str]
) -> None:
    payload = {
        "puntuacion": 6,  # Rango permitido 1 a 5
        "comentario": "Fuera de rango",
    }
    response = client.post(
        "/api/v1/citas/1/calificacion", json=payload, headers=auth_cliente_headers
    )
    assert response.status_code == 422
    data = response.json()
    assert data["error"]["code"] == "VALIDATION_ERROR"
