"""Esquemas Pydantic para el módulo de autenticación y emisión de tokens."""

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.common import BaseInputSchema


class LoginRequest(BaseInputSchema):
    """Esquema de credenciales de inicio de sesión."""

    email: str = Field(
        ...,
        max_length=254,
        pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$",
        description="Correo electrónico registrado del usuario",
    )
    password: str = Field(
        ...,
        min_length=8,
        max_length=128,
        description="Contraseña de la cuenta (mínimo 8 caracteres)",
    )


class RegisterRequest(BaseInputSchema):
    """Esquema de registro de nuevo usuario con rol inicial."""

    email: str = Field(
        ...,
        max_length=254,
        pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$",
        description="Correo electrónico único del usuario",
    )
    password: str = Field(
        ...,
        min_length=8,
        max_length=128,
        description="Contraseña segura de la cuenta",
    )
    nombres: str = Field(..., min_length=1, max_length=100)
    apellidos: str = Field(..., min_length=1, max_length=100)
    telefono: str | None = Field(
        None,
        max_length=20,
        pattern=r"^\+?[0-9]{7,15}$",
        description="Teléfono en formato internacional estándar",
    )
    rol: str = Field(
        "CLIENTE",
        pattern=r"^(CLIENTE|TRABAJADOR)$",
        description="Rol funcional inicial asignado al usuario",
    )


class RefreshTokenRequest(BaseInputSchema):
    """Esquema para solicitud de rotación de refresh token."""

    refresh_token: str = Field(
        ...,
        min_length=1,
        description="Refresh token JWT válido y no revocado",
    )


class TokenResponse(BaseModel):
    """Respuesta con par de tokens JWT y metadatos de vigencia."""

    model_config = ConfigDict(from_attributes=True)

    access_token: str = Field(..., description="Access token JWT de corta duración")
    refresh_token: str = Field(..., description="Refresh token JWT para rotación")
    token_type: str = Field("bearer", description="Tipo de esquema de autorización")
    expires_in: int = Field(..., description="Vigencia del access token en segundos")


class AuthUserOut(BaseModel):
    """Perfil público esencial del usuario autenticado."""

    model_config = ConfigDict(from_attributes=True)

    usuario_id: int
    email: str
    nombres: str
    apellidos: str
    telefono: str | None = None
    roles: list[str] = []


class RegisterResponse(BaseModel):
    """Respuesta al registrar exitosamente un nuevo usuario."""

    model_config = ConfigDict(from_attributes=True)

    usuario: AuthUserOut
    tokens: TokenResponse
