# FindJob

Backend REST para el proyecto universitario **FindJob**, marketplace de contratación de servicios remotos y presenciales.

## Estado de esta entrega

Esta versión está preparada para una **auditoría HTTP reproducible con Podman y Bruno**.

- Backend: Python 3.11 + FastAPI.
- Contenedor: `backend/Dockerfile`.
- API versionada: `/api/v1`.
- Swagger: `http://localhost:8000/api/v1/docs`.
- OpenAPI: `http://localhost:8000/api/v1/openapi.json`.
- Health: `http://localhost:8000/api/v1/health`.
- Persistencia de auditoría: mock en memoria, reiniciable al recrear el contenedor.
- Modelo SQL objetivo: `findjob.sql`, PostgreSQL 17, 36 tablas.
- Colección Bruno: `bruno/FindJob-Auditoria`.

> La API de auditoría no afirma estar conectada a Cloud SQL. El modelo PostgreSQL está documentado e implementado en `findjob.sql`, mientras que la ejecución local utiliza datos mock para no depender de servicios cloud durante la evaluación.

## Ejecución rápida con Podman

Desde la raíz del repositorio:

```bash
podman build -t findjob-api ./backend
podman run --rm -p 8000:8000 \
  -e ENVIRONMENT=audit \
  -e ALLOW_TEST_AUTH_HEADERS=true \
  --name findjob-api findjob-api
```

En PowerShell puede ejecutarse en una sola línea:

```powershell
podman build -t findjob-api ./backend
podman run --rm -p 8000:8000 -e ENVIRONMENT=audit -e ALLOW_TEST_AUTH_HEADERS=true --name findjob-api findjob-api
```

También se incluye `compose.yaml` para equipos que tengan un proveedor compatible con `podman compose`:

```bash
podman compose up --build
```

## Usuarios de auditoría

En `development`, `test` o `audit` se permite el header temporal `X-User-Id`:

| Usuario | X-User-Id | Rol |
|---|---:|---|
| Cliente de prueba | `1` | `CLIENTE` |
| Trabajador de prueba | `2` | `TRABAJADOR` |
| Administrador de prueba | `3` | `ADMIN` |

Este mecanismo **queda bloqueado cuando `ENVIRONMENT=production`**. La arquitectura final contempla Firebase Authentication / Identity Platform.

## Pruebas automatizadas

Desde `backend`:

```bash
python -m pytest -q
```

La entrega fue validada con **39 pruebas aprobadas**.

Consulta `AUDITORIA_PODMAN_BRUNO.md` para el procedimiento completo de evaluación.
