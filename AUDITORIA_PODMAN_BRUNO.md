# Auditoría de FindJob con Podman + Bruno

## 1. Objetivo

Levantar el backend de FindJob en un contenedor local y validar sus servicios HTTP sin depender de Cloud SQL, Firebase ni otros recursos externos durante la auditoría.

La persistencia usada en esta ejecución es `app/mocks/mock_db.py`. Los datos viven mientras el proceso está activo y vuelven al estado inicial al recrear el contenedor.

## 2. Requisitos

- Git
- Podman
- Bruno

No se requiere PostgreSQL local para esta entrega de auditoría.

## 3. Clonar y construir

```bash
git clone <URL_DEL_REPOSITORIO>
cd FINDJOB
podman build -t findjob-api ./backend
```

## 4. Ejecutar

```bash
podman run --rm -p 8000:8000 \
  -e ENVIRONMENT=audit \
  -e ALLOW_TEST_AUTH_HEADERS=true \
  --name findjob-api findjob-api
```

PowerShell:

```powershell
podman run --rm -p 8000:8000 -e ENVIRONMENT=audit -e ALLOW_TEST_AUTH_HEADERS=true --name findjob-api findjob-api
```

## 5. Verificaciones iniciales

- Swagger: `http://localhost:8000/api/v1/docs`
- OpenAPI: `http://localhost:8000/api/v1/openapi.json`
- Health: `http://localhost:8000/api/v1/health`

El health debe responder HTTP 200.

## 6. Autenticación para auditoría local

Se usa el header `X-User-Id` únicamente en entornos `development`, `test` y `audit`:

- `1`: CLIENTE
- `2`: TRABAJADOR
- `3`: ADMIN

Ejemplo:

```http
GET /api/v1/me
X-User-Id: 1
```

En `production`, ese header es rechazado con `401 TEST_AUTH_DISABLED`.

## 7. Bruno

Abrir como colección la carpeta:

```text
bruno/FindJob-Auditoria
```

Seleccionar el entorno `Local` y ejecutar las peticiones en orden. La colección incluye pruebas de:

- disponibilidad;
- OpenAPI;
- catálogos públicos;
- servicios públicos;
- autenticación obligatoria;
- CLIENTE;
- TRABAJADOR;
- ADMIN;
- RBAC negativo;
- prevención de Mass Assignment;
- reglas de negocio;
- chat y autorización de participante;
- errores 404 uniformes.

## 8. Persistencia y base de datos

`findjob.sql` contiene el diseño PostgreSQL 17 del proyecto, con 36 tablas, relaciones, restricciones, funciones y triggers.

Para esta auditoría HTTP, el backend usa persistencia mock en memoria para que la evaluación sea reproducible aun cuando Cloud SQL no esté disponible. La integración SQLAlchemy/Alembic/Cloud SQL corresponde a la siguiente etapa de infraestructura.

## 9. Reiniciar los datos

Detener el contenedor y levantarlo nuevamente:

```bash
podman stop findjob-api
```

Luego volver a ejecutar el comando de `podman run`. El dataset mock retorna a su estado inicial.

## 10. Ejecutar suite automatizada

En un entorno Python con las dependencias instaladas:

```bash
cd backend
python -m pytest -q
```

Resultado validado de esta entrega: **39 passed**.
