import json

from django.http import JsonResponse

from apps.common.exceptions import ServiceError


def json_ok(data, status=200):
    return JsonResponse(data, status=status, safe=False, json_dumps_params={'ensure_ascii': False})


def json_error(message, status, errors=None):
    body = {'detail': message}
    if errors:
        body['errors'] = errors
    return JsonResponse(body, status=status, json_dumps_params={'ensure_ascii': False})


def read_json(request):
    if not request.body:
        return {}
    try:
        payload = json.loads(request.body.decode('utf-8'))
    except (json.JSONDecodeError, UnicodeDecodeError):
        return None
    if not isinstance(payload, dict):
        return None
    return payload


def call_service(action):
    try:
        return action(), None
    except ServiceError as exc:
        return None, json_error(exc.message, exc.status, errors=exc.errors)
