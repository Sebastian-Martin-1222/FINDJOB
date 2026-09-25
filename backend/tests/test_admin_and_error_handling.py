"""Pruebas para el rol ADMIN y sanitización de respuestas de error."""

from fastapi.testclient import TestClient


def test_admin_listar_usuarios(
    client: TestClient, auth_admin_headers: dict[str, str]
) -> None:
    response = client.get("/api/v1/admin/usuarios", headers=auth_admin_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 3


def test_cliente_no_puede_acceder_a_admin(
    client: TestClient, auth_cliente_headers: dict[str, str]
) -> None:
    response = client.get("/api/v1/admin/usuarios", headers=auth_cliente_headers)
    assert response.status_code == 403
    data = response.json()
    assert data["error"]["code"] == "INSUFFICIENT_PERMISSIONS"


def test_admin_actualizar_estado_usuario(
    client: TestClient, auth_admin_headers: dict[str, str]
) -> None:
    payload = {"activo": False}
    response = client.patch(
        "/api/v1/admin/usuarios/1/estado", json=payload, headers=auth_admin_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["activo"] is False


def test_estructura_uniforme_de_errores_sin_stack_trace(client: TestClient) -> None:
    # Petición a ruta inexistente
    response = client.get("/api/v1/ruta-inexistente-totalmente")
    assert response.status_code == 404
    data = response.json()
    assert "error" in data
    assert "code" in data["error"]
    assert "message" in data["error"]
    # Verificar que no hay claves de trace ni dumps de Python
    assert "traceback" not in str(data).lower()
    assert "exception" not in str(data).lower()
