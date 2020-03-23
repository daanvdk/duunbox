import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { Form, Icon, Group, Input, Button, RadioButtons, Modal } from '../../../component';
import { useToasts } from '../../../helpers';
import api from '../../../api';
import theme from '../../../theme';
import NameChangeModal from './NameChangeModal'; 

const Container = styled.div`
    ${({ blur }) => blur ? `
        filter: blur(8px);
    ` : ``}
`;

const Title = styled.h1`
    font-size: 1.5rem;
    font-weight: bold;
    color: ${theme.textColor};
    margin: 2rem 0 0.25rem;
`;

const UnderTitle = styled.h2`
    font-size: 0.75rem;
    font-weight: normal;
    font-style: italic;
    color: ${theme.textColorN2};
    margin: 0 0 2rem;
`;

const Code = styled.div`
    color: ${theme.primaryColor};
    text-align: center;
    font-size: 2.25em;
    font-weight: bold;
    margin: -1rem 0 1rem;
`;

const PlayerContainer = styled.div`
    display: column;
    border-radius: 0.75rem;
    margin: -0.125rem;

    display: grid;
    grid-template-columns: repeat(${({ columns = 3 }) => columns}, 1fr);
`;

const Player = styled.div`
    margin: 0.125rem;
    border-radius: 0.5rem;
    padding: 0.5rem 2rem;
    font-weight: bold;
    text-align: center;
    ${({ self }) => self ? `
        background-color: ${theme.bgColorN2};
        color: ${theme.textColorN1};
    ` : `
        background-color: ${theme.bgColorN1};
        color: ${theme.textColorN2};
    `}

    position: relative;
    > i.fa-crown {
        font-size: 0.9em;
        line-height: 1;
        position: absolute;
        left: 0.7rem;
        top: 50%;
        transform: translateY(-50%);
    }
    > i.fa-pen {
        font-size: 0.9em;
        line-height: 1;
        position: absolute;
        right: 0.7rem;
        top: 50%;
        transform: translateY(-50%);
        cursor: pointer;
        opacity: 0.25;
        &:hover {
            opacity: 1;
        }
        transition: opacity 300ms ease;
    }
`;

const ShareIcon = styled(Icon)`
    position: absolute;
    top: 1rem;
    right: 1rem;
    font-size: 1.25rem;
    cursor: pointer;
    color: ${theme.textColor};
    &:hover {
        color: ${theme.textColorP1};
    }
    transition: color 300ms ease;
`;

const GAME_OPTIONS = [
    {
        value: 'bussen',
        content: 'Bussen',
    },
];

export default function GameLobbyScreen({ game, setGame }) {
    const [nameChange, setNameChange] = useState(false);
    const createToast = useToasts();
    const self = useMemo(() => game.players.find(({ self }) => self), [game]);

    function onSubmit(e) {
        e.preventDefault();
        if (!self || !self.admin || !game.game) {
            return;
        }

        return (
            api.put(`game/${game.code}/`, { started: true })
            .catch((error) => {
                if (error.response) {
                    createToast(error.response.data.message, { warning: true });
                }
            })
        );
    }

    return (
        <React.Fragment>
            <Container blur={nameChange}>
                <Title>
                    <Icon name="box" size={0.75} style={{
                        position: 'relative',
                        top: '-0.075em',
                        marginRight: '0.375em',
                    }} />
                    Düünbox
                </Title>
                <UnderTitle>Niet van Jack, maar van Düün.</UnderTitle>
                <Code>{game.code}</Code>
                <Form onSubmit={onSubmit}>
                    <Group label="Spel">
                        <RadioButtons
                            value={game.game}
                            onChange={(value) => (
                                api.put(`game/${game.code}/`, { game: value })
                                .then(({ data }) => setGame(data))
                                .catch((error) => (
                                    error.response && error.response.status === 400
                                    ? createToast('invalid_game', { warning: true })
                                    : createToast('unknown_error', { error: true })
                                ))
                            )}
                            options={GAME_OPTIONS}
                        />
                    </Group>
                    <Group label="Spelers">
                        <PlayerContainer>
                            {game.players.map(({ name, admin, self }, i) => (
                                <Player key={i} self={self}>
                                    {admin && <Icon name="crown" />}
                                    {name}
                                    {self && <Icon name="pen" onClick={() => setNameChange(true)} />}
                                </Player>
                            ))}
                        </PlayerContainer>
                    </Group>
                    <Button primary
                        icon="play"
                        disabled={!self || !self.admin || !game.game}
                    >
                        Spel Starten
                    </Button>
                </Form>
            </Container>
            <NameChangeModal
                open={nameChange}
                onClose={() => setNameChange(false)}
                code={game.code}
                defaultName={self.name}
            />
        </React.Fragment>
    );
}
