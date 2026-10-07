import logging
import secrets
import shutil
import uuid
from pathlib import Path

from django.conf import settings
from django.utils import timezone

from apps.common.exceptions import ServiceError
from apps.storage.models import StoredFile
from apps.storage.validators import clean_comment, clean_original_name
from apps.users.models import User


logger = logging.getLogger(__name__)


def list_files(actor, user_id):
    owner = resolve_owner(actor, user_id)
    files = list(StoredFile.objects.filter(owner=owner))
    logger.debug('Пользователь %s запросил файлы хранилища %s', actor.login, owner.login)
    return owner, files


def save_upload(actor, uploaded_file, comment, user_id):
    owner = resolve_owner(actor, user_id)
    if uploaded_file is None:
        raise ServiceError('Выберите файл для загрузки', 400)
    original_name = clean_original_name(uploaded_file.name)
    if original_name is None:
        raise ServiceError('Некорректное имя файла', 400)
    prepared_comment = clean_comment(comment)
    if prepared_comment is None:
        raise ServiceError('Комментарий должен быть текстом не длиннее 1000 символов', 400)
    if uploaded_file.size > settings.MAX_UPLOAD_SIZE:
        raise ServiceError('Файл превышает допустимый размер', 400)

    token = secrets.token_urlsafe(32)
    relative_path = f'{owner.storage_path}/{uuid.uuid4().hex}'
    full_path = Path(settings.STORAGE_ROOT) / relative_path
    full_path.parent.mkdir(parents=True, exist_ok=True)
    try:
        with full_path.open('wb') as destination:
            for chunk in uploaded_file.chunks():
                destination.write(chunk)
        stored = StoredFile.objects.create(
            owner=owner,
            original_name=original_name,
            size=full_path.stat().st_size,
            comment=prepared_comment,
            storage_path=relative_path,
            public_link=f'/api/public/{token}/',
        )
    except OSError as exc:
        logger.error('Не удалось записать файл на диск: %s', exc)
        full_path.unlink(missing_ok=True)
        raise ServiceError('Не удалось сохранить файл', 500)
    except Exception:
        full_path.unlink(missing_ok=True)
        logger.error('Не удалось сохранить сведения о файле %s', original_name)
        raise
    logger.info('Пользователь %s загрузил файл %s в хранилище %s', actor.login, original_name, owner.login)
    return stored


def rename_file(actor, file_id, name):
    stored = get_accessible_file(actor, file_id)
    cleaned = clean_original_name(name)
    if cleaned is None:
        raise ServiceError('Укажите корректное имя файла без символов пути', 400)
    stored.original_name = cleaned
    stored.save(update_fields=['original_name'])
    logger.info('Пользователь %s переименовал файл %s в %s', actor.login, stored.id, cleaned)
    return stored


def update_comment(actor, file_id, comment):
    stored = get_accessible_file(actor, file_id)
    prepared = clean_comment(comment)
    if prepared is None:
        raise ServiceError('Комментарий должен быть текстом не длиннее 1000 символов', 400)
    stored.comment = prepared
    stored.save(update_fields=['comment'])
    logger.info('Пользователь %s изменил комментарий к файлу %s', actor.login, stored.id)
    return stored


def delete_file(actor, file_id):
    stored = get_accessible_file(actor, file_id)
    path = absolute_path(stored)
    stored_id = stored.id
    original_name = stored.original_name
    stored.delete()
    if path.is_file():
        path.unlink()
    elif path.exists():
        logger.warning('Путь файла не является файлом: %s', path)
    else:
        logger.warning('Файл уже отсутствует на диске: %s', path)
    logger.info('Пользователь %s удалил файл %s (%s)', actor.login, stored_id, original_name)


def mark_downloaded(stored):
    stored.last_downloaded_at = timezone.now()
    stored.save(update_fields=['last_downloaded_at'])
    logger.info('Скачан файл %s (%s)', stored.id, stored.original_name)
    return stored


def get_accessible_file(actor, file_id):
    stored = _get_file(file_id)
    if stored.owner_id != actor.id and not actor.is_admin:
        logger.warning('Пользователь %s запросил чужой файл %s', actor.login, file_id)
        raise ServiceError('Недостаточно прав для доступа к файлу', 403)
    return stored


def get_public_file(token):
    link = f'/api/public/{token}/'
    try:
        return StoredFile.objects.get(public_link=link)
    except StoredFile.DoesNotExist:
        logger.warning('Публичная ссылка не найдена')
        raise ServiceError('Файл не найден', 404)


def absolute_path(stored):
    root = Path(settings.STORAGE_ROOT).resolve()
    path = (root / stored.storage_path).resolve()
    if root != path and root not in path.parents:
        logger.error('Попытка выйти за пределы хранилища: %s', stored.storage_path)
        raise ServiceError('Некорректный путь к файлу', 400)
    return path


def resolve_owner(actor, user_id):
    if user_id in (None, ''):
        return actor
    try:
        owner_id = int(user_id)
    except (TypeError, ValueError):
        raise ServiceError('Параметр user_id должен быть числом', 400)
    try:
        owner = User.objects.get(pk=owner_id)
    except User.DoesNotExist:
        raise ServiceError('Пользователь не найден', 404)
    if owner.id != actor.id and not actor.is_admin:
        logger.warning('Пользователь %s запросил чужое хранилище %s', actor.login, owner.login)
        raise ServiceError('Недостаточно прав для доступа к этому хранилищу', 403)
    return owner


def remove_user_storage(user):
    directory = Path(settings.STORAGE_ROOT) / user.storage_path
    if directory.exists():
        shutil.rmtree(directory, ignore_errors=True)
        logger.info('Удалена папка хранилища %s', user.storage_path)


def _get_file(file_id):
    try:
        return StoredFile.objects.get(pk=file_id)
    except StoredFile.DoesNotExist:
        raise ServiceError('Файл не найден', 404)
