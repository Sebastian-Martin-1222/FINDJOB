"""Esquemas genéricos y comunes para respuestas de API."""

from typing import Any, Generic, TypeVar

from pydantic import BaseModel, ConfigDict

T = TypeVar("T")


class MessageResponse(BaseModel):
    """Respuesta general para operaciones de éxito con mensaje."""

    model_config = ConfigDict(from_attributes=True)
    message: str
    detail: str | None = None


class PaginatedResponse(BaseModel, Generic[T]):
    """Envoltorio estándar para respuestas paginadas."""

    model_config = ConfigDict(from_attributes=True)
    items: list[T]
    total: int
    page: int
    size: int


class ErrorDetail(BaseModel):
    """Detalle de error para documentación OpenAPI."""

    code: str
    message: str
    details: dict[str, Any] | None = None


class ErrorEnvelope(BaseModel):
    """Estructura uniforme de respuesta de error."""

    error: ErrorDetail
