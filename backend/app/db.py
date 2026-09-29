"""Conexión PostgreSQL para Cloud SQL."""

import os

import psycopg


def get_db_connection():
    """Crear una conexión a PostgreSQL usando el socket de Cloud SQL."""
    instance_connection_name = os.environ["INSTANCE_CONNECTION_NAME"]
    db_name = os.environ["DB_NAME"]
    db_user = os.environ["DB_USER"]
    db_password = os.environ["DB_PASSWORD"]

    return psycopg.connect(
        dbname=db_name,
        user=db_user,
        password=db_password,
        host=f"/cloudsql/{instance_connection_name}",
        connect_timeout=10,
    )
