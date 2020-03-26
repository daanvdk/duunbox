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

    const setRoom = useCallback((room) => {
        setData((data) => ({ ...data, room }));
    }, [setData]);

    useEffect(() => {
        setData({ loading: true });

        const refetch = () => (
            api.get(`room/${code}/`)
            .then(({ data: room }) => setData({ loading: false, room, refetch }))
            .catch((error) => setData({ loading: false, error, refetch }))
        );

        refetch();
    }, [code]);

    return { ...data, setRoom };
}

export default function GameViewScreen({ code }) {
    const t = useTranslations();
    const { loading, room, error, refetch, setRoom } = useGame(code);
    const socketRef = useRef();
    const createToast = useToasts();

    const roomCode = useMemo(() => room && room.code, [room]);
    const self = useMemo(() => {
        if (room) {
            for (const player of room.players) {
                if (player.self) {
                    return player.name;
                }
            }
        }
        return null;
    }, [room]);

    useEffect(() => {
        if (socketRef.current) {
            socketRef.current.close();
            socketRef.current = undefined;
        }
        if (roomCode) {
            socketRef.current = new WebSocket(
                `${PROTOCOL_MAP[window.location.protocol]}//${window.location.host}/api/room/${roomCode}/`
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
                    case 'room.update':
                        setRoom(message.room);
                        break;
                    case 'room.messages':
                        handleMessages(message);
                        break;
                    default:
                        // noop
                }
            };
        }
    }, [roomCode, self, createToast, setRoom, t]);

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

    if (!room.started) {
        return <GameLobby room={room} setRoom={setRoom} />;
    }

    return (
        <Container>
            <GameContainer>
                <Scrollbars>
                    {room.game === 'bussen' ? (
                        <Bussen room={room} />
                    ) : (
                        <pre>{jsonFormat(room)}</pre>
                    )}
                </Scrollbars>
            </GameContainer>
            {room.form && (
                <FormContainer>
                    <GameForm
                        game={room.game}
                        form={room.form}
                        onSubmit={(fields) => (
                            api.post(`room/${room.code}/action/`, {
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
