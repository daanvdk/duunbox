from django.urls import include, path, re_path

from .views import not_found_view
from game.views import (
    room_list_view, room_detail_view, room_join_view, room_action_view,
)


urlpatterns = [
    path('room/', room_list_view, name='room-list'),
    path('room/<code>/', room_detail_view, name='room-detail'),
    path('room/<code>/join/', room_join_view, name='room-join'),
    path('room/<code>/action/', room_action_view, name='room-action'),
    re_path(r'^.*$', not_found_view, name='not-found'),
]

# Wrap with api/ prefix
urlpatterns = [path('api/', include(urlpatterns))]
