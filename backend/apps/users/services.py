import logging

from django.contrib.auth import authenticate
from django.db import IntegrityError
from django.db.models import BigIntegerField, Count, Sum, Value
from django.db.models.functions import Coalesce

from apps.common.exceptions import ServiceError
from apps.users.models import User
from apps.users.validators import validate_registration


logger = logging.getLogger(__name__)


def register_user(payload):
    errors = validate_registration(payload)
    if errors:
        logger.warning('Регистрация отклонена: %s', ', '.join(errors))
        raise ServiceError('Проверьте введённые данные', 400, errors=errors)

    login = payload['login']
    email = payload['email'].strip().lower()
    if User.objects.filter(login__iexact=login).exists():
        raise ServiceError('Проверьте введённые данные', 400, errors={'login': 'Такой логин уже занят'})
    if User.objects.filter(email__iexact=email).exists():
        raise ServiceError('Проверьте введённые данные', 400, errors={'email': 'Такой email уже зарегистрирован'})

    try:
        user = User.objects.create_user(
            login=login,
            email=email,
            password=payload['password'],
            full_name=payload['full_name'],
        )
    except IntegrityError:
        logger.warning('Конфликт при регистрации логина %s', login)
        raise ServiceError('Пользователь с такими данными уже существует', 400)
    logger.info('Зарегистрирован пользователь %s', user.login)
    return user


def authenticate_user(login, password):
    if not isinstance(login, str) or not login.strip() or not isinstance(password, str) or not password:
        raise ServiceError('Укажите логин и пароль', 400)
    login = login.strip()
    if not User.objects.filter(login=login).exists():
        logger.warning('Вход отклонён, логин не найден: %s', login)
        raise ServiceError('Пользователь с таким логином не найден', 401)
    user = authenticate(username=login, password=password)
    if user is None:
        logger.warning('Вход отклонён, неверный пароль: %s', login)
        raise ServiceError('Неверный пароль', 401)
    logger.info('Пользователь %s вошёл в систему', user.login)
    return user


def list_users():
    return User.objects.annotate(
        files_count=Count('files'),
        files_size=Coalesce(Sum('files__size'), Value(0), output_field=BigIntegerField()),
    ).order_by('login')


def set_admin_flag(actor, user_id, is_admin):
    target = _get_user(user_id)
    if not isinstance(is_admin, bool):
        raise ServiceError('Поле is_admin должно быть логическим значением', 400)
    if actor.id == target.id and not is_admin:
        raise ServiceError('Нельзя снять права администратора с самого себя', 400)
    if target.is_admin and not is_admin and _admin_count() <= 1:
        raise ServiceError('Нельзя снять права с последнего администратора', 400)
    target.is_admin = is_admin
    target.save(update_fields=['is_admin'])
    logger.info('Пользователь %s изменил признак администратора у %s на %s', actor.login, target.login, is_admin)
    return target


def delete_user(actor, user_id):
    target = _get_user(user_id)
    if actor.id == target.id:
        raise ServiceError('Нельзя удалить свою учётную запись', 400)
    if target.is_admin and _admin_count() <= 1:
        raise ServiceError('Нельзя удалить последнего администратора', 400)
    from apps.storage.services import remove_user_storage

    remove_user_storage(target)
    login = target.login
    target.delete()
    logger.info('Пользователь %s удалил учётную запись %s', actor.login, login)


def _get_user(user_id):
    try:
        return User.objects.get(pk=user_id)
    except User.DoesNotExist:
        raise ServiceError('Пользователь не найден', 404)


def _admin_count():
    return User.objects.filter(is_admin=True).count()
