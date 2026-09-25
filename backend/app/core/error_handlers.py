"""Manejadores globales de excepciones para FastAPI.

Garantizan que ninguna respuesta exponga stack traces ni detalles sensibles.
"""

import logging
from typing import Any

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.exceptions import AppException

logger = logging.getLogger("findjob.errors")


def register_error_handlers(app: FastAPI) -> None:
    """Registrar todos los manejadores de excepciones globales."""

    @app.exception_handler(AppException)
    async def app_exception_handler(
        request: Request, exc: AppException
    ) -> JSONResponse:
        logger.warning(
            "AppException en %s %s: [%s] %s",
            request.method,
            request.url.path,
            exc.code,
            exc.message,
        )
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": {
                    "code": exc.code,
                    "message": exc.message,
                    "details": exc.details,
                }
            },
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        errors_summary: list[dict[str, Any]] = []
        for error in exc.errors():
            loc = " -> ".join([str(p) for p in error.get("loc", [])])
            msg = error.get("msg", "Dato inválido")
            errors_summary.append({"campo": loc, "error": msg})

        logger.info(
            "Error de validación de entrada en %s %s: %s",
            request.method,
            request.url.path,
            errors_summary,
        )
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "error": {
                    "code": "VALIDATION_ERROR",
                    "message": "Los datos enviados contienen errores de formato o valores no válidos.",
                    "details": {"errores": errors_summary},
                }
            },
        )

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(
        request: Request, exc: StarletteHTTPException
    ) -> JSONResponse:
        logger.warning(
            "HTTPException %d en %s %s: %s",
            exc.status_code,
            request.method,
            request.url.path,
            exc.detail,
        )
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": {
                    "code": f"HTTP_{exc.status_code}",
                    "message": exc.detail,
                    "details": {},
                }
            },
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(
        request: Request, exc: Exception
    ) -> JSONResponse:
        # Registrar error completo en servidor para diagnóstico
        logger.error(
            "Error interno no controlado en %s %s: %s",
            request.method,
            request.url.path,
            str(exc),
            exc_info=exc,
        )
        # Respuesta hacia el cliente totalmente sanitizada sin stack trace
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": {
                    "code": "INTERNAL_SERVER_ERROR",
                    "message": "Ha ocurrido un error inesperado al procesar la solicitud. Por favor intente más tarde.",
                    "details": {},
                }
            },
        )
