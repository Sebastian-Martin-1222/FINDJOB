"""Servicio de administración y moderación para el rol ADMIN."""

from typing import Any

from app.core.exceptions import EntityNotFoundException
from app.mocks.mock_db import mock_db
from app.schemas.pago import PagoOut
from app.schemas.seguridad import AlertaSeguridadOut, AlertaSeguridadUpdate
from app.schemas.usuario import UsuarioOut


class AdminService:
    """Operaciones de supervisión, moderación y catálogos administrativos."""

    def listar_usuarios(self) -> list[UsuarioOut]:
        resultados: list[UsuarioOut] = []
        for u in mock_db.usuarios:
            roles = [
                r["codigo"]
                for ur in mock_db.usuario_roles
                if ur["usuario_id"] == u["usuario_id"]
                for r in mock_db.roles
                if r["rol_id"] == ur["rol_id"]
            ]
            resultados.append(UsuarioOut(**u, roles=roles))
        return resultados

    def actualizar_estado_usuario(self, usuario_id: int, activo: bool) -> UsuarioOut:
        for u in mock_db.usuarios:
            if u["usuario_id"] == usuario_id:
                u["activo"] = activo
                roles = [
                    r["codigo"]
                    for ur in mock_db.usuario_roles
                    if ur["usuario_id"] == u["usuario_id"]
                    for r in mock_db.roles
                    if r["rol_id"] == ur["rol_id"]
                ]
                return UsuarioOut(**u, roles=roles)
        raise EntityNotFoundException(f"Usuario {usuario_id} no encontrado.")

    def actualizar_roles_usuario(
        self, usuario_id: int, roles_ids: list[int]
    ) -> UsuarioOut:
        u = next(
            (usr for usr in mock_db.usuarios if usr["usuario_id"] == usuario_id), None
        )
        if not u:
            raise EntityNotFoundException(f"Usuario {usuario_id} no encontrado.")

        # Reemplazar roles en usuario_roles
        mock_db.usuario_roles = [
            ur for ur in mock_db.usuario_roles if ur["usuario_id"] != usuario_id
        ]
        for rid in roles_ids:
            mock_db.usuario_roles.append(
                {
                    "usuario_id": usuario_id,
                    "rol_id": rid,
                    "asignado_en": u["actualizado_en"],
                }
            )

        roles = [
            r["codigo"]
            for ur in mock_db.usuario_roles
            if ur["usuario_id"] == u["usuario_id"]
            for r in mock_db.roles
            if r["rol_id"] == ur["rol_id"]
        ]
        return UsuarioOut(**u, roles=roles)

    def listar_alertas(self) -> list[AlertaSeguridadOut]:
        resultados: list[AlertaSeguridadOut] = []
        for a in mock_db.alertas_seguridad:
            usr = next(
                (u for u in mock_db.usuarios if u["usuario_id"] == a["usuario_id"]),
                None,
            )
            tipo = next(
                (
                    t
                    for t in mock_db.tipos_alerta
                    if t["tipo_alerta_id"] == a["tipo_alerta_id"]
                ),
                None,
            )
            resultados.append(
                AlertaSeguridadOut(
                    **a,
                    usuario_nombre=f"{usr['nombres']} {usr['apellidos']}"
                    if usr
                    else None,
                    tipo_alerta_codigo=tipo["codigo"] if tipo else None,
                )
            )
        return resultados

    def actualizar_alerta(
        self, alerta_id: int, data: AlertaSeguridadUpdate
    ) -> AlertaSeguridadOut:
        for a in mock_db.alertas_seguridad:
            if a["alerta_seguridad_id"] == alerta_id:
                if data.descripcion is not None:
                    a["descripcion"] = data.descripcion
                usr = next(
                    (u for u in mock_db.usuarios if u["usuario_id"] == a["usuario_id"]),
                    None,
                )
                tipo = next(
                    (
                        t
                        for t in mock_db.tipos_alerta
                        if t["tipo_alerta_id"] == a["tipo_alerta_id"]
                    ),
                    None,
                )
                return AlertaSeguridadOut(
                    **a,
                    usuario_nombre=f"{usr['nombres']} {usr['apellidos']}"
                    if usr
                    else None,
                    tipo_alerta_codigo=tipo["codigo"] if tipo else None,
                )
        raise EntityNotFoundException(f"Alerta {alerta_id} no encontrada.")

    def listar_pagos_admin(self) -> list[PagoOut]:
        from app.services.pagos_service import pagos_service

        return [pagos_service._ensamblar_pago(p) for p in mock_db.pagos]

    def consultar_catalogo(self, catalogo: str) -> list[dict[str, Any]]:
        catalogos_map = {
            "roles": mock_db.roles,
            "estados_solicitud": mock_db.estados_solicitud,
            "estados_cita": mock_db.estados_cita,
            "metodos_pago": mock_db.metodos_pago,
            "estados_pago": mock_db.estados_pago,
            "tipos_mensaje": mock_db.tipos_mensaje,
            "tipos_alerta": mock_db.tipos_alerta,
            "modalidades": mock_db.modalidades,
        }
        if catalogo not in catalogos_map:
            raise EntityNotFoundException(
                f"Catálogo '{catalogo}' no reconocido. Disponibles: {list(catalogos_map.keys())}"
            )
        return catalogos_map[catalogo]


admin_service = AdminService()
