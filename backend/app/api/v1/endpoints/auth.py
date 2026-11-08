"""Endpoints de autenticación, emisión y renovación de tokens JWT."""

from fastapi import APIRouter, Depends, status
from fastapi.security import HTTPAuthorizationCredentials

from app.api.deps import security_scheme
from app.schemas.auth import (
    LoginRequest,
    RefreshTokenRequest,
    RegisterRequest,
    RegisterResponse,
    TokenResponse,
)
from app.schemas.common import MessageResponse
from app.services.auth_service import auth_service

router = APIRouter(prefix="/auth", tags=["Autenticación"])


@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Iniciar sesión y obtener tokens JWT",
)
def login(data: LoginRequest) -> TokenResponse:
    """Autentica las credenciales del usuario y emite un access token y refresh token."""
    return auth_service.login(data)


@router.post(
    "/register",
    response_model=RegisterResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar nuevo usuario",
)
def register(data: RegisterRequest) -> RegisterResponse:
    """Registra una nueva cuenta de usuario con rol inicial y emite sesión JWT."""
    return auth_service.register(data)


@router.post(
    "/refresh",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Rotar sesión mediante refresh token",
)
def refresh_token(data: RefreshTokenRequest) -> TokenResponse:
    """Renueva la sesión emitiendo un nuevo par de tokens y revocando el refresh token previo."""
    return auth_service.refresh(data)


@router.post(
    "/logout",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Cerrar sesión y revocar token",
)
def logout(
    credentials: HTTPAuthorizationCredentials | None = Depends(security_scheme),
) -> MessageResponse:
    """Revoca el token actual para impedir su reutilización posterior."""
    if credentials and credentials.credentials:
        auth_service.logout(credentials.credentials)
    return MessageResponse(message="Sesión cerrada correctamente.")
