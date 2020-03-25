import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Loader } from '../../component';
import api from '../../api';
import { jsonFormat, useToasts, useTranslations } from '../../helpers';
import GameCreateView from './Create';
import GameLobby from './View/Lobby';
import GameForm from './View/GameForm';
import styled from 'styled-components';
import Scrollbars from 'react-custom-scrollbars';
import Bussen from './View/Game/Bussen';

const Container = styled.div`
    height: calc(100% + 2em);
    display: flex;
    flex-direction: column;
    margin: -1em;
`;

const GameContainer = styled.div`
    flex: 1 1 0;
    height: 100%;
`;

const FormContainer = styled.div`
    flex: 0 0 auto;
    padding: 1rem;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
    position: relative;
    z-index: 10;
    border-top: 1px solid rgba(0, 0, 0, 0.075);
`;

const PROTOCOL_MAP = {
    'http:': 'ws:',
    'https:': 'wss:',
};

function useGame(code) {
    const [data, setData] = useState({ loading: true });

    const setGame = useCallback((game) => {
        setData((data) => ({ ...data, game }));
    }, [setData]);

    useEffect(() => {
        setData({ loading: true });

        const refetch = () => (
            api.get(`game/${code}/`)
            .then(({ data: game }) => setData({ loading: false, game, refetch }))
            .catch((error) => setData({ loading: false, error, refetch }))
        );

        refetch();
    }, [code]);

    return { ...data, setGame };
}

export default function GameViewScreen({ code }) {
    const t = useTranslations();
    const { loading, game, error, refetch, setGame } = useGame(code);
    const socketRef = useRef();
    const createToast = useToasts();

    const gameCode = useMemo(() => game && game.code, [game]);
    const self = useMemo(() => {
        if (game) {
            for (const player of game.players) {
                if (player.self) {
                    return player.name;
                }
            }
        }
        return null;
    }, [game]);

    useEffect(() => {
        if (socketRef.current) {
            socketRef.current.close();
            socketRef.current = undefined;
        }
        if (gameCode) {
            socketRef.current = new WebSocket(
                `${PROTOCOL_MAP[window.location.protocol]}//${window.location.host}/api/game/${gameCode}/`
            );

            function handleMessages({ messages, interval, namespace }) {
                const [{ key, params = {}, players = [] }, ...tail] = messages;

                createToast(t(key, params, namespace), { highlight: players.includes(self) });

                if (tail.length > 0) {
                    setTimeout(() => handleMessages({
                        messages: tail,
                        interval,
                        namespace,
                    }), interval);
                }
            }

            socketRef.current.onmessage = (message) => {
                message = JSON.parse(message.data);
                switch (message.type) {
                    case 'game.update':
                        setGame(message.game);
                        break;
                    case 'game.messages':
                        handleMessages(message);
                        break;
                    default:
                        // noop
                }
            };
        }
    }, [gameCode, self, createToast, setGame, t]);

    if (loading) {
        return <Loader />;
    }

    if (error) {
        if (error.response.status === 403) {
            return <GameCreateView defaultCode={code} afterSubmit={refetch} />;
        } else {
            return t('error.unknown');
        }
    }

    if (!game.started) {
        return <GameLobby game={game} setGame={setGame} />;
    }

    return (
        <Container>
            <GameContainer>
                <Scrollbars>
                    {game.game === 'bussen' ? (
                        <Bussen game={game} />
                    ) : (
                        <pre>{jsonFormat(game)}</pre>
                    )}
                </Scrollbars>
            </GameContainer>
            {game.form && (
                <FormContainer>
                    <GameForm
                        game={game.game}
                        form={game.form}
                        onSubmit={(fields) => (
                            api.post(`game/${game.code}/move/`, {
                                type: 'form',
                                fields,
                            })
                            .catch((error) => createToast(t('error.unknown'), { error: true }))
                        )}
                    />
                </FormContainer>
            )}
        </Container>
    );
}
