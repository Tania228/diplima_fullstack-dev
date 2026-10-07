from django.shortcuts import render
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_GET

from apps.common.http import json_error


@ensure_csrf_cookie
@require_GET
def index(request):
    return render(request, 'index.html')


@require_GET
def api_not_found(request):
    return json_error('Ресурс не найден', 404)
