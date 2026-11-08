"""Selector de persistencia para FindJob."""

from app.core.config import settings

if settings.USE_CLOUD_SQL:
    from app.persistence.cloud_db import cloud_db as data_store
else:
    from app.mocks.mock_db import mock_db as data_store
