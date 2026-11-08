# Correcciones de acceso y registro

## Cambios aplicados

- Navegación construida a partir de capacidades internas de la cuenta.
- Los nombres internos de rol no se muestran en navbar, perfil, chat ni mensajes de autorización.
- Las rutas fuera del alcance redirigen a una página válida en lugar de mostrar el módulo restringido.
- El acceso a contratación, prestación de servicios y administración se mantiene como lógica interna.
- El botón para alternar áreas solo aparece cuando la cuenta tiene ambos alcances funcionales.
- `dashboard`, solicitudes propias y solicitud de servicio quedan restringidos al alcance de contratación.
- Las rutas de gestión de servicios quedan restringidas al alcance correspondiente.
- Programación y edición de citas quedan restringidas al alcance que puede gestionarlas.
- Pago/calificación queda restringido al alcance que puede registrar el pago.
- El bloque de direcciones del perfil solo se muestra cuando la cuenta puede utilizarlas.
- La edición de una cita presencial ya no ofrece direcciones de la cuenta que presta el servicio; conserva la dirección de la solicitud.
- Mensajes y vistas compartidas no muestran el rol del otro participante.
- Errores 403 del backend ya no revelan nombres internos de roles.

## Registro

- Se agregó `Repite la contraseña`.
- La confirmación es obligatoria.
- Se valida al perder foco y se revalida al modificar la contraseña original.
- Si ambas contraseñas no coinciden, el formulario no llama al backend.
- `confirmPassword` nunca se envía al endpoint `/auth/register`.

## Validación ejecutada en este entorno

- Parse sintáctico de todos los archivos `.ts` y `.tsx`: OK.
- `python -m compileall backend/app`: OK.
- Búsqueda de etiquetas visibles `CLIENTE/TRABAJADOR/ADMIN` en UI principal: sin residuos visibles; los códigos permanecen únicamente en lógica interna.

La validación completa `npx tsc --noEmit`, `npm run lint` y `npm run build` debe ejecutarse en Windows después de `npm install`, porque este entorno no puede descargar todas las dependencias npm del proyecto.
