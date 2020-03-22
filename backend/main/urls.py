from django.urls import include, path, re_path

from .views import not_found_view
from game.views import (
    game_list_view, game_detail_view, game_join_view, game_move_view,
)


urlpatterns = [
    path('game/', game_list_view, name='game-list'),
    path('game/<code>/', game_detail_view, name='game-detail'),
    path('game/<code>/join/', game_join_view, name='game-join'),
    path('game/<code>/move/', game_move_view, name='game-move'),
    re_path(r'^.*$', not_found_view, name='not-found'),
]

# Wrap with api/ prefix
urlpatterns = [path('api/', include(urlpatterns))]
