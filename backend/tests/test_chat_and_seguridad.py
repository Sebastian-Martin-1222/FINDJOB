"""Pruebas de chat interno (mensajería, lecturas) y seguridad presencial."""

from fastapi.testclient import TestClient


def test_listar_conversaciones_participante(
    client: TestClient, auth_cliente_headers: dict[str, str]
) -> None:
    response = client.get("/api/v1/conversaciones", headers=auth_cliente_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert data[0]["conversacion_id"] == 1


def test_enviar_mensaje_chat(
    client: TestClient, auth_cliente_headers: dict[str, str]
) -> None:
    payload = {"contenido": "Hola, ¿podemos revisar los requerimientos?"}
    response = client.post(
        "/api/v1/conversaciones/1/mensajes", json=payload, headers=auth_cliente_headers
    )
    assert response.status_code == 201
    data = response.json()
    assert data["contenido"] == payload["contenido"]
    assert data["remitente_usuario_id"] == 1


def test_no_participante_no_puede_enviar_mensaje(
    client: TestClient, auth_admin_headers: dict[str, str]
) -> None:
    # Admin (usuario_id = 3) no es participante de la conversación 1
    payload = {"contenido": "Mensaje no autorizado."}
    response = client.post(
        "/api/v1/conversaciones/1/mensajes", json=payload, headers=auth_admin_headers
    )
    assert response.status_code == 403
    data = response.json()
    assert data["error"]["code"] == "FORBIDDEN"


def test_generar_alerta_seguridad_presencial(
    client: TestClient, auth_cliente_headers: dict[str, str]
) -> None:
    # Ajustamos la cita 1 como PRESENCIAL en la solicitud para probar la alerta
    from app.mocks.mock_db import mock_db

    sol = mock_db.solicitudes_servicio[0]
    sol["modalidad_id"] = 2  # PRESENCIAL

    payload = {
        "tipo_alerta_id": 1,  # EMERGENCIA
        "descripcion": "Retraso excesivo y sospechoso en la llegada al sitio acordado.",
        "latitud": 4.655820,
        "longitud": -74.058310,
    }
    response = client.post(
        "/api/v1/citas/1/alertas-seguridad", json=payload, headers=auth_cliente_headers
    )
    assert response.status_code == 201
    data = response.json()
    assert data["cita_id"] == 1
    assert data["tipo_alerta_codigo"] == "EMERGENCIA"
