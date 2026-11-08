# FRONTEND_CONTRACT_MATRIX

**Baseline revisada:** `ea6e8d1`  
**Estado local final:** 4 de noviembre de 2026  
**Inventario:** 85 endpoints API v1.

La matriz valida método/ruta/rol y la existencia de una integración frontend cuando corresponde. Los endpoints de soporte se consumen mediante services compartidos aunque no tengan una página independiente.

| # | Método | Endpoint | Rol | Integración frontend | Estado |
|---:|---|---|---|---|---|
| 1 | `GET` | `/health` | Público | admin.service / salud | ✅ Alineado |
| 2 | `POST` | `/auth/login` | Público | auth.service / login-registro | ✅ Alineado |
| 3 | `POST` | `/auth/register` | Público | auth.service / login-registro | ✅ Alineado |
| 4 | `POST` | `/auth/refresh` | Público | auth.service / login-registro | ✅ Alineado |
| 5 | `POST` | `/auth/logout` | Autenticado | auth.service / login-registro | ✅ Alineado |
| 6 | `GET` | `/categorias` | Público | catalog.service / formularios | ✅ Alineado |
| 7 | `GET` | `/categorias/{categoria_id}/subcategorias` | Público | catalog.service / formularios | ✅ Alineado |
| 8 | `GET` | `/modalidades` | Público | catalog.service / formularios | ✅ Alineado |
| 9 | `GET` | `/ciudades` | Público | catalog.service / formularios | ✅ Alineado |
| 10 | `GET` | `/habilidades` | Público | catalog.service / formularios | ✅ Alineado |
| 11 | `GET` | `/metodos-pago` | Público | catalog.service / formularios | ✅ Alineado |
| 12 | `GET` | `/tipos-alerta` | Público | catalog.service / formularios | ✅ Alineado |
| 13 | `GET` | `/me` | Autenticado | user.service / perfil | ✅ Alineado |
| 14 | `PATCH` | `/me` | Autenticado | user.service / perfil | ✅ Alineado |
| 15 | `GET` | `/me/roles` | Autenticado | user.service / perfil | ✅ Alineado |
| 16 | `GET` | `/me/direcciones` | CLIENTE | user.service / perfil | ✅ Alineado |
| 17 | `POST` | `/me/direcciones` | CLIENTE | user.service / perfil | ✅ Alineado |
| 18 | `PATCH` | `/me/direcciones/{direccion_id}` | CLIENTE | user.service / perfil | ✅ Alineado |
| 19 | `DELETE` | `/me/direcciones/{direccion_id}` | CLIENTE | user.service / perfil | ✅ Alineado |
| 20 | `GET` | `/trabajadores/{perfil_trabajador_id}` | Público | marketplace.service / perfil público | ✅ Alineado |
| 21 | `GET` | `/trabajadores/{perfil_trabajador_id}/calificaciones` | Público | marketplace.service / perfil público | ✅ Alineado |
| 22 | `POST` | `/trabajador/perfil` | TRABAJADOR | user/marketplace.service / área trabajador | ✅ Alineado |
| 23 | `GET` | `/trabajador/perfil` | TRABAJADOR | user/marketplace.service / área trabajador | ✅ Alineado |
| 24 | `PATCH` | `/trabajador/perfil` | TRABAJADOR | user/marketplace.service / área trabajador | ✅ Alineado |
| 25 | `GET` | `/trabajador/habilidades` | TRABAJADOR | user/marketplace.service / área trabajador | ✅ Alineado |
| 26 | `POST` | `/trabajador/habilidades` | TRABAJADOR | user/marketplace.service / área trabajador | ✅ Alineado |
| 27 | `DELETE` | `/trabajador/habilidades/{habilidad_id}` | TRABAJADOR | user/marketplace.service / área trabajador | ✅ Alineado |
| 28 | `GET` | `/trabajador/coberturas` | TRABAJADOR | user/marketplace.service / área trabajador | ✅ Alineado |
| 29 | `POST` | `/trabajador/coberturas` | TRABAJADOR | user/marketplace.service / área trabajador | ✅ Alineado |
| 30 | `DELETE` | `/trabajador/coberturas/{ciudad_id}` | TRABAJADOR | user/marketplace.service / área trabajador | ✅ Alineado |
| 31 | `GET` | `/trabajador/servicios` | TRABAJADOR | user/marketplace.service / área trabajador | ✅ Alineado |
| 32 | `GET` | `/trabajador/pagos` | TRABAJADOR | user/marketplace.service / área trabajador | ✅ Alineado |
| 33 | `GET` | `/trabajador/calificaciones` | TRABAJADOR | user/marketplace.service / área trabajador | ✅ Alineado |
| 34 | `GET` | `/servicios` | Público | marketplace.service / servicios | ✅ Alineado |
| 35 | `GET` | `/servicios/{servicio_id}` | Público | marketplace.service / servicios | ✅ Alineado |
| 36 | `POST` | `/servicios` | TRABAJADOR | marketplace.service / servicios | ✅ Alineado |
| 37 | `PATCH` | `/servicios/{servicio_id}` | TRABAJADOR propietario | marketplace.service / servicios | ✅ Alineado |
| 38 | `DELETE` | `/servicios/{servicio_id}` | TRABAJADOR propietario | marketplace.service / servicios | ✅ Alineado |
| 39 | `PUT` | `/servicios/{servicio_id}/modalidades` | TRABAJADOR propietario | marketplace.service / servicios | ✅ Alineado |
| 40 | `POST` | `/solicitudes` | CLIENTE | marketplace.service / solicitudes-citas | ✅ Alineado |
| 41 | `GET` | `/solicitudes/mis-solicitudes` | CLIENTE | marketplace.service / solicitudes-citas | ✅ Alineado |
| 42 | `GET` | `/solicitudes/recibidas` | TRABAJADOR | marketplace.service / solicitudes-citas | ✅ Alineado |
| 43 | `GET` | `/solicitudes/{solicitud_id}` | Participante/Admin | marketplace.service / solicitudes-citas | ✅ Alineado |
| 44 | `PATCH` | `/solicitudes/{solicitud_id}/aceptar` | TRABAJADOR | marketplace.service / solicitudes-citas | ✅ Alineado |
| 45 | `PATCH` | `/solicitudes/{solicitud_id}/rechazar` | TRABAJADOR | marketplace.service / solicitudes-citas | ✅ Alineado |
| 46 | `PATCH` | `/solicitudes/{solicitud_id}/cancelar` | CLIENTE | marketplace.service / solicitudes-citas | ✅ Alineado |
| 47 | `POST` | `/solicitudes/{solicitud_id}/cita` | TRABAJADOR | marketplace.service / solicitudes-citas | ✅ Alineado |
| 48 | `GET` | `/citas/mis-citas` | Autenticado | marketplace.service / citas-pagos-seguridad | ✅ Alineado |
| 49 | `GET` | `/citas/{cita_id}` | Participante/Admin | marketplace.service / citas-pagos-seguridad | ✅ Alineado |
| 50 | `PATCH` | `/citas/{cita_id}` | TRABAJADOR | marketplace.service / citas-pagos-seguridad | ✅ Alineado |
| 51 | `PATCH` | `/citas/{cita_id}/iniciar` | TRABAJADOR | marketplace.service / citas-pagos-seguridad | ✅ Alineado |
| 52 | `PATCH` | `/citas/{cita_id}/finalizar` | TRABAJADOR | marketplace.service / citas-pagos-seguridad | ✅ Alineado |
| 53 | `POST` | `/citas/{cita_id}/confirmar` | TRABAJADOR | marketplace.service / citas-pagos-seguridad | ✅ Alineado |
| 54 | `POST` | `/citas/{cita_id}/alertas-seguridad` | Participante | marketplace.service / citas-pagos-seguridad | ✅ Alineado |
| 55 | `GET` | `/citas/{cita_id}/chequeos-seguridad` | Participante | marketplace.service / citas-pagos-seguridad | ✅ Alineado |
| 56 | `POST` | `/citas/{cita_id}/pagos` | CLIENTE | marketplace.service / citas-pagos-seguridad | ✅ Alineado |
| 57 | `GET` | `/citas/{cita_id}/pago` | Participante/Admin | marketplace.service / citas-pagos-seguridad | ✅ Alineado |
| 58 | `POST` | `/citas/{cita_id}/calificacion` | CLIENTE | marketplace.service / citas-pagos-seguridad | ✅ Alineado |
| 59 | `GET` | `/conversaciones` | Autenticado participante | chat.service / conversaciones | ✅ Alineado |
| 60 | `GET` | `/conversaciones/{conversacion_id}/mensajes` | Participante | chat.service / conversaciones | ✅ Alineado |
| 61 | `POST` | `/conversaciones/{conversacion_id}/mensajes` | Participante | chat.service / conversaciones | ✅ Alineado |
| 62 | `POST` | `/conversaciones/{conversacion_id}/adjuntos` | Participante | chat.service / conversaciones | ✅ Alineado |
| 63 | `POST` | `/mensajes/{mensaje_id}/lectura` | Participante | user.service / perfil | ✅ Alineado |
| 64 | `POST` | `/chequeos-seguridad/{chequeo_id}/respuestas` | Participante | marketplace.service / chequeos | ✅ Alineado |
| 65 | `GET` | `/admin/usuarios` | ADMIN | admin.service / administración | ✅ Alineado |
| 66 | `PATCH` | `/admin/usuarios/{usuario_id}/estado` | ADMIN | admin.service / administración | ✅ Alineado |
| 67 | `PUT` | `/admin/usuarios/{usuario_id}/roles` | ADMIN | admin.service / administración | ✅ Alineado |
| 68 | `POST` | `/admin/categorias` | ADMIN | admin.service / administración | ✅ Alineado |
| 69 | `PATCH` | `/admin/categorias/{categoria_id}` | ADMIN | admin.service / administración | ✅ Alineado |
| 70 | `POST` | `/admin/subcategorias` | ADMIN | catalog.service / formularios | ✅ Alineado |
| 71 | `PATCH` | `/admin/subcategorias/{subcategoria_id}` | ADMIN | catalog.service / formularios | ✅ Alineado |
| 72 | `POST` | `/admin/habilidades` | ADMIN | admin.service / administración | ✅ Alineado |
| 73 | `PATCH` | `/admin/habilidades/{habilidad_id}` | ADMIN | admin.service / administración | ✅ Alineado |
| 74 | `GET` | `/admin/solicitudes` | ADMIN | admin.service / administración | ✅ Alineado |
| 75 | `GET` | `/admin/citas` | ADMIN | admin.service / administración | ✅ Alineado |
| 76 | `GET` | `/admin/alertas-seguridad` | ADMIN | admin.service / administración | ✅ Alineado |
| 77 | `PATCH` | `/admin/alertas-seguridad/{alerta_id}` | ADMIN | admin.service / administración | ✅ Alineado |
| 78 | `GET` | `/admin/pagos` | ADMIN | admin.service / administración | ✅ Alineado |
| 79 | `POST` | `/admin/politicas-comision` | ADMIN | admin.service / administración | ✅ Alineado |
| 80 | `GET` | `/admin/politicas-comision` | ADMIN | admin.service / administración | ✅ Alineado |
| 81 | `GET` | `/admin/preguntas-seguridad` | ADMIN | admin.service / administración | ✅ Alineado |
| 82 | `POST` | `/admin/preguntas-seguridad` | ADMIN | admin.service / administración | ✅ Alineado |
| 83 | `PATCH` | `/admin/preguntas-seguridad/{pregunta_id}` | ADMIN | admin.service / administración | ✅ Alineado |
| 84 | `GET` | `/admin/catalogos/{catalogo}` | ADMIN | admin.service / administración | ✅ Alineado |
| 85 | `GET` | `/health/db` | Público | admin.service / salud | ✅ Alineado |

## Brechas externas conocidas

- **Adjuntos:** existe contrato de metadata, pero no un flujo binario de upload/storage; la UI no simula carga.
- **Sesión tras recarga:** tokens permanecen en memoria para evitar almacenamiento web persistente; una sesión durable requiere cookie HttpOnly/BFF o cambio backend.
- **Identity Platform/GCP:** requiere credenciales y entorno real para prueba end-to-end.
- **Cloud SQL:** existe adapter y guard de producción, pero la conectividad real no pudo validarse en este sandbox.
