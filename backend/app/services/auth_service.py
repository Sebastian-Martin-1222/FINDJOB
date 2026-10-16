"""Servicio de autenticación, emisión, rotación y revocación de tokens JWT."""

import uuid
from datetime import UTC, datetime
from typing import Any

from app.core.config import settings
from app.core.exceptions import (
    AuthenticationException,
    AuthorizationException,
    ConflictException,
)
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
    decode_token,
    get_password_hash,
    revoke_token,
    verify_password,
)
from app.persistence.store import data_store
from app.schemas.auth import (
    AuthUserOut,
    LoginRequest,
    RefreshTokenRequest,
    RegisterRequest,
    RegisterResponse,
    TokenResponse,
)

# Diccionario auxiliar en memoria para contraseñas de usuarios mock
_PASSWORD_STORE: dict[int, str] = {}
# Contraseña estándar para usuarios semilla en modo mock/test
_DEFAULT_TEST_PASSWORD_HASH = get_password_hash("Password123!")


class AuthService:
    """Lógica de negocio para autenticación basada en JWT."""

    def _obtener_roles_usuario(self, usuario_id: int) -> list[str]:
        roles: list[str] = []
        for ur in data_store.usuario_roles:
            if ur["usuario_id"] == usuario_id:
                for r in data_store.roles:
                    if r["rol_id"] == ur["rol_id"]:
                        roles.append(r["codigo"])
        return roles

    def _obtener_hash_usuario(self, usuario: dict[str, Any]) -> str:
        uid = usuario["usuario_id"]
        if uid in _PASSWORD_STORE:
            return _PASSWORD_STORE[uid]
        if "password_hash" in usuario:
            return usuario["password_hash"]
        # Asignar hash por defecto para usuarios sembrados en memoria
        _PASSWORD_STORE[uid] = _DEFAULT_TEST_PASSWORD_HASH
        return _PASSWORD_STORE[uid]

    def _generar_par_tokens(self, usuario: dict[str, Any]) -> TokenResponse:
        uid = usuario["usuario_id"]
        roles = self._obtener_roles_usuario(uid)

        access_token = create_access_token(
            data={
                "sub": str(uid),
                "email": usuario["email"],
                "roles": roles,
            }
        )
        refresh_token = create_refresh_token(
            data={
                "sub": str(uid),
                "email": usuario["email"],
            }
        )
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )

    def login(self, data: LoginRequest) -> TokenResponse:
        """Autenticar usuario con credenciales y emitir par de tokens."""
        email_clean = data.email.strip().lower()

        usuario = next(
            (u for u in data_store.usuarios if u["email"].strip().lower() == email_clean),
            None,
        )
        if not usuario:
            # Mensaje genérico para mitigar enumeración de cuentas
            raise AuthenticationException(
                message="Credenciales de acceso incorrectas.",
                code="INVALID_CREDENTIALS",
            )

        if not usuario.get("activo", True):
            raise AuthorizationException(
                message="La cuenta de usuario se encuentra inactiva o suspendida.",
                code="USER_INACTIVE",
            )

        stored_hash = self._obtener_hash_usuario(usuario)
        if not verify_password(data.password, stored_hash):
            raise AuthenticationException(
                message="Credenciales de acceso incorrectas.",
                code="INVALID_CREDENTIALS",
            )

        return self._generar_par_tokens(usuario)

    def register(self, data: RegisterRequest) -> RegisterResponse:
        """Registrar una nueva cuenta de usuario y emitir sesión."""
        email_clean = data.email.strip().lower()

        existe = any(
            u["email"].strip().lower() == email_clean for u in data_store.usuarios
        )
        if existe:
            raise ConflictException(
                message="El correo electrónico ya se encuentra registrado.",
                code="EMAIL_ALREADY_EXISTS",
            )

        # Determinar rol a asignar
        rol_codigo = data.rol.upper()
        rol_obj = next(
            (r for r in data_store.roles if r["codigo"].upper() == rol_codigo),
            None,
        )
        if not rol_obj:
            raise ConflictException(
                message=f"El rol especificado '{data.rol}' no existe.",
                code="INVALID_ROLE",
            )

        now = datetime.now(UTC)
        next_id = max((u["usuario_id"] for u in data_store.usuarios), default=0) + 1
        hashed_password = get_password_hash(data.password)

        nuevo_usuario: dict[str, Any] = {
            "usuario_id": next_id,
            "uid_autenticacion": f"auth_uid_{uuid.uuid4().hex[:16]}",
            "email": email_clean,
            "nombres": data.nombres.strip(),
            "apellidos": data.apellidos.strip(),
            "telefono": data.telefono,
            "activo": True,
            "creado_en": now,
            "actualizado_en": now,
        }

        data_store.usuarios.append(nuevo_usuario)
        _PASSWORD_STORE[next_id] = hashed_password

        # Asignar rol
        data_store.usuario_roles.append(
            {
                "usuario_id": next_id,
                "rol_id": rol_obj["rol_id"],
                "asignado_en": now,
            }
        )

        tokens = self._generar_par_tokens(nuevo_usuario)
        roles = [rol_obj["codigo"]]

        usuario_out = AuthUserOut(
            usuario_id=next_id,
            email=nuevo_usuario["email"],
            nombres=nuevo_usuario["nombres"],
            apellidos=nuevo_usuario["apellidos"],
            telefono=nuevo_usuario["telefono"],
            roles=roles,
        )

        return RegisterResponse(usuario=usuario_out, tokens=tokens)

    def refresh(self, data: RefreshTokenRequest) -> TokenResponse:
        """Rotar refresh token y emitir nuevo par de tokens."""
        token_data = decode_refresh_token(data.refresh_token)

        try:
            uid_int = int(token_data.sub or "0")
        except ValueError as exc:
            raise AuthenticationException(
                message="Identificador de usuario inválido en refresh token.",
                code="INVALID_TOKEN_SUB",
            ) from exc

        usuario = next(
            (u for u in data_store.usuarios if u["usuario_id"] == uid_int),
            None,
        )
        if not usuario:
            raise AuthenticationException(
                message="Usuario asociado al token no encontrado.",
                code="USER_NOT_FOUND",
            )

        if not usuario.get("activo", True):
            raise AuthorizationException(
                message="La cuenta de usuario se encuentra inactiva o suspendida.",
                code="USER_INACTIVE",
            )

        # Rotación estricta: revocar el refresh token previo
        if token_data.jti:
            revoke_token(token_data.jti)

        return self._generar_par_tokens(usuario)

    def logout(self, token: str) -> None:
        """Cerrar sesión revocando el token activo."""
        token_data = decode_token(token)
        if token_data.jti:
            revoke_token(token_data.jti)


auth_service = AuthService()
