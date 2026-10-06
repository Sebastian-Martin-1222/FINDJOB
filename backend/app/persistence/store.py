"""Selector de persistencia para FindJob."""

import os

_use_cloud_sql = os.getenv(
    "USE_CLOUD_SQL",
    "false",
).strip().lower() in {"1", "true", "yes", "on"}

if _use_cloud_sql:
    from app.persistence.cloud_db import cloud_db as data_store
else:
    from app.mocks.mock_db import mock_db as data_store
