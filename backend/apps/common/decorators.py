import logging
from functools import wraps

from apps.common.http import json_error


logger = logging.getLogger(__name__)


def auth_required(view):
    @wraps(view)
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated:
            logger.warning('Отказ в доступе без аутентификации: %s %s', request.method, request.path)
            return json_error('Требуется аутентификация', 401)
        return view(request, *args, **kwargs)

    return wrapper


def admin_required(view):
    @wraps(view)
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated:
            logger.warning('Отказ в доступе без аутентификации: %s %s', request.method, request.path)
            return json_error('Требуется аутентификация', 401)
        if not request.user.is_admin:
            logger.warning(
                'Отказ в доступе пользователю %s: %s %s',
                request.user.login,
                request.method,
                request.path,
            )
            return json_error('Недостаточно прав', 403)
        return view(request, *args, **kwargs)

    return wrapper
