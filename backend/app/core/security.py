"""Módulo de seguridad, encriptación y abstracción de tokens."""

import uuid
from datetime import UTC, datetime, timedelta
from typing import Any

from jose import jwt
from jose.exceptions import ExpiredSignatureError, JWTClaimsError, JWTError
from passlib.context import CryptContext
from pydantic import BaseModel

from app.core.config import settings
from app.core.exceptions import AuthenticationException

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Conjunto en memoria de tokens revocados (para logout o invalidación explícita)
_revoked_tokens: set[str] = set()


class TokenData(BaseModel):
    """Estructura de datos contenida dentro de un token de autenticación."""

    sub: str | None = None
    email: str | None = None
    roles: list[str] = []
    exp: datetime | None = None
    nbf: datetime | None = None
    iat: datetime | None = None
    iss: str | None = None
    aud: str | None = None
    jti: str | None = None


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica si una contraseña en texto plano coincide con el hash."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Genera hash seguro de una contraseña."""
    return pwd_context.hash(password)


def revoke_token(jti: str) -> None:
    """Registra un identificador de token (jti) en la lista de revocación."""
    _revoked_tokens.add(jti)


def is_token_revoked(jti: str | None) -> bool:
    """Verifica si un jti ha sido revocado."""
    if not jti:
        return False
    return jti in _revoked_tokens


def create_access_token(
    data: dict[str, Any],
    expires_delta: timedelta | None = None,
    secret_key: str | None = None,
    algorithm: str | None = None,
) -> str:
    """Crea un token JWT firmado para sesiones internas o pruebas."""
    to_encode = data.copy()
    now = datetime.now(UTC)
    expire = (
        now + expires_delta
        if expires_delta
        else now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    # Inyección de claims estándar de seguridad
    if "exp" not in to_encode:
        to_encode["exp"] = expire
    if "iat" not in to_encode:
        to_encode["iat"] = now
    if "nbf" not in to_encode:
        to_encode["nbf"] = now
    if "iss" not in to_encode and settings.JWT_ISSUER:
        to_encode["iss"] = settings.JWT_ISSUER
    if "aud" not in to_encode and settings.JWT_AUDIENCE:
        to_encode["aud"] = settings.JWT_AUDIENCE
    if "jti" not in to_encode:
        to_encode["jti"] = str(uuid.uuid4())

    key = secret_key or settings.SECRET_KEY
    alg = algorithm or settings.ALGORITHM

    if alg not in settings.ALLOWED_ALGORITHMS or alg.lower() == "none":
        raise ValueError(f"Algoritmo no permitido: {alg}")

    encoded_jwt = jwt.encode(to_encode, key, algorithm=alg)
    return encoded_jwt


def decode_token(
    token: str,
    verify_aud: bool = True,
    verify_iss: bool = True,
) -> TokenData:
    """Decodifica y valida rigurosamente firma, algoritmo, expiración y claims."""
    try:
        # 1. Inspección del encabezado no verificado para mitigar algoritmo 'none' o algoritmos no permitidos
        unverified_headers = jwt.get_unverified_header(token)
        token_alg = unverified_headers.get("alg")

        if not token_alg or token_alg.lower() == "none" or token_alg not in settings.ALLOWED_ALGORITHMS:
            raise AuthenticationException(
                message="Algoritmo de token no permitido o inseguro.",
                code="UNSECURED_TOKEN_ALGORITHM",
            )

        # 2. Intentar decodificación con la clave actual o claves anteriores (soporte de rotación)
        keys_to_try = [settings.SECRET_KEY] + settings.PREVIOUS_SECRET_KEYS
        payload = None
        last_exc = None

        decode_options = {
            "verify_signature": True,
            "verify_exp": True,
            "verify_nbf": True,
            "verify_iat": True,
            "verify_aud": verify_aud and bool(settings.JWT_AUDIENCE),
            "verify_iss": verify_iss and bool(settings.JWT_ISSUER),
        }

        for key in keys_to_try:
            try:
                payload = jwt.decode(
                    token,
                    key,
                    algorithms=settings.ALLOWED_ALGORITHMS,
                    audience=settings.JWT_AUDIENCE if (verify_aud and settings.JWT_AUDIENCE) else None,
                    issuer=settings.JWT_ISSUER if (verify_iss and settings.JWT_ISSUER) else None,
                    options=decode_options,
                )
                break
            except ExpiredSignatureError as exp_err:
                raise AuthenticationException(
                    message="El token ha expirado. Por favor autentíquese nuevamente.",
                    code="TOKEN_EXPIRED",
                ) from exp_err
            except JWTClaimsError as claim_err:
                raise AuthenticationException(
                    message=f"Reclamos del token inválidos ({claim_err}).",
                    code="INVALID_TOKEN_CLAIMS",
                ) from claim_err
            except JWTError as exc:
                last_exc = exc
                continue

        if payload is None:
            raise AuthenticationException(
                message="Firma de token inválida o token malformado.",
                code="INVALID_TOKEN_SIGNATURE",
            ) from last_exc

        # 3. Validación de claims requeridos
        user_id: str | None = payload.get("sub")
        email: str | None = payload.get("email")
        roles: list[str] = payload.get("roles", [])
        jti: str | None = payload.get("jti")

        if not user_id:
            raise AuthenticationException(
                message="El token no contiene un identificador de usuario válido.",
                code="INVALID_TOKEN_PAYLOAD",
            )

        # 4. Validación de revocación
        if is_token_revoked(jti):
            raise AuthenticationException(
                message="El token ha sido revocado.",
                code="TOKEN_REVOKED",
            )

        return TokenData(
            sub=user_id,
            email=email,
            roles=roles,
            exp=datetime.fromtimestamp(payload["exp"], tz=UTC) if "exp" in payload else None,
            iat=datetime.fromtimestamp(payload["iat"], tz=UTC) if "iat" in payload else None,
            nbf=datetime.fromtimestamp(payload["nbf"], tz=UTC) if "nbf" in payload else None,
            iss=payload.get("iss"),
            aud=payload.get("aud"),
            jti=jti,
        )
    except AuthenticationException:
        raise
    except Exception as exc:
        raise AuthenticationException(
            message="Token inválido, malformado o ilegible.",
            code="INVALID_TOKEN",
        ) from exc
