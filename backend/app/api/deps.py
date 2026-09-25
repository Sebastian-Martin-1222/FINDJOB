"""Inyección de dependencias para autenticación, autorización y roles."""

from collections.abc import Callable

from fastapi import Depends, Header
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel

from app.core.exceptions import AuthenticationException, AuthorizationException
from app.core.security import decode_token
from app.mocks.mock_db import mock_db

# Esquema de autenticación Bearer estándar
security_scheme = HTTPBearer(auto_error=False)


class CurrentUser(BaseModel):
    """Representa al usuario autenticado en la petición actual."""

    usuario_id: int
    uid_autenticacion: str | None = None
    email: str
    nombres: str
    apellidos: str
    roles: list[str] = []
    activo: bool = True

    def has_role(self, role: str) -> bool:
        """Verifica si el usuario posee un rol específico."""
        return role.upper() in [r.upper() for r in self.roles]


def _obtener_roles_usuario(usuario_id: int) -> list[str]:
    roles: list[str] = []
    for ur in mock_db.usuario_roles:
        if ur["usuario_id"] == usuario_id:
            for r in mock_db.roles:
                if r["rol_id"] == ur["rol_id"]:
                    roles.append(r["codigo"])
    return roles


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security_scheme),
    x_user_id: str | None = Header(
        None,
        alias="X-User-Id",
        description="ID de usuario para pruebas con mocks (1=Cliente, 2=Trabajador, 3=Admin)",
    ),
) -> CurrentUser:
    """Extrae y valida la identidad del usuario actual.

    Soporta:
    1. Token JWT en Authorization: Bearer <token>
    2. Header X-User-Id para pruebas en fase de prototipado sin proveedor externo
    """
    user_dict = None

    if credentials and credentials.credentials:
        # Validación de token JWT
        token_data = decode_token(credentials.credentials)
        # Buscar usuario en mock_db por email o sub
        for u in mock_db.usuarios:
            if (
                str(u["usuario_id"]) == str(token_data.sub)
                or u["email"] == token_data.email
            ):
                user_dict = u
                break
        if not user_dict:
            raise AuthenticationException(
                message="Usuario asociado al token no encontrado.",
                code="USER_NOT_FOUND",
            )
    elif x_user_id:
        try:
            uid_int = int(x_user_id)
            user_dict = next(
                (u for u in mock_db.usuarios if u["usuario_id"] == uid_int),
                None,
            )
        except ValueError:
            pass

    # Si no se envió credencial ni header de prueba
    if not user_dict:
        raise AuthenticationException(
            message="Autenticación requerida. Proporcione un Bearer token o header X-User-Id.",
            code="UNAUTHENTICATED",
        )

    if not user_dict.get("activo", True):
        raise AuthorizationException(
            message="La cuenta de usuario se encuentra inactiva o suspendida.",
            code="USER_INACTIVE",
        )

    roles = _obtener_roles_usuario(user_dict["usuario_id"])
    return CurrentUser(
        usuario_id=user_dict["usuario_id"],
        uid_autenticacion=user_dict.get("uid_autenticacion"),
        email=user_dict["email"],
        nombres=user_dict["nombres"],
        apellidos=user_dict["apellidos"],
        roles=roles,
        activo=user_dict.get("activo", True),
    )


def require_roles(required_roles: list[str]) -> Callable[[CurrentUser], CurrentUser]:
    """Generador de dependencias para autorización RBAC estricta."""

    def role_checker(
        current_user: CurrentUser = Depends(get_current_user),
    ) -> CurrentUser:
        tiene_alguno = any(current_user.has_role(r) for r in required_roles)
        if not tiene_alguno:
            roles_str = ", ".join(required_roles)
            raise AuthorizationException(
                message=f"Operación restringida. Se requiere alguno de los siguientes roles: [{roles_str}].",
                code="INSUFFICIENT_PERMISSIONS",
            )
        return current_user

    return role_checker


# Dependencias específicas de conveniencia
require_cliente = require_roles(["CLIENTE"])
require_trabajador = require_roles(["TRABAJADOR"])
require_admin = require_roles(["ADMIN"])
