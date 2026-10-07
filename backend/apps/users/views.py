import logging

from django.contrib.auth import login, logout
from django.views.decorators.http import require_GET, require_http_methods, require_POST

from apps.common.decorators import admin_required, auth_required
from apps.common.http import call_service, json_error, json_ok, read_json
from apps.users.presentation import serialize_user
from apps.users.services import authenticate_user, delete_user, list_users, register_user, set_admin_flag


logger = logging.getLogger(__name__)


@require_POST
def register_view(request):
    payload = read_json(request)
    if payload is None:
        return json_error('Ожидается JSON-объект', 400)
    user, error = call_service(lambda: register_user(payload))
    if error:
        return error
    return json_ok(serialize_user(user), status=201)


@require_POST
def login_view(request):
    payload = read_json(request)
    if payload is None:
        return json_error('Ожидается JSON-объект', 400)
    user, error = call_service(lambda: authenticate_user(payload.get('login'), payload.get('password')))
    if error:
        return error
    login(request, user)
    return json_ok(serialize_user(user))


@require_POST
@auth_required
def logout_view(request):
    login_name = request.user.login
    logout(request)
    logger.info('Пользователь %s вышел из системы', login_name)
    return json_ok({'detail': 'Вы вышли из системы'})


@require_GET
@auth_required
def me_view(request):
    logger.debug('Запрошен профиль пользователя %s', request.user.login)
    return json_ok(serialize_user(request.user))


@require_GET
@admin_required
def user_list_view(request):
    users = list_users()
    logger.debug('Администратор %s запросил список пользователей', request.user.login)
    return json_ok([serialize_user(user, include_storage=True) for user in users])


@require_http_methods(['PATCH', 'DELETE'])
@admin_required
def user_detail_view(request, user_id):
    if request.method == 'DELETE':
        _, error = call_service(lambda: delete_user(request.user, user_id))
        if error:
            return error
        return json_ok({'detail': 'Пользователь удалён'})

    payload = read_json(request)
    if payload is None or 'is_admin' not in payload:
        return json_error('Передайте поле is_admin', 400)
    user, error = call_service(lambda: set_admin_flag(request.user, user_id, payload.get('is_admin')))
    if error:
        return error
    updated = list_users().get(pk=user.id)
    return json_ok(serialize_user(updated, include_storage=True))
