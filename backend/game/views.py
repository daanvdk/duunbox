import secrets
import math

from django.http import JsonResponse
from django.conf import settings
from django.db import IntegrityError, transaction

import channels.layers
from asgiref.sync import async_to_sync

from is_valid import (
    is_pre, is_str, is_not_blank, is_subdict_where, is_in, is_bool,
    is_superdict_where,
)

from utils.views import allow_methods, validate_body
from .models import Room, Player
from .game import Game


# Helpers

def with_player(view):
    def decorated_view(request, *args, code, **kwargs):
        code = code.upper()
        try:
            pk = request.session[f'room_{code}']
        except KeyError:
            if Room.objects.filter(code=code).exists():
                return JsonResponse(
                    status=403,
                    data={
                        'code': 'Forbidden',
                        'message': 'You are not player in this room.',
                    },
                )
            else:
                return JsonResponse(
                    status=404,
                    data={
                        'code': 'NotFound',
                        'message': 'Room could not be found.',
                    },
                )
        player = Player.objects.get(pk=pk)
        return view(request, player, *args, **kwargs)
    return decorated_view


# Game views

CODE_CHARS = 'BCDFGHJKLMNPQRSTVWXZ'


def serialize_room(player):
    data = {
        'code': player.room.code,
        'game': player.room.game,
        'started': player.room.started,
        'players': [
            {
                'name': p.name,
                'admin': p.admin,
                'self': p == player,
            }
            for p in player.room.players.order_by('pk')
        ],
    }

    if player.room.started:
        game = Game(player.room.game)
        data.update(game.show_game(player.room.state, player.name))

    return data


def group_send(group, event):
    channel_layer = channels.layers.get_channel_layer()
    return async_to_sync(channel_layer.group_send)(group, event)


def send_room_update(room):
    for player in room.players.all():
        group_send(f'player_{player.pk}', {
            'type': 'room.event',
            'event':  {
                'type': 'room.update',
                'room': serialize_room(player),
            },
        })


def send_room_message(room, *messages, interval=1000, namespace=None):
    group_send(f'room_{room.code}', {
        'type': 'room.event',
        'event': {
            'type': 'room.messages',
            'interval': interval,
            'namespace': namespace,
            'messages': messages,
        },
    })


@allow_methods('POST')
@validate_body({
    'name': is_pre(is_str, is_not_blank),
})
@transaction.atomic
def room_create_view(request, data):
    rooms = Room.objects.count()
    chars = max(math.ceil(math.log(rooms + 1, len(CODE_CHARS))) + 1, 4)

    for _ in range(1000):
        code = ''.join(secrets.choice(CODE_CHARS) for _ in range(chars))
        if not Room.objects.filter(code=code).exists():
            break
    else:
        raise ValueError('could not find a free code')

    room = Room.objects.create(code=code, started=False)
    player = Player.objects.create(room=room, name=data['name'], admin=True)
    request.session[f'room_{code}'] = player.id

    return JsonResponse(serialize_room(player))


@allow_methods('GET')
@with_player
@transaction.atomic
def room_read_view(request, player):
    return JsonResponse(serialize_room(player))


@allow_methods('PUT')
@with_player
@validate_body(is_subdict_where({
    'game': is_in(settings.INSTALLED_GAMES),
    'started': is_bool,
}))
@transaction.atomic
def room_update_view(request, data, player):
    if not player.admin:
        return JsonResponse(
            code=403,
            data={
                'code': 'Forbidden',
                'message': 'Only the admin can make changes.',
            },
        )

    if player.room.started:
        return JsonResponse(
            code=403,
            data={
                'code': 'Forbidden',
                'message': 'The room has already started.',
            },
        )

    if 'game' in data:
        player.room.game = data['game']

    if 'started' in data:
        player.room.started = data['started']
        player.room.state = Game(player.room.game).initial_state([
            player.name
            for player in player.room.players.all()
        ])

    if player.room.started and player.room.game is None:
        return JsonResponse(
            code=400,
            data={
                'code': 'BadRequest',
                'message': 'Cannot start the game before a game is selected.',
            },
        )

    player.room.save()

    send_room_update(player.room)

    return JsonResponse(serialize_room(player))


# REST endpoints

@allow_methods('POST')
def room_list_view(request, *args, **kwargs):
    return room_create_view(request, *args, **kwargs)


@allow_methods('GET', 'PUT')
def room_detail_view(request, *args, **kwargs):
    if request.method == 'GET':
        return room_read_view(request, *args, **kwargs)
    elif request.method == 'PUT':
        return room_update_view(request, *args, **kwargs)


# Detail endpoints

@allow_methods('POST')
@validate_body({
    'name': is_pre(is_str, is_not_blank),
})
@transaction.atomic
def room_join_view(request, data, code):
    code = code.upper()
    try:
        room = Room.objects.get(code=code, started=False)
    except Game.DoesNotExist:
        return JsonResponse(
            status=404,
            data={
                'code': 'NotFound',
                'message': 'Room could not be found.',
            },
        )

    try:
        try:
            player_pk = request.session[f'room_{code}']
        except KeyError:
            player = Player.objects.create(room=room, name=data['name'])
            request.session[f'room_{code}'] = player.pk
            send_room_message(player.room, {
                'key': 'game.message.playerJoined',
                'params': {'name': player.name},
            })
        else:
            player = Player.objects.get(pk=player_pk)
            old_name = player.name
            player.name = data['name']
            player.save()
            send_room_message(player.room, {
                'key': 'game.message.nameChange',
                'params': {'oldName': old_name, 'newName': player.name},
            })
    except IntegrityError:
        return JsonResponse(
            status=400,
            data={
                'code': 'BadRequest',
                'message': 'Name is already in use.',
            },
        )

    send_room_update(player.room)

    return JsonResponse(serialize_room(player))


@allow_methods('POST')
@with_player
@validate_body(is_superdict_where({
    'type': is_str,
}))
@transaction.atomic
def room_action_view(request, data, player):
    if not player.room.started:
        return JsonResponse(
            code=403,
            data={
                'code': 'Forbidden',
                'message': 'The game has not yet started.',
            },
        )

    def notify(*messages, **options):
        options['namespace'] = f'game.{player.room.game}'
        send_room_message(player.room, *messages, **options)

    game = Game(player.room.game)
    try:
        player.room.state = game.update_state(
            player.room.state, player.name, data, notify,
        )
    except ValueError as e:
        return JsonResponse(
            status=400,
            data={
                'code': 'BadRequest',
                'message': str(e),
            },
        )

    player.room.save()

    send_room_update(player.room)

    return JsonResponse(serialize_room(player))
