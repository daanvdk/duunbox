from django.urls import path

from channels.routing import ProtocolTypeRouter, URLRouter
from channels.sessions import SessionMiddlewareStack

from game.consumers import GameConsumer


application = ProtocolTypeRouter({
    'websocket': SessionMiddlewareStack(
        URLRouter([
            path('api/', URLRouter([
                path('game/<code>/', GameConsumer),
            ])),
        ]),
    ),
})
