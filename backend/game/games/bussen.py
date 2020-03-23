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
    return ValueError('invalid_move')


def get_form(state, player):
    # Cards part
    _, turn = sorted(
        (len(hand), name)
        for name, hand in state['hands'].items()
    )[0]

    if player != turn:
        return None

    hand = state['hands'][player]

    def card_action(check):
        def action(notify, answer):
            deck = list(state['deck'])
            card = deck.pop()

            if not check(card, answer):
                notify(
                    'bussen.drink',
                    {'player': player, 'count': 1},
                    player=player,
                )

            return {
                **state,
                'deck': deck,
                'hands': {
                    **state['hands'],
                    player: [*hand, card],
                },
            }
        return action

    if len(hand) == 0:
        # Color
        @card_action
        def action(card, answer):
            if answer == 'color.value.red':
                return card['suit'] in {'diamonds', 'hearts'}
            elif answer == 'color.value.black':
                return card['suit'] in {'spades', 'clubs'}

        return action, [{
            'type': 'choice',
            'label': 'color.label',
            'choices': [
                'color.value.red',
                'color.value.black',
            ],
        }]

    elif len(hand) == 1:
        # Higher / Lower
        @card_action
        def action(card, answer):
            if answer == 'higherLower.value.lower':
                return compare(card, hand[0], suit=False) < 0
            elif answer == 'higherLower.value.equal':
                return compare(card, hand[0], suit=False) == 0
            elif answer == 'higherLower.value.higher':
                return compare(card, hand[0], suit=False) > 0

        return action, [{
            'type': 'choice',
            'label': 'higherLower.label',
            'choices': [
                'higherLower.value.higher',
                'higherLower.value.equal',
                'higherLower.value.lower',
            ],
        }]

    elif len(hand) == 2:
        # Inside / Outside
        @card_action
        def action(card, answer):
            if compare(hand[0], hand[1]) > 0:
                highest, lowest = hand
            else:
                lowest, highest = hand

            if answer == 'insideOutside.value.inside':
                return (
                    compare(card, lowest, suit=False) > 0 and
                    compare(card, highest, suit=False) < 0
                )
            elif answer == 'insideOutside.value.equal':
                return (
                    compare(card, lowest, suit=False) == 0 or
                    compare(card, highest, suit=False) == 0
                )
            elif answer == 'insideOutside.value.outside':
                return (
                    compare(card, lowest, suit=False) < 0 or
                    compare(card, highest, suit=False) > 0
                )

        return action, [{
            'type': 'choice',
            'label': 'insideOutside.label',
            'choices': [
                'insideOutside.value.inside',
                'insideOutside.value.equal',
                'insideOutside.value.outside',
            ],
        }]

    elif len(hand) == 3:
        # Inside / Outside
        @card_action
        def action(card, answer):
            return f'suit.value.{card["suit"]}' == answer

        return action, [{
            'type': 'choice',
            'label': 'suit.label',
            'choices': [
                f'suit.value.{suit}'
                for suit in SUITS
            ],
        }]


def filter_state(state, player):
    return {
        'hands': state['hands'],
    }
