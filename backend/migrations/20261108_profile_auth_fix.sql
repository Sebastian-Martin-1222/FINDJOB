BEGIN;

-- Persistencia de contraseñas para nuevas cuentas.
ALTER TABLE marketplace.usuarios
    ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- El trigger debe resolver explícitamente las tablas del esquema marketplace.
CREATE OR REPLACE FUNCTION marketplace.fn_validar_rol_trabajador()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM marketplace.usuario_roles ur
        JOIN marketplace.roles r ON r.rol_id = ur.rol_id
        WHERE ur.usuario_id = NEW.usuario_id
          AND upper(r.codigo) = 'TRABAJADOR'
    ) THEN
        RAISE EXCEPTION 'El usuario debe tener acceso para ofrecer servicios antes de crear un perfil profesional';
    END IF;

    RETURN NEW;
END;
$$;

COMMIT;
