"""Pruebas de búsqueda pública, publicación de servicios y perfiles profesionales."""

from fastapi.testclient import TestClient


def test_buscar_servicios_publico(client: TestClient) -> None:
    response = client.get("/api/v1/servicios")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2


def test_filtrar_servicios_por_modalidad(client: TestClient) -> None:
    # Modalidad 1 = REMOTO
    response = client.get("/api/v1/servicios?modalidad_id=1")
    assert response.status_code == 200
    for s in response.json():
        codigos_mod = [m["codigo"] for m in s["modalidades"]]
        assert "REMOTO" in codigos_mod


def test_consultar_perfil_publico_trabajador(client: TestClient) -> None:
    response = client.get("/api/v1/trabajadores/1")
    assert response.status_code == 200
    data = response.json()
    assert data["perfil_trabajador_id"] == 1
    assert data["calificacion_promedio"] == 5.0
    assert data["total_calificaciones"] == 1
    assert len(data["habilidades"]) >= 1


def test_publicar_servicio_trabajador(
    client: TestClient, auth_trabajador_headers: dict[str, str]
) -> None:
    payload = {
        "subcategoria_id": 1,
        "titulo": "Auditoría de Arquitectura Cloud y 3FN",
        "descripcion": "Revisión técnica de normalización y rendimiento relacional.",
        "precio_base": 220000.00,
        "tiempo_estimado_horas": 8,
        "revisiones_incluidas": 1,
        "modalidades_ids": [1],  # REMOTO
    }
    response = client.post(
        "/api/v1/servicios", json=payload, headers=auth_trabajador_headers
    )
    assert response.status_code == 201
    data = response.json()
    assert data["titulo"] == "Auditoría de Arquitectura Cloud y 3FN"
    assert data["activo"] is True


def test_cliente_no_puede_publicar_servicio(
    client: TestClient, auth_cliente_headers: dict[str, str]
) -> None:
    payload = {
        "subcategoria_id": 1,
        "titulo": "Servicio no autorizado",
        "descripcion": "El cliente no tiene rol trabajador.",
        "precio_base": 100000.00,
        "tiempo_estimado_horas": 2,
        "modalidades_ids": [1],
    }
    response = client.post(
        "/api/v1/servicios", json=payload, headers=auth_cliente_headers
    )
    assert response.status_code == 403
    data = response.json()
    assert data["error"]["code"] == "INSUFFICIENT_PERMISSIONS"


def test_validar_precio_positivo(
    client: TestClient, auth_trabajador_headers: dict[str, str]
) -> None:
    payload = {
        "subcategoria_id": 1,
        "titulo": "Precio Inválido",
        "descripcion": "Precio menor o igual a cero.",
        "precio_base": -50.00,
        "tiempo_estimado_horas": 2,
        "modalidades_ids": [1],
    }
    response = client.post(
        "/api/v1/servicios", json=payload, headers=auth_trabajador_headers
    )
    assert response.status_code == 422
    data = response.json()
    assert data["error"]["code"] == "VALIDATION_ERROR"
