SUITS = ['spades', 'diamonds', 'clubs', 'hearts']
RANKS = [
    'ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen',
    'king',
]


def get_deck(*, jokers=False):
    deck = list(zip(SUITS, RANKS))
    if jokers:
        deck.extend([('joker', 'red'), ('joker', 'black')])
    deck.shuffle()
    return deck


def compare(lhs, rhs, *, suit=True):
    lsuit, lrank = lhs
    rsuit, rrank = rhs

    lsuit = SUITS.index(lsuit)
    lrank = RANKS.index(lrank)
    rsuit = SUITS.index(rsuit)
    rrank = RANKS.index(rrank)

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
