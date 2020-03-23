export default {
    main: {
        title: 'Düünbox',
        underTitle: 'Not Jack\'s, but Düün\'s.',
    },
    game: {
        create: {
            name: { label: 'Name' },
            code: { label: 'Code' },
            createButton: 'New Game',
            joinButton: 'Join Game',
            error: {
                nameTaken: 'This name is already in use.',
                gameNotFound: 'No game could be found with this code.',
            },
        },
        lobby: {
            code: { label: 'Code' },
            game: {
                label: 'Game',
                value: {
                    bussen: 'Bussen',
                },
            },
            players: { label: 'Players' },
            startButton: 'Start',
            error: {
                couldNotStart: 'Game could not be started.',
                invalidGame: 'This game is not available.',
            },
            changeName: {
                title: 'Change Name',
                name: { label: 'New Name' },
                changeButton: 'Change',
            },
        },
        form: {
            submitButton: 'Submit',
        },
        message: {
            name_change: '{{old_name}} changed their name to {{new_name}}.',
            player_joined: '{{name}} has joined the game.',
            bussen: {
                drink: '{{player}}: Drink {{count}} sip!',
                drink_plural: '{{player}}: Drink {{count}} sips!',
            },
        },
        bussen: {
            form: {
                color: {
                    label: 'Red or black?',
                    value: {
                        red: 'Red',
                        black: 'Black',
                    },
                },
                higherLower: {
                    label: 'Higher or lower?',
                    value: {
                        higher: 'Higher',
                        equal: 'Equal',
                        lower: 'Lower',
                    },
                },
                insideOutside: {
                    label: 'Inside or outside?',
                    value: {
                        inside: 'Inside',
                        equal: 'Equal',
                        outside: 'Outside',
                    },
                },
                suit: {
                    label: 'Suit?',
                    value: {
                        spades: 'Spades',
                        diamonds: 'Diamonds',
                        clubs: 'Clubs',
                        hearts: 'Hearts',
                    },
                },
            },
        },
    },
    error: {
        unknown: 'An unexpected error occured.',
    },
};
