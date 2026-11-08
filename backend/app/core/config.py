"""Módulo de configuración general del proyecto FindJob."""

from typing import Any, List, Union

from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Configuración del sistema cargada desde variables de entorno."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    PROJECT_NAME: str = "FindJob Marketplace API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    # Header X-User-Id permitido solo para desarrollo/test/auditoría local.
    ALLOW_TEST_AUTH_HEADERS: bool = True

    # Orígenes CORS permitidos
    BACKEND_CORS_ORIGINS: List[Union[str, AnyHttpUrl]] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Any) -> Any:
        """Normalizar lista de orígenes CORS si viene como cadena."""
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        return v

    # Persistencia PostgreSQL / Cloud SQL
    USE_CLOUD_SQL: bool = False
    INSTANCE_CONNECTION_NAME: str | None = None
    DB_NAME: str | None = None
    DB_USER: str | None = None
    DB_PASSWORD: str | None = None

    # Parámetros de seguridad (no hardcodear secretos reales)
    SECRET_KEY: str = "findjob-insecure-development-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    JWT_ISSUER: str = "findjob-backend"
    JWT_AUDIENCE: str = "findjob-api"


    def validate_runtime_security(self) -> None:
        """Fail fast when an unsafe development configuration reaches production."""
        if self.ENVIRONMENT.lower() != "production":
            return
        insecure_secrets = {
            "findjob-insecure-development-secret-key-change-in-production",
            "insecure-default-change-me-in-production-environment",
            "",
        }
        problems: list[str] = []
        if self.DEBUG:
            problems.append("DEBUG debe ser False")
        if self.ALLOW_TEST_AUTH_HEADERS:
            problems.append("ALLOW_TEST_AUTH_HEADERS debe ser False")
        if self.SECRET_KEY in insecure_secrets or len(self.SECRET_KEY) < 32:
            problems.append("SECRET_KEY debe ser un secreto robusto administrado externamente")
        if not self.USE_CLOUD_SQL:
            problems.append("USE_CLOUD_SQL debe ser True")
        missing_db = [name for name, value in {
            "INSTANCE_CONNECTION_NAME": self.INSTANCE_CONNECTION_NAME,
            "DB_NAME": self.DB_NAME,
            "DB_USER": self.DB_USER,
            "DB_PASSWORD": self.DB_PASSWORD,
        }.items() if not value]
        if missing_db:
            problems.append("faltan variables de base de datos: " + ", ".join(missing_db))
        if problems:
            raise RuntimeError("Configuración insegura para producción: " + "; ".join(problems))

    # Proyecto Firebase / Identity Platform
    FIREBASE_PROJECT_ID: str = "findjob-dev"


settings = Settings()
