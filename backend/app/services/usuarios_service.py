"""Servicio de negocio para usuarios y gestión de direcciones."""

from datetime import UTC, datetime
from typing import Any

from app.core.exceptions import (
    AuthorizationException,
    ConflictException,
    EntityNotFoundException,
)
from app.mocks.mock_db import mock_db
from app.schemas.usuario import (
    DireccionCreate,
    DireccionOut,
    DireccionUpdate,
    UsuarioOut,
    UsuarioUpdate,
)


class UsuariosService:
    """Lógica de negocio para cuentas de usuario y direcciones reutilizables."""

    def _obtener_roles_usuario(self, usuario_id: int) -> list[str]:
        roles_codigos: list[str] = []
        for ur in mock_db.usuario_roles:
            if ur["usuario_id"] == usuario_id:
                for r in mock_db.roles:
                    if r["rol_id"] == ur["rol_id"]:
                        roles_codigos.append(r["codigo"])
        return roles_codigos

    def get_usuario_por_id(self, usuario_id: int) -> UsuarioOut:
        for u in mock_db.usuarios:
            if u["usuario_id"] == usuario_id:
                roles = self._obtener_roles_usuario(usuario_id)
                return UsuarioOut(**u, roles=roles)
        raise EntityNotFoundException(f"Usuario con ID {usuario_id} no encontrado.")

    def actualizar_usuario(self, usuario_id: int, data: UsuarioUpdate) -> UsuarioOut:
        for u in mock_db.usuarios:
            if u["usuario_id"] == usuario_id:
                if data.nombres is not None:
                    u["nombres"] = data.nombres
                if data.apellidos is not None:
                    u["apellidos"] = data.apellidos
                if data.telefono is not None:
                    u["telefono"] = data.telefono
                u["actualizado_en"] = datetime.now(UTC)
                roles = self._obtener_roles_usuario(usuario_id)
                return UsuarioOut(**u, roles=roles)
        raise EntityNotFoundException(f"Usuario con ID {usuario_id} no encontrado.")

    def get_direcciones_usuario(self, usuario_id: int) -> list[DireccionOut]:
        dirs = [
            d
            for d in mock_db.direcciones
            if d["usuario_id"] == usuario_id and d.get("activa", True)
        ]
        return [DireccionOut(**d) for d in dirs]

    def crear_direccion(self, usuario_id: int, data: DireccionCreate) -> DireccionOut:
        # Validar ciudad
        if not any(c["ciudad_id"] == data.ciudad_id for c in mock_db.ciudades):
            raise EntityNotFoundException(f"La ciudad {data.ciudad_id} no existe.")

        # Validar unicidad (usuario_id, alias) según CONSTRAINT uq_direcciones_usuario_alias
        if any(
            d["usuario_id"] == usuario_id
            and d["alias"].lower() == data.alias.lower()
            and d.get("activa", True)
            for d in mock_db.direcciones
        ):
            raise ConflictException(
                f"Ya tienes una dirección registrada con el alias '{data.alias}'."
            )

        ahora = datetime.now(UTC)
        nueva_id = max([d["direccion_id"] for d in mock_db.direcciones], default=0) + 1
        item: dict[str, Any] = {
            "direccion_id": nueva_id,
            "usuario_id": usuario_id,
            "ciudad_id": data.ciudad_id,
            "alias": data.alias,
            "linea_direccion": data.linea_direccion,
            "complemento": data.complemento,
            "referencia": data.referencia,
            "codigo_postal": data.codigo_postal,
            "latitud": data.latitud,
            "longitud": data.longitud,
            "activa": True,
            "creado_en": ahora,
            "actualizado_en": ahora,
        }
        mock_db.direcciones.append(item)
        return DireccionOut(**item)

    def actualizar_direccion(
        self, usuario_id: int, direccion_id: int, data: DireccionUpdate
    ) -> DireccionOut:
        for d in mock_db.direcciones:
            if d["direccion_id"] == direccion_id:
                # Validar propiedad del recurso
                if d["usuario_id"] != usuario_id:
                    raise AuthorizationException(
                        "No tienes permiso para modificar esta dirección."
                    )
                if data.ciudad_id is not None:
                    if not any(
                        c["ciudad_id"] == data.ciudad_id for c in mock_db.ciudades
                    ):
                        raise EntityNotFoundException(
                            f"La ciudad {data.ciudad_id} no existe."
                        )
                    d["ciudad_id"] = data.ciudad_id
                if data.alias is not None:
                    # Validar unicidad si cambia alias
                    if any(
                        o["usuario_id"] == usuario_id
                        and o["direccion_id"] != direccion_id
                        and o["alias"].lower() == data.alias.lower()
                        for o in mock_db.direcciones
                    ):
                        raise ConflictException(
                            f"Ya posees otra dirección con el alias '{data.alias}'."
                        )
                    d["alias"] = data.alias
                if data.linea_direccion is not None:
                    d["linea_direccion"] = data.linea_direccion
                if data.complemento is not None:
                    d["complemento"] = data.complemento
                if data.referencia is not None:
                    d["referencia"] = data.referencia
                if data.codigo_postal is not None:
                    d["codigo_postal"] = data.codigo_postal
                if data.latitud is not None:
                    d["latitud"] = data.latitud
                if data.longitud is not None:
                    d["longitud"] = data.longitud
                if data.activa is not None:
                    d["activa"] = data.activa
                d["actualizado_en"] = datetime.now(UTC)
                return DireccionOut(**d)

        raise EntityNotFoundException(f"Dirección con ID {direccion_id} no encontrada.")

    def eliminar_direccion(self, usuario_id: int, direccion_id: int) -> None:
        for d in mock_db.direcciones:
            if d["direccion_id"] == direccion_id:
                if d["usuario_id"] != usuario_id:
                    raise AuthorizationException(
                        "No tienes permiso para eliminar esta dirección."
                    )
                # Borrado lógico para no romper historial de citas/solicitudes
                d["activa"] = False
                d["actualizado_en"] = datetime.now(UTC)
                return
        raise EntityNotFoundException(f"Dirección con ID {direccion_id} no encontrada.")


usuarios_service = UsuariosService()
