Quiero que audites el proyecto FindJob que se encuentra actualmente de forma LOCAL en este entorno.

OBJETIVO PRINCIPAL:
Validar todos los endpoints y servicios existentes en el proyecto local y compararlos con el catálogo de endpoints requerido para FindJob que aparece al final de este prompt.

NO quiero que reemplaces innecesariamente código que ya funciona. Primero debes inspeccionar y entender la implementación actual y después realizar únicamente los cambios necesarios.

PROCESO OBLIGATORIO:

1. Analiza primero toda la estructura del proyecto local.

2. Identifica:
   - Routers.
   - Endpoints.
   - Controllers o archivos equivalentes.
   - Services.
   - Schemas/DTOs.
   - Models.
   - Repositories.
   - Middleware.
   - Autenticación y autorización.
   - Configuración relacionada con la API.
   - Tests existentes.

3. Genera internamente un inventario de todos los endpoints que actualmente existen.

4. Compara ese inventario contra TODOS los endpoints especificados al final de este prompt.

5. Para cada endpoint requerido determina:
   - Si existe.
   - Si no existe.
   - Si existe pero utiliza una ruta diferente.
   - Si existe pero utiliza un método HTTP diferente.
   - Si existe pero está incompleto.
   - Si existe pero no tiene implementado correctamente el servicio asociado.
   - Si existe pero no tiene validaciones suficientes.

6. NO crees endpoints duplicados.
   Si un endpoint equivalente ya existe con una implementación válida, reutiliza la implementación existente y adáptala solamente si es necesario.

7. Si faltan endpoints:
   - Créales el router correspondiente.
   - Implementa el service necesario.
   - Crea o adapta schemas/DTOs.
   - Utiliza los models y repositories existentes.
   - Respeta la arquitectura y convenciones actuales del proyecto.
   - No inventes una arquitectura nueva si ya existe una estructura definida.

8. Si para implementar un endpoint hace falta una función de service, repository, schema o model que no existe, créala solamente si es necesaria.

9. Verifica que los endpoints utilicen correctamente:
   - GET
   - POST
   - PATCH
   - PUT
   - DELETE

10. Verifica también las rutas dinámicas, por ejemplo:
   {categoria_id}
   {servicio_id}
   {perfil_trabajador_id}
   {direccion_id}
   {solicitud_id}
   {cita_id}
   {conversacion_id}
   {mensaje_id}
   {chequeo_id}
   {habilidad_id}
   {ciudad_id}
   {usuario_id}
   {categoria_id}
   {subcategoria_id}
   {alerta_id}
   {pregunta_id}
   {catalogo}

11. Revisa que los endpoints protegidos tengan correctamente implementada la autenticación y autorización según corresponda.

12. Revisa especialmente que:
   - Un cliente no pueda modificar recursos de otro cliente.
   - Un trabajador no pueda modificar recursos de otro trabajador.
   - Los endpoints administrativos estén restringidos al rol ADMIN.
   - Los usuarios autenticados sean correctamente identificados.
   - No se confíe únicamente en datos enviados desde el frontend para determinar permisos.
   - Se valide la propiedad o participación del usuario sobre solicitudes, citas, conversaciones, mensajes, pagos y demás recursos.
   - No existan vulnerabilidades de acceso directo a objetos (BOLA/IDOR).

13. Revisa las transiciones de estado de solicitudes y citas para evitar operaciones inválidas.

14. Revisa que los endpoints que devuelven listas tengan paginación o límites cuando sea necesario, especialmente:
   - Solicitudes.
   - Citas.
   - Conversaciones.
   - Mensajes.
   - Pagos.
   - Usuarios.
   - Calificaciones.

15. Verifica que las respuestas y códigos HTTP sean coherentes con la operación realizada.

16. Verifica que los errores sean manejados correctamente y no se exponga información sensible.

17. Después de realizar las modificaciones, ejecuta los tests disponibles.

18. Si existen errores provocados por los cambios, corrígelos.

19. Si no existen tests suficientes para validar los nuevos endpoints, crea pruebas básicas para los endpoints que hayas agregado o modificado, siguiendo el patrón de testing que ya utilice el proyecto.

20. NO elimines funcionalidades existentes solamente para hacer coincidir el proyecto con esta lista.

21. NO cambies tecnologías ni hagas una migración de arquitectura.

22. NO generes microservicios si el proyecto actualmente funciona como una aplicación monolítica/modular.

23. Conserva el estilo, estructura, nombres y convenciones utilizadas actualmente por el proyecto siempre que sea posible.

CATÁLOGO DE ENDPOINTS REQUERIDOS:

==============================
PÚBLICOS Y COMUNES
==============================

GET /api/v1/categorias

GET /api/v1/categorias/{categoria_id}/subcategorias

GET /api/v1/modalidades

GET /api/v1/ciudades

GET /api/v1/servicios

GET /api/v1/servicios/{servicio_id}

GET /api/v1/trabajadores/{perfil_trabajador_id}

GET /api/v1/trabajadores/{perfil_trabajador_id}/calificaciones

GET /api/v1/me

PATCH /api/v1/me

GET /api/v1/me/roles


==============================
CLIENTE
==============================

GET /api/v1/me/direcciones

POST /api/v1/me/direcciones

PATCH /api/v1/me/direcciones/{direccion_id}

DELETE /api/v1/me/direcciones/{direccion_id}

POST /api/v1/solicitudes

GET /api/v1/solicitudes/mis-solicitudes

GET /api/v1/solicitudes/{solicitud_id}

PATCH /api/v1/solicitudes/{solicitud_id}/cancelar

GET /api/v1/citas/mis-citas

GET /api/v1/citas/{cita_id}

POST /api/v1/citas/{cita_id}/confirmar

GET /api/v1/conversaciones

GET /api/v1/conversaciones/{conversacion_id}/mensajes

POST /api/v1/conversaciones/{conversacion_id}/mensajes

POST /api/v1/conversaciones/{conversacion_id}/adjuntos

POST /api/v1/mensajes/{mensaje_id}/lectura

POST /api/v1/citas/{cita_id}/alertas-seguridad

GET /api/v1/citas/{cita_id}/chequeos-seguridad

POST /api/v1/chequeos-seguridad/{chequeo_id}/respuestas

POST /api/v1/citas/{cita_id}/pagos

GET /api/v1/citas/{cita_id}/pago

POST /api/v1/citas/{cita_id}/calificacion


==============================
TRABAJADOR
==============================

POST /api/v1/trabajador/perfil

GET /api/v1/trabajador/perfil

PATCH /api/v1/trabajador/perfil

GET /api/v1/trabajador/habilidades

POST /api/v1/trabajador/habilidades

DELETE /api/v1/trabajador/habilidades/{habilidad_id}

GET /api/v1/trabajador/coberturas

POST /api/v1/trabajador/coberturas

DELETE /api/v1/trabajador/coberturas/{ciudad_id}

POST /api/v1/servicios

GET /api/v1/trabajador/servicios

PATCH /api/v1/servicios/{servicio_id}

DELETE /api/v1/servicios/{servicio_id}

PUT /api/v1/servicios/{servicio_id}/modalidades

GET /api/v1/solicitudes/recibidas

PATCH /api/v1/solicitudes/{solicitud_id}/aceptar

PATCH /api/v1/solicitudes/{solicitud_id}/rechazar

POST /api/v1/solicitudes/{solicitud_id}/cita

PATCH /api/v1/citas/{cita_id}

PATCH /api/v1/citas/{cita_id}/iniciar

PATCH /api/v1/citas/{cita_id}/finalizar

GET /api/v1/trabajador/pagos

GET /api/v1/trabajador/calificaciones

POST /api/v1/citas/{cita_id}/alertas-seguridad

POST /api/v1/chequeos-seguridad/{chequeo_id}/respuestas


==============================
ADMIN
==============================

GET /api/v1/admin/usuarios

PATCH /api/v1/admin/usuarios/{usuario_id}/estado

PUT /api/v1/admin/usuarios/{usuario_id}/roles

POST /api/v1/admin/categorias

PATCH /api/v1/admin/categorias/{categoria_id}

POST /api/v1/admin/subcategorias

PATCH /api/v1/admin/subcategorias/{subcategoria_id}

POST /api/v1/admin/habilidades

PATCH /api/v1/admin/habilidades/{habilidad_id}

GET /api/v1/admin/solicitudes

GET /api/v1/admin/citas

GET /api/v1/admin/alertas-seguridad

PATCH /api/v1/admin/alertas-seguridad/{alerta_id}

GET /api/v1/admin/pagos

POST /api/v1/admin/politicas-comision

GET /api/v1/admin/politicas-comision

POST /api/v1/admin/preguntas-seguridad

PATCH /api/v1/admin/preguntas-seguridad/{pregunta_id}

GET /api/v1/admin/catalogos/{catalogo}


==============================
RESULTADO FINAL OBLIGATORIO
==============================

Al finalizar la auditoría, genera un informe con:

1. ENDPOINTS EXISTENTES
   Lista de endpoints del catálogo que ya estaban implementados correctamente.

2. ENDPOINTS FALTANTES
   Lista de endpoints del catálogo que no existían y que fueron implementados.

3. ENDPOINTS INCOMPLETOS
   Lista de endpoints que existían pero necesitaban modificaciones.

4. ENDPOINTS DIFERENTES
   Lista de endpoints que existen con una ruta o método diferente al especificado.

5. SERVICIOS CREADOS O MODIFICADOS
   Indica qué services fueron creados o modificados.

6. SCHEMAS CREADOS O MODIFICADOS
   Indica qué schemas/DTOs fueron creados o modificados.

7. MODELOS/REPOSITORIES CREADOS O MODIFICADOS
   Indica cualquier modificación necesaria.

8. AUTENTICACIÓN Y AUTORIZACIÓN
   Indica qué endpoints requieren autenticación y qué roles pueden utilizarlos.

9. PRUEBAS
   Indica qué pruebas ejecutaste y cuáles fueron sus resultados.

10. RESUMEN FINAL
   Presenta una tabla con:

   MÉTODO | ENDPOINT | ESTADO | ACCIÓN REALIZADA

   Estados permitidos:
   - EXISTENTE
   - IMPLEMENTADO
   - MODIFICADO
   - DIFERENTE
   - ERROR

IMPORTANTE:

Antes de modificar cualquier archivo, analiza primero el proyecto local.

No asumas que un endpoint está ausente solamente porque no encuentres exactamente el nombre esperado. Busca también routers, funciones, services y rutas equivalentes.

No dupliques funcionalidades.

Después de implementar los faltantes, verifica nuevamente TODO el catálogo para confirmar que no quede ningún endpoint requerido sin implementar.

El objetivo final es que el proyecto local quede alineado con el catálogo de endpoints de FindJob indicado anteriormente.