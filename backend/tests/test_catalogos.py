"""Pruebas para endpoints de catálogos y geografía."""

from fastapi.testclient import TestClient


def test_listar_categorias(client: TestClient) -> None:
    response = client.get("/api/v1/categorias")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2
    assert any(c["nombre"] == "Tecnología y Software" for c in data)


def test_consultar_subcategorias(client: TestClient) -> None:
    response = client.get("/api/v1/categorias/1/subcategorias")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert any(s["nombre"] == "Desarrollo de Software y Web" for s in data)


def test_consultar_subcategorias_categoria_inexistente(client: TestClient) -> None:
    response = client.get("/api/v1/categorias/999/subcategorias")
    assert response.status_code == 404
    data = response.json()
    assert data["error"]["code"] == "ENTITY_NOT_FOUND"


def test_consultar_modalidades(client: TestClient) -> None:
    response = client.get("/api/v1/modalidades")
    assert response.status_code == 200
    codigos = [m["codigo"] for m in response.json()]
    assert "REMOTO" in codigos
    assert "PRESENCIAL" in codigos
    # Regla: No existe modalidad AMBOS
    assert "AMBOS" not in codigos


def test_consultar_ciudades(client: TestClient) -> None:
    response = client.get("/api/v1/ciudades")
    assert response.status_code == 200
    ciudades = [c["nombre"] for c in response.json()]
    assert "Bogotá" in ciudades
