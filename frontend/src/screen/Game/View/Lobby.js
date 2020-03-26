import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { Form, Icon, Group, Button, RadioButtons } from '../../../component';
import { useTranslations, useToasts } from '../../../helpers';
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
    margin: 0 0 1.5rem;
`;

const Code = styled.div`
    color: ${theme.primaryColor};
    text-align: center;
    font-size: 2.25em;
    margin: -0.1em 0;
    font-weight: bold;
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

const GAMES = ['bussen'];

export default function GameLobbyScreen({ room, setRoom }) {
    const t = useTranslations();
    const [nameChange, setNameChange] = useState(false);
    const createToast = useToasts();
    const self = useMemo(() => room.players.find(({ self }) => self), [room]);

    function onSubmit(e) {
        e.preventDefault();
        if (!self || !self.admin || !room.game) {
            return;
        }

        return (
            api.put(`room/${room.code}/`, { started: true })
            .catch((error) => {
                if (error.response) {
                    createToast(t('game.lobby.error.couldNotStart'), { error: true });
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
                    {t('main.title')}
                </Title>
                <UnderTitle>{t('main.underTitle')}</UnderTitle>
                <Form onSubmit={onSubmit}>
                    <Group label={t('game.lobby.code.label')}>
                        <Code>{room.code}</Code>
                    </Group>
                    <Group label={t('game.lobby.game.label')}>
                        <RadioButtons vertical
                            value={room.game}
                            onChange={(value) => {
                                if (!self || !self.admin) {
                                    return;
                                }

                                api.put(`room/${room.code}/`, { game: value })
                                    .then(({ data }) => setRoom(data))
                                    .catch((error) => (
                                        error.response && error.response.status === 400
                                        ? createToast(t('game.lobby.error.invalidGame'), { warning: true })
                                        : createToast(t('error.unknown'), { error: true })
                                    ));
                            }}
                            options={GAMES.map((value) => ({ value, content: t(`game.lobby.game.value.${value}`) }))}
                        />
                    </Group>
                    <Group label={t('game.lobby.players.label')}>
                        <PlayerContainer>
                            {room.players.map(({ name, admin, self }, i) => (
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
                        disabled={!self || !self.admin || !room.game}
                    >
                        {t('game.lobby.startButton')}
                    </Button>
                </Form>
            </Container>
            <NameChangeModal
                open={nameChange}
                onClose={() => setNameChange(false)}
                code={room.code}
                defaultName={self.name}
            />
        </React.Fragment>
    );
}
