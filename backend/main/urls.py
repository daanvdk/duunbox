from django.urls import include, path, re_path

from .views import not_found_view


urlpatterns = [
    re_path(r'^.*$', not_found_view, name='not-found'),
]

# Wrap with api/ prefix
urlpatterns = [path('api/', include(urlpatterns))]
