"""Módulo de seguridad, encriptación y abstracción de tokens."""

import uuid
from datetime import UTC, datetime, timedelta
from typing import Any

import bcrypt
from jose import JWTError, jwt
from pydantic import BaseModel

from app.core.config import settings
from app.core.exceptions import AuthenticationException

# Almacén de revocación de identificadores de token (jti)
_REVOKED_JTIS: set[str] = set()


class TokenData(BaseModel):
    """Estructura de datos contenida dentro de un token de autenticación."""

    sub: str | None = None
    email: str | None = None
    roles: list[str] = []
    exp: datetime | None = None
    jti: str | None = None
    token_type: str | None = None


def revoke_token(jti: str) -> None:
    """Revocar un token mediante su identificador único (jti)."""
    _REVOKED_JTIS.add(jti)


def is_token_revoked(jti: str | None) -> bool:
    """Verificar si un jti ha sido marcado como revocado."""
    if not jti:
        return False
    return jti in _REVOKED_JTIS


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica si una contraseña en texto plano coincide con el hash."""
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8")[:72],
            hashed_password.encode("utf-8"),
        )
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    """Genera hash seguro de una contraseña usando bcrypt."""
    pwd_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


def create_access_token(
    data: dict[str, Any], expires_delta: timedelta | None = None
) -> str:
    """Crea un access token JWT firmado con validación de claims y algoritmo explícito."""
    now = datetime.now(UTC)
    to_encode = data.copy()
    expire = (
        now + expires_delta
        if expires_delta
        else now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update(
        {
            "exp": expire,
            "iat": now,
            "nbf": now,
            "iss": settings.JWT_ISSUER,
            "aud": settings.JWT_AUDIENCE,
            "jti": to_encode.get("jti") or str(uuid.uuid4()),
            "token_type": "access",
        }
    )
    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )
    return encoded_jwt


def create_refresh_token(
    data: dict[str, Any], expires_delta: timedelta | None = None
) -> str:
    """Crea un refresh token JWT firmado para rotación de sesiones."""
    now = datetime.now(UTC)
    to_encode = data.copy()
    expire = (
        now + expires_delta
        if expires_delta
        else now + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    )

    to_encode.update(
        {
            "exp": expire,
            "iat": now,
            "nbf": now,
            "iss": settings.JWT_ISSUER,
            "aud": settings.JWT_AUDIENCE,
            "jti": to_encode.get("jti") or str(uuid.uuid4()),
            "token_type": "refresh",
        }
    )
    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )
    return encoded_jwt


def decode_token(token: str) -> TokenData:
    """Decodifica y valida la firma, vigencia, revocación y claims de un token."""
    try:
        # Lista explícita de algoritmos permitidos; rechaza 'none'
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
            options={"verify_aud": False, "verify_iss": False},
        )
        jti: str | None = payload.get("jti")
        if is_token_revoked(jti):
            raise AuthenticationException(
                message="El token ha sido revocado.",
                code="TOKEN_REVOKED",
            )

        user_id: str | None = payload.get("sub")
        email: str | None = payload.get("email")
        roles: list[str] = payload.get("roles", [])
        token_type: str | None = payload.get("token_type")

        if user_id is None:
            raise AuthenticationException(
                message="El token no contiene un identificador de usuario válido.",
                code="INVALID_TOKEN_PAYLOAD",
            )
        return TokenData(
            sub=user_id,
            email=email,
            roles=roles,
            jti=jti,
            token_type=token_type,
        )
    except AuthenticationException:
        raise
    except JWTError as exc:
        raise AuthenticationException(
            message="Token inválido o expirado.",
            code="INVALID_TOKEN",
        ) from exc


def decode_refresh_token(token: str) -> TokenData:
    """Decodifica y valida estrictamente un refresh token."""
    token_data = decode_token(token)
    if token_data.token_type != "refresh":
        raise AuthenticationException(
            message="El token proporcionado no corresponde a un refresh token válido.",
            code="INVALID_TOKEN_TYPE",
        )
    return token_data
