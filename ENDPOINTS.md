# FindJob — Catálogo API v1

**Estado:** 4 de noviembre de 2026  
**Total:** 85 endpoints de API v1.

La fuente de verdad son los routers FastAPI y sus esquemas Pydantic. Este archivo reemplaza el inventario parcial anterior.

| # | Método | Ruta | Acceso |
|---:|---|---|---|
| 1 | `GET` | `/health` | Público |
| 2 | `POST` | `/auth/login` | Público |
| 3 | `POST` | `/auth/register` | Público |
| 4 | `POST` | `/auth/refresh` | Público |
| 5 | `POST` | `/auth/logout` | Autenticado |
| 6 | `GET` | `/categorias` | Público |
| 7 | `GET` | `/categorias/{categoria_id}/subcategorias` | Público |
| 8 | `GET` | `/modalidades` | Público |
| 9 | `GET` | `/ciudades` | Público |
| 10 | `GET` | `/habilidades` | Público |
| 11 | `GET` | `/metodos-pago` | Público |
| 12 | `GET` | `/tipos-alerta` | Público |
| 13 | `GET` | `/me` | Autenticado |
| 14 | `PATCH` | `/me` | Autenticado |
| 15 | `GET` | `/me/roles` | Autenticado |
| 16 | `GET` | `/me/direcciones` | CLIENTE |
| 17 | `POST` | `/me/direcciones` | CLIENTE |
| 18 | `PATCH` | `/me/direcciones/{direccion_id}` | CLIENTE |
| 19 | `DELETE` | `/me/direcciones/{direccion_id}` | CLIENTE |
| 20 | `GET` | `/trabajadores/{perfil_trabajador_id}` | Público |
| 21 | `GET` | `/trabajadores/{perfil_trabajador_id}/calificaciones` | Público |
| 22 | `POST` | `/trabajador/perfil` | TRABAJADOR |
| 23 | `GET` | `/trabajador/perfil` | TRABAJADOR |
| 24 | `PATCH` | `/trabajador/perfil` | TRABAJADOR |
| 25 | `GET` | `/trabajador/habilidades` | TRABAJADOR |
| 26 | `POST` | `/trabajador/habilidades` | TRABAJADOR |
| 27 | `DELETE` | `/trabajador/habilidades/{habilidad_id}` | TRABAJADOR |
| 28 | `GET` | `/trabajador/coberturas` | TRABAJADOR |
| 29 | `POST` | `/trabajador/coberturas` | TRABAJADOR |
| 30 | `DELETE` | `/trabajador/coberturas/{ciudad_id}` | TRABAJADOR |
| 31 | `GET` | `/trabajador/servicios` | TRABAJADOR |
| 32 | `GET` | `/trabajador/pagos` | TRABAJADOR |
| 33 | `GET` | `/trabajador/calificaciones` | TRABAJADOR |
| 34 | `GET` | `/servicios` | Público |
| 35 | `GET` | `/servicios/{servicio_id}` | Público |
| 36 | `POST` | `/servicios` | TRABAJADOR |
| 37 | `PATCH` | `/servicios/{servicio_id}` | TRABAJADOR propietario |
| 38 | `DELETE` | `/servicios/{servicio_id}` | TRABAJADOR propietario |
| 39 | `PUT` | `/servicios/{servicio_id}/modalidades` | TRABAJADOR propietario |
| 40 | `POST` | `/solicitudes` | CLIENTE |
| 41 | `GET` | `/solicitudes/mis-solicitudes` | CLIENTE |
| 42 | `GET` | `/solicitudes/recibidas` | TRABAJADOR |
| 43 | `GET` | `/solicitudes/{solicitud_id}` | Participante/Admin |
| 44 | `PATCH` | `/solicitudes/{solicitud_id}/aceptar` | TRABAJADOR |
| 45 | `PATCH` | `/solicitudes/{solicitud_id}/rechazar` | TRABAJADOR |
| 46 | `PATCH` | `/solicitudes/{solicitud_id}/cancelar` | CLIENTE |
| 47 | `POST` | `/solicitudes/{solicitud_id}/cita` | TRABAJADOR |
| 48 | `GET` | `/citas/mis-citas` | Autenticado |
| 49 | `GET` | `/citas/{cita_id}` | Participante/Admin |
| 50 | `PATCH` | `/citas/{cita_id}` | TRABAJADOR |
| 51 | `PATCH` | `/citas/{cita_id}/iniciar` | TRABAJADOR |
| 52 | `PATCH` | `/citas/{cita_id}/finalizar` | TRABAJADOR |
| 53 | `POST` | `/citas/{cita_id}/confirmar` | TRABAJADOR |
| 54 | `POST` | `/citas/{cita_id}/alertas-seguridad` | Participante |
| 55 | `GET` | `/citas/{cita_id}/chequeos-seguridad` | Participante |
| 56 | `POST` | `/citas/{cita_id}/pagos` | CLIENTE |
| 57 | `GET` | `/citas/{cita_id}/pago` | Participante/Admin |
| 58 | `POST` | `/citas/{cita_id}/calificacion` | CLIENTE |
| 59 | `GET` | `/conversaciones` | Autenticado participante |
| 60 | `GET` | `/conversaciones/{conversacion_id}/mensajes` | Participante |
| 61 | `POST` | `/conversaciones/{conversacion_id}/mensajes` | Participante |
| 62 | `POST` | `/conversaciones/{conversacion_id}/adjuntos` | Participante |
| 63 | `POST` | `/mensajes/{mensaje_id}/lectura` | Participante |
| 64 | `POST` | `/chequeos-seguridad/{chequeo_id}/respuestas` | Participante |
| 65 | `GET` | `/admin/usuarios` | ADMIN |
| 66 | `PATCH` | `/admin/usuarios/{usuario_id}/estado` | ADMIN |
| 67 | `PUT` | `/admin/usuarios/{usuario_id}/roles` | ADMIN |
| 68 | `POST` | `/admin/categorias` | ADMIN |
| 69 | `PATCH` | `/admin/categorias/{categoria_id}` | ADMIN |
| 70 | `POST` | `/admin/subcategorias` | ADMIN |
| 71 | `PATCH` | `/admin/subcategorias/{subcategoria_id}` | ADMIN |
| 72 | `POST` | `/admin/habilidades` | ADMIN |
| 73 | `PATCH` | `/admin/habilidades/{habilidad_id}` | ADMIN |
| 74 | `GET` | `/admin/solicitudes` | ADMIN |
| 75 | `GET` | `/admin/citas` | ADMIN |
| 76 | `GET` | `/admin/alertas-seguridad` | ADMIN |
| 77 | `PATCH` | `/admin/alertas-seguridad/{alerta_id}` | ADMIN |
| 78 | `GET` | `/admin/pagos` | ADMIN |
| 79 | `POST` | `/admin/politicas-comision` | ADMIN |
| 80 | `GET` | `/admin/politicas-comision` | ADMIN |
| 81 | `GET` | `/admin/preguntas-seguridad` | ADMIN |
| 82 | `POST` | `/admin/preguntas-seguridad` | ADMIN |
| 83 | `PATCH` | `/admin/preguntas-seguridad/{pregunta_id}` | ADMIN |
| 84 | `GET` | `/admin/catalogos/{catalogo}` | ADMIN |
| 85 | `GET` | `/health/db` | Público |

## Notas de contrato

- Los catálogos públicos de métodos de pago y tipos de alerta evitan IDs hardcodeados en el frontend.
- `GET /admin/preguntas-seguridad` completa la administración de preguntas ya soportada por create/update.
- Los DTO de lectura de solicitudes, citas, pagos, perfiles y conversaciones incluyen contexto derivado de datos existentes; no agregan columnas nuevas.
- Los adjuntos de chat registran metadata. La carga binaria a almacenamiento externo sigue siendo una dependencia arquitectónica pendiente.
- En producción el backend exige configuración Cloud SQL explícita y rechaza configuración de seguridad de desarrollo.
