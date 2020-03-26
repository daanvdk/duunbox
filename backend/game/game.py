import importlib

from django.conf import settings

from is_valid import is_dict_where, is_in


LOADED_GAMES = {}


def field_to_pred(field):
    if field['type'] == 'choice':
        return is_in(field['choices'])
    else:
        return ValueError(f'unknown field type {field["type"]!r}')


class Game:

    def __new__(cls, name):
        assert name in settings.INSTALLED_APPS, (
            f'game {name!r} is not installed'
        )

        if 'name' in LOADED_GAMES:
            return LOADED_GAMES[name]

        game = object.__new__(cls)
        game.__game_module = importlib.import_module(name)
        return game

    def __init__(self, name):
        self.has_forms = hasattr(self.__game_module, 'get_form')

    def initial_state(self, players):
        return self.__game_module.initial_state(players)

    def get_form(self, state, player):
        assert self.has_forms, 'game does not have forms'
        return self.__game_module.get_form(state, player)

    def update_state(self, state, player, data, notify):
        if self.has_forms and data['type'] == 'form':
            form = self.get_form(state, player)
            if form is None:
                raise ValueError('Player does not have a form.')

            action, fields = form
            is_data = is_dict_where({
                'type': 'form',
                'fields': [field_to_pred(field) for field in fields],
            })

            valid = is_data.explain(data)
            if not valid:
                print(valid.summary())
                raise ValueError('Invalid request body.')

            return action(notify, *valid.data['fields'])

        if hasattr(self.__game_module, 'update_state'):
            return self.__game_module.update_state(state, player, data, notify)

        raise ValueError('Invalid request body.')

    def show_game(self, state, player):
        if hasattr(self.__game_module, 'show_state'):
            state = self.__game_module.show_state(state, player)

        if self.has_forms:
            form = self.get_form(state, player)
            if form:
                _, fields = form
                state = {'state': state, 'form': fields}
            else:
                state = {'state': state}

        return state
