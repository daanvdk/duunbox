import random


SUITS = ['spades', 'diamonds', 'clubs', 'hearts']
RANKS = [
    '2', '3', '4', '5', '6', '7', '8', '9', '10',
    'jack', 'queen', 'king', 'ace',
]


def get_deck(*, jokers=False):
    deck = [{'suit': suit, 'rank': rank} for suit in SUITS for rank in RANKS]
    if jokers:
        deck.extend([
            {'suit': 'joker', 'rank': 'red'},
            {'suit': 'joker', 'rank': 'black'},
        ])
    random.shuffle(deck)
    return deck


def compare(lhs, rhs, *, suit=True):
    lsuit = SUITS.index(lhs['suit'])
    lrank = RANKS.index(lhs['rank'])
    rsuit = SUITS.index(rhs['suit'])
    rrank = RANKS.index(rhs['rank'])

    if lrank < rrank:
        return -1
    elif lrank > rrank:
        return 1
    elif suit and lsuit > rsuit:
        return -1
    elif suit and lsuit < rsuit:
        return 1
    else:
        return 0
