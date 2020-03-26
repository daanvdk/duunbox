from utils.cards import get_deck

from .common import get_turn


def initial_state(players):
    deck = []
    min_cards = 4 * len(players) + (5 + 4 + 3 + 2 + 1)
    while len(deck) < min_cards:
        deck.extend(get_deck())

    state = {
        'stage': 'cards',
        'deck': deck,
        'hands': {player: [] for player in players},
    }
    state['turn'] = get_turn(state)

    return state
