from pathlib import Path

from django.apps import AppConfig


class StorageConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.storage'

    def ready(self):
        from django.conf import settings

        Path(settings.STORAGE_ROOT).mkdir(parents=True, exist_ok=True)
        Path(settings.STATIC_ROOT).mkdir(parents=True, exist_ok=True)
