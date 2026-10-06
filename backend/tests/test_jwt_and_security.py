"""Suite de pruebas de ciberseguridad, validación rigurosa de JWT, RBAC y BOLA/IDOR."""

import uuid
from datetime import UTC, datetime, timedelta

import pytest
from fastapi.testclient import TestClient
from jose import jwt

from app.core.config import settings
from app.core.security import create_access_token, revoke_token
from app.mocks.mock_db import mock_db

# ---------------------------------------------------------------------------
# 1. Pruebas de Autenticación JWT y Criptografía
# ---------------------------------------------------------------------------


def test_jwt_autenticacion_exitosa(client: TestClient) -> None:
    """Un token JWT válido debe permitir el acceso a endpoints protegidos."""
    token = create_access_token(data={"sub": "1", "email": "cliente@findjob.com", "roles": ["CLIENTE"]})
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/v1/me", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["usuario_id"] == 1
    assert data["email"] == "cliente@findjob.com"


def test_acceso_sin_token_ni_credenciales(client: TestClient) -> None:
    """Petición a endpoint protegido sin header Authorization debe retornar 401."""
    response = client.get("/api/v1/me")
    assert response.status_code == 401
    data = response.json()
    assert data["error"]["code"] == "UNAUTHENTICATED"


def test_jwt_token_malformado(client: TestClient) -> None:
    """Un token malformado o cadena aleatoria debe ser rechazado con 401."""
    headers = {"Authorization": "Bearer token_completamente_invalido_xyz123"}
    response = client.get("/api/v1/me", headers=headers)
    assert response.status_code == 401
    data = response.json()
    assert data["error"]["code"] in {"INVALID_TOKEN", "INVALID_TOKEN_SIGNATURE"}


def test_jwt_firma_invalida(client: TestClient) -> None:
    """Un token firmado con una clave secreta incorrecta debe ser rechazado con 401."""
    token_falso = create_access_token(
        data={"sub": "1", "email": "juan.perez@example.com"},
        secret_key="clave-secreta-totalmente-falsa-e-invalida",
    )
    headers = {"Authorization": f"Bearer {token_falso}"}
    response = client.get("/api/v1/me", headers=headers)
    assert response.status_code == 401
    data = response.json()
    assert data["error"]["code"] == "INVALID_TOKEN_SIGNATURE"


def test_jwt_token_expirado(client: TestClient) -> None:
    """Un token con exp en el pasado debe retornar 401 TOKEN_EXPIRED."""
    token_expirado = create_access_token(
        data={"sub": "1", "email": "juan.perez@example.com"},
        expires_delta=timedelta(seconds=-10),
    )
    headers = {"Authorization": f"Bearer {token_expirado}"}
    response = client.get("/api/v1/me", headers=headers)
    assert response.status_code == 401
    data = response.json()
    assert data["error"]["code"] == "TOKEN_EXPIRED"


def test_jwt_token_premature_nbf(client: TestClient) -> None:
    """Un token con nbf en el futuro no debe ser aceptado aún (401)."""
    payload = {
        "sub": "1",
        "email": "juan.perez@example.com",
        "iat": datetime.now(UTC),
        "nbf": datetime.now(UTC) + timedelta(minutes=10),
        "exp": datetime.now(UTC) + timedelta(minutes=60),
        "iss": settings.JWT_ISSUER,
        "aud": settings.JWT_AUDIENCE,
    }
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/v1/me", headers=headers)
    assert response.status_code == 401
    data = response.json()
    assert data["error"]["code"] == "INVALID_TOKEN_CLAIMS"


def test_jwt_emisor_invalido(client: TestClient) -> None:
    """Un token con iss incorrecto debe retornar 401."""
    payload = {
        "sub": "1",
        "email": "juan.perez@example.com",
        "iat": datetime.now(UTC),
        "exp": datetime.now(UTC) + timedelta(minutes=60),
        "iss": "emisor-fraudulento-no-autorizado",
        "aud": settings.JWT_AUDIENCE,
    }
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/v1/me", headers=headers)
    assert response.status_code == 401
    data = response.json()
    assert data["error"]["code"] == "INVALID_TOKEN_CLAIMS"


def test_jwt_audiencia_invalida(client: TestClient) -> None:
    """Un token con aud incorrecto debe retornar 401."""
    payload = {
        "sub": "1",
        "email": "juan.perez@example.com",
        "iat": datetime.now(UTC),
        "exp": datetime.now(UTC) + timedelta(minutes=60),
        "iss": settings.JWT_ISSUER,
        "aud": "audiencia-invalida",
    }
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/v1/me", headers=headers)
    assert response.status_code == 401
    data = response.json()
    assert data["error"]["code"] == "INVALID_TOKEN_CLAIMS"


def test_jwt_rechazo_algoritmo_none(client: TestClient) -> None:
    """Tokens con algoritmo 'none' o sin firma deben ser rechazados inmediatamente."""
    import base64
    import json

    header = base64.urlsafe_b64encode(json.dumps({"alg": "none", "typ": "JWT"}).encode()).decode().rstrip("=")
    payload_data = (
        base64.urlsafe_b64encode(
            json.dumps(
                {
                    "sub": "1",
                    "email": "cliente@findjob.com",
                    "exp": int((datetime.now(UTC) + timedelta(hours=1)).timestamp()),
                    "iss": settings.JWT_ISSUER,
                    "aud": settings.JWT_AUDIENCE,
                }
            ).encode()
        )
        .decode()
        .rstrip("=")
    )

    token_none = f"{header}.{payload_data}."
    headers = {"Authorization": f"Bearer {token_none}"}
    response = client.get("/api/v1/me", headers=headers)
    assert response.status_code == 401
    data = response.json()
    assert data["error"]["code"] in {"UNSECURED_TOKEN_ALGORITHM", "INVALID_TOKEN"}


def test_jwt_sin_sub_valido(client: TestClient) -> None:
    """Un token sin campo 'sub' debe retornar 401 INVALID_TOKEN_PAYLOAD."""
    payload = {
        "email": "juan.perez@example.com",
        "exp": datetime.now(UTC) + timedelta(minutes=60),
        "iss": settings.JWT_ISSUER,
        "aud": settings.JWT_AUDIENCE,
    }
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/v1/me", headers=headers)
    assert response.status_code == 401
    data = response.json()
    assert data["error"]["code"] == "INVALID_TOKEN_PAYLOAD"


def test_jwt_token_revocado(client: TestClient) -> None:
    """Un token cuyo JTI ha sido revocado debe ser rechazado con 401."""
    jti_id = str(uuid.uuid4())
    token = create_access_token(data={"sub": "1", "jti": jti_id})
    # Revocar token explícitamente
    revoke_token(jti_id)

    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/v1/me", headers=headers)
    assert response.status_code == 401
    data = response.json()
    assert data["error"]["code"] == "TOKEN_REVOKED"


def test_jwt_rotacion_de_claves(client: TestClient, monkeypatch: pytest.MonkeyPatch) -> None:
    """Tokens emitidos con claves anteriores deben ser válidos durante la transición de rotación."""
    clave_antigua = "clave-secreta-antigua-antes-de-la-rotacion-12345"
    clave_nueva = "clave-secreta-nueva-despues-de-la-rotacion-67890"

    monkeypatch.setattr(settings, "SECRET_KEY", clave_nueva)
    monkeypatch.setattr(settings, "PREVIOUS_SECRET_KEYS", [clave_antigua])

    token_con_clave_antigua = create_access_token(
        data={"sub": "1", "email": "juan.perez@example.com"},
        secret_key=clave_antigua,
    )
    headers = {"Authorization": f"Bearer {token_con_clave_antigua}"}
    response = client.get("/api/v1/me", headers=headers)
    assert response.status_code == 200
    assert response.json()["usuario_id"] == 1


def test_usuario_inactivo_con_token_valido_retorna_403(client: TestClient) -> None:
    """Si el usuario asociado al token está inactivo en base de datos, retornar 403."""
    # Desactivar usuario 1 temporalmente
    usr = next(u for u in mock_db.usuarios if u["usuario_id"] == 1)
    usr["activo"] = False

    token = create_access_token(data={"sub": "1", "email": "juan.perez@example.com"})
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/v1/me", headers=headers)
    assert response.status_code == 403
    data = response.json()
    assert data["error"]["code"] == "USER_INACTIVE"


# ---------------------------------------------------------------------------
# 2. Pruebas de Autorización RBAC y Aislamiento BOLA/IDOR
# ---------------------------------------------------------------------------


def test_rbac_cliente_no_puede_crear_servicios(client: TestClient) -> None:
    """Un usuario con rol CLIENTE no debe poder publicar servicios de trabajador (403)."""
    token_cliente = create_access_token(data={"sub": "1"})
    headers = {"Authorization": f"Bearer {token_cliente}"}
    payload = {
        "subcategoria_id": 1,
        "titulo": "Servicio no autorizado",
        "descripcion": "Descripción del servicio",
        "precio_base": 50000,
        "tiempo_estimado_horas": 4,
        "revisiones_incluidas": 1,
        "modalidades_ids": [1],
    }
    response = client.post("/api/v1/servicios", json=payload, headers=headers)
    assert response.status_code == 403
    data = response.json()
    assert data["error"]["code"] == "INSUFFICIENT_PERMISSIONS"


def test_rbac_trabajador_no_puede_crear_solicitudes(client: TestClient) -> None:
    """Un usuario únicamente TRABAJADOR no debe poder crear solicitudes (rol CLIENTE requerido)."""
    token_trabajador = create_access_token(data={"sub": "2"})
    headers = {"Authorization": f"Bearer {token_trabajador}"}
    payload = {
        "servicio_id": 1,
        "modalidad_id": 1,
        "descripcion_necesidad": "Necesito este servicio urgente",
        "fecha_propuesta": "2026-10-15T10:00:00Z",
    }
    response = client.post("/api/v1/solicitudes", json=payload, headers=headers)
    assert response.status_code == 403
    data = response.json()
    assert data["error"]["code"] == "INSUFFICIENT_PERMISSIONS"


def test_bola_modificar_direccion_ajena(client: TestClient) -> None:
    """Un usuario no debe poder modificar direcciones que pertenecen a otro usuario (BOLA/IDOR)."""
    token_user2 = create_access_token(data={"sub": "2"})
    headers = {"Authorization": f"Bearer {token_user2}"}
    payload = {"alias": "Alias Fraudulento"}
    response = client.patch("/api/v1/me/direcciones/1", json=payload, headers=headers)
    assert response.status_code == 403
    data = response.json()
    assert data["error"]["code"] == "FORBIDDEN"


def test_bola_eliminar_direccion_ajena(client: TestClient) -> None:
    """Un usuario no debe poder eliminar direcciones de otro usuario (BOLA/IDOR)."""
    token_user2 = create_access_token(data={"sub": "2"})
    headers = {"Authorization": f"Bearer {token_user2}"}
    response = client.delete("/api/v1/me/direcciones/1", headers=headers)
    assert response.status_code == 403
    data = response.json()
    assert data["error"]["code"] == "FORBIDDEN"


def test_bola_acceso_mensajes_conversacion_ajena(client: TestClient) -> None:
    """Un usuario no participante en la conversación no debe poder leer sus mensajes."""
    token_admin = create_access_token(data={"sub": "3"})
    headers = {"Authorization": f"Bearer {token_admin}"}
    response = client.get("/api/v1/conversaciones/1/mensajes", headers=headers)
    assert response.status_code == 403
    data = response.json()
    assert data["error"]["code"] == "FORBIDDEN"


def test_bola_cancelar_solicitud_ajena(client: TestClient) -> None:
    """Un usuario que no sea el cliente solicitante no puede cancelar la solicitud."""
    token_user2 = create_access_token(data={"sub": "2"})
    headers = {"Authorization": f"Bearer {token_user2}"}
    response = client.patch("/api/v1/solicitudes/1/cancelar", headers=headers)
    assert response.status_code in {403, 404}


def test_admin_actualizar_roles_usuario_con_rol_inexistente(client: TestClient) -> None:
    """Asignar un rol inexistente debe fallar con 404 EntityNotFoundException."""
    token_admin = create_access_token(data={"sub": "3"})
    headers = {"Authorization": f"Bearer {token_admin}"}
    payload = {"roles_ids": [99999]}
    response = client.put("/api/v1/admin/usuarios/1/roles", json=payload, headers=headers)
    assert response.status_code == 404
    data = response.json()
    assert data["error"]["code"] == "ENTITY_NOT_FOUND"


# ---------------------------------------------------------------------------
# 3. Pruebas de Mass Assignment y Validación de Entrada
# ---------------------------------------------------------------------------


def test_mass_assignment_rechazo_campos_extra_en_direccion(client: TestClient) -> None:
    """Campos no declarados en el payload deben ser rechazados con 422 (OWASP API3)."""
    token_cliente = create_access_token(data={"sub": "1"})
    headers = {"Authorization": f"Bearer {token_cliente}"}
    payload = {
        "ciudad_id": 1,
        "alias": "Oficina Central",
        "linea_direccion": "Cra 7 # 71-21",
        "campo_extra_no_permitido": "valor_malicioso",
        "es_admin": True,
    }
    response = client.post("/api/v1/me/direcciones", json=payload, headers=headers)
    assert response.status_code == 422
    data = response.json()
    assert data["error"]["code"] == "VALIDATION_ERROR"


def test_mass_assignment_rechazo_campos_extra_en_solicitud(client: TestClient) -> None:
    """Campos extra en la creación de solicitud deben ser rechazados."""
    token_cliente = create_access_token(data={"sub": "1"})
    headers = {"Authorization": f"Bearer {token_cliente}"}
    payload = {
        "servicio_id": 1,
        "modalidad_id": 1,
        "descripcion_necesidad": "Revisión completa de arquitectura",
        "fecha_propuesta": "2026-10-20T14:00:00Z",
        "estado_solicitud_id": 2,  # Intentar inyectar estado ACEPTADA directamente
    }
    response = client.post("/api/v1/solicitudes", json=payload, headers=headers)
    assert response.status_code == 422
    data = response.json()
    assert data["error"]["code"] == "VALIDATION_ERROR"
