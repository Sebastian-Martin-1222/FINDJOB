-- ============================================================
-- MARKETPLACE DE SERVICIOS - DDL FINAL
-- Google Cloud SQL for PostgreSQL
-- Modelo relacional normalizado hasta 3FN
-- Sin datos / sin INSERT
-- ============================================================

BEGIN;

CREATE SCHEMA IF NOT EXISTS marketplace;
SET search_path TO marketplace, public;

-- ============================================================
-- 1. GEOGRAFIA
-- ============================================================

CREATE TABLE paises (
    pais_id        BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    codigo_iso2    CHAR(2) NOT NULL,
    nombre         VARCHAR(100) NOT NULL,
    CONSTRAINT uq_paises_codigo_iso2 UNIQUE (codigo_iso2),
    CONSTRAINT uq_paises_nombre UNIQUE (nombre),
    CONSTRAINT chk_paises_codigo CHECK (codigo_iso2 ~ '^[A-Z]{2}$'),
    CONSTRAINT chk_paises_nombre CHECK (btrim(nombre) <> '')
);

CREATE TABLE regiones (
    region_id      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    pais_id        BIGINT NOT NULL,
    nombre         VARCHAR(120) NOT NULL,
    codigo         VARCHAR(30),
    CONSTRAINT fk_regiones_pais
        FOREIGN KEY (pais_id) REFERENCES paises(pais_id) ON DELETE RESTRICT,
    CONSTRAINT uq_regiones_pais_nombre UNIQUE (pais_id, nombre),
    CONSTRAINT chk_regiones_nombre CHECK (btrim(nombre) <> ''),
    CONSTRAINT chk_regiones_codigo CHECK (codigo IS NULL OR btrim(codigo) <> '')
);

CREATE TABLE ciudades (
    ciudad_id      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    region_id      BIGINT NOT NULL,
    nombre         VARCHAR(120) NOT NULL,
    codigo_externo VARCHAR(50),
    CONSTRAINT fk_ciudades_region
        FOREIGN KEY (region_id) REFERENCES regiones(region_id) ON DELETE RESTRICT,
    CONSTRAINT uq_ciudades_region_nombre UNIQUE (region_id, nombre),
    CONSTRAINT chk_ciudades_nombre CHECK (btrim(nombre) <> ''),
    CONSTRAINT chk_ciudades_codigo CHECK (codigo_externo IS NULL OR btrim(codigo_externo) <> '')
);

-- ============================================================
-- 2. CATALOGOS
-- ============================================================

CREATE TABLE roles (
    rol_id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    codigo         VARCHAR(40) NOT NULL,
    nombre         VARCHAR(80) NOT NULL,
    descripcion    VARCHAR(300),
    CONSTRAINT uq_roles_codigo UNIQUE (codigo),
    CONSTRAINT uq_roles_nombre UNIQUE (nombre),
    CONSTRAINT chk_roles_codigo CHECK (btrim(codigo) <> ''),
    CONSTRAINT chk_roles_nombre CHECK (btrim(nombre) <> '')
);

CREATE TABLE habilidades (
    habilidad_id   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre         VARCHAR(120) NOT NULL,
    descripcion    VARCHAR(500),
    activa         BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT uq_habilidades_nombre UNIQUE (nombre),
    CONSTRAINT chk_habilidades_nombre CHECK (btrim(nombre) <> '')
);

CREATE TABLE categorias (
    categoria_id   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre         VARCHAR(120) NOT NULL,
    descripcion    VARCHAR(500),
    activa         BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT uq_categorias_nombre UNIQUE (nombre),
    CONSTRAINT chk_categorias_nombre CHECK (btrim(nombre) <> '')
);

CREATE TABLE subcategorias (
    subcategoria_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    categoria_id    BIGINT NOT NULL,
    nombre          VARCHAR(120) NOT NULL,
    descripcion     VARCHAR(500),
    activa          BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_subcategorias_categoria
        FOREIGN KEY (categoria_id) REFERENCES categorias(categoria_id) ON DELETE RESTRICT,
    CONSTRAINT uq_subcategorias_categoria_nombre UNIQUE (categoria_id, nombre),
    CONSTRAINT chk_subcategorias_nombre CHECK (btrim(nombre) <> '')
);

CREATE TABLE modalidades (
    modalidad_id   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    codigo         VARCHAR(30) NOT NULL,
    nombre         VARCHAR(80) NOT NULL,
    descripcion    VARCHAR(300),
    CONSTRAINT uq_modalidades_codigo UNIQUE (codigo),
    CONSTRAINT uq_modalidades_nombre UNIQUE (nombre),
    CONSTRAINT chk_modalidades_codigo CHECK (btrim(codigo) <> ''),
    CONSTRAINT chk_modalidades_nombre CHECK (btrim(nombre) <> '')
);

CREATE TABLE estados_solicitud (
    estado_solicitud_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    codigo              VARCHAR(40) NOT NULL,
    nombre              VARCHAR(80) NOT NULL,
    descripcion         VARCHAR(300),
    CONSTRAINT uq_estados_solicitud_codigo UNIQUE (codigo),
    CONSTRAINT uq_estados_solicitud_nombre UNIQUE (nombre),
    CONSTRAINT chk_estados_solicitud_codigo CHECK (btrim(codigo) <> '')
);

CREATE TABLE estados_cita (
    estado_cita_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    codigo         VARCHAR(40) NOT NULL,
    nombre         VARCHAR(80) NOT NULL,
    descripcion    VARCHAR(300),
    CONSTRAINT uq_estados_cita_codigo UNIQUE (codigo),
    CONSTRAINT uq_estados_cita_nombre UNIQUE (nombre),
    CONSTRAINT chk_estados_cita_codigo CHECK (btrim(codigo) <> '')
);

CREATE TABLE metodos_pago (
    metodo_pago_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    codigo         VARCHAR(40) NOT NULL,
    nombre         VARCHAR(80) NOT NULL,
    descripcion    VARCHAR(300),
    activo         BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT uq_metodos_pago_codigo UNIQUE (codigo),
    CONSTRAINT uq_metodos_pago_nombre UNIQUE (nombre),
    CONSTRAINT chk_metodos_pago_codigo CHECK (btrim(codigo) <> '')
);

CREATE TABLE estados_pago (
    estado_pago_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    codigo         VARCHAR(40) NOT NULL,
    nombre         VARCHAR(80) NOT NULL,
    descripcion    VARCHAR(300),
    CONSTRAINT uq_estados_pago_codigo UNIQUE (codigo),
    CONSTRAINT uq_estados_pago_nombre UNIQUE (nombre),
    CONSTRAINT chk_estados_pago_codigo CHECK (btrim(codigo) <> '')
);

CREATE TABLE tipos_mensaje (
    tipo_mensaje_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    codigo          VARCHAR(40) NOT NULL,
    nombre          VARCHAR(80) NOT NULL,
    descripcion     VARCHAR(300),
    CONSTRAINT uq_tipos_mensaje_codigo UNIQUE (codigo),
    CONSTRAINT uq_tipos_mensaje_nombre UNIQUE (nombre),
    CONSTRAINT chk_tipos_mensaje_codigo CHECK (btrim(codigo) <> '')
);

CREATE TABLE tipos_alerta (
    tipo_alerta_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    codigo         VARCHAR(40) NOT NULL,
    nombre         VARCHAR(100) NOT NULL,
    descripcion    VARCHAR(300),
    CONSTRAINT uq_tipos_alerta_codigo UNIQUE (codigo),
    CONSTRAINT uq_tipos_alerta_nombre UNIQUE (nombre),
    CONSTRAINT chk_tipos_alerta_codigo CHECK (btrim(codigo) <> '')
);

-- ============================================================
-- 3. USUARIOS, ROLES Y PERFIL PROFESIONAL
-- ============================================================

CREATE TABLE usuarios (
    usuario_id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    uid_autenticacion   VARCHAR(128),
    email               VARCHAR(254) NOT NULL,
    nombres             VARCHAR(100) NOT NULL,
    apellidos           VARCHAR(100) NOT NULL,
    telefono            VARCHAR(20),
    activo              BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en           TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_usuarios_uid_autenticacion UNIQUE (uid_autenticacion),
    CONSTRAINT chk_usuarios_uid CHECK (uid_autenticacion IS NULL OR btrim(uid_autenticacion) <> ''),
    CONSTRAINT chk_usuarios_email CHECK (btrim(email) <> ''),
    CONSTRAINT chk_usuarios_nombres CHECK (btrim(nombres) <> ''),
    CONSTRAINT chk_usuarios_apellidos CHECK (btrim(apellidos) <> ''),
    CONSTRAINT chk_usuarios_telefono CHECK (
        telefono IS NULL OR telefono ~ '^\+?[0-9]{7,15}$'
    )
);

CREATE UNIQUE INDEX uq_usuarios_email_ci
    ON usuarios (lower(email));

CREATE TABLE usuario_roles (
    usuario_id     BIGINT NOT NULL,
    rol_id         BIGINT NOT NULL,
    asignado_en    TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_usuario_roles PRIMARY KEY (usuario_id, rol_id),
    CONSTRAINT fk_usuario_roles_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios(usuario_id) ON DELETE CASCADE,
    CONSTRAINT fk_usuario_roles_rol
        FOREIGN KEY (rol_id) REFERENCES roles(rol_id) ON DELETE RESTRICT
);

CREATE TABLE perfiles_trabajador (
    perfil_trabajador_id   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id             BIGINT NOT NULL,
    ciudad_id              BIGINT,
    titulo_profesional     VARCHAR(160),
    descripcion_profesional TEXT,
    experiencia_resumen     TEXT,
    activo                 BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en              TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en         TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_perfiles_trabajador_usuario UNIQUE (usuario_id),
    CONSTRAINT fk_perfiles_trabajador_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios(usuario_id) ON DELETE RESTRICT,
    CONSTRAINT fk_perfiles_trabajador_ciudad
        FOREIGN KEY (ciudad_id) REFERENCES ciudades(ciudad_id) ON DELETE RESTRICT,
    CONSTRAINT chk_perfil_titulo CHECK (
        titulo_profesional IS NULL OR btrim(titulo_profesional) <> ''
    )
);

CREATE TABLE usuario_habilidades (
    usuario_id             BIGINT NOT NULL,
    habilidad_id           BIGINT NOT NULL,
    descripcion_competencia VARCHAR(500),
    registrada_en          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_usuario_habilidades PRIMARY KEY (usuario_id, habilidad_id),
    CONSTRAINT fk_usuario_habilidades_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios(usuario_id) ON DELETE CASCADE,
    CONSTRAINT fk_usuario_habilidades_habilidad
        FOREIGN KEY (habilidad_id) REFERENCES habilidades(habilidad_id) ON DELETE RESTRICT
);

-- ============================================================
-- 4. SERVICIOS Y COBERTURA
-- ============================================================

CREATE TABLE servicios (
    servicio_id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    perfil_trabajador_id   BIGINT NOT NULL,
    subcategoria_id        BIGINT NOT NULL,
    titulo                 VARCHAR(180) NOT NULL,
    descripcion            TEXT NOT NULL,
    precio_base            NUMERIC(14,2) NOT NULL,
    tiempo_estimado_horas  INTEGER NOT NULL,
    revisiones_incluidas   SMALLINT NOT NULL DEFAULT 0,
    activo                 BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en              TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en         TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_servicios_perfil
        FOREIGN KEY (perfil_trabajador_id)
        REFERENCES perfiles_trabajador(perfil_trabajador_id) ON DELETE RESTRICT,
    CONSTRAINT fk_servicios_subcategoria
        FOREIGN KEY (subcategoria_id)
        REFERENCES subcategorias(subcategoria_id) ON DELETE RESTRICT,
    CONSTRAINT chk_servicios_titulo CHECK (btrim(titulo) <> ''),
    CONSTRAINT chk_servicios_descripcion CHECK (btrim(descripcion) <> ''),
    CONSTRAINT chk_servicios_precio CHECK (precio_base > 0),
    CONSTRAINT chk_servicios_tiempo CHECK (tiempo_estimado_horas BETWEEN 1 AND 8760),
    CONSTRAINT chk_servicios_revisiones CHECK (revisiones_incluidas >= 0)
);

CREATE TABLE servicio_modalidades (
    servicio_id     BIGINT NOT NULL,
    modalidad_id    BIGINT NOT NULL,
    CONSTRAINT pk_servicio_modalidades PRIMARY KEY (servicio_id, modalidad_id),
    CONSTRAINT fk_servicio_modalidades_servicio
        FOREIGN KEY (servicio_id) REFERENCES servicios(servicio_id) ON DELETE CASCADE,
    CONSTRAINT fk_servicio_modalidades_modalidad
        FOREIGN KEY (modalidad_id) REFERENCES modalidades(modalidad_id) ON DELETE RESTRICT
);

CREATE TABLE coberturas (
    perfil_trabajador_id BIGINT NOT NULL,
    ciudad_id            BIGINT NOT NULL,
    CONSTRAINT pk_coberturas PRIMARY KEY (perfil_trabajador_id, ciudad_id),
    CONSTRAINT fk_coberturas_perfil
        FOREIGN KEY (perfil_trabajador_id)
        REFERENCES perfiles_trabajador(perfil_trabajador_id) ON DELETE CASCADE,
    CONSTRAINT fk_coberturas_ciudad
        FOREIGN KEY (ciudad_id) REFERENCES ciudades(ciudad_id) ON DELETE RESTRICT
);

-- ============================================================
-- 5. DIRECCIONES
-- ============================================================

CREATE TABLE direcciones (
    direccion_id      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id        BIGINT NOT NULL,
    ciudad_id         BIGINT NOT NULL,
    alias             VARCHAR(80) NOT NULL,
    linea_direccion   VARCHAR(250) NOT NULL,
    complemento       VARCHAR(150),
    referencia        VARCHAR(250),
    codigo_postal     VARCHAR(20),
    latitud           NUMERIC(9,6),
    longitud          NUMERIC(10,6),
    activa            BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en         TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en    TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_direcciones_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios(usuario_id) ON DELETE RESTRICT,
    CONSTRAINT fk_direcciones_ciudad
        FOREIGN KEY (ciudad_id) REFERENCES ciudades(ciudad_id) ON DELETE RESTRICT,
    CONSTRAINT uq_direcciones_usuario_alias UNIQUE (usuario_id, alias),
    CONSTRAINT chk_direcciones_alias CHECK (btrim(alias) <> ''),
    CONSTRAINT chk_direcciones_linea CHECK (btrim(linea_direccion) <> ''),
    CONSTRAINT chk_direcciones_latitud CHECK (latitud IS NULL OR latitud BETWEEN -90 AND 90),
    CONSTRAINT chk_direcciones_longitud CHECK (longitud IS NULL OR longitud BETWEEN -180 AND 180),
    CONSTRAINT chk_direcciones_coordenadas CHECK (
        (latitud IS NULL AND longitud IS NULL)
        OR (latitud IS NOT NULL AND longitud IS NOT NULL)
    )
);

-- ============================================================
-- 6. SOLICITUDES
-- ============================================================

CREATE TABLE solicitudes_servicio (
    solicitud_servicio_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cliente_usuario_id    BIGINT NOT NULL,
    servicio_id           BIGINT NOT NULL,
    modalidad_id          BIGINT NOT NULL,
    estado_solicitud_id   BIGINT NOT NULL,
    direccion_id          BIGINT,
    descripcion_necesidad TEXT NOT NULL,
    fecha_propuesta       TIMESTAMPTZ NOT NULL,
    valor_acordado        NUMERIC(14,2),
    plataforma_remota     VARCHAR(80),
    creada_en             TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    respondida_en         TIMESTAMPTZ,
    actualizado_en        TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_solicitudes_cliente
        FOREIGN KEY (cliente_usuario_id)
        REFERENCES usuarios(usuario_id) ON DELETE RESTRICT,
    CONSTRAINT fk_solicitudes_servicio_modalidad
        FOREIGN KEY (servicio_id, modalidad_id)
        REFERENCES servicio_modalidades(servicio_id, modalidad_id) ON DELETE RESTRICT,
    CONSTRAINT fk_solicitudes_estado
        FOREIGN KEY (estado_solicitud_id)
        REFERENCES estados_solicitud(estado_solicitud_id) ON DELETE RESTRICT,
    CONSTRAINT fk_solicitudes_direccion
        FOREIGN KEY (direccion_id) REFERENCES direcciones(direccion_id) ON DELETE RESTRICT,
    CONSTRAINT chk_solicitudes_descripcion CHECK (btrim(descripcion_necesidad) <> ''),
    CONSTRAINT chk_solicitudes_valor CHECK (valor_acordado IS NULL OR valor_acordado > 0),
    CONSTRAINT chk_solicitudes_plataforma CHECK (
        plataforma_remota IS NULL OR btrim(plataforma_remota) <> ''
    ),
    CONSTRAINT chk_solicitudes_respuesta CHECK (
        respondida_en IS NULL OR respondida_en >= creada_en
    )
);

-- ============================================================
-- 7. CITAS / EJECUCION
-- ============================================================

CREATE TABLE citas (
    cita_id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    solicitud_servicio_id BIGINT NOT NULL,
    estado_cita_id        BIGINT NOT NULL,
    direccion_id          BIGINT,
    fecha_inicio          TIMESTAMPTZ NOT NULL,
    fecha_fin             TIMESTAMPTZ,
    codigo_confirmacion   VARCHAR(64),
    plataforma_remota     VARCHAR(80),
    enlace_reunion        VARCHAR(2048),
    creada_en             TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en        TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_citas_solicitud UNIQUE (solicitud_servicio_id),
    CONSTRAINT uq_citas_codigo_confirmacion UNIQUE (codigo_confirmacion),
    CONSTRAINT fk_citas_solicitud
        FOREIGN KEY (solicitud_servicio_id)
        REFERENCES solicitudes_servicio(solicitud_servicio_id) ON DELETE RESTRICT,
    CONSTRAINT fk_citas_estado
        FOREIGN KEY (estado_cita_id) REFERENCES estados_cita(estado_cita_id) ON DELETE RESTRICT,
    CONSTRAINT fk_citas_direccion
        FOREIGN KEY (direccion_id) REFERENCES direcciones(direccion_id) ON DELETE RESTRICT,
    CONSTRAINT chk_citas_fechas CHECK (fecha_fin IS NULL OR fecha_fin > fecha_inicio),
    CONSTRAINT chk_citas_codigo CHECK (
        codigo_confirmacion IS NULL OR btrim(codigo_confirmacion) <> ''
    ),
    CONSTRAINT chk_citas_plataforma CHECK (
        plataforma_remota IS NULL OR btrim(plataforma_remota) <> ''
    ),
    CONSTRAINT chk_citas_enlace_https CHECK (
        enlace_reunion IS NULL OR enlace_reunion ~* '^https://'
    )
);

-- ============================================================
-- 8. COMISIONES Y PAGOS
-- ============================================================

CREATE TABLE politicas_comision (
    politica_comision_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre               VARCHAR(120) NOT NULL,
    porcentaje_comision  NUMERIC(5,2) NOT NULL,
    vigente_desde        TIMESTAMPTZ NOT NULL,
    vigente_hasta        TIMESTAMPTZ,
    descripcion          VARCHAR(500),
    creada_en            TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_politicas_nombre CHECK (btrim(nombre) <> ''),
    CONSTRAINT chk_politicas_porcentaje CHECK (
        porcentaje_comision BETWEEN 0 AND 100
    ),
    CONSTRAINT chk_politicas_periodo CHECK (
        vigente_hasta IS NULL OR vigente_hasta > vigente_desde
    ),
    CONSTRAINT ex_politicas_comision_no_solapadas
        EXCLUDE USING gist (
            tstzrange(vigente_desde, vigente_hasta, '[)') WITH &&
        )
);

CREATE TABLE pagos (
    pago_id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cita_id               BIGINT NOT NULL,
    metodo_pago_id        BIGINT NOT NULL,
    estado_pago_id        BIGINT NOT NULL,
    politica_comision_id  BIGINT NOT NULL,
    monto_total           NUMERIC(14,2) NOT NULL,
    referencia_pasarela   VARCHAR(255),
    fecha_pago            TIMESTAMPTZ,
    creado_en             TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en        TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_pagos_cita UNIQUE (cita_id),
    CONSTRAINT uq_pagos_referencia_pasarela UNIQUE (referencia_pasarela),
    CONSTRAINT fk_pagos_cita
        FOREIGN KEY (cita_id) REFERENCES citas(cita_id) ON DELETE RESTRICT,
    CONSTRAINT fk_pagos_metodo
        FOREIGN KEY (metodo_pago_id) REFERENCES metodos_pago(metodo_pago_id) ON DELETE RESTRICT,
    CONSTRAINT fk_pagos_estado
        FOREIGN KEY (estado_pago_id) REFERENCES estados_pago(estado_pago_id) ON DELETE RESTRICT,
    CONSTRAINT fk_pagos_politica
        FOREIGN KEY (politica_comision_id)
        REFERENCES politicas_comision(politica_comision_id) ON DELETE RESTRICT,
    CONSTRAINT chk_pagos_monto CHECK (monto_total > 0),
    CONSTRAINT chk_pagos_referencia CHECK (
        referencia_pasarela IS NULL OR btrim(referencia_pasarela) <> ''
    )
);

-- ============================================================
-- 9. CALIFICACIONES
-- ============================================================

CREATE TABLE calificaciones (
    calificacion_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cita_id         BIGINT NOT NULL,
    puntuacion      SMALLINT NOT NULL,
    comentario      TEXT,
    creada_en       TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_calificaciones_cita UNIQUE (cita_id),
    CONSTRAINT fk_calificaciones_cita
        FOREIGN KEY (cita_id) REFERENCES citas(cita_id) ON DELETE RESTRICT,
    CONSTRAINT chk_calificaciones_puntuacion CHECK (puntuacion BETWEEN 1 AND 5)
);

-- ============================================================
-- 10. SEGURIDAD PRESENCIAL
-- ============================================================

CREATE TABLE preguntas_seguridad (
    pregunta_seguridad_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    texto                 VARCHAR(300) NOT NULL,
    activa                BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT uq_preguntas_seguridad_texto UNIQUE (texto),
    CONSTRAINT chk_preguntas_seguridad_texto CHECK (btrim(texto) <> '')
);

CREATE TABLE chequeos_seguridad (
    chequeo_seguridad_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cita_id              BIGINT NOT NULL,
    generado_en          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    cerrado_en           TIMESTAMPTZ,
    CONSTRAINT fk_chequeos_cita
        FOREIGN KEY (cita_id) REFERENCES citas(cita_id) ON DELETE RESTRICT,
    CONSTRAINT chk_chequeos_fechas CHECK (
        cerrado_en IS NULL OR cerrado_en >= generado_en
    )
);

CREATE TABLE respuestas_chequeo (
    chequeo_seguridad_id  BIGINT NOT NULL,
    pregunta_seguridad_id BIGINT NOT NULL,
    usuario_id            BIGINT NOT NULL,
    respuesta_ok          BOOLEAN NOT NULL,
    comentario            VARCHAR(500),
    latitud               NUMERIC(9,6),
    longitud              NUMERIC(10,6),
    respondido_en         TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_respuestas_chequeo
        PRIMARY KEY (chequeo_seguridad_id, pregunta_seguridad_id, usuario_id),
    CONSTRAINT fk_respuestas_chequeo
        FOREIGN KEY (chequeo_seguridad_id)
        REFERENCES chequeos_seguridad(chequeo_seguridad_id) ON DELETE CASCADE,
    CONSTRAINT fk_respuestas_pregunta
        FOREIGN KEY (pregunta_seguridad_id)
        REFERENCES preguntas_seguridad(pregunta_seguridad_id) ON DELETE RESTRICT,
    CONSTRAINT fk_respuestas_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios(usuario_id) ON DELETE RESTRICT,
    CONSTRAINT chk_respuestas_latitud CHECK (latitud IS NULL OR latitud BETWEEN -90 AND 90),
    CONSTRAINT chk_respuestas_longitud CHECK (longitud IS NULL OR longitud BETWEEN -180 AND 180),
    CONSTRAINT chk_respuestas_coordenadas CHECK (
        (latitud IS NULL AND longitud IS NULL)
        OR (latitud IS NOT NULL AND longitud IS NOT NULL)
    )
);

CREATE TABLE alertas_seguridad (
    alerta_seguridad_id   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cita_id               BIGINT NOT NULL,
    usuario_id            BIGINT NOT NULL,
    tipo_alerta_id        BIGINT NOT NULL,
    descripcion           VARCHAR(1000),
    latitud               NUMERIC(9,6),
    longitud              NUMERIC(10,6),
    ubicacion_capturada_en TIMESTAMPTZ,
    creada_en             TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_alertas_cita
        FOREIGN KEY (cita_id) REFERENCES citas(cita_id) ON DELETE RESTRICT,
    CONSTRAINT fk_alertas_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios(usuario_id) ON DELETE RESTRICT,
    CONSTRAINT fk_alertas_tipo
        FOREIGN KEY (tipo_alerta_id) REFERENCES tipos_alerta(tipo_alerta_id) ON DELETE RESTRICT,
    CONSTRAINT chk_alertas_latitud CHECK (latitud IS NULL OR latitud BETWEEN -90 AND 90),
    CONSTRAINT chk_alertas_longitud CHECK (longitud IS NULL OR longitud BETWEEN -180 AND 180),
    CONSTRAINT chk_alertas_ubicacion_completa CHECK (
        (latitud IS NULL AND longitud IS NULL AND ubicacion_capturada_en IS NULL)
        OR
        (latitud IS NOT NULL AND longitud IS NOT NULL AND ubicacion_capturada_en IS NOT NULL)
    )
);

-- ============================================================
-- 11. CHAT
-- ============================================================

CREATE TABLE conversaciones (
    conversacion_id       BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    solicitud_servicio_id BIGINT NOT NULL,
    creada_en             TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    cerrada_en            TIMESTAMPTZ,
    CONSTRAINT uq_conversaciones_solicitud UNIQUE (solicitud_servicio_id),
    CONSTRAINT fk_conversaciones_solicitud
        FOREIGN KEY (solicitud_servicio_id)
        REFERENCES solicitudes_servicio(solicitud_servicio_id) ON DELETE RESTRICT,
    CONSTRAINT chk_conversaciones_cierre CHECK (
        cerrada_en IS NULL OR cerrada_en >= creada_en
    )
);

CREATE TABLE participantes_conversacion (
    conversacion_id BIGINT NOT NULL,
    usuario_id      BIGINT NOT NULL,
    unido_en        TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    salido_en       TIMESTAMPTZ,
    CONSTRAINT pk_participantes_conversacion PRIMARY KEY (conversacion_id, usuario_id),
    CONSTRAINT fk_participantes_conversacion
        FOREIGN KEY (conversacion_id)
        REFERENCES conversaciones(conversacion_id) ON DELETE RESTRICT,
    CONSTRAINT fk_participantes_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios(usuario_id) ON DELETE RESTRICT,
    CONSTRAINT chk_participantes_fechas CHECK (
        salido_en IS NULL OR salido_en >= unido_en
    )
);

CREATE TABLE mensajes (
    mensaje_id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    conversacion_id      BIGINT NOT NULL,
    remitente_usuario_id BIGINT NOT NULL,
    tipo_mensaje_id      BIGINT NOT NULL,
    contenido            TEXT,
    enviado_en           TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    editado_en           TIMESTAMPTZ,
    CONSTRAINT fk_mensajes_participante
        FOREIGN KEY (conversacion_id, remitente_usuario_id)
        REFERENCES participantes_conversacion(conversacion_id, usuario_id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_mensajes_tipo
        FOREIGN KEY (tipo_mensaje_id)
        REFERENCES tipos_mensaje(tipo_mensaje_id) ON DELETE RESTRICT,
    CONSTRAINT chk_mensajes_edicion CHECK (
        editado_en IS NULL OR editado_en >= enviado_en
    )
);

CREATE TABLE lecturas_mensajes (
    mensaje_id BIGINT NOT NULL,
    usuario_id BIGINT NOT NULL,
    leido_en   TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_lecturas_mensajes PRIMARY KEY (mensaje_id, usuario_id),
    CONSTRAINT fk_lecturas_mensaje
        FOREIGN KEY (mensaje_id) REFERENCES mensajes(mensaje_id) ON DELETE CASCADE,
    CONSTRAINT fk_lecturas_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios(usuario_id) ON DELETE RESTRICT
);

CREATE TABLE archivos_adjuntos (
    archivo_adjunto_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    mensaje_id         BIGINT NOT NULL,
    nombre_original    VARCHAR(255) NOT NULL,
    tipo_mime          VARCHAR(100),
    tamano_bytes       BIGINT,
    bucket             VARCHAR(63) NOT NULL,
    ruta_objeto        VARCHAR(1024) NOT NULL,
    creado_en          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_archivos_mensaje
        FOREIGN KEY (mensaje_id) REFERENCES mensajes(mensaje_id) ON DELETE CASCADE,
    CONSTRAINT uq_archivos_objeto UNIQUE (bucket, ruta_objeto),
    CONSTRAINT chk_archivos_nombre CHECK (btrim(nombre_original) <> ''),
    CONSTRAINT chk_archivos_bucket CHECK (btrim(bucket) <> ''),
    CONSTRAINT chk_archivos_ruta CHECK (btrim(ruta_objeto) <> ''),
    CONSTRAINT chk_archivos_tamano CHECK (tamano_bytes IS NULL OR tamano_bytes >= 0)
);

-- ============================================================
-- 12. INDICES
-- ============================================================

CREATE INDEX idx_regiones_pais ON regiones(pais_id);
CREATE INDEX idx_ciudades_region ON ciudades(region_id);

CREATE INDEX idx_usuario_roles_rol ON usuario_roles(rol_id, usuario_id);
CREATE INDEX idx_perfiles_ciudad ON perfiles_trabajador(ciudad_id);
CREATE INDEX idx_usuario_habilidades_habilidad ON usuario_habilidades(habilidad_id, usuario_id);

CREATE INDEX idx_subcategorias_categoria ON subcategorias(categoria_id);

CREATE INDEX idx_servicios_perfil ON servicios(perfil_trabajador_id);
CREATE INDEX idx_servicios_subcategoria ON servicios(subcategoria_id);
CREATE INDEX idx_servicios_precio ON servicios(precio_base);
CREATE INDEX idx_servicios_activos_subcategoria_precio
    ON servicios(subcategoria_id, precio_base)
    WHERE activo = TRUE;

CREATE INDEX idx_servicio_modalidades_modalidad
    ON servicio_modalidades(modalidad_id, servicio_id);

CREATE INDEX idx_coberturas_ciudad
    ON coberturas(ciudad_id, perfil_trabajador_id);

CREATE INDEX idx_direcciones_usuario ON direcciones(usuario_id);
CREATE INDEX idx_direcciones_ciudad ON direcciones(ciudad_id);

CREATE INDEX idx_solicitudes_cliente_fecha
    ON solicitudes_servicio(cliente_usuario_id, creada_en DESC);
CREATE INDEX idx_solicitudes_servicio_estado
    ON solicitudes_servicio(servicio_id, estado_solicitud_id, creada_en DESC);
CREATE INDEX idx_solicitudes_estado_fecha
    ON solicitudes_servicio(estado_solicitud_id, creada_en DESC);
CREATE INDEX idx_solicitudes_modalidad
    ON solicitudes_servicio(modalidad_id);
CREATE INDEX idx_solicitudes_fecha_propuesta
    ON solicitudes_servicio(fecha_propuesta);

CREATE INDEX idx_citas_estado_fecha ON citas(estado_cita_id, fecha_inicio);
CREATE INDEX idx_citas_direccion ON citas(direccion_id);

CREATE INDEX idx_politicas_vigencia
    ON politicas_comision(vigente_desde, vigente_hasta);

CREATE INDEX idx_pagos_estado_fecha
    ON pagos(estado_pago_id, fecha_pago DESC);
CREATE INDEX idx_pagos_metodo ON pagos(metodo_pago_id);
CREATE INDEX idx_pagos_politica ON pagos(politica_comision_id);

CREATE INDEX idx_calificaciones_puntuacion ON calificaciones(puntuacion);

CREATE INDEX idx_chequeos_cita_fecha
    ON chequeos_seguridad(cita_id, generado_en DESC);

CREATE INDEX idx_respuestas_usuario
    ON respuestas_chequeo(usuario_id, respondido_en DESC);

CREATE INDEX idx_alertas_cita_fecha
    ON alertas_seguridad(cita_id, creada_en DESC);
CREATE INDEX idx_alertas_usuario_fecha
    ON alertas_seguridad(usuario_id, creada_en DESC);
CREATE INDEX idx_alertas_tipo ON alertas_seguridad(tipo_alerta_id);

CREATE INDEX idx_participantes_usuario
    ON participantes_conversacion(usuario_id, conversacion_id);
CREATE INDEX idx_mensajes_conversacion_fecha
    ON mensajes(conversacion_id, enviado_en DESC);
CREATE INDEX idx_mensajes_tipo ON mensajes(tipo_mensaje_id);
CREATE INDEX idx_lecturas_usuario_mensaje
    ON lecturas_mensajes(usuario_id, mensaje_id);
CREATE INDEX idx_archivos_mensaje ON archivos_adjuntos(mensaje_id);

-- ============================================================
-- 13. TRIGGER GENERICO actualizado_en
-- ============================================================

CREATE OR REPLACE FUNCTION fn_actualizar_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.actualizado_en := CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_usuarios_actualizado
BEFORE UPDATE ON usuarios
FOR EACH ROW EXECUTE FUNCTION fn_actualizar_timestamp();

CREATE TRIGGER trg_perfiles_actualizado
BEFORE UPDATE ON perfiles_trabajador
FOR EACH ROW EXECUTE FUNCTION fn_actualizar_timestamp();

CREATE TRIGGER trg_servicios_actualizado
BEFORE UPDATE ON servicios
FOR EACH ROW EXECUTE FUNCTION fn_actualizar_timestamp();

CREATE TRIGGER trg_direcciones_actualizado
BEFORE UPDATE ON direcciones
FOR EACH ROW EXECUTE FUNCTION fn_actualizar_timestamp();

CREATE TRIGGER trg_solicitudes_actualizado
BEFORE UPDATE ON solicitudes_servicio
FOR EACH ROW EXECUTE FUNCTION fn_actualizar_timestamp();

CREATE TRIGGER trg_citas_actualizado
BEFORE UPDATE ON citas
FOR EACH ROW EXECUTE FUNCTION fn_actualizar_timestamp();

CREATE TRIGGER trg_pagos_actualizado
BEFORE UPDATE ON pagos
FOR EACH ROW EXECUTE FUNCTION fn_actualizar_timestamp();

-- ============================================================
-- 14. REGLA: PERFIL SOLO PARA USUARIO CON ROL TRABAJADOR
-- Requiere que el catalogo roles contenga codigo TRABAJADOR.
-- ============================================================

CREATE OR REPLACE FUNCTION fn_validar_rol_trabajador()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM usuario_roles ur
        JOIN roles r ON r.rol_id = ur.rol_id
        WHERE ur.usuario_id = NEW.usuario_id
          AND upper(r.codigo) = 'TRABAJADOR'
    ) THEN
        RAISE EXCEPTION 'El usuario debe tener el rol TRABAJADOR para crear un perfil profesional';
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validar_rol_trabajador
BEFORE INSERT OR UPDATE OF usuario_id
ON perfiles_trabajador
FOR EACH ROW EXECUTE FUNCTION fn_validar_rol_trabajador();

-- ============================================================
-- 15. REGLA: CONTEXTO DE SOLICITUD
-- ============================================================

CREATE OR REPLACE FUNCTION fn_validar_solicitud_contexto()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_modalidad_codigo VARCHAR(30);
    v_propietario_direccion BIGINT;
    v_trabajador_usuario_id BIGINT;
BEGIN
    SELECT codigo
      INTO v_modalidad_codigo
      FROM modalidades
     WHERE modalidad_id = NEW.modalidad_id;

    SELECT pt.usuario_id
      INTO v_trabajador_usuario_id
      FROM servicios s
      JOIN perfiles_trabajador pt
        ON pt.perfil_trabajador_id = s.perfil_trabajador_id
     WHERE s.servicio_id = NEW.servicio_id;

    IF NEW.cliente_usuario_id = v_trabajador_usuario_id THEN
        RAISE EXCEPTION 'Un trabajador no puede solicitar su propio servicio';
    END IF;

    IF upper(v_modalidad_codigo) = 'PRESENCIAL' THEN
        IF NEW.direccion_id IS NULL THEN
            RAISE EXCEPTION 'Una solicitud PRESENCIAL requiere direccion_id';
        END IF;

        IF NEW.plataforma_remota IS NOT NULL THEN
            RAISE EXCEPTION 'Una solicitud PRESENCIAL no debe registrar plataforma_remota';
        END IF;

        SELECT usuario_id
          INTO v_propietario_direccion
          FROM direcciones
         WHERE direccion_id = NEW.direccion_id;

        IF v_propietario_direccion IS DISTINCT FROM NEW.cliente_usuario_id THEN
            RAISE EXCEPTION 'La direccion de la solicitud debe pertenecer al cliente';
        END IF;

    ELSIF upper(v_modalidad_codigo) = 'REMOTO' THEN
        IF NEW.direccion_id IS NOT NULL THEN
            RAISE EXCEPTION 'Una solicitud REMOTA no debe contener direccion_id';
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validar_solicitud_contexto
BEFORE INSERT OR UPDATE OF
    cliente_usuario_id, servicio_id, modalidad_id, direccion_id, plataforma_remota
ON solicitudes_servicio
FOR EACH ROW EXECUTE FUNCTION fn_validar_solicitud_contexto();

-- ============================================================
-- 16. REGLA: CONTEXTO DE CITA
-- ============================================================

CREATE OR REPLACE FUNCTION fn_validar_cita_contexto()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_modalidad_codigo VARCHAR(30);
    v_cliente_usuario_id BIGINT;
    v_propietario_direccion BIGINT;
BEGIN
    SELECT m.codigo, s.cliente_usuario_id
      INTO v_modalidad_codigo, v_cliente_usuario_id
      FROM solicitudes_servicio s
      JOIN modalidades m ON m.modalidad_id = s.modalidad_id
     WHERE s.solicitud_servicio_id = NEW.solicitud_servicio_id;

    IF upper(v_modalidad_codigo) = 'PRESENCIAL' THEN
        IF NEW.direccion_id IS NULL THEN
            RAISE EXCEPTION 'Una cita PRESENCIAL requiere direccion_id';
        END IF;

        IF NEW.plataforma_remota IS NOT NULL OR NEW.enlace_reunion IS NOT NULL THEN
            RAISE EXCEPTION 'Una cita PRESENCIAL no debe registrar datos de reunion remota';
        END IF;

        SELECT usuario_id
          INTO v_propietario_direccion
          FROM direcciones
         WHERE direccion_id = NEW.direccion_id;

        IF v_propietario_direccion IS DISTINCT FROM v_cliente_usuario_id THEN
            RAISE EXCEPTION 'La direccion de la cita debe pertenecer al cliente';
        END IF;

    ELSIF upper(v_modalidad_codigo) = 'REMOTO' THEN
        IF NEW.direccion_id IS NOT NULL THEN
            RAISE EXCEPTION 'Una cita REMOTA no debe contener direccion_id';
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validar_cita_contexto
BEFORE INSERT OR UPDATE OF
    solicitud_servicio_id, direccion_id, plataforma_remota, enlace_reunion
ON citas
FOR EACH ROW EXECUTE FUNCTION fn_validar_cita_contexto();

-- ============================================================
-- 17. REGLA: CONVERSACION SOLO DESDE SOLICITUD ACEPTADA
-- ============================================================

CREATE OR REPLACE FUNCTION fn_validar_conversacion_solicitud()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_estado_codigo VARCHAR(40);
BEGIN
    SELECT es.codigo
      INTO v_estado_codigo
      FROM solicitudes_servicio s
      JOIN estados_solicitud es
        ON es.estado_solicitud_id = s.estado_solicitud_id
     WHERE s.solicitud_servicio_id = NEW.solicitud_servicio_id;

    IF upper(v_estado_codigo) <> 'ACEPTADA' THEN
        RAISE EXCEPTION 'La conversacion solo puede crearse para una solicitud ACEPTADA';
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validar_conversacion_solicitud
BEFORE INSERT OR UPDATE OF solicitud_servicio_id
ON conversaciones
FOR EACH ROW EXECUTE FUNCTION fn_validar_conversacion_solicitud();

-- ============================================================
-- 18. REGLA: SOLO CLIENTE Y TRABAJADOR EN EL CHAT
-- ============================================================

CREATE OR REPLACE FUNCTION fn_validar_participante_conversacion()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_cliente_id BIGINT;
    v_trabajador_id BIGINT;
BEGIN
    SELECT ss.cliente_usuario_id, pt.usuario_id
      INTO v_cliente_id, v_trabajador_id
      FROM conversaciones c
      JOIN solicitudes_servicio ss
        ON ss.solicitud_servicio_id = c.solicitud_servicio_id
      JOIN servicios s
        ON s.servicio_id = ss.servicio_id
      JOIN perfiles_trabajador pt
        ON pt.perfil_trabajador_id = s.perfil_trabajador_id
     WHERE c.conversacion_id = NEW.conversacion_id;

    IF NEW.usuario_id <> v_cliente_id AND NEW.usuario_id <> v_trabajador_id THEN
        RAISE EXCEPTION 'Solo el cliente y el trabajador de la solicitud pueden participar en la conversacion';
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validar_participante_conversacion
BEFORE INSERT OR UPDATE OF conversacion_id, usuario_id
ON participantes_conversacion
FOR EACH ROW EXECUTE FUNCTION fn_validar_participante_conversacion();

-- ============================================================
-- 19. REGLA: LECTURA SOLO POR PARTICIPANTES
-- ============================================================

CREATE OR REPLACE FUNCTION fn_validar_lectura_participante()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM mensajes m
        JOIN participantes_conversacion pc
          ON pc.conversacion_id = m.conversacion_id
         AND pc.usuario_id = NEW.usuario_id
        WHERE m.mensaje_id = NEW.mensaje_id
    ) THEN
        RAISE EXCEPTION 'El usuario debe participar en la conversacion para registrar lectura';
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validar_lectura_participante
BEFORE INSERT OR UPDATE
ON lecturas_mensajes
FOR EACH ROW EXECUTE FUNCTION fn_validar_lectura_participante();

-- ============================================================
-- 20. FUNCION AUXILIAR: USUARIO INVOLUCRADO EN CITA
-- ============================================================

CREATE OR REPLACE FUNCTION fn_usuario_involucrado_en_cita(
    p_cita_id BIGINT,
    p_usuario_id BIGINT
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM citas c
        JOIN solicitudes_servicio ss
          ON ss.solicitud_servicio_id = c.solicitud_servicio_id
        JOIN servicios s
          ON s.servicio_id = ss.servicio_id
        JOIN perfiles_trabajador pt
          ON pt.perfil_trabajador_id = s.perfil_trabajador_id
        WHERE c.cita_id = p_cita_id
          AND p_usuario_id IN (ss.cliente_usuario_id, pt.usuario_id)
    );
$$;

-- ============================================================
-- 21. REGLA: SEGURIDAD SOLO EN PRESENCIAL Y POR INVOLUCRADOS
-- ============================================================

CREATE OR REPLACE FUNCTION fn_validar_alerta_seguridad()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_modalidad_codigo VARCHAR(30);
BEGIN
    SELECT m.codigo
      INTO v_modalidad_codigo
      FROM citas c
      JOIN solicitudes_servicio ss
        ON ss.solicitud_servicio_id = c.solicitud_servicio_id
      JOIN modalidades m
        ON m.modalidad_id = ss.modalidad_id
     WHERE c.cita_id = NEW.cita_id;

    IF upper(v_modalidad_codigo) <> 'PRESENCIAL' THEN
        RAISE EXCEPTION 'Las alertas de seguridad solo aplican a citas PRESENCIALES';
    END IF;

    IF NOT fn_usuario_involucrado_en_cita(NEW.cita_id, NEW.usuario_id) THEN
        RAISE EXCEPTION 'La alerta debe ser generada por el cliente o trabajador de la cita';
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validar_alerta_seguridad
BEFORE INSERT OR UPDATE OF cita_id, usuario_id
ON alertas_seguridad
FOR EACH ROW EXECUTE FUNCTION fn_validar_alerta_seguridad();

CREATE OR REPLACE FUNCTION fn_validar_chequeo_seguridad()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_modalidad_codigo VARCHAR(30);
BEGIN
    SELECT m.codigo
      INTO v_modalidad_codigo
      FROM citas c
      JOIN solicitudes_servicio ss
        ON ss.solicitud_servicio_id = c.solicitud_servicio_id
      JOIN modalidades m
        ON m.modalidad_id = ss.modalidad_id
     WHERE c.cita_id = NEW.cita_id;

    IF upper(v_modalidad_codigo) <> 'PRESENCIAL' THEN
        RAISE EXCEPTION 'Los chequeos de seguridad solo aplican a citas PRESENCIALES';
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validar_chequeo_seguridad
BEFORE INSERT OR UPDATE OF cita_id
ON chequeos_seguridad
FOR EACH ROW EXECUTE FUNCTION fn_validar_chequeo_seguridad();

CREATE OR REPLACE FUNCTION fn_validar_respuesta_chequeo()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_cita_id BIGINT;
BEGIN
    SELECT cita_id
      INTO v_cita_id
      FROM chequeos_seguridad
     WHERE chequeo_seguridad_id = NEW.chequeo_seguridad_id;

    IF NOT fn_usuario_involucrado_en_cita(v_cita_id, NEW.usuario_id) THEN
        RAISE EXCEPTION 'Solo el cliente o trabajador de la cita puede responder un chequeo';
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validar_respuesta_chequeo
BEFORE INSERT OR UPDATE OF chequeo_seguridad_id, usuario_id
ON respuestas_chequeo
FOR EACH ROW EXECUTE FUNCTION fn_validar_respuesta_chequeo();

-- ============================================================
-- 22. REGLA: CALIFICAR SOLO CITA FINALIZADA
-- ============================================================

CREATE OR REPLACE FUNCTION fn_validar_calificacion_finalizada()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_estado_codigo VARCHAR(40);
BEGIN
    SELECT ec.codigo
      INTO v_estado_codigo
      FROM citas c
      JOIN estados_cita ec ON ec.estado_cita_id = c.estado_cita_id
     WHERE c.cita_id = NEW.cita_id;

    IF upper(v_estado_codigo) <> 'FINALIZADA' THEN
        RAISE EXCEPTION 'Solo es posible calificar una cita FINALIZADA';
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validar_calificacion_finalizada
BEFORE INSERT OR UPDATE OF cita_id
ON calificaciones
FOR EACH ROW EXECUTE FUNCTION fn_validar_calificacion_finalizada();

-- ============================================================
-- 23. REGLA: PAGO SOLO CITA FINALIZADA + POLITICA VIGENTE
-- ============================================================

CREATE OR REPLACE FUNCTION fn_validar_pago()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_estado_cita VARCHAR(40);
    v_vigente_desde TIMESTAMPTZ;
    v_vigente_hasta TIMESTAMPTZ;
    v_fecha_referencia TIMESTAMPTZ;
BEGIN
    SELECT ec.codigo
      INTO v_estado_cita
      FROM citas c
      JOIN estados_cita ec ON ec.estado_cita_id = c.estado_cita_id
     WHERE c.cita_id = NEW.cita_id;

    IF upper(v_estado_cita) <> 'FINALIZADA' THEN
        RAISE EXCEPTION 'El pago solo puede asociarse a una cita FINALIZADA';
    END IF;

    SELECT vigente_desde, vigente_hasta
      INTO v_vigente_desde, v_vigente_hasta
      FROM politicas_comision
     WHERE politica_comision_id = NEW.politica_comision_id;

    v_fecha_referencia := COALESCE(NEW.fecha_pago, NEW.creado_en, CURRENT_TIMESTAMP);

    IF v_fecha_referencia < v_vigente_desde
       OR (v_vigente_hasta IS NOT NULL AND v_fecha_referencia >= v_vigente_hasta) THEN
        RAISE EXCEPTION 'La politica de comision no estaba vigente para la fecha del pago';
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validar_pago
BEFORE INSERT OR UPDATE OF cita_id, politica_comision_id, fecha_pago
ON pagos
FOR EACH ROW EXECUTE FUNCTION fn_validar_pago();

-- ============================================================
-- 24. PROTEGER HISTORICO DE POLITICAS YA USADAS
-- ============================================================

CREATE OR REPLACE FUNCTION fn_proteger_politica_comision_usada()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pagos
        WHERE politica_comision_id = OLD.politica_comision_id
    ) THEN
        RAISE EXCEPTION 'No se puede modificar o eliminar una politica de comision utilizada en pagos';
    END IF;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_politica_comision_proteger_update
BEFORE UPDATE OF porcentaje_comision, vigente_desde, vigente_hasta
ON politicas_comision
FOR EACH ROW EXECUTE FUNCTION fn_proteger_politica_comision_usada();

CREATE TRIGGER trg_politica_comision_proteger_delete
BEFORE DELETE ON politicas_comision
FOR EACH ROW EXECUTE FUNCTION fn_proteger_politica_comision_usada();

COMMIT;
