import secrets
import math

from django.http import JsonResponse
from django.db import IntegrityError

import channels.layers
from asgiref.sync import async_to_sync

from is_valid import (
    is_str, is_something, is_in, is_subdict_where, is_bool, is_pre,
    is_not_blank,
)

from utils.views import allow_methods, validate_body
from .models import Game, Player
from .games import GAMES


# Helpers

def with_player(view):
    def decorated_view(request, *args, code, **kwargs):
        try:
            pk = request.session[f'game_{code.upper()}']
        except KeyError:
            if Game.objects.filter(code=code).exists():
                return JsonResponse(
                    status=403,
                    data={
                        'code': 'Forbidden',
                        'message': 'You are not player in this game.',
                    },
                )
            else:
                return JsonResponse(
                    status=404,
                    data={
                        'code': 'NotFound',
                        'message': 'Game could not be found.',
                    },
                )
        player = Player.objects.get(pk=pk)
        return view(request, player, *args, **kwargs)
    return decorated_view


# Game views

CODE_CHARS = 'BCDFGHJKLMNPQRSTVWXZ'


def serialize_game(player):
    data = {
        'code': player.game.code,
        'game': player.game.game,
        'started': player.game.started,
        'players': [
            {
                'name': p.name,
                'admin': p.admin,
                'self': p == player,
            }
            for p in player.game.players.order_by('pk')
        ],
    }

    if player.game.started:
        state = player.game.state
        if hasattr(GAMES[player.game.game], 'filter_state'):
            state = GAMES[player.game.game].filter_state(state, player.name)
        data['state'] = state

    return data


def send_group(group, event):
    channel_layer = channels.layers.get_channel_layer()
    return async_to_sync(channel_layer.group_send)(group, event)


def send_game_update(game):
    for player in game.players.all():
        send_group(f'player_{player.pk}', {
            'type': 'game_update',
            'game': serialize_game(player),
        })


def send_game_message(game, message, player=None):
    send_group(f'game_{game.code}', {
        'type': 'game_message',
        'message': message,
        'player': player,
    })


@allow_methods('POST')
@validate_body({
    'name': is_pre(is_str, is_not_blank),
})
def game_create_view(request, data):
    games = Game.objects.count()
    chars = max(math.ceil(math.log(games + 1, len(CODE_CHARS))) + 1, 4)

    for _ in range(1000):
        code = ''.join(secrets.choice(CODE_CHARS) for _ in range(chars))
        if not Game.objects.filter(code=code).exists():
            break
    else:
        raise ValueError('could not find a free code')

    game = Game.objects.create(code=code, started=False)
    player = Player.objects.create(game=game, name=data['name'], admin=True)
    request.session[f'game_{code}'] = player.id

    send_game_update(game)

    return JsonResponse(serialize_game(player))


@allow_methods('GET')
@with_player
def game_read_view(request, player):
    return JsonResponse(serialize_game(player))


@allow_methods('PUT')
@with_player
@validate_body(is_subdict_where({
    'game': is_in(set(GAMES)),
    'started': is_bool,
}))
def game_update_view(request, data, player):
    if not player.admin:
        return JsonResponse(
            code=403,
            data={
                'code': 'Forbidden',
                'message': 'Only the admin can make changes.',
            },
        )

    if player.game.started:
        return JsonResponse(
            code=403,
            data={
                'code': 'Forbidden',
                'message': 'The game has already started.',
            },
        )

    if 'game' in data:
        player.game.game = data['game']
    if 'started' in data:
        player.game.started = data['started']

    if player.game.started and player.game.game is None:
        return JsonResponse(
            code=400,
            data={
                'code': 'BadRequest',
                'message': 'Cannot start the game before a game is selected.',
            },
        )

    player.game.save()

    send_game_update(player.game)

    return JsonResponse(serialize_game(player))


# REST endpoints

@allow_methods('POST')
def game_list_view(request, *args, **kwargs):
    return game_create_view(request, *args, **kwargs)


@allow_methods('GET', 'PUT')
def game_detail_view(request, *args, **kwargs):
    if request.method == 'GET':
        return game_read_view(request, *args, **kwargs)
    elif request.method == 'PUT':
        return game_update_view(request, *args, **kwargs)


# Detail endpoints

@allow_methods('POST')
@validate_body({
    'name': is_pre(is_str, is_not_blank),
})
def game_join_view(request, data, code):
    try:
        game = Game.objects.get(code=code.upper(), started=False)
    except Game.DoesNotExist:
        return JsonResponse(
            status=404,
            data={
                'code': 'NotFound',
                'message': 'Game could not be found.',
            },
        )

    try:
        try:
            player_pk = request.session[f'game_{code}']
        except KeyError:
            player = Player.objects.create(game=game, name=data['name'])
            request.session[f'game_{code}'] = player.pk
        else:
            player = Player.objects.get(pk=player_pk)
            player.name = data['name']
            player.save()
    except IntegrityError:
        return JsonResponse(
            status=400,
            data={
                'code': 'BadRequest',
                'message': 'Name is already in use.',
            },
        )

    return JsonResponse(serialize_game(player))


@allow_methods('POST')
@with_player
@validate_body(is_something)
def game_move_view(request, data, player):
    if not player.game.started:
        return JsonResponse(
            code=403,
            data={
                'code': 'Forbidden',
                'message': 'The game has not yet started.',
            },
        )

    def notify(*args, **kwargs):
        send_game_message(player.game, *args, **kwargs)

    try:
        player.game.state = GAMES[player.game.game].update_state(
            player.game.state, player.name, data, notify,
        )
    except ValueError as e:
        return JsonResponse(
            code=400,
            data={
                'code': 'BadRequest',
                'message': str(e),
            },
        )
    player.game.save()

    send_game_update(player.game)

    return JsonResponse(serialize_game(player))