"""Pruebas unitarias, de integración y de seguridad para el módulo de autenticación JWT."""

from fastapi.testclient import TestClient
from jose import jwt

from app.core.config import settings


def test_login_exitoso(client: TestClient) -> None:
    """Verifica que un usuario con credenciales correctas obtenga access y refresh token."""
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "cliente@findjob.com", "password": "Password123!"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"
    assert data["expires_in"] > 0


def test_login_credenciales_invalidas(client: TestClient) -> None:
    """Verifica el rechazo uniforme (401) ante contraseña errónea o usuario inexistente."""
    # Contraseña incorrecta
    res1 = client.post(
        "/api/v1/auth/login",
        json={"email": "cliente@findjob.com", "password": "WrongPassword999!"},
    )
    assert res1.status_code == 401
    assert res1.json()["error"]["code"] == "INVALID_CREDENTIALS"

    # Usuario no registrado
    res2 = client.post(
        "/api/v1/auth/login",
        json={"email": "noexiste@findjob.com", "password": "Password123!"},
    )
    assert res2.status_code == 401
    assert res2.json()["error"]["code"] == "INVALID_CREDENTIALS"


def test_registro_exitoso(client: TestClient) -> None:
    """Verifica el registro seguro de un nuevo usuario emitiendo sesión JWT."""
    nuevo_email = "nuevo_usuario_test@findjob.com"
    payload = {
        "email": nuevo_email,
        "password": "SecurePassword2026*",
        "nombres": "Pedro",
        "apellidos": "Martínez",
        "telefono": "+573009998877",
        "rol": "CLIENTE",
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["usuario"]["email"] == nuevo_email
    assert data["usuario"]["nombres"] == "Pedro"
    assert "CLIENTE" in data["usuario"]["roles"]
    assert "access_token" in data["tokens"]
    assert "refresh_token" in data["tokens"]


def test_registro_email_duplicado(client: TestClient) -> None:
    """Verifica que no se permita registrar una cuenta con un correo ya existente (409 Conflict)."""
    payload = {
        "email": "cliente@findjob.com",
        "password": "Password123!",
        "nombres": "Carlos",
        "apellidos": "Duplicado",
        "rol": "CLIENTE",
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 409
    assert response.json()["error"]["code"] == "EMAIL_ALREADY_EXISTS"


def test_registro_prevenir_mass_assignment(client: TestClient) -> None:
    """Verifica que campos no declarados en el DTO sean rechazados con 422 (OWASP API3)."""
    payload = {
        "email": "hacker@test.com",
        "password": "Password123!",
        "nombres": "Atacante",
        "apellidos": "Malicioso",
        "rol": "CLIENTE",
        "is_admin": True,  # Campo no permitido
        "usuario_id": 999,  # Intento de forzar ID
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 422


def test_refresh_token_rotacion_y_revocacion(client: TestClient) -> None:
    """Verifica el ciclo de rotación del refresh token y la invalidación del token previo."""
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": "cliente@findjob.com", "password": "Password123!"},
    )
    assert login_res.status_code == 200
    original_refresh = login_res.json()["refresh_token"]

    # 1. Rotación exitosa
    refresh_res = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": original_refresh},
    )
    assert refresh_res.status_code == 200
    new_data = refresh_res.json()
    assert "access_token" in new_data
    assert "refresh_token" in new_data
    assert new_data["refresh_token"] != original_refresh

    # 2. Intento de reusar el refresh token anterior (debe fallar por estar revocado)
    replay_res = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": original_refresh},
    )
    assert replay_res.status_code == 401
    assert replay_res.json()["error"]["code"] == "TOKEN_REVOKED"


def test_acceso_recurso_protegido_con_jwt(client: TestClient) -> None:
    """Verifica que el access token JWT emitido permita consumir endpoints protegidos (/me)."""
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": "cliente@findjob.com", "password": "Password123!"},
    )
    access_token = login_res.json()["access_token"]

    response = client.get(
        "/api/v1/me",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    assert response.status_code == 200
    assert response.json()["email"] == "cliente@findjob.com"
    assert response.json()["usuario_id"] == 1


def test_rechazo_algoritmo_none_y_firma_falsa(client: TestClient) -> None:
    """Verifica que tokens forjados con algoritmo none o firmados con clave distinta sean rechazados (401)."""
    # 1. Token no firmado / algoritmo none (ataque clásico forjado sin firma)
    import base64
    import json
    h = base64.urlsafe_b64encode(json.dumps({"alg": "none", "typ": "JWT"}).encode()).decode().rstrip("=")
    p = base64.urlsafe_b64encode(json.dumps({"sub": "1", "email": "cliente@findjob.com"}).encode()).decode().rstrip("=")
    token_none = f"{h}.{p}."
    res1 = client.get(
        "/api/v1/me",
        headers={"Authorization": f"Bearer {token_none}"},
    )
    assert res1.status_code == 401

    # 2. Token firmado con clave incorrecta
    token_fake = jwt.encode(
        {"sub": "1", "email": "cliente@findjob.com"},
        "clave-falsa-atacante-123",
        algorithm=settings.ALGORITHM,
    )
    res2 = client.get(
        "/api/v1/me",
        headers={"Authorization": f"Bearer {token_fake}"},
    )
    assert res2.status_code == 401


def test_logout_revoca_token(client: TestClient) -> None:
    """Verifica que al hacer logout el token quede revocado para peticiones subsecuentes."""
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": "cliente@findjob.com", "password": "Password123!"},
    )
    access_token = login_res.json()["access_token"]

    # Comprobar que funciona antes del logout
    res_before = client.get(
        "/api/v1/me",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    assert res_before.status_code == 200

    # Logout
    logout_res = client.post(
        "/api/v1/auth/logout",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    assert logout_res.status_code == 200

    # Comprobar que fue revocado
    res_after = client.get(
        "/api/v1/me",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    assert res_after.status_code == 401
    assert res_after.json()["error"]["code"] == "TOKEN_REVOKED"
