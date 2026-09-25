"""Módulo de seguridad, encriptación y abstracción de tokens."""

from datetime import UTC, datetime, timedelta
from typing import Any

from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel

from app.core.config import settings
from app.core.exceptions import AuthenticationException

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class TokenData(BaseModel):
    """Estructura de datos contenida dentro de un token de autenticación."""

    sub: str | None = None
    email: str | None = None
    roles: list[str] = []
    exp: datetime | None = None


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica si una contraseña en texto plano coincide con el hash."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Genera hash seguro de una contraseña."""
    return pwd_context.hash(password)


def create_access_token(
    data: dict[str, Any], expires_delta: timedelta | None = None
) -> str:
    """Crea un token JWT firmado para sesiones internas o pruebas."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(UTC) + expires_delta
    else:
        expire = datetime.now(UTC) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )
    return encoded_jwt


def decode_token(token: str) -> TokenData:
    """Decodifica y valida la firma y vigencia de un token."""
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        user_id: str | None = payload.get("sub")
        email: str | None = payload.get("email")
        roles: list[str] = payload.get("roles", [])
        if user_id is None:
            raise AuthenticationException(
                message="El token no contiene un identificador de usuario válido.",
                code="INVALID_TOKEN_PAYLOAD",
            )
        return TokenData(sub=user_id, email=email, roles=roles)
    except JWTError as exc:
        raise AuthenticationException(
            message="Token inválido o expirado.",
            code="INVALID_TOKEN",
        ) from exc
