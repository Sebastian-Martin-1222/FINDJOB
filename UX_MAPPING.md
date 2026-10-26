# FINDJOB — Generación de UX_MAPPING.md a partir del UX Mapping aprobado y backend real

Actúa como un **Arquitecto de Software Senior, Especialista UX y Analista de Integración Frontend–Backend**.

Estás trabajando sobre el proyecto:

**FindJob Colombia**

Repositorio:

`https://github.com/Sebastian-Martin-1222/FINDJOB`

Rama de trabajo del backend:

`test/antigravity-endpoints`

IMPORTANTE:

No trabajes sobre supuestos.
No inventes pantallas.
No inventes endpoints.
No inventes campos.
No inventes reglas de negocio.
No inventes estados.
No inventes integraciones externas.

La fuente de verdad funcional y visual debe ser el documento:

`@uxmapping_v1.pdf`

y la fuente de verdad técnica debe ser el código real del backend existente en este repositorio.

El objetivo final es crear en la raíz del proyecto:

`ux_mapping.md`

Este archivo será la **fuente de verdad para implementar el frontend generado/diseñado en Google Stitch y conectarlo correctamente con el backend FindJob ya desarrollado.**

---

# 1. FUENTES OBLIGATORIAS

Antes de escribir cualquier archivo debes analizar completamente estas fuentes.

## FUENTE A — UX Mapping aprobado

Lee en su totalidad:

`@uxmapping_v1.pdf`

Debes revisar TODAS sus páginas.

Extrae exactamente:

- módulos;
- pantallas;
- nombres de pantallas;
- etapas del usuario;
- navegación;
- botones;
- formularios;
- modales;
- tablas;
- filtros;
- estados visuales;
- decisiones;
- acciones;
- transiciones;
- roles;
- flujos;
- interacciones automáticas;
- evidencias técnicas.

No asumas que dos pantallas similares son la misma.

No renombres pantallas definidas en el PDF.

Cuando el PDF utilice referencias de Google Stitch como:

`AUTH_Login`

`USR_MiPerfil`

`TRAB_Perfil_Ver`

`SERV_Explorar`

`CITA_PAGO_Detalle`

`CHAT_RegistroLectura`

`ADMIN_OP_Pagos`

`SYS_HEALTH_DB`

debes conservar EXACTAMENTE ese nombre.

Estos nombres se utilizarán posteriormente para localizar las capturas y componentes correspondientes en Google Stitch.

---

## FUENTE B — Backend real

Analiza el backend real existente en:

`backend/app/`

y específicamente los routers ubicados en:

`backend/app/api/v1/endpoints/`

Incluyendo como mínimo:

- `auth.py`
- `catalogos.py`
- `usuarios.py`
- `trabajadores.py`
- `servicios.py`
- `solicitudes.py`
- `citas.py`
- `conversaciones.py`
- `seguridad.py`
- `admin.py`
- `health_db.py`

También debes revisar cuando sea necesario:

`backend/app/services/`

`backend/app/schemas/`

`backend/app/core/`

`backend/app/persistence/`

y cualquier otra fuente necesaria para entender correctamente:

- request;
- response;
- autorización;
- reglas de negocio;
- validaciones;
- transiciones de estado.

No deduzcas el contrato de un endpoint únicamente por su nombre.

Revisa el router, schema Pydantic y service correspondiente.

---

# 2. BACKEND DESPLEGADO Y ENDPOINTS REALES

Utiliza como URL base del backend desplegado:

`https://findjob-api-audit-2k2ft2tdxq-uc.a.run.app`

El prefijo real de la API es:

`/api/v1`

Por lo tanto, la URL base efectiva para las llamadas del frontend es:

`https://findjob-api-audit-2k2ft2tdxq-uc.a.run.app/api/v1`

No escribas esta URL directamente dentro de componentes.

Primero identifica la tecnología real del frontend.

Si utiliza Vite:

```env
VITE_API_URL=https://findjob-api-audit-2k2ft2tdxq-uc.a.run.app/api/v1



Endpoints disponibles del backend FindJob:

1. GET /health
2. POST /auth/login
3. POST /auth/register
4. POST /auth/refresh
5. POST /auth/logout
6. GET /categorias
7. GET /categorias/{categoria_id}/subcategorias
8. GET /modalidades
9. GET /ciudades
10. GET /habilidades
11. GET /me
12. PATCH /me
13. GET /me/roles
14. GET /me/direcciones
15. POST /me/direcciones
16. PATCH /me/direcciones/{direccion_id}
17. DELETE /me/direcciones/{direccion_id}
18. GET /trabajadores/{perfil_trabajador_id}
19. GET /trabajadores/{perfil_trabajador_id}/calificaciones
20. POST /trabajador/perfil
21. GET /trabajador/perfil
22. PATCH /trabajador/perfil
23. GET /trabajador/habilidades
24. POST /trabajador/habilidades
25. DELETE /trabajador/habilidades/{habilidad_id}
26. GET /trabajador/coberturas
27. POST /trabajador/coberturas
28. DELETE /trabajador/coberturas/{ciudad_id}
29. GET /trabajador/servicios
30. GET /trabajador/pagos
31. GET /trabajador/calificaciones
32. GET /servicios
33. GET /servicios/{servicio_id}
34. POST /servicios
35. PATCH /servicios/{servicio_id}
36. DELETE /servicios/{servicio_id}
37. PUT /servicios/{servicio_id}/modalidades
38. POST /solicitudes
39. GET /solicitudes/mis-solicitudes
40. GET /solicitudes/recibidas
41. GET /solicitudes/{solicitud_id}
42. PATCH /solicitudes/{solicitud_id}/aceptar
43. PATCH /solicitudes/{solicitud_id}/rechazar
44. PATCH /solicitudes/{solicitud_id}/cancelar
45. POST /solicitudes/{solicitud_id}/cita
46. GET /citas/mis-citas
47. GET /citas/{cita_id}
48. PATCH /citas/{cita_id}
49. PATCH /citas/{cita_id}/iniciar
50. PATCH /citas/{cita_id}/finalizar
51. POST /citas/{cita_id}/confirmar
52. POST /citas/{cita_id}/alertas-seguridad
53. GET /citas/{cita_id}/chequeos-seguridad
54. POST /citas/{cita_id}/pagos
55. GET /citas/{cita_id}/pago
56. POST /citas/{cita_id}/calificacion
57. GET /conversaciones
58. GET /conversaciones/{conversacion_id}/mensajes
59. POST /conversaciones/{conversacion_id}/mensajes
60. POST /conversaciones/{conversacion_id}/adjuntos
61. POST /mensajes/{mensaje_id}/lectura
62. POST /chequeos-seguridad/{chequeo_id}/respuestas
63. GET /admin/usuarios
64. PATCH /admin/usuarios/{usuario_id}/estado
65. PUT /admin/usuarios/{usuario_id}/roles
66. POST /admin/categorias
67. PATCH /admin/categorias/{categoria_id}
68. POST /admin/subcategorias
69. PATCH /admin/subcategorias/{subcategoria_id}
70. POST /admin/habilidades
71. PATCH /admin/habilidades/{habilidad_id}
72. GET /admin/solicitudes
73. GET /admin/citas
74. GET /admin/alertas-seguridad
75. PATCH /admin/alertas-seguridad/{alerta_id}
76. GET /admin/pagos
77. POST /admin/politicas-comision
78. GET /admin/politicas-comision
79. POST /admin/preguntas-seguridad
80. PATCH /admin/preguntas-seguridad/{pregunta_id}
81. GET /admin/catalogos/{catalogo}
82. GET /health/db

IMPORTANTE:

La lista anterior contiene los 82 endpoints actualmente identificados en la rama `test/antigravity-endpoints`.

Debes validar cada uno directamente contra el código real ubicado en `backend/app/api/v1/` y `backend/app/api/v1/endpoints/`.

No asumas Request, Response, autorización, campos, errores ni reglas de negocio únicamente a partir del nombre del endpoint.

Para cada endpoint revisa:
- router;
- schema Pydantic;
- service;
- autorización;
- validaciones;
- reglas de negocio;
- transiciones de estado.

El resultado esperado del cruce es:

Endpoints esperados: 82
Endpoints mapeados: 82
Endpoints sin correspondencia: 0
Cobertura: 100 %

Si el código real contradice esta lista, el código de la rama `test/antigravity-endpoints` tiene prioridad y la discrepancia debe documentarse en `Brechas UX ↔ Backend`.