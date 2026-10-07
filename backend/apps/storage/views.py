import logging
import mimetypes

from django.http import FileResponse
from django.views.decorators.http import require_GET, require_http_methods, require_POST

from apps.common.decorators import auth_required
from apps.common.http import call_service, json_error, json_ok, read_json
from apps.storage.presentation import serialize_file, serialize_storage
from apps.storage.services import (
    absolute_path,
    delete_file,
    get_accessible_file,
    get_public_file,
    list_files,
    mark_downloaded,
    rename_file,
    save_upload,
    update_comment,
)


logger = logging.getLogger(__name__)


@require_GET
@auth_required
def file_list_view(request):
    result, error = call_service(lambda: list_files(request.user, request.GET.get('user_id')))
    if error:
        return error
    owner, files = result
    return json_ok(serialize_storage(owner, files, request))


@require_POST
@auth_required
def file_upload_view(request):
    stored, error = call_service(
        lambda: save_upload(
            request.user,
            request.FILES.get('file'),
            request.POST.get('comment', ''),
            request.POST.get('user_id'),
        )
    )
    if error:
        return error
    return json_ok(serialize_file(stored, request), status=201)


@require_http_methods(['PATCH'])
@auth_required
def file_rename_view(request, file_id):
    payload = read_json(request)
    if payload is None:
        return json_error('Ожидается JSON-объект', 400)
    stored, error = call_service(lambda: rename_file(request.user, file_id, payload.get('name')))
    if error:
        return error
    return json_ok(serialize_file(stored, request))


@require_http_methods(['PATCH'])
@auth_required
def file_comment_view(request, file_id):
    payload = read_json(request)
    if payload is None or 'comment' not in payload:
        return json_error('Передайте поле comment', 400)
    stored, error = call_service(lambda: update_comment(request.user, file_id, payload.get('comment')))
    if error:
        return error
    return json_ok(serialize_file(stored, request))


@require_http_methods(['DELETE'])
@auth_required
def file_delete_view(request, file_id):
    _, error = call_service(lambda: delete_file(request.user, file_id))
    if error:
        return error
    return json_ok({'detail': 'Файл удалён'})


@require_GET
@auth_required
def file_download_view(request, file_id):
    stored, error = call_service(lambda: get_accessible_file(request.user, file_id))
    if error:
        return error
    inline = request.GET.get('inline') == '1'
    return _file_response(stored, inline)


@require_GET
@auth_required
def file_link_view(request, file_id):
    stored, error = call_service(lambda: get_accessible_file(request.user, file_id))
    if error:
        return error
    logger.debug('Пользователь %s запросил ссылку на файл %s', request.user.login, file_id)
    return json_ok({'url': request.build_absolute_uri(stored.public_link)})


@require_GET
def public_download(request, token):
    stored, error = call_service(lambda: get_public_file(token))
    if error:
        return error
    return _file_response(stored, inline=True)


def _file_response(stored, inline):
    path = absolute_path(stored)
    if not path.is_file():
        logger.error('Файл %s отсутствует на диске: %s', stored.id, path)
        return json_error('Файл не найден на диске', 404)
    mark_downloaded(stored)
    content_type = mimetypes.guess_type(stored.original_name)[0] or 'application/octet-stream'
    return FileResponse(
        path.open('rb'),
        as_attachment=not inline,
        filename=stored.original_name,
        content_type=content_type,
    )
