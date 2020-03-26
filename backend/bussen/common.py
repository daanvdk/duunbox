def get_turn(state):
    return next(
        (name for _, name in sorted(
            (len(hand), name)
            for name, hand in state['hands'].items()
            if len(hand) < 4
        )),
        None,
    )
