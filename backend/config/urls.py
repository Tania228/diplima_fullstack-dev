from django.urls import include, path, re_path

from apps.storage.views import public_download
from config.views import api_not_found, index

urlpatterns = [
    path('api/auth/', include('apps.users.auth_urls')),
    path('api/users/', include('apps.users.urls')),
    path('api/files/', include('apps.storage.urls')),
    path('api/public/<str:token>/', public_download, name='public-download'),
    re_path(r'^api/', api_not_found),
    re_path(r'^', index, name='index'),
]
