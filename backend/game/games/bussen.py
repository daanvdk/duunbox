from utils.cards import get_deck, compare, SUITS


def initial_state(players):
    deck = []
    min_cards = 4 * len(players) + (5 + 4 + 3 + 2 + 1)
    while len(deck) < min_cards:
        deck.extend(get_deck())

    return {
        'deck': deck,
        'hands': {player: [] for player in players},
    }


def update_state(state, player, move, notify):
    if 'bus' in state:
        pass  # Bus logica

    elif 'pyramid' in state:
        pass  # Pyramide logica

    else:
        _, turn = sorted(
            (len(hand), name)
            for name, hand in state['hands'].items()
        )[0]

        if player != turn:
            raise ValueError('Je bent niet aan de beurt.')

        hand = state['hands'][player]

        # Rood of zwart
        if len(hand) == 0:
            if move == 'rood':
                def predicate(card):
                    return card[0] in {'diamonds', 'hearts'}
            elif move == 'zwart':
                def predicate(card):
                    return card[0] in {'spades', 'clubs'}
            else:
                raise ValueError('Ongeldige zet.')
        # Hoger of lager
        elif len(hand) == 1:
            if move == 'hoger':
                def predicate(card):
                    return compare(card, hand[0], suit=False) > 0
            elif move == 'paal':
                def predicate(card):
                    return compare(card, hand[0], suit=False) == 0
            elif move == 'lager':
                def predicate(card):
                    return compare(card, hand[0], suit=False) < 0
            else:
                raise ValueError('Ongeldige zet.')
        # Binnen of buiten
        elif len(hand) == 2:
            if compare(hand[0], hand[1]) > 0:
                highest = hand[0]
                lowest = hand[1]
            else:
                lowest, highest = hand

            if move == 'binnen':
                def predicate(card):
                    return (
                        compare(card, lowest, suit=False) > 0 and
                        compare(card, highest, suit=False) < 0
                    )
            elif move == 'paal':
                def predicate(card):
                    return (
                        compare(card, lowest, suit=False) == 0 or
                        compare(card, highest, suit=False) == 0
                    )
            elif move == 'buiten':
                def predicate(card):
                    return (
                        compare(card, lowest, suit=False) < 0 or
                        compare(card, highest, suit=False) > 0
                    )
            else:
                raise ValueError('Ongeldige zet.')
        # Soort
        elif len(hand) == 3:
            if move in SUITS:
                def predicate(card):
                    return card[0] == move
            else:
                raise ValueError('Ongeldige zet.')
        # Volle hand
        else:
            raise ValueError('Volle hand.')

        deck = state['deck'].copy()
        card = deck.pop()

        if not predicate(card):
            notify(f'Drinken {player}!', player)

        return {
            'deck': deck,
            'hands': {**state['hands'], player: [*hand, card]},
        }


def filter_state(state, player):
    return {
        'hands': state['hands'],
    }
