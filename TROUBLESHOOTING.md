# TROUBLESHOOTING - FindJob

Bitácora obligatoria de incidencias, errores y soluciones técnicas encontradas durante el desarrollo del proyecto FindJob.

---

### Incidencia 01: Vulnerabilidad potencial de algoritmo `none` y falta de validación de claims estándar en tokens JWT
- **Problema:** La decodificación inicial de JWT no realizaba una inspección estricta del encabezado ni verificaba de forma explícita reclamos críticos como `iss` (issuer), `aud` (audience), `nbf` (not before), `iat` (issued at), `jti` (identificador único para revocación) y soporte de rotación de claves (`PREVIOUS_SECRET_KEYS`).
- **Causa raíz:** Configuración básica de decodificación que dependía únicamente de la validación implícita de firma y expiración.
- **Solución implementada:** Se implementó un flujo de decodificación en [security.py](file:///c:/Users/usuario1/Desktop/Full_Stack/FINDJOB/backend/app/core/security.py) que:
  1. Extrae y valida el encabezado no verificado asegurando que `alg` no sea `none` y pertenezca a la lista de permitidos `ALLOWED_ALGORITHMS` (`["HS256", "RS256"]`).
  2. Valida la firma contra la clave primaria `SECRET_KEY` o claves históricas en `PREVIOUS_SECRET_KEYS` para rotación segura sin interrupción.
  3. Verifica reclamos de audiencia `aud`, emisor `iss`, no antes de `nbf` y detecta tokens revocados por `jti`.
- **Validación:** 14 pruebas de seguridad automatizadas añadidas en [test_jwt_and_security.py](file:///c:/Users/usuario1/Desktop/Full_Stack/FINDJOB/backend/tests/test_jwt_and_security.py), aprobadas exitosamente.

---

### Incidencia 02: Endpoints administrativos de listado sin parámetros de paginación
- **Problema:** Los endpoints `GET /api/v1/admin/solicitudes` y `GET /api/v1/admin/politicas-comision` no exponían los parámetros estándar de paginación (`limit`, `offset`), violando el control de consumo de recursos (OWASP API4 / AIP-158).
- **Causa raíz:** Omisión de `Query(..., ge=1, le=100)` en las firmas de los endpoints en [admin.py](file:///c:/Users/usuario1/Desktop/Full_Stack/FINDJOB/backend/app/api/v1/endpoints/admin.py).
- **Solución implementada:** Se agregaron los parámetros `limit` (con tope máximo de 100) y `offset` (con mínimo 0), aplicando el slice de resultados en los servicios correspondientes.
- **Validación:** Pruebas unitarias e integración validadas con `pytest`.

---

### Incidencia 03: Validación estricta de existencia de roles en actualización administrativa
- **Problema:** La función `actualizar_roles_usuario` permitía asignar IDs de rol que no existían en el catálogo de roles del sistema.
- **Causa raíz:** Falta de verificación de pertenencia al conjunto de IDs de `mock_db.roles`.
- **Solución implementada:** Se agregó validación en [admin_service.py](file:///c:/Users/usuario1/Desktop/Full_Stack/FINDJOB/backend/app/services/admin_service.py) que lanza `EntityNotFoundException` (HTTP 404) si algún `rol_id` no está registrado.
- **Validación:** Prueba `test_admin_actualizar_roles_usuario_con_rol_inexistente` agregada y aprobada.

