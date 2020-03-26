import secrets
import math

from django.http import JsonResponse
from django.db import IntegrityError, transaction

import channels.layers
from asgiref.sync import async_to_sync

from is_valid import (
    is_str, is_in, is_subdict_where, is_bool, is_pre, is_not_blank,
    is_superdict_where, is_dict_where,
)

from utils.views import allow_methods, validate_body
from .models import Game, Player
from .games import GAMES


# Helpers

def with_player(view):
    def decorated_view(request, *args, code, **kwargs):
        code = code.upper()
        try:
            pk = request.session[f'game_{code}']
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

        if hasattr(GAMES[player.game.game], 'get_form'):
            form = GAMES[player.game.game].get_form(state, player.name)
            if form is not None:
                action, fields = form
                data['form'] = fields

    return data


def group_send(group, event):
    channel_layer = channels.layers.get_channel_layer()
    return async_to_sync(channel_layer.group_send)(group, event)


def send_game_update(game):
    for player in game.players.all():
        group_send(f'player_{player.pk}', {
            'type': 'game.update',
            'game': serialize_game(player),
        })


def send_game_message(game, *messages, interval=1000, namespace=None):
    group_send(f'game_{game.code}', {
        'type': 'game.messages',
        'interval': interval,
        'namespace': namespace,
        'messages': messages,
    })


@allow_methods('POST')
@validate_body({
    'name': is_pre(is_str, is_not_blank),
})
@transaction.atomic
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
@transaction.atomic
def game_read_view(request, player):
    return JsonResponse(serialize_game(player))


@allow_methods('PUT')
@with_player
@validate_body(is_subdict_where({
    'game': is_in(set(GAMES)),
    'started': is_bool,
}))
@transaction.atomic
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
        player.game.state = GAMES[player.game.game].initial_state(
            [player.name for player in player.game.players.all()]
        )

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
@transaction.atomic
def game_join_view(request, data, code):
    code = code.upper()
    try:
        game = Game.objects.get(code=code, started=False)
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
            send_game_message(player.game, {
                'key': 'game.message.playerJoined',
                'params': {'name': player.name},
            })
        else:
            player = Player.objects.get(pk=player_pk)
            old_name = player.name
            player.name = data['name']
            player.save()
            send_game_message(player.game, {
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

    send_game_update(player.game)

    return JsonResponse(serialize_game(player))


@allow_methods('POST')
@with_player
@validate_body(is_superdict_where({
    'type': is_str,
}))
@transaction.atomic
def game_move_view(request, data, player):
    if not player.game.started:
        return JsonResponse(
            code=403,
            data={
                'code': 'Forbidden',
                'message': 'The game has not yet started.',
            },
        )

    def notify(*messages, **options):
        options['namespace'] = f'game.{player.game.game}'
        send_game_message(player.game, *messages, **options)

    game = GAMES[player.game.game]

    if data['type'] == 'form' and hasattr(game, 'get_form'):
        form = game.get_form(player.game.state, player.name)

        if form is None:
            return JsonResponse(
                status=400,
                data={
                    'code': 'BadRequest',
                    'message': 'no_form',
                },
            )

        action, fields = form
        field_preds = []
        for field in fields:
            if field['type'] == 'choice':
                field_preds.append(is_in(field['choices']))

        data_pred = is_dict_where(type='form', fields=field_preds)
        valid = data_pred.explain(data)
        if not valid:
            return JsonResponse(
                status=400,
                data={
                    'code': 'BadRequest',
                    'message': 'Request body is not valid.',
                    'details': valid.dict(),
                },
            )

        player.game.state = action(notify, *data['fields'])

    else:
        try:
            player.game.state = game.update_state(
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
