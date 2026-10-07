from django.urls import path

from apps.storage.views import (
    file_comment_view,
    file_delete_view,
    file_download_view,
    file_link_view,
    file_list_view,
    file_rename_view,
    file_upload_view,
)

urlpatterns = [
    path('', file_list_view, name='file-list'),
    path('upload/', file_upload_view, name='file-upload'),
    path('<int:file_id>/rename/', file_rename_view, name='file-rename'),
    path('<int:file_id>/comment/', file_comment_view, name='file-comment'),
    path('<int:file_id>/', file_delete_view, name='file-delete'),
    path('<int:file_id>/download/', file_download_view, name='file-download'),
    path('<int:file_id>/link/', file_link_view, name='file-link'),
]
