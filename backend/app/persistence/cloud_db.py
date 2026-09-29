"""Adaptador de persistencia sobre PostgreSQL/Cloud SQL.

Expone una interfaz compatible con las colecciones usadas actualmente por
la capa de servicios, pero las lecturas y escrituras se realizan realmente
contra el esquema marketplace en PostgreSQL.
"""

from __future__ import annotations

from typing import Any, Iterable

from psycopg.rows import dict_row

from app.db import get_db_connection


_TABLES: dict[str, tuple[tuple[str, ...], str | None]] = {
    "paises": (("pais_id",), "pais_id"),
    "regiones": (("region_id",), "region_id"),
    "ciudades": (("ciudad_id",), "ciudad_id"),
    "roles": (("rol_id",), "rol_id"),
    "habilidades": (("habilidad_id",), "habilidad_id"),
    "categorias": (("categoria_id",), "categoria_id"),
    "subcategorias": (("subcategoria_id",), "subcategoria_id"),
    "modalidades": (("modalidad_id",), "modalidad_id"),
    "estados_solicitud": (("estado_solicitud_id",), "estado_solicitud_id"),
    "estados_cita": (("estado_cita_id",), "estado_cita_id"),
    "metodos_pago": (("metodo_pago_id",), "metodo_pago_id"),
    "estados_pago": (("estado_pago_id",), "estado_pago_id"),
    "tipos_mensaje": (("tipo_mensaje_id",), "tipo_mensaje_id"),
    "tipos_alerta": (("tipo_alerta_id",), "tipo_alerta_id"),
    "usuarios": (("usuario_id",), "usuario_id"),
    "usuario_roles": (("usuario_id", "rol_id"), None),
    "perfiles_trabajador": (
        ("perfil_trabajador_id",),
        "perfil_trabajador_id",
    ),
    "usuario_habilidades": (
        ("usuario_id", "habilidad_id"),
        None,
    ),
    "servicios": (("servicio_id",), "servicio_id"),
    "servicio_modalidades": (
        ("servicio_id", "modalidad_id"),
        None,
    ),
    "coberturas": (
        ("perfil_trabajador_id", "ciudad_id"),
        None,
    ),
    "direcciones": (("direccion_id",), "direccion_id"),
    "solicitudes_servicio": (
        ("solicitud_servicio_id",),
        "solicitud_servicio_id",
    ),
    "citas": (("cita_id",), "cita_id"),
    "politicas_comision": (
        ("politica_comision_id",),
        "politica_comision_id",
    ),
    "pagos": (("pago_id",), "pago_id"),
    "calificaciones": (("calificacion_id",), "calificacion_id"),
    "preguntas_seguridad": (
        ("pregunta_seguridad_id",),
        "pregunta_seguridad_id",
    ),
    "chequeos_seguridad": (
        ("chequeo_seguridad_id",),
        "chequeo_seguridad_id",
    ),
    "respuestas_chequeo": (
        (
            "chequeo_seguridad_id",
            "pregunta_seguridad_id",
            "usuario_id",
        ),
        None,
    ),
    "alertas_seguridad": (
        ("alerta_seguridad_id",),
        "alerta_seguridad_id",
    ),
    "conversaciones": (("conversacion_id",), "conversacion_id"),
    "participantes_conversacion": (
        ("conversacion_id", "usuario_id"),
        None,
    ),
    "mensajes": (("mensaje_id",), "mensaje_id"),
    "lecturas_mensajes": (
        ("mensaje_id", "usuario_id"),
        None,
    ),
    "archivos_adjuntos": (
        ("archivo_adjunto_id",),
        "archivo_adjunto_id",
    ),
}


def _where_pk(pk_columns: tuple[str, ...]) -> str:
    return " AND ".join(f"{column} = %s" for column in pk_columns)


class PersistentRow(dict[str, Any]):
    """Fila PostgreSQL que persiste cambios realizados con item[key] = value."""

    def __init__(
        self,
        table_name: str,
        pk_columns: tuple[str, ...],
        values: dict[str, Any],
    ) -> None:
        dict.__init__(self, values)
        self._table_name = table_name
        self._pk_columns = pk_columns

    def __setitem__(self, key: str, value: Any) -> None:
        if key not in self:
            raise KeyError(
                f"La columna '{key}' no existe en marketplace.{self._table_name}"
            )

        pk_values = tuple(dict.__getitem__(self, pk) for pk in self._pk_columns)

        query = (
            f"UPDATE marketplace.{self._table_name} "
            f"SET {key} = %s "
            f"WHERE {_where_pk(self._pk_columns)} "
            "RETURNING *"
        )

        with get_db_connection() as connection:
            with connection.cursor(row_factory=dict_row) as cursor:
                cursor.execute(query, (value, *pk_values))
                updated = cursor.fetchone()

        if updated is None:
            raise RuntimeError(
                f"No fue posible actualizar marketplace.{self._table_name}"
            )

        dict.clear(self)
        dict.update(self, updated)

    def update(self, *args: Any, **kwargs: Any) -> None:
        values = dict(*args, **kwargs)
        for key, value in values.items():
            self[key] = value


class PersistentTable(list[PersistentRow]):
    """Colección tipo lista respaldada por una tabla PostgreSQL."""

    def __init__(
        self,
        table_name: str,
        pk_columns: tuple[str, ...],
        identity_column: str | None,
    ) -> None:
        self._table_name = table_name
        self._pk_columns = pk_columns
        self._identity_column = identity_column
        super().__init__()
        self._reload()

    def _reload(self) -> None:
        order_by = ", ".join(self._pk_columns)

        with get_db_connection() as connection:
            with connection.cursor(row_factory=dict_row) as cursor:
                cursor.execute(
                    f"""
                    SELECT *
                    FROM marketplace.{self._table_name}
                    ORDER BY {order_by}
                    """
                )
                rows = cursor.fetchall()

        list.clear(self)
        list.extend(
            self,
            [
                PersistentRow(
                    self._table_name,
                    self._pk_columns,
                    dict(row),
                )
                for row in rows
            ],
        )

    def _insert_row(
        self,
        cursor: Any,
        item: dict[str, Any],
    ) -> dict[str, Any]:
        columns = list(item.keys())

        if not columns:
            raise ValueError("No es posible insertar una fila vacía.")

        column_sql = ", ".join(columns)
        placeholders = ", ".join(["%s"] * len(columns))

        override = ""
        if (
            self._identity_column is not None
            and self._identity_column in item
        ):
            override = " OVERRIDING SYSTEM VALUE"

        query = (
            f"INSERT INTO marketplace.{self._table_name} "
            f"({column_sql}){override} "
            f"VALUES ({placeholders}) "
            "RETURNING *"
        )

        cursor.execute(query, tuple(item[column] for column in columns))
        row = cursor.fetchone()

        if row is None:
            raise RuntimeError(
                f"No fue posible insertar en marketplace.{self._table_name}"
            )

        return dict(row)

    def append(self, item: dict[str, Any]) -> None:
        with get_db_connection() as connection:
            with connection.cursor(row_factory=dict_row) as cursor:
                inserted = self._insert_row(cursor, dict(item))

        list.append(
            self,
            PersistentRow(
                self._table_name,
                self._pk_columns,
                inserted,
            ),
        )

    def extend(self, values: Iterable[dict[str, Any]]) -> None:
        for value in values:
            self.append(value)

    def remove(self, value: dict[str, Any]) -> None:
        pk_values = tuple(value[pk] for pk in self._pk_columns)

        with get_db_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    f"""
                    DELETE FROM marketplace.{self._table_name}
                    WHERE {_where_pk(self._pk_columns)}
                    """,
                    pk_values,
                )

        list.remove(self, value)

    def replace_all(self, values: Iterable[dict[str, Any]]) -> None:
        desired_rows = [dict(value) for value in values]

        with get_db_connection() as connection:
            with connection.cursor(row_factory=dict_row) as cursor:
                cursor.execute(
                    f"SELECT * FROM marketplace.{self._table_name}"
                )
                current_rows = [dict(row) for row in cursor.fetchall()]

                def key_for(row: dict[str, Any]) -> tuple[Any, ...]:
                    return tuple(row[column] for column in self._pk_columns)

                current_map = {
                    key_for(row): row
                    for row in current_rows
                }
                desired_map = {
                    key_for(row): row
                    for row in desired_rows
                }

                for key in current_map.keys() - desired_map.keys():
                    cursor.execute(
                        f"""
                        DELETE FROM marketplace.{self._table_name}
                        WHERE {_where_pk(self._pk_columns)}
                        """,
                        key,
                    )

                for key, desired in desired_map.items():
                    current = current_map.get(key)

                    if current is None:
                        self._insert_row(cursor, desired)
                        continue

                    updates = {
                        column: value
                        for column, value in desired.items()
                        if column not in self._pk_columns
                        and current.get(column) != value
                    }

                    if not updates:
                        continue

                    assignments = ", ".join(
                        f"{column} = %s"
                        for column in updates
                    )

                    cursor.execute(
                        f"""
                        UPDATE marketplace.{self._table_name}
                        SET {assignments}
                        WHERE {_where_pk(self._pk_columns)}
                        """,
                        (*updates.values(), *key),
                    )

        self._reload()

    def clear(self) -> None:
        self.replace_all([])


class CloudSQLDatabase:
    """Facade de las 36 tablas del esquema marketplace."""

    def __getattr__(self, name: str) -> PersistentTable:
        metadata = _TABLES.get(name)

        if metadata is None:
            raise AttributeError(name)

        pk_columns, identity_column = metadata

        return PersistentTable(
            table_name=name,
            pk_columns=pk_columns,
            identity_column=identity_column,
        )

    def __setattr__(self, name: str, value: Any) -> None:
        metadata = _TABLES.get(name)

        if metadata is None:
            object.__setattr__(self, name, value)
            return

        pk_columns, identity_column = metadata

        table = PersistentTable(
            table_name=name,
            pk_columns=pk_columns,
            identity_column=identity_column,
        )
        table.replace_all(value)


cloud_db = CloudSQLDatabase()
