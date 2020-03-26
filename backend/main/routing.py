from django.urls import path

from channels.routing import ProtocolTypeRouter, URLRouter
from channels.sessions import SessionMiddlewareStack

from game.consumers import RoomConsumer


application = ProtocolTypeRouter({
    'websocket': SessionMiddlewareStack(
        URLRouter([
            path('api/', URLRouter([
                path('room/<code>/', RoomConsumer),
            ])),
        ]),
    ),
})
