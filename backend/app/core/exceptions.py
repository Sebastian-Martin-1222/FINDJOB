"""Definición de excepciones del dominio y de negocio para FindJob."""

from typing import Any


class AppException(Exception):
    """Excepción base para errores controlados de la aplicación."""

    def __init__(
        self,
        message: str,
        code: str = "APP_ERROR",
        status_code: int = 400,
        details: dict[str, Any] | None = None,
    ) -> None:
        self.message = message
        self.code = code
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)


class EntityNotFoundException(AppException):
    """Excepción cuando un recurso solicitado no existe."""

    def __init__(
        self,
        message: str = "Recurso no encontrado",
        code: str = "ENTITY_NOT_FOUND",
        details: dict[str, Any] | None = None,
    ) -> None:
        super().__init__(
            message=message,
            code=code,
            status_code=404,
            details=details,
        )


class BusinessRuleException(AppException):
    """Excepción cuando se viola una regla funcional o de negocio."""

    def __init__(
        self,
        message: str,
        code: str = "BUSINESS_RULE_VIOLATION",
        details: dict[str, Any] | None = None,
    ) -> None:
        super().__init__(
            message=message,
            code=code,
            status_code=422,
            details=details,
        )


class AuthorizationException(AppException):
    """Excepción cuando el usuario no tiene permisos sobre el recurso."""

    def __init__(
        self,
        message: str = "Acceso no autorizado al recurso",
        code: str = "FORBIDDEN",
        details: dict[str, Any] | None = None,
    ) -> None:
        super().__init__(
            message=message,
            code=code,
            status_code=403,
            details=details,
        )


class AuthenticationException(AppException):
    """Excepción de fallo de autenticación o token inválido."""

    def __init__(
        self,
        message: str = "No autenticado o credenciales inválidas",
        code: str = "UNAUTHENTICATED",
        details: dict[str, Any] | None = None,
    ) -> None:
        super().__init__(
            message=message,
            code=code,
            status_code=401,
            details=details,
        )


class ConflictException(AppException):
    """Excepción por conflicto de estado o restricción única."""

    def __init__(
        self,
        message: str,
        code: str = "CONFLICT",
        details: dict[str, Any] | None = None,
    ) -> None:
        super().__init__(
            message=message,
            code=code,
            status_code=409,
            details=details,
        )
