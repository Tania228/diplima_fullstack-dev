from django.urls import path

from apps.users.views import user_detail_view, user_list_view

urlpatterns = [
    path('', user_list_view, name='user-list'),
    path('<int:user_id>/', user_detail_view, name='user-detail'),
]
