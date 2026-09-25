"""Pruebas de usuario, roles, direcciones y autorización de recursos."""

from fastapi.testclient import TestClient


def test_me_sin_autenticacion(client: TestClient) -> None:
    response = client.get("/api/v1/me")
    assert response.status_code == 401
    data = response.json()
    assert data["error"]["code"] == "UNAUTHENTICATED"


def test_me_con_autenticacion_cliente(
    client: TestClient, auth_cliente_headers: dict[str, str]
) -> None:
    response = client.get("/api/v1/me", headers=auth_cliente_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "cliente@findjob.com"
    assert "CLIENTE" in data["roles"]


def test_consultar_roles(
    client: TestClient, auth_trabajador_headers: dict[str, str]
) -> None:
    response = client.get("/api/v1/me/roles", headers=auth_trabajador_headers)
    assert response.status_code == 200
    roles = response.json()
    assert "TRABAJADOR" in roles


def test_crear_direccion_cliente(
    client: TestClient, auth_cliente_headers: dict[str, str]
) -> None:
    payload = {
        "ciudad_id": 1,
        "alias": "Apartamento Norte",
        "linea_direccion": "Calle 140 # 19-30 Apto 401",
        "complemento": "Torre B",
        "latitud": 4.721234,
        "longitud": -74.035412,
    }
    response = client.post(
        "/api/v1/me/direcciones", json=payload, headers=auth_cliente_headers
    )
    assert response.status_code == 201
    data = response.json()
    assert data["alias"] == "Apartamento Norte"
    assert data["usuario_id"] == 1


def test_crear_direccion_alias_duplicado(
    client: TestClient, auth_cliente_headers: dict[str, str]
) -> None:
    # La oficina central ya existe en los mocks
    payload = {
        "ciudad_id": 1,
        "alias": "Oficina Central",
        "linea_direccion": "Calle 100 # 15-20",
    }
    response = client.post(
        "/api/v1/me/direcciones", json=payload, headers=auth_cliente_headers
    )
    assert response.status_code == 409
    data = response.json()
    assert data["error"]["code"] == "CONFLICT"


def test_eliminar_direccion_ajena(
    client: TestClient, auth_trabajador_headers: dict[str, str]
) -> None:
    # Trabajador (id=2) intentando eliminar la dirección id=1 del cliente (id=1)
    response = client.delete(
        "/api/v1/me/direcciones/1", headers=auth_trabajador_headers
    )
    assert response.status_code == 403
    data = response.json()
    assert data["error"]["code"] == "FORBIDDEN"


def test_prevenir_mass_assignment_extra_fields(
    client: TestClient, auth_cliente_headers: dict[str, str]
) -> None:
    """Verifica el cumplimiento de REGLAS_NOTEBOOK.md (OWASP API3 - Mass Assignment)."""
    payload = {
        "nombres": "Cliente Modificado",
        "rol": "ADMIN",
        "usuario_id": 999,
        "es_superusuario": True,
    }
    response = client.patch(
        "/api/v1/me", json=payload, headers=auth_cliente_headers
    )
    assert response.status_code == 422
    data = response.json()
    assert data["error"]["code"] == "VALIDATION_ERROR"
