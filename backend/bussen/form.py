from utils.cards import compare, SUITS

from .common import get_turn


def get_form(state, player):
    # Cards part
    if player != state['turn']:
        return None

    hand = state['hands'][player]

    def card_action(handle_card):
        def action(notify, answer):
            deck = list(state['deck'])
            card = deck.pop()

            actual_answer, drink = handle_card(card, answer)

            messages = [
                {
                    'key': f'message.playerAnswer',
                    'params': {'player': player, 'answer': answer},
                },
                {
                    'key': f'message.actualAnswer',
                    'params': {'answer': actual_answer},
                    'players': [player],
                },
            ]
            if drink:
                players, count = drink
                messages.append({
                    'key': f'message.drink',
                    'params': {'players': players, 'count': count},
                    'players': players,
                })

            notify(*messages)

            new_state = {
                **state,
                'deck': deck,
                'hands': {
                    **state['hands'],
                    player: [*hand, card],
                },
            }
            new_state['turn'] = get_turn(new_state)

            return new_state
        return action

    if len(hand) == 0:
        # Color
        @card_action
        def action(card, answer):
            if card['suit'] in {'diamonds', 'hearts'}:
                actual_answer = 'color.value.red'
            else:
                actual_answer = 'color.value.black'

            if answer == actual_answer:
                drink = None
            else:
                drink = [player], 1

            return actual_answer, drink

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
            cmp = compare(card, hand[0], suit=False)
            if cmp < 0:
                actual_answer = 'higherLower.value.lower'
            elif cmp == 0:
                actual_answer = 'higherLower.value.equal'
            elif cmp > 0:
                actual_answer = 'higherLower.value.higher'

            if answer == actual_answer:
                drink = None
            elif actual_answer == 'higherLower.value.equal':
                drink = [player], 2
            else:
                drink = [player], 1

            return actual_answer, drink

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
                hi, lo = hand
            else:
                lo, hi = hand

            cmp_lo = compare(card, lo, suit=False)
            cmp_hi = compare(card, hi, suit=False)

            if cmp_lo > 0 and cmp_hi < 0:
                actual_answer = 'insideOutside.value.inside'
            elif cmp_lo == 0 or cmp_hi == 0:
                actual_answer = 'insideOutside.value.equal'
            elif cmp_lo < 0 or cmp_hi > 0:
                actual_answer = 'insideOutside.value.outside'

            if answer == actual_answer:
                drink = None
            elif actual_answer == 'insideOutside.value.equal':
                drink = [player], 2
            else:
                drink = [player], 1

            return actual_answer, drink

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
        suits = {card['suit'] for card in hand}
        if len(suits) == 3:
            disco = next(suit for suit in SUITS if suit not in suits)
        else:
            disco = None

        @card_action
        def action(card, answer):
            if card['suit'] == disco:
                actual_answer = 'suit.value.disco'
            else:
                actual_answer = 'suit.value.' + card['suit']

            if answer != actual_answer:
                drink = [player], 1
            elif answer == 'suit.value.disco':
                drink = [p for p in state['hands'] if p != player], 1
            else:
                drink = None

            return actual_answer, drink

        return action, [{
            'type': 'choice',
            'label': 'suit.label',
            'choices': [
                f'suit.value.disco' if suit == disco else f'suit.value.{suit}'
                for suit in SUITS
            ],
        }]
