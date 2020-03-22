"""
A game is a module that has to contain two functions:

- initial_state:
    This function generates the initial state for a game given a list of
    players.

- update_state:
    This function updates the state of a game given the current state, the
    player doing a move and the move itself.

The module can also optionally provide the following function:

- filter_state:
    This function gives back a filtered version of the state that is suitable
    for sending to the players given the current state.
    If this function is not provided the state will not be filtered.
"""

# Mapping from name to module
GAMES = {
}
