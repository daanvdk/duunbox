export default {
    main: {
        title: 'Düünbox',
        underTitle: 'Niet die van Jack, maar die van Düün.',
    },
    game: {
        create: {
            name: { label: 'Naam' },
            code: { label: 'Code' },
            createButton: 'Nieuw Spel',
            joinButton: 'Deelnemen',
            error: {
                nameTaken: 'Deze naam is al in gebruik.',
                gameNotFound: 'Er kon geen spel gevonden worden met deze code.',
            },
        },
        lobby: {
            code: { label: 'Code' },
            game: {
                label: 'Spel',
                value: {
                    bussen: 'Bussen',
                },
            },
            players: { label: 'Spelers' },
            startButton: 'Start',
            error: {
                couldNotStart: 'Spel kon niet gestart worden.',
                invalidGame: 'Dit spel is niet beschikbaar.',
            },
            changeName: {
                title: 'Naam Aanpassen',
                name: { label: 'Nieuwe Naam' },
                changeButton: 'Aanpassen',
            },
        },
        form: {
            submitButton: 'Invoeren',
        },
        message: {
            nameChange: '{{oldName}} heeft zijn/haar naam aangepast naar {{newName}}.',
            playerJoined: '{{name}} is bij het spel gekomen.',
        },
        bussen: {
            color: {
                label: 'Rood of zwart?',
                value: {
                    red: 'Rood',
                    black: 'Zwart',
                },
            },
            higherLower: {
                label: 'Hoger of lager?',
                value: {
                    higher: 'Hoger',
                    equal: 'Paal',
                    lower: 'Lager',
                },
            },
            insideOutside: {
                label: 'Binnen of buiten?',
                value: {
                    inside: 'Binnen',
                    equal: 'Paal',
                    outside: 'Buiten',
                },
            },
            suit: {
                label: 'Kleur?',
                value: {
                    spades: 'Schoppen',
                    diamonds: 'Ruiten',
                    clubs: 'Klaveren',
                    hearts: 'Harten',
                    disco: 'Disco',
                },
            },
            message: {
                playerAnswer: '{{player}} zegt {{answer!trans!lower}}.',
                actualAnswer: 'Het is {{answer!trans!lower}}!',
                drink: '{{players}}, drinken!',
                drink_plural: '{{players}}, {{count}} keer drinken!',
            },
        },
    },
    error: {
        unknown: 'Er is een onverwachte fout opgetreden.',
    },
};
