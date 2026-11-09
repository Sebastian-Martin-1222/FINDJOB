-- ============================================================
-- Fija el search_path de todas las funciones/triggers del esquema
-- marketplace.
--
-- Problema: las funciones de los triggers consultan tablas sin el
-- prefijo "marketplace." (p. ej. solicitudes_servicio, estados_solicitud).
-- La conexión del backend no define search_path, así que dentro del
-- trigger esas tablas "no existen" y la operación falla con 500.
-- Caso visible: al ACEPTAR una solicitud se crea la conversación del
-- chat y el trigger trg_validar_conversacion_solicitud revienta.
--
-- Solución: cada función usa siempre marketplace, public sin importar
-- desde dónde se invoque. No cambia datos ni la lógica de los triggers.
-- Se puede ejecutar más de una vez sin problema.
-- ============================================================

BEGIN;

ALTER FUNCTION marketplace.fn_actualizar_timestamp() SET search_path = marketplace, public;
ALTER FUNCTION marketplace.fn_validar_rol_trabajador() SET search_path = marketplace, public;
ALTER FUNCTION marketplace.fn_validar_solicitud_contexto() SET search_path = marketplace, public;
ALTER FUNCTION marketplace.fn_validar_cita_contexto() SET search_path = marketplace, public;
ALTER FUNCTION marketplace.fn_validar_conversacion_solicitud() SET search_path = marketplace, public;
ALTER FUNCTION marketplace.fn_validar_participante_conversacion() SET search_path = marketplace, public;
ALTER FUNCTION marketplace.fn_validar_lectura_participante() SET search_path = marketplace, public;
ALTER FUNCTION marketplace.fn_usuario_involucrado_en_cita(BIGINT, BIGINT) SET search_path = marketplace, public;
ALTER FUNCTION marketplace.fn_validar_alerta_seguridad() SET search_path = marketplace, public;
ALTER FUNCTION marketplace.fn_validar_chequeo_seguridad() SET search_path = marketplace, public;
ALTER FUNCTION marketplace.fn_validar_respuesta_chequeo() SET search_path = marketplace, public;
ALTER FUNCTION marketplace.fn_validar_calificacion_finalizada() SET search_path = marketplace, public;
ALTER FUNCTION marketplace.fn_validar_pago() SET search_path = marketplace, public;
ALTER FUNCTION marketplace.fn_proteger_politica_comision_usada() SET search_path = marketplace, public;

COMMIT;
