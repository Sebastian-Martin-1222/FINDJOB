# FRONTEND_AUDIT — FindJob

**Fecha:** 4 de noviembre de 2026  
**Baseline:** `ea6e8d1` (`test/frontend/owasp`)

## Resultado

El frontend fue saneado contra los contratos FastAPI/Pydantic actuales. Se eliminaron fallbacks silenciosos y datos ficticios, se migraron páginas que todavía enviaban DTO antiguos y se completaron pantallas para perfil, habilidades, coberturas, pagos/calificaciones y administración.

## Validaciones y UX

- Login y registro: validación `onBlur`, estado `touched`, revalidación `onChange`, validación integral al submit y foco al primer campo inválido.
- `Input`: `aria-invalid`, `aria-describedby` y mensaje de error con `role="alert"`.
- Schemas Zod alineados con constraints Pydantic; no se mantienen mínimos/máximos arbitrarios que el API no exige.
- Formularios críticos usan services tipados y no llaman `apiClient` directamente desde páginas.

## Integración

- Solicitudes migradas a `modalidad_id`, `direccion_id`, `descripcion_necesidad`, `fecha_propuesta`.
- Citas migradas a `fecha_inicio`, `fecha_fin`, `codigo_confirmacion`, plataforma/enlace y dirección real.
- Métodos de pago, tipos de alerta y roles se resuelven desde catálogos, no mediante IDs hardcodeados.
- Chat usa participantes/remitentes/lecturas reales. Los adjuntos permanecen deshabilitados en UI hasta existir almacenamiento binario real.
- Dashboards dejaron de mostrar KPI, verificación, disponibilidad o claims de infraestructura inventados.
- Comunidad/foros queda explícitamente fuera de alcance porque no existe backend productivo para ese módulo.

## Seguridad

- Tokens no se guardan en `localStorage`/`sessionStorage`.
- Refresh concurrente comparte una sola renovación y rechaza correctamente si falla.
- El cliente API rechaza endpoints absolutos arbitrarios y valida respuestas JSON.
- CSP endurecida; `unsafe-eval` solo se permite en desarrollo.
- Navegación por roles separa capacidad de modo/ruta y añade guards UX para trabajador/admin.

## Verificación local

- `npx tsc --noEmit`: ✅ 0 errores.
- `npm run lint`: ✅ 0 errores / 0 warnings.
- `next build`: ⚠️ no ejecutable completamente en este sandbox: falta SWC Linux y no hay red para descargarlo. No se considera fallo del código.

## Limitaciones externas

Una sesión durable tras recarga requiere una decisión arquitectónica (cookie HttpOnly/BFF o equivalente). La integración real con Identity Platform, Cloud SQL y almacenamiento binario debe probarse con el entorno GCP correspondiente.
