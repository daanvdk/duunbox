import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Loader } from '../../component';
import api from '../../api';
import { jsonFormat, useToasts } from '../../helpers';
import GameCreateView from './Create';
import GameLobby from './View/Lobby';

const PROTOCOL_MAP = {
    'http:': 'ws:',
    'https:': 'wss:',
};

function useGame(code) {
    const [data, setData] = useState({ loading: true });

    function setGame(game) {
        setData({ ...data, game }); 
    }

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
        function connect() {
            if (socketRef.current) {
                delete socketRef.current.onclose;
                socketRef.current.close();
                socketRef.current = undefined;
            }
            if (gameCode) {
                socketRef.current = new WebSocket(
                    `${PROTOCOL_MAP[window.location.protocol]}//${window.location.host}/api/game/${gameCode}/`
                );
                socketRef.current.onclose = connect;
                socketRef.current.onmessage = (message) => {
                    message = JSON.parse(message.data);
                    switch (message.type) {
                        case 'game.update':
                            setGame(message.game);
                            break;
                        case 'game.message':
                            createToast(`${message.key} ${JSON.stringify(message.params)}`, {
                                highlight: message.player === self,
                            });
                            break;
                    }
                };
            }
        }
        connect();
    }, [gameCode, self]);

    if (loading) {
        return <Loader />;
    }

    if (error) {
        if (error.response.status === 403) {
            return <GameCreateView defaultCode={code} afterSubmit={refetch} />;
        } else {
            return error.response.data.message;
        }
    }

    if (!game.started) {
        return <GameLobby game={game} setGame={setGame} />;
    }

    return (
        <pre>{jsonFormat(game)}</pre>
    );
}
