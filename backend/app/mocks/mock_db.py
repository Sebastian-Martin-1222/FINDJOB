"""Base de datos en memoria (Mocks) para la fase de prototipado.

Contiene datos coherentes con las 36 tablas del esquema marketplace
y permite simular operaciones CRUD completas sin tocar base de datos real.
"""

from datetime import UTC, datetime
from decimal import Decimal
from typing import Any


class MockDatabase:
    """Almacén central en memoria con estructuras idénticas a las tablas SQL."""

    def __init__(self) -> None:
        self._reset()

    def _reset(self) -> None:
        now = datetime.now(UTC)

        # 1. Geografía
        self.paises: list[dict[str, Any]] = [
            {"pais_id": 1, "codigo_iso2": "CO", "nombre": "Colombia"},
        ]
        self.regiones: list[dict[str, Any]] = [
            {"region_id": 1, "pais_id": 1, "nombre": "Bogotá D.C.", "codigo": "11"},
            {"region_id": 2, "pais_id": 1, "nombre": "Antioquia", "codigo": "05"},
            {"region_id": 3, "pais_id": 1, "nombre": "Valle del Cauca", "codigo": "76"},
        ]
        self.ciudades: list[dict[str, Any]] = [
            {
                "ciudad_id": 1,
                "region_id": 1,
                "nombre": "Bogotá",
                "codigo_externo": "11001",
            },
            {
                "ciudad_id": 2,
                "region_id": 2,
                "nombre": "Medellín",
                "codigo_externo": "05001",
            },
            {
                "ciudad_id": 3,
                "region_id": 3,
                "nombre": "Cali",
                "codigo_externo": "76001",
            },
        ]

        # 2. Catálogos
        self.roles: list[dict[str, Any]] = [
            {
                "rol_id": 1,
                "codigo": "CLIENTE",
                "nombre": "Cliente",
                "descripcion": "Usuario que contrata servicios",
            },
            {
                "rol_id": 2,
                "codigo": "TRABAJADOR",
                "nombre": "Trabajador",
                "descripcion": "Prestador de servicios con perfil",
            },
            {
                "rol_id": 3,
                "codigo": "ADMIN",
                "nombre": "Administrador",
                "descripcion": "Gestor de plataforma y moderación",
            },
        ]
        self.habilidades: list[dict[str, Any]] = [
            {
                "habilidad_id": 1,
                "nombre": "Desarrollo Web en Python y React",
                "descripcion": "APIs y frontends modernos",
                "activa": True,
            },
            {
                "habilidad_id": 2,
                "nombre": "Plomería Residencial",
                "descripcion": "Reparación e instalación de tuberías",
                "activa": True,
            },
            {
                "habilidad_id": 3,
                "nombre": "Electricidad Básica",
                "descripcion": "Cableado e iluminación",
                "activa": True,
            },
            {
                "habilidad_id": 4,
                "nombre": "Diseño UX/UI",
                "descripcion": "Prototipado en Figma y usabilidad",
                "activa": True,
            },
        ]
        self.categorias: list[dict[str, Any]] = [
            {
                "categoria_id": 1,
                "nombre": "Tecnología y Software",
                "descripcion": "Servicios digitales y desarrollo",
                "activa": True,
            },
            {
                "categoria_id": 2,
                "nombre": "Hogar y Mantenimiento",
                "descripcion": "Servicios técnicos para el hogar",
                "activa": True,
            },
        ]
        self.subcategorias: list[dict[str, Any]] = [
            {
                "subcategoria_id": 1,
                "categoria_id": 1,
                "nombre": "Desarrollo de Software y Web",
                "descripcion": "Creación de aplicaciones",
                "activa": True,
            },
            {
                "subcategoria_id": 2,
                "categoria_id": 1,
                "nombre": "Diseño Gráfico y Multimedia",
                "descripcion": "Identidad visual y diseño",
                "activa": True,
            },
            {
                "subcategoria_id": 3,
                "categoria_id": 2,
                "nombre": "Plomería y Fontanería",
                "descripcion": "Mantenimiento de tuberías",
                "activa": True,
            },
            {
                "subcategoria_id": 4,
                "categoria_id": 2,
                "nombre": "Electricidad y Redes",
                "descripcion": "Instalaciones eléctricas",
                "activa": True,
            },
        ]
        self.modalidades: list[dict[str, Any]] = [
            {
                "modalidad_id": 1,
                "codigo": "REMOTO",
                "nombre": "Remoto",
                "descripcion": "Prestación a distancia mediante medios digitales",
            },
            {
                "modalidad_id": 2,
                "codigo": "PRESENCIAL",
                "nombre": "Presencial",
                "descripcion": "Prestación en sitio físico",
            },
        ]
        self.estados_solicitud: list[dict[str, Any]] = [
            {
                "estado_solicitud_id": 1,
                "codigo": "PENDIENTE",
                "nombre": "Pendiente",
                "descripcion": "Esperando respuesta del trabajador",
            },
            {
                "estado_solicitud_id": 2,
                "codigo": "ACEPTADA",
                "nombre": "Aceptada",
                "descripcion": "Aceptada por el trabajador",
            },
            {
                "estado_solicitud_id": 3,
                "codigo": "RECHAZADA",
                "nombre": "Rechazada",
                "descripcion": "Rechazada por el trabajador",
            },
            {
                "estado_solicitud_id": 4,
                "codigo": "CANCELADA",
                "nombre": "Cancelada",
                "descripcion": "Cancelada por el cliente",
            },
        ]
        self.estados_cita: list[dict[str, Any]] = [
            {
                "estado_cita_id": 1,
                "codigo": "PROGRAMADA",
                "nombre": "Programada",
                "descripcion": "Cita agendada",
            },
            {
                "estado_cita_id": 2,
                "codigo": "EN_EJECUCION",
                "nombre": "En Ejecución",
                "descripcion": "Servicio en proceso",
            },
            {
                "estado_cita_id": 3,
                "codigo": "FINALIZADA",
                "nombre": "Finalizada",
                "descripcion": "Servicio concluido",
            },
            {
                "estado_cita_id": 4,
                "codigo": "CANCELADA",
                "nombre": "Cancelada",
                "descripcion": "Cita cancelada",
            },
        ]
        self.metodos_pago: list[dict[str, Any]] = [
            {
                "metodo_pago_id": 1,
                "codigo": "SIMULADO",
                "nombre": "Pago Simulado (Sandbox)",
                "descripcion": "Pruebas académicas",
                "activo": True,
            },
            {
                "metodo_pago_id": 2,
                "codigo": "TRANSFERENCIA",
                "nombre": "Transferencia Bancaria",
                "descripcion": "PSE o depósito",
                "activo": True,
            },
        ]
        self.estados_pago: list[dict[str, Any]] = [
            {
                "estado_pago_id": 1,
                "codigo": "PENDIENTE",
                "nombre": "Pendiente",
                "descripcion": "Pago por procesar",
            },
            {
                "estado_pago_id": 2,
                "codigo": "APROBADO",
                "nombre": "Aprobado",
                "descripcion": "Pago completado exitosamente",
            },
            {
                "estado_pago_id": 3,
                "codigo": "RECHAZADO",
                "nombre": "Rechazado",
                "descripcion": "Pago fallido o declinado",
            },
        ]
        self.tipos_mensaje: list[dict[str, Any]] = [
            {
                "tipo_mensaje_id": 1,
                "codigo": "TEXTO",
                "nombre": "Texto",
                "descripcion": "Mensaje de texto",
            },
            {
                "tipo_mensaje_id": 2,
                "codigo": "ADJUNTO",
                "nombre": "Adjunto",
                "descripcion": "Archivo adjunto",
            },
            {
                "tipo_mensaje_id": 3,
                "codigo": "SISTEMA",
                "nombre": "Sistema",
                "descripcion": "Mensaje automático del sistema",
            },
        ]
        self.tipos_alerta: list[dict[str, Any]] = [
            {
                "tipo_alerta_id": 1,
                "codigo": "EMERGENCIA",
                "nombre": "Emergencia",
                "descripcion": "Situación de riesgo durante servicio presencial",
            },
            {
                "tipo_alerta_id": 2,
                "codigo": "RETRASO",
                "nombre": "Retraso",
                "descripcion": "Retraso significativo en el inicio",
            },
            {
                "tipo_alerta_id": 3,
                "codigo": "DESVIO_UBICACION",
                "nombre": "Desvío de Ubicación",
                "descripcion": "Inconsistencia en la dirección acordada",
            },
        ]

        # 3. Usuarios y Roles
        self.usuarios: list[dict[str, Any]] = [
            {
                "usuario_id": 1,
                "uid_autenticacion": "firebase_uid_cliente_01",
                "email": "cliente@findjob.com",
                "nombres": "Carlos",
                "apellidos": "Gómez Pérez",
                "telefono": "+573001112233",
                "activo": True,
                "creado_en": now,
                "actualizado_en": now,
            },
            {
                "usuario_id": 2,
                "uid_autenticacion": "firebase_uid_trabajador_01",
                "email": "trabajador@findjob.com",
                "nombres": "Andrés",
                "apellidos": "Rodríguez Silva",
                "telefono": "+573004445566",
                "activo": True,
                "creado_en": now,
                "actualizado_en": now,
            },
            {
                "usuario_id": 3,
                "uid_autenticacion": "firebase_uid_admin_01",
                "email": "admin@findjob.com",
                "nombres": "Super",
                "apellidos": "Administrador",
                "telefono": "+573007778899",
                "activo": True,
                "creado_en": now,
                "actualizado_en": now,
            },
        ]
        self.usuario_roles: list[dict[str, Any]] = [
            {"usuario_id": 1, "rol_id": 1, "asignado_en": now},  # Cliente
            {"usuario_id": 2, "rol_id": 2, "asignado_en": now},  # Trabajador
            {"usuario_id": 3, "rol_id": 3, "asignado_en": now},  # Admin
        ]

        # 4. Perfiles y Servicios
        self.perfiles_trabajador: list[dict[str, Any]] = [
            {
                "perfil_trabajador_id": 1,
                "usuario_id": 2,
                "ciudad_id": 1,
                "titulo_profesional": "Ingeniero de Software y Desarrollador Full Stack",
                "descripcion_profesional": "Especialista en arquitectura FastAPI, React y Google Cloud Platform.",
                "experiencia_resumen": "Más de 5 años diseñando e implementando soluciones web en 3FN.",
                "activo": True,
                "creado_en": now,
                "actualizado_en": now,
            }
        ]
        self.usuario_habilidades: list[dict[str, Any]] = [
            {
                "usuario_id": 2,
                "habilidad_id": 1,
                "descripcion_competencia": "Certificado en desarrollo backend Python",
                "registrada_en": now,
            }
        ]
        self.coberturas: list[dict[str, Any]] = [
            {"perfil_trabajador_id": 1, "ciudad_id": 1},
            {"perfil_trabajador_id": 1, "ciudad_id": 2},
        ]
        self.servicios: list[dict[str, Any]] = [
            {
                "servicio_id": 1,
                "perfil_trabajador_id": 1,
                "subcategoria_id": 1,
                "titulo": "Construcción de API REST con FastAPI y Clean Architecture",
                "descripcion": "Desarrollo completo de endpoints parametrizados, esquemas Pydantic y documentación OpenAPI.",
                "precio_base": Decimal("180000.00"),
                "tiempo_estimado_horas": 16,
                "revisiones_incluidas": 2,
                "activo": True,
                "creado_en": now,
                "actualizado_en": now,
            },
            {
                "servicio_id": 2,
                "perfil_trabajador_id": 1,
                "subcategoria_id": 1,
                "titulo": "Soporte Técnico e Instalación de Infraestructura en Sitio",
                "descripcion": "Diagnóstico y puesta a punto de servidores locales y redes de oficina.",
                "precio_base": Decimal("250000.00"),
                "tiempo_estimado_horas": 6,
                "revisiones_incluidas": 1,
                "activo": True,
                "creado_en": now,
                "actualizado_en": now,
            },
        ]
        self.servicio_modalidades: list[dict[str, Any]] = [
            {"servicio_id": 1, "modalidad_id": 1},  # Remoto
            {"servicio_id": 2, "modalidad_id": 2},  # Presencial
        ]

        # 5. Direcciones y Contratación
        self.direcciones: list[dict[str, Any]] = [
            {
                "direccion_id": 1,
                "usuario_id": 1,
                "ciudad_id": 1,
                "alias": "Oficina Central",
                "linea_direccion": "Carrera 7 # 72-41 Oficina 502",
                "complemento": "Edificio Business Center",
                "referencia": "Frente a estación transmilenio",
                "codigo_postal": "110221",
                "latitud": Decimal("4.655820"),
                "longitud": Decimal("-74.058310"),
                "activa": True,
                "creado_en": now,
                "actualizado_en": now,
            }
        ]
        self.solicitudes_servicio: list[dict[str, Any]] = [
            {
                "solicitud_servicio_id": 1,
                "cliente_usuario_id": 1,
                "servicio_id": 1,
                "modalidad_id": 1,
                "estado_solicitud_id": 2,  # Aceptada
                "direccion_id": None,
                "descripcion_necesidad": "Requiero desarrollo de endpoints y lógica de negocio para FindJob.",
                "fecha_propuesta": now,
                "valor_acordado": Decimal("180000.00"),
                "plataforma_remota": "Google Meet",
                "creada_en": now,
                "respondida_en": now,
                "actualizado_en": now,
            }
        ]
        self.citas: list[dict[str, Any]] = [
            {
                "cita_id": 1,
                "solicitud_servicio_id": 1,
                "estado_cita_id": 3,  # Finalizada
                "direccion_id": None,
                "fecha_inicio": now,
                "fecha_fin": now,
                "codigo_confirmacion": "CONF-FJ-2026-001",
                "plataforma_remota": "Google Meet",
                "enlace_reunion": "https://meet.google.com/abc-defg-hij",
                "creada_en": now,
                "actualizado_en": now,
            }
        ]

        # 6. Políticas de Comisión y Pagos
        self.politicas_comision: list[dict[str, Any]] = [
            {
                "politica_comision_id": 1,
                "nombre": "Comisión Base FindJob 2026",
                "porcentaje_comision": Decimal("10.00"),
                "vigente_desde": datetime(2026, 1, 1, tzinfo=UTC),
                "vigente_hasta": None,
                "descripcion": "Comisión del 10% para sostenibilidad de la plataforma",
                "creada_en": now,
            }
        ]
        self.pagos: list[dict[str, Any]] = [
            {
                "pago_id": 1,
                "cita_id": 1,
                "metodo_pago_id": 1,
                "estado_pago_id": 2,  # Aprobado
                "politica_comision_id": 1,
                "monto_total": Decimal("180000.00"),
                "referencia_pasarela": "SIM-PAY-987654321",
                "fecha_pago": now,
                "creado_en": now,
                "actualizado_en": now,
            }
        ]

        # 7. Calificaciones
        self.calificaciones: list[dict[str, Any]] = [
            {
                "calificacion_id": 1,
                "cita_id": 1,
                "puntuacion": 5,
                "comentario": "Excelente trabajo, puntual y código limpio según especificación.",
                "creada_en": now,
            }
        ]

        # 8. Seguridad Presencial
        self.preguntas_seguridad: list[dict[str, Any]] = [
            {
                "pregunta_seguridad_id": 1,
                "texto": "¿El prestador del servicio llegó debidamente identificado?",
                "activa": True,
            },
            {
                "pregunta_seguridad_id": 2,
                "texto": "¿Las condiciones del sitio de trabajo se perciben seguras?",
                "activa": True,
            },
        ]
        self.chequeos_seguridad: list[dict[str, Any]] = []
        self.respuestas_chequeo: list[dict[str, Any]] = []
        self.alertas_seguridad: list[dict[str, Any]] = []

        # 9. Chat interno
        self.conversaciones: list[dict[str, Any]] = [
            {
                "conversacion_id": 1,
                "solicitud_servicio_id": 1,
                "creada_en": now,
                "cerrada_en": None,
            }
        ]
        self.participantes_conversacion: list[dict[str, Any]] = [
            {"conversacion_id": 1, "usuario_id": 1, "unido_en": now, "salido_en": None},
            {"conversacion_id": 1, "usuario_id": 2, "unido_en": now, "salido_en": None},
        ]
        self.mensajes: list[dict[str, Any]] = [
            {
                "mensaje_id": 1,
                "conversacion_id": 1,
                "remitente_usuario_id": 1,
                "tipo_mensaje_id": 1,
                "contenido": "Hola Andrés, quedo atento a los detalles técnicos.",
                "enviado_en": now,
                "editado_en": None,
            },
            {
                "mensaje_id": 2,
                "conversacion_id": 1,
                "remitente_usuario_id": 2,
                "tipo_mensaje_id": 1,
                "contenido": "Perfecto Carlos, hoy mismo arrancamos con la arquitectura base.",
                "enviado_en": now,
                "editado_en": None,
            },
        ]
        self.lecturas_mensajes: list[dict[str, Any]] = [
            {"mensaje_id": 1, "usuario_id": 2, "leido_en": now},
            {"mensaje_id": 2, "usuario_id": 1, "leido_en": now},
        ]
        self.archivos_adjuntos: list[dict[str, Any]] = []


# Instancia singleton de MockDatabase en memoria
mock_db = MockDatabase()
